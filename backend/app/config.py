import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DoseBuddy AI Backend"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase/firebase-credentials.json")
    CAREGIVER_DEFAULT_PHONE: str = os.getenv("CAREGIVER_DEFAULT_PHONE", "+15551234567")
    
    class Config:
        env_file = ".env"

settings = Settings()
