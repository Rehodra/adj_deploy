"""
Gemini Embeddings for AI Legal Courtroom Simulator
Uses Google Gemini Embeddings API (text-embedding-004) — no extra packages
needed; google-genai is already in requirements.txt.
"""

from typing import List
from google import genai


class GeminiEmbeddings:
    """
    Embedding implementation using the Gemini Embeddings API.
    Model: text-embedding-004 (768-dim, free with GEMINI_API_KEY)
    """

    def __init__(self, api_key: str = None, model_name: str = "text-embedding-004"):
        """
        Initialize Gemini embeddings.

        Args:
            api_key: Google Gemini API key (required)
            model_name: Embedding model name
        """
        if not api_key:
            from app.config import get_settings
            api_key = get_settings().GEMINI_API_KEY

        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        self._dimension = 768  # text-embedding-004 fixed dimension

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple documents using Gemini API.

        Args:
            texts: List of text strings to embed

        Returns:
            List of embedding vectors
        """
        embeddings = []
        for text in texts:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=text,
            )
            embeddings.append(result.embeddings[0].values)
        return embeddings

    def embed_query(self, query: str) -> List[float]:
        """
        Embed a single query using Gemini API.

        Args:
            query: Query string to embed

        Returns:
            Query embedding vector
        """
        result = self.client.models.embed_content(
            model=self.model_name,
            contents=query,
        )
        return result.embeddings[0].values

    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings.

        Returns:
            Embedding dimension (768 for text-embedding-004)
        """
        return self._dimension
