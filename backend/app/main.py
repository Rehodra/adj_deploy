"""
Main FastAPI Application for AI Legal Courtroom Simulator
Backend API with Google Gemini integration and RAG system
"""

from dotenv import load_dotenv
load_dotenv()

import io
import os
import json
import hashlib
import logging
from datetime import datetime
from contextlib import asynccontextmanager

import cloudinary
import cloudinary.uploader
import httpx
import uvicorn

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.api.routes import cases, session, argument, audio, auth
from app.db import connect_to_mongo, close_mongo_connection
from app.models.schemas import HealthResponse, ErrorResponse

# ---------------------------------------------------------------------------
# Logger
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Settings (loaded once)
# ---------------------------------------------------------------------------
settings = get_settings()

# ---------------------------------------------------------------------------
# Rate limiter (key = client IP)
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.API_RATE_LIMIT])

# ---------------------------------------------------------------------------
# In-memory TTS URL cache
# ---------------------------------------------------------------------------
_elevenlabs_url_cache: dict[str, str] = {}


# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.ENV.lower() == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
        return response


# ---------------------------------------------------------------------------
# Application lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    print("🚀 Starting AI Legal Courtroom Simulator API...")
    print(f"📅 Started at: {datetime.utcnow()}")

    print(f"⚙️  Environment : {settings.ENV}")
    print(f"🔑 Gemini key  : {'✅ Set' if settings.GEMINI_API_KEY else '❌ Missing'}")
    print(f"📊 VectorDB    : {settings.VECTOR_DB_PATH}")
    print(f"🌐 CORS origins: {settings.CORS_ORIGINS}")

    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

    if not os.path.exists(settings.VECTOR_DB_PATH):
        logger.warning(f"Vector DB path {settings.VECTOR_DB_PATH} not found.")

    await connect_to_mongo()

    yield

    print("🛑 Shutting down AI Legal Courtroom Simulator API...")
    await close_mongo_connection()


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
# Hide interactive docs in production to reduce attack surface
_docs_url = None if settings.ENV.lower() == "production" else "/docs"
_redoc_url = None if settings.ENV.lower() == "production" else "/redoc"

app = FastAPI(
    title="AI Legal Courtroom Simulator API",
    description="Backend for AI-powered legal education platform with Gemini AI and RAG system",
    version="1.0.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url="/openapi.json" if settings.ENV.lower() != "production" else None,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Attach rate-limiter state & handler
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# Middleware — order matters: added last = executed first
# ---------------------------------------------------------------------------

# 1. Trusted-host guard (rejects requests with forged Host headers)
#    Render sends HTTPS traffic, so we also allow the raw *.onrender.com host.
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS + ["*.onrender.com"],
)

# 2. CORS — strictly locked to allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-Request-ID",
    ],
    expose_headers=["X-Request-ID"],
    max_age=600,  # preflight cache 10 minutes
)

# 3. Security headers
app.add_middleware(SecurityHeadersMiddleware)


# ---------------------------------------------------------------------------
# JWT auth dependency (reusable across routes that need protection)
# ---------------------------------------------------------------------------
import jwt as _jwt  # PyJWT


def get_current_user(request: Request) -> dict:
    """
    Dependency: validates Bearer JWT from Authorization header.
    Raises 401 on any failure.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1]
    secret = settings.JWT_SECRET_KEY or settings.SECRET_KEY
    try:
        payload = _jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except _jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except _jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(session.router,  prefix="/api/session",  tags=["session"])
app.include_router(argument.router, prefix="/api/argument", tags=["argument"])
app.include_router(cases.router,    prefix="/api/cases",    tags=["cases"])
app.include_router(audio.router,    prefix="/api/audio",    tags=["audio"])
app.include_router(auth.router,     prefix="/api",          tags=["auth"])


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------
@app.get("/", response_model=dict, tags=["meta"])
@limiter.limit("30/minute")
async def root(request: Request):
    """Root endpoint — API info."""
    return {
        "message": "AI Legal Courtroom Simulator API",
        "status": "running",
        "version": "1.0.0",
        "health": "/health",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health", response_model=HealthResponse, tags=["meta"])
@limiter.limit("30/minute")
async def health_check(request: Request):
    """Comprehensive health check."""
    try:
        dependencies: dict = {}

        # AI provider
        try:
            if settings.AI_PROVIDER == "groq":
                from groq import Groq
                Groq(api_key=settings.GROQ_API_KEY)
                dependencies["ai_provider"] = "✅ Groq (Llama 3.3 70B)"
            else:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                client.models.list()
                dependencies["ai_provider"] = "✅ Gemini Connected"
        except Exception as exc:
            dependencies["ai_provider"] = f"❌ {exc}"

        # ChromaDB
        try:
            import chromadb
            chroma_client = chromadb.PersistentClient(path=settings.VECTOR_DB_PATH)
            cols = chroma_client.list_collections()
            dependencies["chromadb"] = f"✅ {len(cols)} collections"
        except Exception as exc:
            dependencies["chromadb"] = f"❌ {exc}"

        # Gemini embeddings
        try:
            from app.ai_system.rag.embeddings import GeminiEmbeddings  # noqa: F401
            dependencies["gemini_embeddings"] = "✅ Available (text-embedding-004)"
        except Exception as exc:
            dependencies["gemini_embeddings"] = f"❌ {exc}"

        all_healthy = all("✅" in s for s in dependencies.values())

        return HealthResponse(
            status="healthy" if all_healthy else "degraded",
            version="1.0.0",
            uptime=None,
            dependencies=dependencies,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Health check failed: {exc}")


@app.get("/api/info", response_model=dict, tags=["meta"])
@limiter.limit("20/minute")
async def api_info(request: Request):
    """Get API information (sanitised — no secrets exposed)."""
    return {
        "api": {
            "name": "AI Legal Courtroom Simulator",
            "version": "1.0.0",
            "description": "Backend for AI-powered legal education platform",
            "framework": "FastAPI",
            "ai_provider": settings.AI_PROVIDER,
            "vector_database": "ChromaDB",
            "embedding_model": "Google Embeddings API",
        },
        "features": {
            "ai_judge": "Legal argument evaluation with scoring",
            "ai_opponent": "Dynamic counter-argument generation",
            "rag_system": "Retrieval-Augmented Generation for legal knowledge",
            "session_management": "Multi-session game management",
            "performance_analytics": "Detailed performance tracking",
            "real_time_evaluation": "Instant argument feedback",
        },
        "legal_domains": {
            "criminal_law": "Indian Penal Code (IPC)",
            "civil_law": "Code of Civil Procedure (CPC)",
            "evidence_law": "Indian Evidence Act",
            "constitutional_law": "Constitution of India",
        },
        "scoring": {
            "legal_accuracy": 40,
            "reasoning": 35,
            "evidence": 25,
            "performance_tiers": [
                "Law Student", "Junior Advocate", "Competent Advocate", "Senior Counsel"
            ],
        },
        "endpoints": {
            "session_management": "/api/session",
            "argument_submission": "/api/argument",
            "health_check": "/health",
        },
    }


# ---------------------------------------------------------------------------
# ElevenLabs TTS endpoint
# ---------------------------------------------------------------------------
_ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")


@app.get("/tts", tags=["audio"])
@limiter.limit("20/minute")
async def elevenlabs_tts(request: Request, text: str, role: str = "judge"):
    """Proxy ElevenLabs TTS and cache result on Cloudinary."""
    text = text.strip()[:300]
    key = hashlib.md5(text.encode()).hexdigest()

    if key in _elevenlabs_url_cache:
        return RedirectResponse(url=_elevenlabs_url_cache[key])

    voice_id = "JBFqnCBsd6RMkjVDRZzb"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
    headers = {
        "xi-api-key": _ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.3, "similarity_boost": 0.7},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            logger.error("ElevenLabs error: %s", response.text)
            return JSONResponse({"error": "TTS failed"}, status_code=500)

        if not response.content or len(response.content) < 1000:
            logger.error("ElevenLabs returned empty audio")
            return JSONResponse({"error": "Empty audio"}, status_code=500)

        upload_result = cloudinary.uploader.upload(
            io.BytesIO(response.content),
            public_id=f"elevenlabs_{key}",
            resource_type="video",
            folder="adjournment_tts",
            overwrite=False,
        )
        cdn_url = upload_result["secure_url"]
        _elevenlabs_url_cache[key] = cdn_url
        logger.info("Uploaded ElevenLabs TTS to Cloudinary: %s", cdn_url)
        return RedirectResponse(url=cdn_url)

    except Exception as exc:
        logger.exception("TTS exception: %s", exc)
        return JSONResponse({"error": "Internal TTS error"}, status_code=500)


# ---------------------------------------------------------------------------
# Development-only debug endpoints
# ---------------------------------------------------------------------------
if settings.ENV.lower() != "production":

    @app.get("/debug/config", tags=["debug"])
    async def debug_config():
        """View configuration — development only."""
        return {
            "environment": settings.ENV,
            "debug": settings.DEBUG,
            "cors_origins": settings.CORS_ORIGINS,
            "allowed_hosts": settings.ALLOWED_HOSTS,
            "vector_db_path": settings.VECTOR_DB_PATH,
            "log_level": settings.LOG_LEVEL,
            "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        }

    @app.get("/debug/test-ai", tags=["debug"])
    async def test_ai_connection():
        """Test AI connection — development only."""
        try:
            from app.ai_system.rag.retriever import RAGRetriever
            from app.ai_system.agents.judge_agent import JudgeAgent

            rag = RAGRetriever(api_key=settings.GEMINI_API_KEY)
            judge = JudgeAgent(api_key=settings.GEMINI_API_KEY, rag_retriever=rag)
            return {
                "rag_system": rag.get_stats(),
                "judge_agent": judge.get_judge_info(),
                "status": "✅ AI systems operational",
            }
        except Exception as exc:
            return {"status": "❌ AI system test failed", "error": str(exc)}


# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_data = ErrorResponse(
        error="HTTPException",
        message=exc.detail,
        details={"status_code": exc.status_code},
        timestamp=datetime.utcnow(),
    ).model_dump()
    error_data["timestamp"] = error_data["timestamp"].isoformat()
    return JSONResponse(status_code=exc.status_code, content=error_data)


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    # Never leak internal details in production
    detail = str(exc) if settings.ENV.lower() != "production" else "An unexpected error occurred"
    error_data = ErrorResponse(
        error="InternalServerError",
        message=detail,
        details={},
        timestamp=datetime.utcnow(),
    ).model_dump()
    error_data["timestamp"] = error_data["timestamp"].isoformat()
    return JSONResponse(status_code=500, content=error_data)


# ---------------------------------------------------------------------------
# Entry point (local dev only)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("🚀 Starting AI Legal Courtroom Simulator API...")
    print(f"📍 Environment : {settings.ENV}")
    print(f"🌐 CORS Origins: {settings.CORS_ORIGINS}")
    print(f"📚 Docs        : http://localhost:8000/docs")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
