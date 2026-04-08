"""
Legal Documents Indexing Script for AI Legal Courtroom Simulator
Processes and indexes legal documents into the RAG system
"""

import os
import sys
from pathlib import Path
from typing import List
import argparse

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.ai_system.rag.document_processor import LegalDocumentProcessor
from app.ai_system.rag.embeddings import GeminiEmbeddings
from app.ai_system.rag.vector_store import VectorStore
from app.config import get_settings


def index_all_documents(
    docs_directory: str = None,
    clear_existing: bool = True,
    verbose: bool = True
) -> None:
    """
    Index all legal documents in the specified directory
    
    Args:
        docs_directory: Directory containing legal documents
        clear_existing: Whether to clear existing vector store
        verbose: Whether to print progress information
    """
    try:
        # Initialize settings
        settings = get_settings()
        
        # Set default docs directory if not provided
        if docs_directory is None:
            docs_directory = os.path.join(backend_dir, "data", "legal_docs")
        
        if verbose:
            print("🚀 Starting Legal Documents Indexing...")
            print(f"📁 Documents directory: {docs_directory}")
            print(f"🔑 Gemini API Key: {'✅ Configured' if settings.GEMINI_API_KEY else '❌ Missing'}")
            print(f"📊 Vector DB Path: {settings.VECTOR_DB_PATH}")
        
        # Initialize components
        if verbose:
            print("\n🔧 Initializing components...")
        
        processor = LegalDocumentProcessor(chunk_size=800, chunk_overlap=150)
        embedder = GeminiEmbeddings(api_key=settings.GEMINI_API_KEY)
        vector_store = VectorStore(persist_directory=settings.VECTOR_DB_PATH)
        
        # Clear existing data if requested
        if clear_existing:
            if verbose:
                print("🗑️  Clearing existing vector database...")
            vector_store.clear()
        
        # Find all legal document files
        docs_path = Path(docs_directory)
        if not docs_path.exists():
            print(f"❌ Documents directory not found: {docs_directory}")
            return
        
        # Find all .txt files recursively
        doc_files = list(docs_path.rglob("*.txt"))
        
        if not doc_files:
            print(f"❌ No .txt files found in {docs_directory}")
            return
        
        if verbose:
            print(f"📄 Found {len(doc_files)} document files")
        
        # Process all documents
        all_chunks = []
        file_stats = {}
        
        for file_path in doc_files:
            if verbose:
                print(f"\n📖 Processing: {file_path.relative_to(docs_path)}")
            
            try:
                # Process document
                chunks = processor.process_document(str(file_path))
                
                # Store file statistics
                file_stats[str(file_path.relative_to(docs_path))] = {
                    "chunks": len(chunks),
                    "total_chars": sum(len(chunk.content) for chunk in chunks)
                }
                
                all_chunks.extend(chunks)
                
                if verbose:
                    print(f"   ✅ Generated {len(chunks)} chunks")
                    print(f"   📊 Total characters: {file_stats[str(file_path.relative_to(docs_path))]['total_chars']}")
                
            except Exception as e:
                print(f"   ❌ Error processing {file_path}: {str(e)}")
                continue
        
        if not all_chunks:
            print("❌ No valid chunks generated from any documents")
            return
        
        if verbose:
            print(f"\n📚 Total chunks generated: {len(all_chunks)}")
        
        # Generate embeddings
        if verbose:
            print("🔮 Generating embeddings...")
        
        texts = [chunk.content for chunk in all_chunks]
        
        # Process in batches to avoid rate limits
        batch_size = 5
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            
            if verbose:
                print(f"   Processing batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
            
            try:
                batch_embeddings = embedder.embed_documents(batch_texts)
                all_embeddings.extend(batch_embeddings)
                
                if verbose:
                    print(f"   ✅ Generated {len(batch_embeddings)} embeddings")
                
            except Exception as e:
                print(f"   ❌ Error in batch {i//batch_size + 1}: {str(e)}")
                # Add zero embeddings as fallback
                zero_embedding = [0.0] * embedder.get_embedding_dimension()
                all_embeddings.extend([zero_embedding] * len(batch_texts))
        
        if verbose:
            print(f"✅ Generated {len(all_embeddings)} total embeddings")
        
        # Store in vector database
        if verbose:
            print("💾 Storing embeddings in vector database...")
        
        try:
            vector_store.add_documents(all_chunks, all_embeddings)
            
            if verbose:
                print("✅ Documents successfully indexed!")
        
        except Exception as e:
            print(f"❌ Error storing documents: {str(e)}")
            return
        
        # Print statistics
        if verbose:
            print("\n📊 Indexing Statistics:")
            print(f"   Total files processed: {len(file_stats)}")
            print(f"   Total chunks: {len(all_chunks)}")
            print(f"   Total embeddings: {len(all_embeddings)}")
            print(f"   Embedding dimension: {embedder.get_embedding_dimension()}")
            
            print("\n📄 File Details:")
            for file_path, stats in file_stats.items():
                print(f"   {file_path}: {stats['chunks']} chunks, {stats['total_chars']} characters")
            
            # Get vector store statistics
            vector_stats = vector_store.get_collection_stats()
            print(f"\n🗄️  Vector Store Stats:")
            print(f"   Collection: {vector_stats.get('collection_name', 'N/A')}")
            print(f"   Document count: {vector_stats.get('document_count', 'N/A')}")
            print(f"   Persist directory: {vector_stats.get('persist_directory', 'N/A')}")
        
        print("\n🎉 Indexing completed successfully!")
        
    except Exception as e:
        print(f"❌ Indexing failed: {str(e)}")
        raise


def test_retrieval(query: str = "What is murder?", top_k: int = 3) -> None:
    """
    Test the retrieval system with a sample query
    
    Args:
        query: Test query
        top_k: Number of results to retrieve
    """
    try:
        print(f"\n🔍 Testing retrieval with query: '{query}'")
        
        # Initialize RAG retriever
        settings = get_settings()
        from app.ai_system.rag.retriever import RAGRetriever
        
        retriever = RAGRetriever(
            api_key=settings.GOOGLE_API_KEY,
            vector_db_path=settings.VECTOR_DB_PATH
        )
        
        # Test retrieval
        results = retriever.retrieve(query, top_k=top_k)
        
        print(f"📄 Retrieved {len(results)} documents:")
        
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Score: {result['score']:.4f}")
            print(f"   Section: {result['metadata'].get('section_number', 'N/A')}")
            print(f"   Act: {result['metadata'].get('doc_type', 'N/A')}")
            print(f"   Preview: {result['content'][:200]}...")
        
        print("\n✅ Retrieval test completed!")
        
    except Exception as e:
        print(f"❌ Retrieval test failed: {str(e)}")


def main():
    """Main function for command line execution"""
    parser = argparse.ArgumentParser(description="Index legal documents for AI Legal Courtroom Simulator")
    
    parser.add_argument(
        "--docs-dir",
        type=str,
        help="Directory containing legal documents (default: backend/data/legal_docs)"
    )
    
    parser.add_argument(
        "--no-clear",
        action="store_true",
        help="Don't clear existing vector database"
    )
    
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress verbose output"
    )
    
    parser.add_argument(
        "--test",
        action="store_true",
        help="Test retrieval after indexing"
    )
    
    parser.add_argument(
        "--test-query",
        type=str,
        default="What is murder?",
        help="Query for testing retrieval"
    )
    
    args = parser.parse_args()
    
    # Index documents
    index_all_documents(
        docs_directory=args.docs_dir,
        clear_existing=not args.no_clear,
        verbose=not args.quiet
    )
    
    # Test retrieval if requested
    if args.test:
        test_retrieval(args.test_query)


if __name__ == "__main__":
    main()
