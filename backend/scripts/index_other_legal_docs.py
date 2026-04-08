import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.ai_system.rag.embeddings import GeminiEmbeddings
from app.ai_system.rag.vector_store import VectorStore
from app.ai_system.rag.document_processor import LegalChunk, LegalDocumentType
from app.config import get_settings

# Initialize Gemini embedding model
settings = get_settings()
model = GeminiEmbeddings(api_key=settings.GEMINI_API_KEY)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'legal_docs'))

def load_files(folder_name):
    dir_path = os.path.join(BASE_DIR, folder_name)
    files = []
    if os.path.exists(dir_path):
        for fname in os.listdir(dir_path):
            if fname.lower().endswith('.txt'):
                files.append(os.path.join(dir_path, fname))
    return files

def create_chunks(file_path, doc_type, act_year, prefix):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()
    
    basename = os.path.splitext(os.path.basename(file_path))[0]
    section_number = basename.replace(prefix, '')
    
    chunk = LegalChunk(
        content=content,
        doc_type=doc_type,
        section_number=section_number,
        act_year=act_year,
        chapter="",
        metadata={},
        chunk_id=f"{doc_type.value}_{section_number}"
    )
    return [chunk]

def main():
    vector_store = VectorStore()
    
    # Configuration for each type
    configs = [
        ('crpc', LegalDocumentType.CRPC, 1973, 'section_'),
        ('evidence_act', LegalDocumentType.EVIDENCE_ACT, 1872, 'section_'),
        ('constitution', LegalDocumentType.CONSTITUTION, 1950, 'article_')
    ]
    
    total_added = 0
    for folder, doc_type, year, prefix in configs:
        files = load_files(folder)
        if not files:
            continue
            
        all_chunks = []
        for fpath in files:
            chunks = create_chunks(fpath, doc_type, year, prefix)
            all_chunks.extend(chunks)
            
        if all_chunks:
            texts = [c.content for c in all_chunks]
            embeddings = model.embed_documents(texts)
            vector_store.add_documents(all_chunks, embeddings)
            print(f"✅ Indexed {len(all_chunks)} {folder} sections.")
            total_added += len(all_chunks)
            
    print(f"Completed! Total documents added to vector store: {total_added}")

if __name__ == '__main__':
    main()
