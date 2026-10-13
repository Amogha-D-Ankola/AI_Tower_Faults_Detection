"""
Detection Router
================
Exposes /api/detect for image ingestion and defect inference,
and /api/model/status for transparent model capability inspection.
"""

from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, Inspection, Detection
from app.config import settings
from app.schemas import InspectionResponse, ModelStatusResponse
from app.services.image_utils import validate_and_save_upload, draw_bounding_boxes
from app.services.inference import inference_service
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api", tags=["Detection"])


@router.get("/supabase/status")
def get_supabase_status():
    """Returns diagnostic health and connection status of Supabase PostgreSQL."""
    return supabase_service.check_connection()


@router.get("/model/status", response_model=ModelStatusResponse)
def get_model_status():
    """
    Returns transparency status: whether a trained model is loaded,
    its class vocabulary, or whether the system is operating in demo mode.
    """
    return inference_service.get_status()


@router.post("/detect", response_model=InspectionResponse)
async def detect_faults(
    file: UploadFile = File(..., description="Drone inspection image (JPG, JPEG, PNG)"),
    tower_id: str = Form(..., description="Tower identifier or image reference"),
    location: Optional[str] = Form(None, description="Optional geographic or sector reference"),
    confidence: float = Form(0.25, ge=0.05, le=0.95, description="Confidence detection threshold"),
    db: Session = Depends(get_db)
):
    """
    Processes an uploaded drone image:
    1. Validates image MIME, extension, size, and dimensions
    2. Runs YOLO object detection using trained weights or demo mode
    3. Suggests triage review priority per defect
    4. Generates an OpenCV annotated image
    5. Persists the assessment into the SQLite database
    """
    cleaned_tower_id = tower_id.strip()
    if not cleaned_tower_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tower ID or image reference cannot be empty."
        )

    # 1. Validate & Save original image
    saved_path, width, height, original_name = validate_and_save_upload(file)

    # 2. Run Inference
    detections_data, mode, is_demo, model_name = inference_service.predict(
        image_path=str(saved_path),
        confidence_threshold=confidence,
        iou_threshold=settings.IOU_THRESHOLD
    )

    # 3. Render Annotated Image
    annotated_filename = f"annotated_{saved_path.name}"
    annotated_path = Path(settings.ANNOTATED_DIR) / annotated_filename
    draw_bounding_boxes(str(saved_path), detections_data, str(annotated_path))

    # 4. Save to Database
    fault_count = len(detections_data)
    high_priority_count = sum(1 for d in detections_data if d.get("priority") == "High")

    inspection = Inspection(
        tower_id=cleaned_tower_id,
        location=location.strip() if location and location.strip() else None,
        original_filename=original_name,
        original_path=str(saved_path),
        annotated_path=str(annotated_path),
        confidence_threshold=confidence,
        mode=mode,
        is_demo=is_demo,
        model_name=model_name,
        fault_count=fault_count,
        high_priority_count=high_priority_count,
        review_status="Pending Review",
        status="completed",
        image_width=width,
        image_height=height
    )
    db.add(inspection)
    db.flush()  # Populates inspection.id

    for d in detections_data:
        det_record = Detection(
            inspection_id=inspection.id,
            class_id=d["class_id"],
            class_name=d["class_name"],
            confidence=d["confidence"],
            x1=d["x1"],
            y1=d["y1"],
            x2=d["x2"],
            y2=d["y2"],
            priority=d["priority"]
        )
        db.add(det_record)

    db.commit()
    db.refresh(inspection)

    # Mirror assessment to Supabase PostgreSQL (safe dual-persistence)
    supabase_service.sync_inspection(inspection, detections_data)

    # Construct response with served image URLs
    response_data = {
        **inspection.__dict__,
        "original_url": f"/api/storage/uploads/{saved_path.name}",
        "annotated_url": f"/api/storage/annotated/{annotated_filename}",
        "detections": inspection.detections
    }
    return response_data
