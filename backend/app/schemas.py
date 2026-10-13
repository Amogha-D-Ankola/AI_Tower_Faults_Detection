from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class DetectionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: Optional[int] = None
    class_id: int
    class_name: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float
    priority: str


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    tower_id: str
    location: Optional[str] = None
    created_at: datetime
    original_path: str
    annotated_path: str
    original_url: str
    annotated_url: str
    confidence_threshold: float
    mode: str
    is_demo: bool
    model_name: str
    fault_count: int
    high_priority_count: int
    review_status: str
    status: str
    image_width: int
    image_height: int
    detections: List[DetectionItem] = []


class InspectionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    tower_id: str
    location: Optional[str] = None
    created_at: datetime
    mode: str
    is_demo: bool
    model_name: str
    fault_count: int
    high_priority_count: int
    review_status: str
    original_url: str
    annotated_url: str
    categories: List[str] = []


class ReviewStatusUpdate(BaseModel):
    review_status: str = Field(..., description="Pending Review, Verified, or Rejected")


class ModelStatusResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    mode: str
    model_path: str
    model_name: str
    class_names: List[str]
    loaded: bool
    is_demo: bool
    note: str


class CategoryCount(BaseModel):
    name: str
    count: int


class DashboardStats(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    total_inspections: int
    total_faults_detected: int
    high_priority_faults: int
    successfully_processed: int
    category_distribution: List[CategoryCount]
    recent_inspections: List[InspectionListItem]
    model_status: ModelStatusResponse
