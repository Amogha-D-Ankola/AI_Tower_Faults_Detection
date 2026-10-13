"""
Tests for Image Processing Utilities
"""

import io
from pathlib import Path
from PIL import Image
import pytest
from fastapi import UploadFile, HTTPException

from app.services.image_utils import (
    validate_and_save_upload,
    draw_bounding_boxes
)
from app.config import settings


def create_test_image_bytes(width=200, height=200, format="JPEG") -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=(50, 100, 150))
    img.save(buf, format=format)
    return buf.getvalue()


def test_valid_image_upload():
    img_bytes = create_test_image_bytes()
    upload = UploadFile(
        filename="tower_inspection.jpg",
        file=io.BytesIO(img_bytes),
        headers={"content-type": "image/jpeg"}
    )
    saved_path, w, h, name = validate_and_save_upload(upload)
    
    assert Path(saved_path).exists()
    assert w == 200
    assert h == 200
    assert name == "tower_inspection.jpg"

    # Cleanup
    if Path(saved_path).exists():
        Path(saved_path).unlink()


def test_unsupported_extension():
    upload = UploadFile(
        filename="document.pdf",
        file=io.BytesIO(b"%PDF-1.4 test"),
        headers={"content-type": "application/pdf"}
    )
    with pytest.raises(HTTPException) as exc_info:
        validate_and_save_upload(upload)
    assert exc_info.value.status_code == 415


def test_corrupt_image():
    upload = UploadFile(
        filename="corrupt.jpg",
        file=io.BytesIO(b"Not an image file byte sequence"),
        headers={"content-type": "image/jpeg"}
    )
    with pytest.raises(HTTPException) as exc_info:
        validate_and_save_upload(upload)
    assert exc_info.value.status_code == 400


def test_too_small_image():
    # Below minimum dimension of 64x64
    tiny_bytes = create_test_image_bytes(width=32, height=32)
    upload = UploadFile(
        filename="tiny.png",
        file=io.BytesIO(tiny_bytes),
        headers={"content-type": "image/png"}
    )
    with pytest.raises(HTTPException) as exc_info:
        validate_and_save_upload(upload)
    assert exc_info.value.status_code == 400


def test_draw_bounding_boxes():
    img_bytes = create_test_image_bytes(width=300, height=300)
    input_path = Path(settings.UPLOAD_DIR) / "test_draw_input.jpg"
    output_path = Path(settings.ANNOTATED_DIR) / "test_draw_output.jpg"

    with open(input_path, "wb") as f:
        f.write(img_bytes)

    detections = [
        {
            "class_id": 0,
            "class_name": "Damaged insulator",
            "confidence": 0.88,
            "x1": 50,
            "y1": 50,
            "x2": 150,
            "y2": 150,
            "priority": "High"
        }
    ]

    draw_bounding_boxes(str(input_path), detections, str(output_path))
    assert output_path.exists()
    assert output_path.stat().st_size > 0

    # Cleanup
    if input_path.exists():
        input_path.unlink()
    if output_path.exists():
        output_path.unlink()
