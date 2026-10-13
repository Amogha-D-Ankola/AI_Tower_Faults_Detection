"""
Nova Grid - Main Application Entrypoint
=======================================
FastAPI application configuration, CORS handling, static asset serving,
and router registration.
"""

import logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import detection, history, reports, dashboard

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("novagrid.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and storage directories on startup."""
    logger.info("Initializing Nova Grid directories and database schema...")
    settings.init_directories()
    init_db()
    logger.info("Nova Grid backend initialized successfully.")
    yield


app = FastAPI(
    title="Nova Grid API",
    description="AI-Based Transmission Tower Fault Detection API - Smarter Grids. Safer Power.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static storage endpoint so frontend can render uploaded and annotated images
app.mount("/api/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

# Register routers
app.include_router(detection.router)
app.include_router(history.router)
app.include_router(reports.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Standard liveness endpoint verifying backend readiness.
    """
    return {
        "status": "OK",
        "app": "Nova Grid",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
