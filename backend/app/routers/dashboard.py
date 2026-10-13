"""
Dashboard Statistics Router
===========================
Computes aggregated metrics from verified database entries.
Strictly presents real data: zeros on empty states, never fabricated statistics.
"""

from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db, Inspection, Detection
from app.schemas import DashboardStats, CategoryCount, InspectionListItem
from app.services.inference import inference_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Computes real database statistics for the analytics dashboard.
    Demo mode inspections are tracked honestly without polluting certified fault metrics.
    """
    total_inspections = db.query(Inspection).count()
    successfully_processed = db.query(Inspection).filter(Inspection.status == "completed").count()

    # Fault metrics: Count trained model detections if available; if only demo records exist,
    # count genuine faults as 0 while reflecting actual processed drone captures.
    trained_query = db.query(Inspection).filter(Inspection.is_demo == False)
    trained_count = trained_query.count()

    if trained_count > 0:
        total_faults = db.query(func.coalesce(func.sum(Inspection.fault_count), 0))\
            .filter(Inspection.is_demo == False).scalar()
        high_priority = db.query(func.coalesce(func.sum(Inspection.high_priority_count), 0))\
            .filter(Inspection.is_demo == False).scalar()
        
        # Category distribution from trained detections
        cat_counts = db.query(
            Detection.class_name,
            func.count(Detection.id).label("count")
        ).join(Inspection)\
         .filter(Inspection.is_demo == False)\
         .group_by(Detection.class_name)\
         .order_by(desc("count"))\
         .all()
    else:
        # If all records are demo-mode or database is empty, maintain technical honesty:
        # genuine fault statistics remain 0.
        total_faults = 0
        high_priority = 0
        cat_counts = []

    category_distribution = [
        CategoryCount(name=row[0], count=row[1]) for row in cat_counts
    ]

    # Recent 5 inspections
    recent_records = db.query(Inspection).order_by(desc(Inspection.created_at)).limit(5).all()
    recent_inspections = []
    for insp in recent_records:
        categories = list({d.class_name for d in insp.detections})
        orig_name = Path(insp.original_path).name
        annot_name = Path(insp.annotated_path).name

        recent_inspections.append(
            InspectionListItem(
                id=insp.id,
                tower_id=insp.tower_id,
                location=insp.location,
                created_at=insp.created_at,
                mode=insp.mode,
                is_demo=insp.is_demo,
                model_name=insp.model_name,
                fault_count=insp.fault_count,
                high_priority_count=insp.high_priority_count,
                review_status=insp.review_status,
                original_url=f"/api/storage/uploads/{orig_name}",
                annotated_url=f"/api/storage/annotated/{annot_name}",
                categories=categories
            )
        )

    model_status = inference_service.get_status()

    return DashboardStats(
        total_inspections=total_inspections,
        total_faults_detected=int(total_faults),
        high_priority_faults=int(high_priority),
        successfully_processed=successfully_processed,
        category_distribution=category_distribution,
        recent_inspections=recent_inspections,
        model_status=model_status
    )
