import os
import logging
import time

logger = logging.getLogger(__name__)


class LegalLCELPipeline:
    """
    LangChain LCEL Pipeline for Legal Reasoning and Validation.
    Executes a hybrid retrieval layer connected to judge formulation
    and a final citation evaluation structure.

    All LangChain imports are deferred (lazy) so the FastAPI server does NOT
    crash at startup if langchain packages are missing.
    """

    def __init__(self, api_key: str = None):
        try:
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import StrOutputParser
            from langchain_core.runnables import RunnablePassthrough
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError as e:
            raise ImportError(
                f"LangChain packages not installed. Run: "
                f"pip install langchain langchain-core langchain-google-genai\n"
                f"Original error: {e}"
            )

        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._ChatPromptTemplate = ChatPromptTemplate
        self._StrOutputParser = StrOutputParser
        self._RunnablePassthrough = RunnablePassthrough

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0.2,
            google_api_key=self.api_key
        )

        from app.ai_system.rag.langchain_retriever import CustomLegalRetriever
        self.retriever = CustomLegalRetriever()

        # 1. JUDGE REASONING PROMPT
        self.judge_prompt = ChatPromptTemplate.from_template("""
You are an AI Judge in an Indian courtroom simulator.

Use ONLY the retrieved legal sections below to rule appropriately.

Context:
{context}

Question:
{question}

Instructions:
- cite exact IPC / CrPC / constitutional sections
- preserve section numbers
- explain legal reasoning clearly
- prioritize punishment vs definition correctly
""")

        # 2. CITATION VALIDATION PROMPT
        self.citation_prompt = ChatPromptTemplate.from_template("""
Validate the following response for:
- correct legal section references
- citation continuity
- exception/proviso completeness

Response:
{response}
""")

    def format_docs(self, docs) -> str:
        """Utility wrapper to format LangChain Documents using our ContextBuilder."""
        from app.ai_system.prompts.context_builder import ContextBuilder
        chunks = []
        for d in docs:
            chunks.append({
                "content": d.page_content,
                "metadata": d.metadata,
                "final_score": d.metadata.get("score", 0.0)
            })
        return ContextBuilder.build_retrieval_context(chunks)

    def build_chain(self):
        """Constructs and returns the LCEL runnable chain."""
        RunnablePassthrough = self._RunnablePassthrough
        StrOutputParser = self._StrOutputParser

        retrieval_chain = (
            {"context": self.retriever | self.format_docs, "question": RunnablePassthrough()}
        )
        reasoning_chain = retrieval_chain | self.judge_prompt | self.llm | StrOutputParser()
        validation_chain = {"response": reasoning_chain} | self.citation_prompt | self.llm | StrOutputParser()
        return validation_chain

    def invoke(self, query: str) -> str:
        """Invoke the full pipeline. Traces latency for demo observability."""
        start = time.time()
        logger.info(f"[LCEL Pipeline] Invoking for query: {query}")
        chain = self.build_chain()
        result = chain.invoke(query)
        latency = time.time() - start
        logger.info(f"[LCEL Pipeline] Pipeline completed in {latency:.2f}s.")
        return result
