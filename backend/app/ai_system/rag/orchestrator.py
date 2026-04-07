import logging
from typing import List, Dict, Optional, Any
from app.ai_system.rag.retriever import RAGRetriever
from app.ai_system.rag.document_processor import LegalDocumentType
import json

logger = logging.getLogger(__name__)

class LegalRetrieverOrchestrator:
    """
    Two-stage retrieval orchestrator for legal cases.
    Stage 1: Vector matching using RAGRetriever
    Stage 2: Reranking using CrossEncoder (ms-marco)
    Includes configurable metadata/legal signal boosting.
    """
    
    _reranker_instance = None

    def __init__(self, retriever: Optional[RAGRetriever] = None):
        if retriever is None:
            self.retriever = RAGRetriever()
        else:
            self.retriever = retriever
            
        # Placeholders for future LangChain integrations
        self.conversation_history = None
        self.previous_citations = None
        self.judge_state = None

    @classmethod
    def get_reranker(cls):
        """Lazy-loaded singleton for the CrossEncoder to save memory."""
        if cls._reranker_instance is None:
            from sentence_transformers import CrossEncoder
            logger.info("Initializing CrossEncoder 'cross-encoder/ms-marco-MiniLM-L-6-v2'...")
            cls._reranker_instance = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)
        return cls._reranker_instance

    def retrieve_candidates(
        self,
        query: str,
        doc_types: Optional[List[LegalDocumentType]] = None,
        section_filter: Optional[str] = None
    ) -> List[Dict]:
        """Stage 1: Retrieve top 10 candidates via vector search."""
        logger.info(f"Retrieving top 10 candidates for query: {query}")
        # Enforce top_k=10 for candidate stage
        candidates = self.retriever.retrieve(
            query=query, 
            top_k=10, 
            doc_types=doc_types, 
            section_filter=section_filter
        )
        logger.info(f"Found {len(candidates)} candidates.")
        return candidates

    def calculate_legal_boost(
        self, 
        doc: Dict, 
        query: str
    ) -> float:
        """
        Calculate metadata-aware legal signals to boost scores.
        Current implementation checks exact act or heading overlaps.
        """
        boost = 0.0
        content = doc.get("content", "").lower()
        query_lower = query.lower()
        metadata = doc.get("metadata", {})
        
        # 1. Exact Act Match Boost
        doc_act = metadata.get("doc_type", "").lower()
        if doc_act and doc_act in query_lower:
            boost += 0.15
            
        # 2. Heading / Keyword Overlap
        heading = metadata.get("heading", "").lower()
        if heading and heading in query_lower:
            boost += 0.10
            
        # 3. Section adjacency could be checked if we stored previous context
        # but for now we omit or set 0.
        return boost

    def rerank_results(self, query: str, candidates: List[Dict], top_k: int = 5) -> List[Dict]:
        """Stage 2: Rerank candidates using CrossEncoder and legal signal boosting."""
        if not candidates:
            return []

        reranker = self.get_reranker()
        
        pairs = [(query, doc["content"]) for doc in candidates]
        try:
            scores = reranker.predict(pairs)
        except Exception as e:
            logger.error(f"Reranking prediction failed: {e}")
            scores = [doc.get("score", 0.0) for doc in candidates]

        reranked_results = []
        for doc, score in zip(candidates, scores):
            legal_boost = self.calculate_legal_boost(doc, query)
            final_score = (0.7 * float(score)) + legal_boost
            
            doc["rerank_score"] = float(score)
            doc["legal_boost"] = legal_boost
            doc["final_score"] = final_score
            reranked_results.append(doc)

        # Sort descending by final score
        reranked_results.sort(key=lambda x: x["final_score"], reverse=True)
        top_results = reranked_results[:top_k]

        # ── Demo-visible per-chunk score log ──────────────────────────────────
        logger.info(f"[RERANKER] Query: '{query[:60]}...' " if len(query) > 60 else f"[RERANKER] Query: '{query}'")
        logger.info(f"[RERANKER] Scored {len(reranked_results)} candidates → keeping top {len(top_results)}")
        logger.info("[RERANKER] ┌─────────────────────────────────────────────────────────────")
        for i, doc in enumerate(reranked_results, 1):
            meta       = doc.get("metadata", {})
            act        = meta.get("doc_type", "Unknown Act")
            section    = meta.get("section_number", "N/A")
            heading    = meta.get("section_title", meta.get("heading", ""))
            r_score    = doc.get("rerank_score", 0.0)
            boost      = doc.get("legal_boost", 0.0)
            f_score    = doc.get("final_score", 0.0)
            kept       = " KEPT" if i <= top_k else " dropped"

            logger.info(
                f"[RERANKER] │ [{i:02d}] §{section} {act}"
                + (f" — {heading[:40]}" if heading else "")
            )
            logger.info(
                f"[RERANKER] │      rerank={r_score:.4f}  boost={boost:.2f}  "
                f"final={f_score:.4f}  {kept}"
            )
        logger.info("[RERANKER] └─────────────────────────────────────────────────────────────")
        final_citation_ids = [f"§{d.get('metadata', {}).get('section_number', 'N/A')}" for d in top_results]
        logger.info(f"[RERANKER] Final citations → {final_citation_ids}")
        # ─────────────────────────────────────────────────────────────────────

        return top_results


    def retrieve_final_context(
        self,
        query: str,
        doc_types: Optional[List[LegalDocumentType]] = None,
        section_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates retrieval and reranking, returning a structured dict ready for prompt builders or API.
        """
        candidates = self.retrieve_candidates(query, doc_types, section_filter)
        reranked = self.rerank_results(query, candidates, top_k=5)
        
        # Determine detected act (naive for now based on doc_types or metadata)
        detected_acts = set()
        for doc in reranked:
            if doc.get("metadata", {}).get("doc_type"):
                detected_acts.add(doc["metadata"]["doc_type"])
        
        # Build raw citations list
        citations = []
        for doc in reranked:
            act = doc.get("metadata", {}).get("doc_type", "Unknown Act")
            sec = doc.get("metadata", {}).get("section_number", "N/A")
            citations.append(f"{act} Section {sec}")

        from app.ai_system.prompts.context_builder import ContextBuilder

        final_context = ContextBuilder.build_retrieval_context(reranked)

        return {
            "query": query,
            "detected_act": list(detected_acts),
            "candidate_chunks": len(candidates),
            "reranked_chunks": len(reranked),
            "final_context": final_context,
            "citations": citations
        }
