"""
Inspection History Router
=========================
CRUD endpoints for viewing past inspections, filtering by review status,
updating inspector decisions, and purging records.
"""

from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db, Inspection
from app.schemas import InspectionResponse, InspectionListItem, ReviewStatusUpdate

router = APIRouter(prefix="/api/inspections", tags=["Inspections"])


@router.get("", response_model=List[InspectionListItem])
def list_inspections(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by tower ID or location"),
    review_status: Optional[str] = Query(None, description="Filter by Pending Review, Verified, Rejected"),
    mode: Optional[str] = Query(None, description="Filter by trained or demo"),
    db: Session = Depends(get_db)
):
    """
    Retrieves paginated inspection records with optional search and filters.
    """
    query = db.query(Inspection)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Inspection.tower_id.ilike(search_term)) |
            (Inspection.location.ilike(search_term))
        )

    if review_status:
        query = query.filter(Inspection.review_status == review_status)

    if mode:
        query = query.filter(Inspection.mode == mode)

    inspections = query.order_by(desc(Inspection.created_at)).offset(skip).limit(limit).all()

    items = []
    for insp in inspections:
        categories = list({d.class_name for d in insp.detections})
        orig_name = Path(insp.original_path).name
        annot_name = Path(insp.annotated_path).name
        
        items.append({
            "id": insp.id,
            "tower_id": insp.tower_id,
            "location": insp.location,
            "created_at": insp.created_at,
            "mode": insp.mode,
            "is_demo": insp.is_demo,
            "model_name": insp.model_name,
            "fault_count": insp.fault_count,
            "high_priority_count": insp.high_priority_count,
            "review_status": insp.review_status,
            "original_url": f"/api/storage/uploads/{orig_name}",
            "annotated_url": f"/api/storage/annotated/{annot_name}",
            "categories": categories
        })

    return items


@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(inspection_id: str, db: Session = Depends(get_db)):
    """
    Returns full inspection details including individual bounding box detections.
    """
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID '{inspection_id}' not found."
        )

    orig_name = Path(insp.original_path).name
    annot_name = Path(insp.annotated_path).name

    return {
        **insp.__dict__,
        "original_url": f"/api/storage/uploads/{orig_name}",
        "annotated_url": f"/api/storage/annotated/{annot_name}",
        "detections": insp.detections
    }


@router.patch("/{inspection_id}/review", response_model=InspectionResponse)
def update_review_status(
    inspection_id: str,
    update: ReviewStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates the inspector verification status: 'Pending Review', 'Verified', or 'Rejected'.
    """
    allowed_statuses = {"Pending Review", "Verified", "Rejected"}
    if update.review_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid review status. Must be one of: {', '.join(allowed_statuses)}"
        )

    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID '{inspection_id}' not found."
        )

    insp.review_status = update.review_status
    db.commit()
    db.refresh(insp)

    orig_name = Path(insp.original_path).name
    annot_name = Path(insp.annotated_path).name

    return {
        **insp.__dict__,
        "original_url": f"/api/storage/uploads/{orig_name}",
        "annotated_url": f"/api/storage/annotated/{annot_name}",
        "detections": insp.detections
    }


@router.delete("/{inspection_id}")
def delete_inspection(inspection_id: str, db: Session = Depends(get_db)):
    """
    Deletes an inspection record and purges its stored files from disk.
    """
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID '{inspection_id}' not found."
        )

    # Safely purge files
    for path_str in [insp.original_path, insp.annotated_path]:
        p = Path(path_str)
        if p.exists() and p.is_file():
            try:
                p.unlink()
            except Exception:
                pass

    db.delete(insp)
    db.commit()

    return {"detail": f"Inspection '{inspection_id}' and associated images deleted successfully."}
