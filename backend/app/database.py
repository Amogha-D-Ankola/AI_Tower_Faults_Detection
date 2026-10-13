import uuid
from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.config import settings

# SQLite connection configuration
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Inspection(Base):
    """
    Stores inspection metadata and summary counts.
    Each record represents a processed drone image inspection.
    """
    __tablename__ = "inspections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    tower_id = Column(String(100), nullable=False, index=True)
    location = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    original_filename = Column(String(255), nullable=False)
    original_path = Column(String(500), nullable=False)
    annotated_path = Column(String(500), nullable=False)
    
    confidence_threshold = Column(Float, nullable=False, default=0.25)
    mode = Column(String(20), nullable=False, default="demo")  # 'trained' or 'demo'
    is_demo = Column(Boolean, nullable=False, default=True)
    model_name = Column(String(100), nullable=False, default="unloaded")
    
    fault_count = Column(Integer, nullable=False, default=0)
    high_priority_count = Column(Integer, nullable=False, default=0)
    
    # Review status: 'Pending Review', 'Verified', 'Rejected'
    review_status = Column(String(30), nullable=False, default="Pending Review", index=True)
    # Processing status: 'completed', 'failed', 'processing'
    status = Column(String(20), nullable=False, default="completed")
    
    image_width = Column(Integer, nullable=False, default=0)
    image_height = Column(Integer, nullable=False, default=0)

    # Cascading relation to detections
    detections = relationship(
        "Detection",
        back_populates="inspection",
        cascade="all, delete-orphan",
        order_by="Detection.id"
    )


class Detection(Base):
    """
    Stores individual bounding box detections for an inspection.
    """
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    inspection_id = Column(String(36), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    
    class_id = Column(Integer, nullable=False)
    class_name = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    
    # Normalized or absolute coordinates: x1, y1, x2, y2
    x1 = Column(Float, nullable=False)
    y1 = Column(Float, nullable=False)
    x2 = Column(Float, nullable=False)
    y2 = Column(Float, nullable=False)
    
    # Suggested priority: 'High', 'Medium', 'Low'
    priority = Column(String(20), nullable=False, default="Low")

    inspection = relationship("Inspection", back_populates="detections")


def get_db():
    """Dependency to provide a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
