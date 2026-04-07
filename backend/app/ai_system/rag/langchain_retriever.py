from typing import List, Any, ClassVar
import logging
import time

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from pydantic import ConfigDict

logger = logging.getLogger(__name__)

_orchestrator_singleton = None

def _get_orchestrator():
    global _orchestrator_singleton
    if _orchestrator_singleton is None:
        from app.ai_system.rag.orchestrator import LegalRetrieverOrchestrator
        _orchestrator_singleton = LegalRetrieverOrchestrator()
    return _orchestrator_singleton


class CustomLegalRetriever(BaseRetriever):
    """
    A LangChain-compatible wrapper around the custom LegalRetrieverOrchestrator.
    This safely encapsulates the top-10 candidate, cross-encoder reranking, and
    metadata extraction logic while integrating directly with LCEL pipelines.
    """
    # Allow arbitrary types so pydantic doesn't reject the orchestrator reference
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    # The orchestrator is stored as a class-level singleton, not a pydantic field
    _orch: ClassVar[Any] = None

    @property
    def orch(self):
        if CustomLegalRetriever._orch is None:
            CustomLegalRetriever._orch = _get_orchestrator()
        return CustomLegalRetriever._orch

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """
        Calls the orchestrator to fetch reranked dict results and transforms them
        into LangChain Document objects.
        """
        start_time = time.time()
        logger.info(f"[LC Wrapper] Initiating retrieval for: {query}")
        
        candidates = self.orch.retrieve_candidates(query)
        reranked = self.orch.rerank_results(query, candidates, top_k=5)
        
        logger.info(f"[LC Wrapper] Top-10 candidates → {len(candidates)}, Reranked top-5 → {len(reranked)}")
        for i, r in enumerate(reranked, 1):
            logger.info(f"  [{i}] {r.get('metadata', {}).get('doc_type', 'N/A')} "
                        f"§{r.get('metadata', {}).get('section_number', 'N/A')} "
                        f"score={r.get('final_score', 0):.3f}")

        docs = []
        for rank, chunk in enumerate(reranked, 1):
            metadata = chunk.get("metadata", {}).copy()
            metadata["score"] = chunk.get("final_score", 0.0)
            metadata["rerank_score"] = chunk.get("rerank_score", 0.0)
            metadata["legal_boost"] = chunk.get("legal_boost", 0.0)
            metadata["rank"] = rank
            docs.append(Document(page_content=chunk.get("content", ""), metadata=metadata))

        latency = time.time() - start_time
        logger.info(f"[LC Wrapper] Completed in {latency:.2f}s. Returning {len(docs)} docs.")
        
        return docs
