"""
Main FastAPI Application for AI Legal Courtroom Simulator
Backend API with Google Gemini integration and RAG system
"""

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import json
import os # Added for os.path.exists check
import logging # Added for logger
from fastapi.responses import StreamingResponse
from gtts import gTTS
import io
import requests
import httpx
import hashlib
from socketio import ASGIApp
from app.config import get_settings
from app.api.routes import cases, session, argument, audio, auth, chat
from app.db import connect_to_mongo, close_mongo_connection
from app.models.schemas import HealthResponse, ErrorResponse
from app.sockets.socket_manager import get_sio
from app.sockets import events as socket_events

load_dotenv()
# Initialize logger
logger = logging.getLogger(__name__)

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    # Startup
    print("🚀 Starting AI Legal Courtroom Simulator API...")
    print(f"📅 Started at: {datetime.utcnow()}")
    
    # Initialize components
    settings = get_settings()
    print(f"⚙️ Environment: {settings.ENV}")
    print(f"🔑 Google Gemini API Key: {'✅ Configured' if settings.GEMINI_API_KEY else '❌ Missing'}")
    print(f"📊 Vector DB Path: {settings.VECTOR_DB_PATH}")

    logger.info("Initializing vector database...")
    if not os.path.exists(settings.VECTOR_DB_PATH):
        logger.warning(f"Vector DB path {settings.VECTOR_DB_PATH} not found.")
    
    # Initialize MongoDB
    await connect_to_mongo()
        
    yield
    
    # Shutdown
    print("🛑 Shutting down AI Legal Courtroom Simulator API...")
    logger.info("Shutting down application...")
    await close_mongo_connection()


# Create FastAPI application
settings = get_settings()
app = FastAPI(
    title="AI Legal Courtroom Simulator API",
    description="Backend for AI-powered legal education platform with Gemini AI and RAG system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(session.router, prefix="/api/session", tags=["session"])
app.include_router(argument.router, prefix="/api/argument", tags=["argument"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


# Root endpoint
@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Legal Courtroom Simulator API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "timestamp": datetime.utcnow()
    }


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check"""
    try:
        # Check dependencies
        dependencies = {}
        
        # Check AI Provider
        try:
            if settings.AI_PROVIDER == "groq":
                from groq import Groq
                groq_client = Groq(api_key=settings.GROQ_API_KEY)
                dependencies["ai_provider"] = "✅ Groq (Llama 3.3 70B)"
            else:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                models = client.models.list()
                dependencies["ai_provider"] = "✅ Gemini Connected"
        except Exception as e:
            dependencies["ai_provider"] = f"❌ Error: {str(e)}"
        
        # Check ChromaDB (vector database)
        try:
            import chromadb
            client = chromadb.PersistentClient(path=settings.VECTOR_DB_PATH)
            collections = client.list_collections()
            dependencies["chromadb"] = f"✅ {len(collections)} collections"
        except Exception as e:
            dependencies["chromadb"] = f"❌ Error: {str(e)}"
        
        # Check sentence transformers (embeddings)
        try:
            from sentence_transformers import SentenceTransformer
            dependencies["sentence_transformers"] = "✅ Available"
        except Exception as e:
            dependencies["sentence_transformers"] = f"❌ Error: {str(e)}"
        
        # Overall status
        all_healthy = all("✅" in status for status in dependencies.values())
        
        return HealthResponse(
            status="healthy" if all_healthy else "degraded",
            version="1.0.0",
            uptime=None,  # Could be calculated from startup time
            dependencies=dependencies
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )


# API info endpoint
@app.get("/api/info", response_model=dict)
async def api_info():
    """Get detailed API information"""
    return {
        "api": {
            "name": "AI Legal Courtroom Simulator",
            "version": "1.0.0",
            "description": "Backend for AI-powered legal education platform",
            "framework": "FastAPI",
            "ai_provider": "Google Gemini",
            "vector_database": "ChromaDB",
            "embedding_model": "Google Embeddings API"
        },
        "features": {
            "ai_judge": "Legal argument evaluation with scoring",
            "ai_opponent": "Dynamic counter-argument generation",
            "rag_system": "Retrieval-Augmented Generation for legal knowledge",
            "session_management": "Multi-session game management",
            "performance_analytics": "Detailed performance tracking",
            "real_time_evaluation": "Instant argument feedback"
        },
        "legal_domains": {
            "criminal_law": "Indian Penal Code (IPC)",
            "civil_law": "Code of Civil Procedure (CPC)",
            "evidence_law": "Indian Evidence Act",
            "constitutional_law": "Constitution of India"
        },
        "scoring": {
            "legal_accuracy": 40,
            "reasoning": 35,
            "evidence": 25,
            "performance_tiers": ["Law Student", "Junior Advocate", "Competent Advocate", "Senior Counsel"]
        },
        "endpoints": {
            "session_management": "/api/session",
            "argument_submission": "/api/argument",
            "documentation": "/docs",
            "health_check": "/health"
        },
        "configuration": {
            "cors_origins": settings.CORS_ORIGINS,
            "vector_db_path": settings.VECTOR_DB_PATH,
            "log_level": settings.LOG_LEVEL
        }
    }


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handle HTTP exceptions"""
    error_data = ErrorResponse(
        error="HTTPException",
        message=exc.detail,
        details={"status_code": exc.status_code},
        timestamp=datetime.utcnow()
    ).dict()
    
    # Convert datetime to string for JSON serialization
    error_data["timestamp"] = error_data["timestamp"].isoformat()
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_data
    )

#For TEXT TO SPEECH
# @app.get("/tts")
# def text_to_speech(text: str, role: str = "user"):
#     import io
#     from gtts import gTTS
#     from fastapi.responses import StreamingResponse

#     audio_bytes = io.BytesIO()

#     # 🎭 Role-based language
#     if role == "judge":
#         tts = gTTS(text=text, lang="en", tld="co.in")
#     elif role == "opponent":
#         tts = gTTS(text=text, lang="en")
#     elif role == "user":
#         tts = gTTS(text=text, lang="bn")  # example Bengali
#     else:
#         tts = gTTS(text=text, lang="en")

#     tts.write_to_fp(audio_bytes)
#     audio_bytes.seek(0)

#     return StreamingResponse(audio_bytes, media_type="audio/mpeg")

#11Labs TTS Endpoint
API_KEY = os.getenv("ELEVENLABS_API_KEY")

@app.get("/tts")
async def elevenlabs_tts(text: str, role: str = "judge"):

    # 1. Trim text
    text = text.strip()[:300]

    # 2. Ensure cache folder exists
    os.makedirs("cache", exist_ok=True)

    # 3. Cache key
    key = hashlib.md5(text.encode()).hexdigest()
    file_path = f"cache/{key}.mp3"

    # 4. Return cached audio
    if os.path.exists(file_path) and os.path.getsize(file_path) > 1000:
        return StreamingResponse(open(file_path, "rb"), media_type="audio/mpeg")

    voice_id = "JBFqnCBsd6RMkjVDRZzb"

    # ✅ IMPORTANT: use /stream
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"

    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.3,
            "similarity_boost": 0.7
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data, headers=headers)

        # ❌ Handle API errors
        if response.status_code != 200:
            print("❌ ElevenLabs error:", response.text)
            return JSONResponse(
                {"error": "TTS failed", "details": response.text},
                status_code=500
            )

        # ❌ Check empty/bad audio
        if not response.content or len(response.content) < 1000:
            print("❌ Empty audio received")
            return JSONResponse(
                {"error": "Empty audio"},
                status_code=500
            )

        # 5. Save valid audio
        with open(file_path, "wb") as f:
            f.write(response.content)

        # 6. Return audio
        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg"
        )

    except Exception as e:
        print("❌ TTS Exception:", str(e))
        return JSONResponse(
            {"error": "Internal TTS error"},
            status_code=500
        )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    error_data = ErrorResponse(
        error="InternalServerError",
        message="An unexpected error occurred",
        details={"exception": str(exc)},
        timestamp=datetime.utcnow()
    ).dict()
    
    # Convert datetime to string for JSON serialization
    error_data["timestamp"] = error_data["timestamp"].isoformat()
    
    return JSONResponse(
        status_code=500,
        content=error_data
    )


# Development endpoints (only in development mode)
if settings.ENV.lower() == "development":
    
    @app.get("/debug/config")
    async def debug_config():
        """Debug endpoint to view configuration (development only)"""
        return {
            "environment": settings.ENV,
            "debug": settings.DEBUG,
            "cors_origins": settings.CORS_ORIGINS,
            "vector_db_path": settings.VECTOR_DB_PATH,
            "log_level": settings.LOG_LEVEL,
            "gemini_api_configured": bool(settings.GEMINI_API_KEY)
        }
    
    @app.get("/debug/test-ai")
    async def test_ai_connection():
        """Test AI connection (development only)"""
        try:
            from app.ai_system.rag.retriever import RAGRetriever
            from app.ai_system.agents.judge_agent import JudgeAgent
            
            # Test RAG system
            rag = RAGRetriever(api_key=settings.GEMINI_API_KEY)
            stats = rag.get_stats()
            
            # Test judge agent
            judge = JudgeAgent(api_key=settings.GEMINI_API_KEY, rag_retriever=rag)
            judge_info = judge.get_judge_info()
            
            return {
                "rag_system": stats,
                "judge_agent": judge_info,
                "status": "✅ AI systems operational"
            }
            
        except Exception as e:
            return {
                "status": "❌ AI system test failed",
                "error": str(e)
            }


# Production middleware and optimizations
if settings.ENV.lower() == "production":
    # Add production-specific middleware here
    # For example: logging, rate limiting, monitoring, etc.
    pass


# Socket.io integration with ASGI
sio = get_sio()
socket_asgi_app = ASGIApp(sio, app)


# Run the application
if __name__ == "__main__":
    print("🚀 Starting AI Legal Courtroom Simulator API...")
    print(f"📍 Environment: {settings.ENV}")
    print(f"🌐 CORS Origins: {settings.CORS_ORIGINS}")
    print(f"📚 Documentation: http://localhost:8000/docs")
    print(f"🔌 WebSocket: ws://localhost:8000/socket.io")
    
    uvicorn.run(
        socket_asgi_app,
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
