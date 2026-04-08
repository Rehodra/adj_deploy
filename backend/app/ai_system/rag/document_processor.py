"""
Document Processor for AI Legal Courtroom Simulator
Implements intelligent chunking strategies for Indian legal documents
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import hashlib
import re


class LegalDocumentType(Enum):
    """Types of Indian legal documents"""
    IPC = "Indian Penal Code"
    CRPC = "Code of Criminal Procedure"
    EVIDENCE_ACT = "Indian Evidence Act"
    CASE_LAW = "Case Law"
    CONSTITUTION = "Constitution of India"
    CPC = "Code of Civil Procedure"


@dataclass
class LegalChunk:
    """Represents a chunk of legal document with metadata"""
    content: str
    doc_type: LegalDocumentType
    section_number: Optional[str]
    act_year: Optional[int]
    chapter: Optional[str]
    metadata: Dict
    chunk_id: str


class LegalDocumentProcessor:
    """
    Implements intelligent chunking strategies for legal documents
    """
    
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
    def count_tokens(self, text: str) -> int:
        """Estimate token count (rough approximation)"""
        return len(text.split()) * 1.3  # Rough estimate: ~1.3 tokens per word
    
    def process_document(self, filepath: str) -> List[LegalChunk]:
        """
        Process a legal document file and return chunks
        """
        # Determine document type from filename
        doc_type = self._detect_document_type(filepath)
        
        # Read file content
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return self.chunk_by_section(content, doc_type)
    
    def chunk_by_section(self, document: str, doc_type: LegalDocumentType) -> List[LegalChunk]:
        """
        Section-aware chunking for legal acts
        Preserves section boundaries and adds contextual overlap
        """
        chunks = []
        
        # Pattern matching for different act structures
        if doc_type == LegalDocumentType.IPC:
            sections = self._split_ipc_sections(document)
        elif doc_type == LegalDocumentType.CRPC:
            sections = self._split_crpc_sections(document)
        elif doc_type == LegalDocumentType.EVIDENCE_ACT:
            sections = self._split_evidence_sections(document)
        else:
            sections = self._generic_split(document)
        
        for section_data in sections:
            chunk = LegalChunk(
                content=section_data['content'],
                doc_type=doc_type,
                section_number=section_data.get('section_number'),
                act_year=section_data.get('year'),
                chapter=section_data.get('chapter'),
                metadata=section_data.get('metadata', {}),
                chunk_id=self._generate_chunk_id(section_data['content'])
            )
            chunks.append(chunk)
        
        return chunks
    
    def _detect_document_type(self, filepath: str) -> LegalDocumentType:
        """Detect document type from filename"""
        filename = filepath.lower()
        if 'ipc' in filename:
            return LegalDocumentType.IPC
        elif 'crpc' in filename:
            return LegalDocumentType.CRPC
        elif 'evidence' in filename:
            return LegalDocumentType.EVIDENCE_ACT
        elif 'constitution' in filename:
            return LegalDocumentType.CONSTITUTION
        elif 'cpc' in filename:
            return LegalDocumentType.CPC
        else:
            return LegalDocumentType.CASE_LAW
    
    def _split_ipc_sections(self, document: str) -> List[Dict]:
        """
        IPC-specific splitting logic
        Example: Section 300 - Murder vs Section 304 - Culpable homicide
        """
        sections = []
        
        # Pattern: "Section XXX" or "Section XXX-A" etc.
        section_pattern = r'Section\s+(\d+[A-Z]?)\s*[.:-]\s*([^\n]+)'
        matches = list(re.finditer(section_pattern, document, re.IGNORECASE))
        
        if not matches:
            # If no section patterns found, do generic split
            return self._generic_split(document)
        
        for i, match in enumerate(matches):
            section_num = match.group(1)
            section_title = match.group(2).strip()
            start_pos = match.start()
            
            # Extract content until next section
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(document)
            
            content = document[start_pos:end_pos].strip()
            
            # Add overlap with previous section for context
            if i > 0:
                overlap_start = max(0, start_pos - 200)
                overlap_text = document[overlap_start:start_pos].strip()
                if overlap_text:
                    content = f"[Previous context: {overlap_text[-150:]}]\n\n{content}"
            
            sections.append({
                'section_number': section_num,
                'title': section_title,
                'content': content,
                'year': 1860,  # IPC enacted in 1860
                'metadata': {
                    'section_title': section_title,
                    'act': 'IPC',
                    'offense_type': self._classify_offense(section_num)
                }
            })
        
        return sections
    
    def _classify_offense(self, section_number: str) -> str:
        """Classify IPC section into offense categories"""
        # Extract numeric part
        numeric_part = ''.join(filter(str.isdigit, section_number))
        if not numeric_part:
            return "General Offenses"
        
        section_num = int(numeric_part)
        
        if 120 <= section_num <= 130:
            return "Offenses Against State"
        elif 299 <= section_num <= 311:
            return "Offenses Affecting Life"
        elif 319 <= section_num <= 338:
            return "Hurt and Grievous Hurt"
        elif 354 <= section_num <= 376:
            return "Sexual Offenses"
        elif 378 <= section_num <= 462:
            return "Property Offenses"
        else:
            return "General Offenses"
    
    def _split_crpc_sections(self, document: str) -> List[Dict]:
        """CrPC-specific splitting"""
        # Similar logic for CrPC structure
        return self._generic_split(document)
    
    def _split_evidence_sections(self, document: str) -> List[Dict]:
        """Evidence Act specific splitting"""
        return self._generic_split(document)
    
    def _generic_split(self, document: str) -> List[Dict]:
        """Generic recursive splitting for other documents"""
        # Simple chunking by paragraphs
        paragraphs = document.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
                
            # Check if adding this paragraph exceeds chunk size
            if len(current_chunk) + len(paragraph) > self.chunk_size and current_chunk:
                chunks.append({
                    'content': current_chunk.strip(),
                    'metadata': {'split_type': 'generic'}
                })
                current_chunk = paragraph
            else:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
        
        # Add remaining content
        if current_chunk:
            chunks.append({
                'content': current_chunk.strip(),
                'metadata': {'split_type': 'generic'}
            })
        
        return chunks
    
    def _generate_chunk_id(self, content: str) -> str:
        """Generate unique ID for chunk"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]


# Example usage
if __name__ == "__main__":
    # Initialize processor
    processor = LegalDocumentProcessor(chunk_size=800, chunk_overlap=150)
    
    # Sample IPC document
    sample_ipc = """
    Section 300 - Murder
    
    Except in the cases hereinafter excepted, culpable homicide is murder, if the act by which the death is caused is done with the intention of causing death, or—
    
    Secondly—If it is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused, or—
    
    Thirdly—If it is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death, or—
    
    Fourthly—If the person committing the act knows that it is so imminently dangerous that it must, in all probability, cause death or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.
    
    Section 304 - Punishment for culpable homicide not amounting to murder
    
    Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death, or of causing such bodily injury as is likely to cause death,
    """
    
    # Chunk document
    chunks = processor.chunk_by_section(sample_ipc, LegalDocumentType.IPC)
    
    print(f"Generated {len(chunks)} chunks")
    for chunk in chunks:
        print(f"\nSection: {chunk.section_number}")
        print(f"Offense Type: {chunk.metadata.get('offense_type')}")
        print(f"Content preview: {chunk.content[:200]}...")
