from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List
import json


class Settings(BaseSettings):
    """Application settings"""
    
    # Google Gemini API
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash", env="GEMINI_MODEL")
    
    # AI Provider (gemini or groq)
    AI_PROVIDER: str = Field(default="gemini", env="AI_PROVIDER")
    
    # Groq API (free alternative)
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile", env="GROQ_MODEL")
    
    # Separate keys/models for agents
    JUDGE_API_KEY: str = Field(default="", env="JUDGE_API_KEY")
    JUDGE_MODEL: str = Field(default="llama-3.3-70b-versatile", env="JUDGE_MODEL")
    
    OPPONENT_API_KEY: str = Field(default="", env="OPPONENT_API_KEY")
    OPPONENT_MODEL: str = Field(default="llama-3.1-8b-instant", env="OPPONENT_MODEL")
    
    # Application
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=False, env="DEBUG")
    SECRET_KEY: str = Field(default="your-secret-key-change-this", env="SECRET_KEY")
    JWT_SECRET_KEY: str = Field(default="", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRE_MINUTES: int = Field(default=10080, env="JWT_EXPIRE_MINUTES")
    
    # Sarvam AI
    SARVAM_API_KEY: str = Field(default="", env="SARVAM_API_KEY")
    
    # ElevenLabs TTS
    ELEVENLABS_API_KEY: str = Field(default="", env="ELEVENLABS_API_KEY")

    # Cloudinary (audio file hosting)
    CLOUDINARY_CLOUD_NAME: str = Field(default="", env="CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str = Field(default="", env="CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str = Field(default="", env="CLOUDINARY_API_SECRET")

    # MongoDB
    MONGODB_URI: str = Field(default="mongodb://localhost:27017", env="MONGODB_URI")
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(default="", env="GOOGLE_REDIRECT_URI")
    GOOGLE_FRONTEND_SUCCESS_URI: str = Field(default="", env="GOOGLE_FRONTEND_SUCCESS_URI")
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["https://adj-flex.vercel.app", "http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Accept CORS_ORIGINS as JSON array string or comma-separated string"""
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Trusted hosts (leave empty to allow all – tighten in production)
    ALLOWED_HOSTS: List[str] = Field(
        default=["adj-deploy-ahix.onrender.com", "localhost", "127.0.0.1"],
        env="ALLOWED_HOSTS"
    )

    # Rate limiting (requests per minute per IP)
    API_RATE_LIMIT: str = Field(default="60/minute", env="API_RATE_LIMIT")
    
    # Vector Database
    VECTOR_DB_PATH: str = Field(default="./data/vector_db", env="VECTOR_DB_PATH")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")   
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
_settings = None


def get_settings() -> Settings:
    """Get settings instance (singleton pattern)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
