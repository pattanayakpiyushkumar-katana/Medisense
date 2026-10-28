import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "Medisense Healthcare API"
    APP_VERSION: str = "1.0.0"
    ENV: str = os.getenv("MEDISENSE_ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medisense.db")
    
    # AI Provider: "demo" (deterministic clinically safe engine), "gemini", or "openai"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "demo").lower()
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

