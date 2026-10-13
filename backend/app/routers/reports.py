"""
Reports Router
==============
Serves audit-compliant PDF and CSV inspection assessment exports.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db, Inspection
from app.services.report_generator import generate_pdf_report, generate_csv_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/{inspection_id}/pdf")
def download_pdf_report(inspection_id: str, db: Session = Depends(get_db)):
    """
    Generates and returns an inspection report as an official PDF document.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID '{inspection_id}' not found."
        )

    pdf_bytes = generate_pdf_report(inspection)
    filename = f"NovaGrid_Report_{inspection.tower_id}_{inspection.id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Cache-Control": "no-cache"
        }
    )


@router.get("/{inspection_id}/csv")
def download_csv_report(inspection_id: str, db: Session = Depends(get_db)):
    """
    Generates and returns raw detection assessment metrics in CSV format.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID '{inspection_id}' not found."
        )

    csv_content = generate_csv_report(inspection)
    filename = f"NovaGrid_Report_{inspection.tower_id}_{inspection.id[:8]}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Cache-Control": "no-cache"
        }
    )
