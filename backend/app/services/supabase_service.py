"""
Nova Grid - Supabase Cloud Synchronization Service
==================================================
Provides dual-engine persistence: seamlessly mirrors inspection metadata
and model detections to Supabase PostgreSQL without interrupting or
modifying the local SQLite database.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.config import settings

logger = logging.getLogger("novagrid.supabase")


class SupabaseService:
    def __init__(self):
        self._client = None
        self._init_client()

    def _init_client(self) -> None:
        """Initializes the Supabase client safely from settings."""
        if not settings.is_supabase_configured:
            logger.info("Supabase is not configured (missing URL or key). Operating in SQLite-only mode.")
            self._client = None
            return

        try:
            from supabase import create_client, Client
            self._client: Optional[Client] = create_client(
                settings.SUPABASE_URL,
                settings.active_supabase_key
            )
            logger.info(f"Supabase client initialized for project: {settings.SUPABASE_URL}")
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}. Operating in SQLite fallback mode.")
            self._client = None

    @property
    def is_connected(self) -> bool:
        """Returns True if the client is initialized."""
        return self._client is not None

    def check_connection(self) -> Dict[str, Any]:
        """
        Tests live connection to Supabase.
        Returns diagnostic status dictionary.
        """
        if not settings.is_supabase_configured:
            return {
                "configured": False,
                "connected": False,
                "message": "SUPABASE_URL or active key missing in environment.",
                "url": None
            }

        if self._client is None:
            self._init_client()

        if self._client is None:
            return {
                "configured": True,
                "connected": False,
                "message": "Supabase client initialization failed.",
                "url": settings.SUPABASE_URL
            }

        try:
            # Query the fault_classes table to verify schema availability
            res = self._client.table("fault_classes").select("id, name").limit(1).execute()
            return {
                "configured": True,
                "connected": True,
                "tables_exist": True,
                "message": "Connected to Supabase PostgreSQL and verified schema.",
                "url": settings.SUPABASE_URL
            }
        except Exception as e:
            err_str = str(e)
            tables_exist = "PGRST205" not in err_str  # PGRST205 means table not in schema cache
            return {
                "configured": True,
                "connected": True,
                "tables_exist": tables_exist,
                "message": (
                    "Connected to Supabase project, but tables are pending creation. "
                    "Run backend/supabase_migration.sql in Supabase SQL Editor."
                    if not tables_exist else f"Supabase responded with: {err_str}"
                ),
                "url": settings.SUPABASE_URL
            }

    def sync_inspection(
        self,
        inspection: Any,
        detections_data: List[Dict[str, Any]]
    ) -> bool:
        """
        Synchronizes an inspection and its detection bounding boxes to Supabase.
        Uses idempotent upsert for the inspection header.
        
        Guaranteed Non-Disruptive:
        Any network or database error is caught and logged; it will never
        raise an exception to callers or interfere with SQLite records.
        """
        if not self.is_connected:
            return False

        try:
            # Format inspection ISO timestamp
            created_iso = (
                inspection.created_at.isoformat()
                if isinstance(inspection.created_at, datetime)
                else str(inspection.created_at)
            )

            inspection_payload = {
                "id": str(inspection.id),
                "tower_id": str(inspection.tower_id),
                "location": inspection.location,
                "created_at": created_iso,
                "original_filename": str(inspection.original_filename),
                "original_path": str(inspection.original_path),
                "annotated_path": str(inspection.annotated_path),
                "confidence_threshold": float(inspection.confidence_threshold),
                "mode": str(inspection.mode),
                "is_demo": bool(inspection.is_demo),
                "model_name": str(inspection.model_name),
                "fault_count": int(inspection.fault_count),
                "high_priority_count": int(inspection.high_priority_count),
                "review_status": str(inspection.review_status),
                "status": str(inspection.status),
                "image_width": int(inspection.image_width),
                "image_height": int(inspection.image_height)
            }

            # 1. Upsert inspection record
            self._client.table("inspections").upsert(
                inspection_payload,
                on_conflict="id"
            ).execute()

            # 2. Insert child detection records if present
            if detections_data:
                detections_payload = []
                for det in detections_data:
                    cid = int(det.get("class_id", -1))
                    # Link to configured fault class if matching IDs 0 to 4
                    fault_cid = cid if cid in [0, 1, 2, 3, 4] else None

                    detections_payload.append({
                        "inspection_id": str(inspection.id),
                        "class_id": cid,
                        "class_name": str(det.get("class_name", "Unknown")),
                        "fault_class_id": fault_cid,
                        "confidence": float(det.get("confidence", 0.0)),
                        "x1": float(det.get("x1", 0.0)),
                        "y1": float(det.get("y1", 0.0)),
                        "x2": float(det.get("x2", 0.0)),
                        "y2": float(det.get("y2", 0.0)),
                        "priority": str(det.get("priority", "Low"))
                    })

                self._client.table("detections").insert(detections_payload).execute()

            logger.info(f"Successfully synced inspection {inspection.id} to Supabase.")
            return True

        except Exception as e:
            logger.warning(
                f"Supabase synchronization skipped for inspection {getattr(inspection, 'id', 'unknown')}: {e}"
            )
            return False


# Singleton instance
supabase_service = SupabaseService()
