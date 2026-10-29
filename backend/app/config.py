import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "Medisense Healthcare API"
    APP_VERSION: str = "1.0.0"
    ENV: str = os.getenv("MEDISENSE_ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medisense.db")
    
    # AI Model & Provider Configuration
    # AI_PROVIDER: "ollama" (Google Gemma 3:4B via Ollama) or "demo" (deterministic offline rule engine)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "ollama").lower()
    AI_MODEL: str = os.getenv("AI_MODEL", "gemma3:4b")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "30.0"))
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    # Emergency numbers
    EMERGENCY_NUMBER_INDIA: str = "112"
    EMERGENCY_NUMBER_GLOBAL: str = "Local Emergency Services (e.g., 911 in USA / 999 in UK / 112 in EU & India)"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
