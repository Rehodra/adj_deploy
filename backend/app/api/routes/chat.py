"""
Chat API Routes for AI Legal Courtroom Simulator
Handles general chat queries from the global chatbot
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.ai_system.agents.chat_agent import ChatAgent
from app.config import get_settings

router = APIRouter(tags=["chat"])

# Initialize Chat agent (singleton pattern)
_settings = get_settings()
_chat_agent = None

def get_chat_agent() -> ChatAgent:
    """Get or initialize chat agent"""
    global _chat_agent
    if _chat_agent is None:
        provider = getattr(_settings, "AI_PROVIDER", "gemini").lower()
        if provider == "groq":
            api_key = getattr(_settings, "GROQ_API_KEY", "")
            model_name = getattr(_settings, "CHAT_MODEL", "llama-3.3-70b-versatile")
        else:
            api_key = _settings.GEMINI_API_KEY
            model_name = _settings.GEMINI_MODEL
            
        _chat_agent = ChatAgent(
            api_key=api_key,
            model_name=model_name,
            provider=provider
        )
    return _chat_agent

@router.post("/query", response_model=ChatResponse)
async def chat_query(
    request: ChatRequest,
    agent: ChatAgent = Depends(get_chat_agent)
):
    """
    Handle a chat query from the global chatbot
    
    Args:
        request: Chat query request
        agent: Chat agent instance
        
    Returns:
        Chat response with AI text
    """
    try:
        response_text = agent.get_chat_response(
            message=request.message,
            language=request.language
        )
        
        return ChatResponse(response=response_text)
        
    except Exception as e:
        print(f"Error in chat_query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat query: {str(e)}"
        )
