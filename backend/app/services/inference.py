"""
YOLO Inference Engine
=====================
Loads trained transmission tower fault detection weights or falls back to
honest Demo Mode. Never fabricates predictions or alters genuine detections.
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import torch

from app.config import settings, BACKEND_DIR
from app.services.priority import determine_priority

logger = logging.getLogger("novagrid.inference")

# In PyTorch 2.6+, weights_only defaults to True which prevents unpickling
# complex YOLO architectures. We patch torch.load to default weights_only=False.
_orig_torch_load = torch.load
def _safe_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _orig_torch_load(*args, **kwargs)
torch.load = _safe_torch_load


class InferenceService:
    def __init__(self):
        self.model = None
        self.mode: str = "demo"
        self.is_demo: bool = True
        self.model_name: str = "Not loaded"
        self.model_path: str = ""
        self.class_names: List[str] = []
        self._load_model()

    def _resolve_model_path(self) -> Optional[Path]:
        """Resolves target model path if present."""
        configured_path = Path(settings.MODEL_PATH)
        if not configured_path.is_absolute():
            candidate = BACKEND_DIR / configured_path
        else:
            candidate = configured_path

        if candidate.exists() and candidate.is_file():
            return candidate
        return None

    def _load_model(self) -> None:
        """
        Attempts to load trained weights first. If absent, enters demo mode
        using generic pretrained YOLO model or fallback offline status.
        """
        try:
            from ultralytics import YOLO
        except ImportError:
            logger.error("Ultralytics library is not installed.")
            self.model = None
            self.mode = "demo"
            self.is_demo = True
            self.model_name = "Ultralytics Unavailable"
            return

        trained_path = self._resolve_model_path()
        if trained_path:
            try:
                logger.info(f"Loading trained Nova Grid weights from {trained_path}")
                self.model = YOLO(str(trained_path))
                self.mode = "trained"
                self.is_demo = False
                self.model_name = trained_path.name
                self.model_path = str(trained_path)
                self.class_names = list(self.model.names.values()) if hasattr(self.model, "names") else []
                logger.info(f"Loaded trained model with classes: {self.class_names}")
                return
            except Exception as e:
                logger.warning(f"Failed to load custom weights at {trained_path}: {e}. Falling back to demo mode.")

        # Fallback to demo mode using standard pretrained YOLOv8n
        self.mode = "demo"
        self.is_demo = True
        self.model_path = "yolov8n.pt (demo fallback)"
        try:
            logger.info("Starting in DEMO MODE. Loading generic YOLOv8n base model.")
            self.model = YOLO(settings.DEMO_MODEL_NAME)
            self.model_name = "yolov8n (Demo Mode Base)"
            self.class_names = list(self.model.names.values()) if hasattr(self.model, "names") else []
            logger.info("Demo base model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load demo model ({e}). System will operate in offline demo mode.")
            self.model = None
            self.model_name = "Offline Demo Mode (Zero Detections)"
            self.class_names = []

    def get_status(self) -> Dict[str, Any]:
        """Returns metadata about the active detection engine."""
        if not self.is_demo and self.model is not None:
            note = "Custom trained transmission tower fault detection model is loaded and active."
        elif self.model is not None:
            note = "DEMO MODE active: generic base weights loaded. Detections demonstrate pipeline flow but are NOT valid tower fault classifications."
        else:
            note = "OFFLINE DEMO MODE active: no weights available. Zero detections will be returned."

        return {
            "mode": self.mode,
            "model_path": self.model_path or settings.MODEL_PATH,
            "model_name": self.model_name,
            "class_names": self.class_names,
            "loaded": self.model is not None,
            "is_demo": self.is_demo,
            "note": note
        }

    def predict(
        self,
        image_path: str,
        confidence_threshold: float,
        iou_threshold: float
    ) -> Tuple[List[Dict[str, Any]], str, bool, str]:
        """
        Runs model inference on an image file.

        Returns:
            (detections, mode, is_demo, model_name)
        """
        if self.model is None:
            return [], self.mode, self.is_demo, self.model_name

        try:
            results = self.model.predict(
                source=image_path,
                conf=confidence_threshold,
                iou=iou_threshold,
                verbose=False
            )

            detections: List[Dict[str, Any]] = []
            if results and len(results) > 0:
                result = results[0]
                if result.boxes is not None:
                    for box in result.boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        coords = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                        class_name = self.model.names.get(cls_id, f"Class_{cls_id}")

                        # In demo mode, clearly map or display the label
                        suggested_priority = determine_priority(class_name, conf)

                        detections.append({
                            "class_id": cls_id,
                            "class_name": class_name,
                            "confidence": round(conf, 4),
                            "x1": round(coords[0], 2),
                            "y1": round(coords[1], 2),
                            "x2": round(coords[2], 2),
                            "y2": round(coords[3], 2),
                            "priority": suggested_priority
                        })

            return detections, self.mode, self.is_demo, self.model_name

        except Exception as e:
            logger.error(f"Inference error on {image_path}: {e}")
            raise RuntimeError(f"Model inference failed: {str(e)}")


# Singleton instance
inference_service = InferenceService()
