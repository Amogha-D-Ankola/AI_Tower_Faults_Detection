"""
Image Processing Utilities
==========================
Handles robust file validation (extension, MIME type, byte integrity, dimension checks),
safe UUID storage, and OpenCV-based bounding box visualization.
"""

import io
import uuid
from pathlib import Path
from typing import Tuple, List, Dict, Any
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import cv2
import numpy as np

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}
MIN_IMAGE_DIMENSION = 64

# High-contrast, modern color palette for defect visualization (BGR format for OpenCV)
CLASS_COLORS = [
    (238, 211, 34),   # Cyan (#22D3EE in BGR)
    (59, 130, 246),   # Amber/Orange in BGR
    (79, 70, 229),    # Coral/Red in BGR
    (147, 51, 234),   # Violet in BGR
    (16, 185, 129),   # Emerald in BGR
    (244, 114, 182),  # Pink in BGR
    (250, 204, 21),   # Yellow in BGR
]


def validate_and_save_upload(upload_file: UploadFile) -> Tuple[Path, int, int, str]:
    """
    Validates uploaded file against extension, MIME type, size limit,
    and image decodability. Saves valid file under a UUID-generated filename.

    Returns:
        (saved_path, width, height, sanitized_original_filename)
    """
    raw_filename = upload_file.filename or "upload.jpg"
    sanitized_name = Path(raw_filename).name
    ext = Path(sanitized_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{ext}'. Only JPG, JPEG, and PNG images are supported."
        )

    if upload_file.content_type and upload_file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Invalid MIME type '{upload_file.content_type}'. Must be image/jpeg or image/png."
        )

    # Read content and enforce size constraint
    content = upload_file.file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds the maximum limit of {settings.MAX_UPLOAD_MB} MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Decode with Pillow to verify image data integrity
    try:
        image = Image.open(io.BytesIO(content))
        image.verify()  # Verifies image header and integrity
        # Re-open after verify to read format and dimensions
        image = Image.open(io.BytesIO(content))
        width, height = image.size
        
        if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image dimensions ({width}x{height}) are too small. Minimum dimension is {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}."
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupt or invalid image data: {str(e)}"
        )

    # Generate UUID filename and save
    file_id = str(uuid.uuid4())
    saved_filename = f"{file_id}{ext}"
    saved_path = Path(settings.UPLOAD_DIR) / saved_filename
    
    with open(saved_path, "wb") as f:
        f.write(content)

    return saved_path, width, height, sanitized_name


def draw_bounding_boxes(
    image_path: str,
    detections: List[Dict[str, Any]],
    output_path: str
) -> None:
    """
    Renders bounding boxes, defect labels, and confidence tags onto the image
    using OpenCV and writes the annotated image to output_path.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to read image at {image_path}")

    h, w = img.shape[:2]

    for det in detections:
        # Determine class color
        cls_id = int(det.get("class_id", 0))
        color = CLASS_COLORS[cls_id % len(CLASS_COLORS)]

        x1 = max(0, min(int(round(det["x1"])), w - 1))
        y1 = max(0, min(int(round(det["y1"])), h - 1))
        x2 = max(0, min(int(round(det["x2"])), w - 1))
        y2 = max(0, min(int(round(det["y2"])), h - 1))

        # Draw main bounding box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness=2, lineType=cv2.LINE_AA)

        # Label text: e.g. "Damaged Insulator: 88.5% (High)"
        class_name = det.get("class_name", "Defect")
        conf_pct = det.get("confidence", 0.0) * 100
        priority = det.get("priority", "Low")
        label = f"{class_name} {conf_pct:.1f}% [{priority}]"

        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = max(0.4, min(0.7, w / 1400.0))
        thickness = 1

        (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)
        
        # Position label banner above box if space permits, else inside
        label_y1 = max(0, y1 - text_h - 8)
        label_y2 = y1 if y1 - text_h - 8 >= 0 else y1 + text_h + 8

        # Draw filled label background
        cv2.rectangle(
            img,
            (x1, label_y1),
            (min(x1 + text_w + 10, w), label_y2),
            color,
            thickness=-1
        )

        # Draw text in contrasting dark navy
        text_baseline_y = label_y2 - 4 if y1 - text_h - 8 >= 0 else label_y2 - 4
        cv2.putText(
            img,
            label,
            (x1 + 4, text_baseline_y),
            font,
            font_scale,
            (10, 17, 40),  # Dark navy background
            thickness=thickness,
            lineType=cv2.LINE_AA
        )

    # Save annotated image
    cv2.imwrite(output_path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
