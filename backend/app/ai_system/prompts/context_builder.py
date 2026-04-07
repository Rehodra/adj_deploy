from typing import List, Dict, Optional
import json

class ContextBuilder:
    """
    Dedicated builder to construct prompt chains from retrieved legal chunks.
    Preserves exact section numbers and act names cleanly.
    """

    @staticmethod
    def build_retrieval_context(retrieved_docs: List[Dict]) -> str:
        """
        Builds the raw context from reranked retrieval output.
        Replaces the old RAGRetriever.build_context behavior.
        """
        if not retrieved_docs:
            return "No relevant legal provisions found."

        context_parts = [
            "=== RELEVANT LEGAL PROVISIONS ===\n",
            "Use ONLY these legal authorities. Do not hallucinate external sections.\n\n"
        ]
        
        for idx, doc in enumerate(retrieved_docs, 1):
            metadata = doc.get('metadata', {})
            section_info = f"Section {metadata.get('section_number', 'N/A')}" if metadata.get('section_number') else "General Provision"
            act_info = metadata.get('doc_type', 'Unknown Act')
            score = doc.get('final_score', doc.get('score', 0.0))
            
            context_parts.append(f"[{idx}] {act_info} - {section_info}")
            context_parts.append(f"Relevance Score: {score:.3f}")
            context_parts.append(f"Text:\n{doc.get('content', '')}\n")
            context_parts.append("-" * 40 + "\n")
            
        return "\n".join(context_parts)

    @staticmethod
    def build_reasoning_prompt(case_facts: Dict, final_context: str, user_argument: Optional[str] = None) -> str:
        """
        Stage 2 prompt: Integrates case facts and user argument with legal context.
        """
        prompt = [
            "=== CASE FACTS ==="
        ]
        
        for key, val in case_facts.items():
            prompt.append(f"{key.capitalize()}: {val}")
        
        prompt.append("\n=== LEGAL CONTEXT ===")
        prompt.append(final_context)
        
        if user_argument:
            prompt.append("\n=== USER ARGUMENT ===")
            prompt.append(user_argument)
            
        return "\n".join(prompt)

    @staticmethod
    def build_validation_prompt(draft_ruling: str, citations: List[str]) -> str:
        """
        Stage 3 prompt: Confirms that a proposed ruling strictly adheres to citations.
        """
        return (
            "Analyze the following draft ruling against the provided citations.\n"
            "Ensure that every mentioned Section is present in the citations, and no fabricated acts are used.\n\n"
            f"=== CITATIONS ===\n{', '.join(citations) if citations else 'None'}\n\n"
            f"=== DRAFT RULING ===\n{draft_ruling}"
        )
