import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    MODEL_PATH: str = "models/best.pt"
    DEMO_MODEL_NAME: str = "yolov8n.pt"
    CONFIDENCE_DEFAULT: float = 0.25
    IOU_THRESHOLD: float = 0.45
    MAX_UPLOAD_MB: int = 10
    DATABASE_URL: str = "sqlite:///./novagrid.db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    # Supabase Cloud Database Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_PUBLISHABLE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Storage directories relative to backend/app
    STORAGE_DIR: str = str(BACKEND_DIR / "app" / "storage")
    UPLOAD_DIR: str = str(BACKEND_DIR / "app" / "storage" / "uploads")
    ANNOTATED_DIR: str = str(BACKEND_DIR / "app" / "storage" / "annotated")
    MODELS_DIR: str = str(BACKEND_DIR / "models")
    DATASETS_DIR: str = str(BACKEND_DIR / "datasets")

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def active_supabase_key(self) -> Optional[str]:
        """Returns the highest-privileged available Supabase key."""
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_KEY or self.SUPABASE_PUBLISHABLE_KEY

    @property
    def is_supabase_configured(self) -> bool:
        """Returns True if both URL and a key are present."""
        return bool(self.SUPABASE_URL and self.active_supabase_key)

    def init_directories(self) -> None:
        """Ensure necessary storage and models directories exist."""
        for path_str in [self.STORAGE_DIR, self.UPLOAD_DIR, self.ANNOTATED_DIR, self.MODELS_DIR, self.DATASETS_DIR]:
            Path(path_str).mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.init_directories()
