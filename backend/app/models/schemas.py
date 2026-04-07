"""
Pydantic Schemas for AI Legal Courtroom Simulator
Defines request and response models for API endpoints
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from enum import Enum
from datetime import datetime


# Enums
class GameMode(str, Enum):
    CRIMINAL = "criminal"
    CIVIL = "civil"
    CONSTITUTIONAL = "constitutional"


class CourtPhase(str, Enum):
    OPENING_STATEMENT = "opening_statement"
    ARGUMENT = "argument"
    CROSS_EXAMINATION = "cross_examination"
    CLOSING_STATEMENT = "closing_statement"
    JUDGMENT = "judgment"


class Position(str, Enum):
    PROSECUTION = "prosecution"
    DEFENSE = "defense"


class PerformanceTier(str, Enum):
    SENIOR_COUNSEL = "Senior Counsel"
    COMPETENT_ADVOCATE = "Competent Advocate"
    JUNIOR_ADVOCATE = "Junior Advocate"
    LAW_STUDENT = "Law Student"


# Request Models
class ArgumentRequest(BaseModel):
    """Request model for argument submission"""
    session_id: str = Field(..., description="Unique session identifier")
    argument_text: str = Field(..., min_length=10, max_length=2000, description="Legal argument text")
    cited_sections: List[str] = Field(default_factory=list, description="List of cited legal sections")
    evidence_references: List[str] = Field(default_factory=list, description="List of evidence references")
    phase: Optional[CourtPhase] = Field(CourtPhase.ARGUMENT, description="Current courtroom phase")
    language: Optional[str] = Field("English", description="Communication language")


class SessionCreateRequest(BaseModel):
    """Request model for session creation"""
    case_id: str = Field(..., description="Case identifier")
    user_id: str = Field(..., description="User identifier")
    mode: GameMode = Field(..., description="Game mode (criminal/civil/constitutional)")
    difficulty: Optional[str] = Field("medium", description="Difficulty level")


class ObjectionRequest(BaseModel):
    """Request model for objection handling"""
    session_id: str = Field(..., description="Session identifier")
    objection_type: str = Field(..., description="Type of objection")
    objection_text: str = Field(..., description="Objection text")
    target_argument: Optional[str] = Field(None, description="Target argument ID")


class ChatRequest(BaseModel):
    """Request model for general chat queries"""
    message: str = Field(..., min_length=1, max_length=5000, description="Chat message")
    language: Optional[str] = Field("English", description="Preferred language")


# Response Models
class EvaluationResponse(BaseModel):
    """Response model for argument evaluation"""
    legal_accuracy_score: float = Field(..., ge=0, le=100, description="Legal accuracy score (0-100)")
    reasoning_score: float = Field(..., ge=0, le=100, description="Reasoning score (0-100)")
    evidence_score: float = Field(..., ge=0, le=100, description="Evidence score (0-100)")
    overall_score: float = Field(..., ge=0, le=100, description="Overall weighted score (0-100)")
    feedback: str = Field(..., description="Detailed feedback from judge")
    correct_sections: List[str] = Field(default_factory=list, description="Correctly cited sections")
    incorrect_sections: List[Dict[str, str]] = Field(default_factory=list, description="Incorrectly cited sections with explanations")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")
    turn_score: float = Field(..., ge=0, le=100, description="Score for this specific turn")
    cumulative_score: float = Field(..., ge=0, description="Total cumulative score")
    performance_tier: PerformanceTier = Field(..., description="Current performance tier")
    opponent_response: str = Field(..., description="Counter-argument from opponent")


class SessionResponse(BaseModel):
    """Response model for session information"""
    session_id: str = Field(..., description="Session identifier")
    case_id: str = Field(..., description="Case identifier")
    user_id: str = Field(..., description="User identifier")
    mode: GameMode = Field(..., description="Game mode")
    current_phase: CourtPhase = Field(..., description="Current courtroom phase")
    case_facts: Dict = Field(..., description="Case facts and details")
    score: float = Field(default=0.0, ge=0, description="Current total score")
    performance_tier: PerformanceTier = Field(default=PerformanceTier.LAW_STUDENT, description="Current performance tier")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Session creation timestamp")
    last_activity: Optional[datetime] = Field(None, description="Last activity timestamp")


class OpponentResponse(BaseModel):
    """Response model for opponent counter-argument"""
    counter_argument: str = Field(..., description="Counter-argument text")
    position: Position = Field(..., description="Opponent position (prosecution/defense)")
    strategy: Optional[str] = Field(None, description="Strategy used")
    personality: Optional[str] = Field(None, description="Personality type")
    confidence_level: Optional[float] = Field(None, ge=0, le=1, description="Confidence level (0-1)")


class AnalyticsResponse(BaseModel):
    """Response model for performance analytics"""
    total_arguments: int = Field(..., ge=0, description="Total number of arguments submitted")
    average_score: float = Field(..., ge=0, le=100, description="Average score across all arguments")
    best_score: float = Field(..., ge=0, le=100, description="Best score achieved")
    worst_score: float = Field(..., ge=0, le=100, description="Worst score achieved")
    improvement_trend: str = Field(..., description="Performance trend (improving/stable/declining)")
    consistency_score: float = Field(..., ge=0, le=100, description="Consistency score")
    performance_tier: PerformanceTier = Field(..., description="Current performance tier")
    correct_sections_count: int = Field(..., ge=0, description="Total correctly cited sections")
    incorrect_sections_count: int = Field(..., ge=0, description="Total incorrectly cited sections")
    improvement_suggestions: List[str] = Field(default_factory=list, description="Personalized improvement suggestions")
    score_breakdown: Dict[str, float] = Field(..., description="Average scores by component")


class ObjectionResponse(BaseModel):
    """Response model for objection ruling"""
    objection_type: str = Field(..., description="Type of objection")
    ruling: Literal["sustained", "overruled", "withdrawn"] = Field(..., description="Objection ruling")
    reasoning: str = Field(..., description="Reasoning for the ruling")
    impact: Optional[str] = Field(None, description="Impact on the argument")


class CaseFacts(BaseModel):
    """Model for case facts"""
    case_id: str = Field(..., description="Case identifier")
    title: str = Field(..., description="Case title")
    type: str = Field(..., description="Case type")
    charges: List[str] = Field(default_factory=list, description="List of charges")
    facts: str = Field(..., description="Case facts description")
    evidence: List[str] = Field(default_factory=list, description="List of evidence items")
    fir_details: Optional[Dict] = Field(None, description="FIR details for criminal cases")
    plaintiff_details: Optional[Dict] = Field(None, description="Plaintiff details for civil cases")
    legal_provisions: List[str] = Field(default_factory=list, description="Relevant legal provisions")


class PerformanceMetrics(BaseModel):
    """Model for detailed performance metrics"""
    legal_accuracy_avg: float = Field(..., ge=0, le=100, description="Average legal accuracy score")
    reasoning_avg: float = Field(..., ge=0, le=100, description="Average reasoning score")
    evidence_avg: float = Field(..., ge=0, le=100, description="Average evidence score")
    total_arguments: int = Field(..., ge=0, description="Total arguments submitted")
    session_duration: Optional[int] = Field(None, description="Session duration in minutes")
    most_cited_sections: List[str] = Field(default_factory=list, description="Most frequently cited sections")
    common_mistakes: List[str] = Field(default_factory=list, description="Common mistakes identified")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")


class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict] = Field(None, description="Additional error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")


class SuccessResponse(BaseModel):
    """Standard success response model"""
    message: str = Field(..., description="Success message")
    data: Optional[Dict] = Field(None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class ChatResponse(BaseModel):
    """Response model for chat queries"""
    response: str = Field(..., description="AI response text")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    uptime: Optional[float] = Field(None, description="Service uptime in seconds")
    dependencies: Dict[str, str] = Field(default_factory=dict, description="Dependency status")


# WebSocket Models
class WebSocketMessage(BaseModel):
    """Base WebSocket message model"""
    type: str = Field(..., description="Message type")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")


class ArgumentWebSocketMessage(WebSocketMessage):
    """WebSocket message for argument submission"""
    session_id: str = Field(..., description="Session identifier")
    argument_text: str = Field(..., description="Argument text")
    cited_sections: List[str] = Field(default_factory=list, description="Cited sections")


class EvaluationWebSocketMessage(WebSocketMessage):
    """WebSocket message for evaluation response"""
    session_id: str = Field(..., description="Session identifier")
    evaluation: Dict = Field(..., description="Evaluation data")
    opponent_response: str = Field(..., description="Opponent counter-argument")


class ObjectionWebSocketMessage(WebSocketMessage):
    """WebSocket message for objection handling"""
    session_id: str = Field(..., description="Session identifier")
    objection_type: str = Field(..., description="Objection type")
    objection_text: str = Field(..., description="Objection text")


# Internal Models (not exposed in API)
class ArgumentHistory(BaseModel):
    """Internal model for storing argument history"""
    argument_id: str
    session_id: str
    argument_text: str
    cited_sections: List[str]
    evaluation: Dict
    opponent_response: str
    turn_score: float
    phase: CourtPhase
    timestamp: datetime


class SessionState(BaseModel):
    """Internal model for session state"""
    session_id: str
    case_id: str
    user_id: str
    mode: GameMode
    current_phase: CourtPhase
    case_facts: CaseFacts
    arguments: List[ArgumentHistory] = Field(default_factory=list)
    total_score: float = Field(default=0.0)
    performance_tier: PerformanceTier = Field(default=PerformanceTier.LAW_STUDENT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)


# Configuration Models
class ModelConfig(BaseModel):
    """Model configuration settings"""
    model_name: str = Field(default="gpt-4", description="AI model name")
    temperature: float = Field(default=0.7, ge=0, le=1, description="Response temperature")
    max_tokens: int = Field(default=2000, ge=100, le=8000, description="Maximum response tokens")
    rate_limit_delay: float = Field(default=0.5, ge=0, description="Rate limiting delay in seconds")


class RAGConfig(BaseModel):
    """RAG system configuration"""
    top_k_retrieval: int = Field(default=8, ge=1, le=20, description="Number of documents to retrieve")
    similarity_threshold: float = Field(default=0.7, ge=0, le=1, description="Similarity threshold")
    chunk_size: int = Field(default=800, ge=100, le=2000, description="Document chunk size")
    chunk_overlap: int = Field(default=150, ge=0, le=500, description="Document chunk overlap")


# Example usage and documentation
"""
Example Request:
{
    "session_id": "abc123",
    "argument_text": "The accused should be convicted under Section 302 IPC as there is clear evidence of intent to cause death...",
    "cited_sections": ["302", "300"],
    "evidence_references": ["forensic_report", "witness_testimony"],
    "phase": "argument"
}

Example Response:
{
    "legal_accuracy_score": 85.0,
    "reasoning_score": 90.0,
    "evidence_score": 80.0,
    "overall_score": 85.5,
    "feedback": "Excellent legal accuracy with proper citation of Section 302...",
    "correct_sections": ["302", "300"],
    "incorrect_sections": [],
    "suggestions": ["Consider citing Section 304 for alternative charges"],
    "turn_score": 85.5,
    "cumulative_score": 85.5,
    "performance_tier": "Competent Advocate",
    "opponent_response": "Your Honor, the prosecution respectfully disagrees..."
}
"""
