"""
Comprehensive API Endpoints Integration Tests
"""

import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import init_db

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()


def get_sample_image_bytes():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(40, 80, 120))
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["app"] == "Nova Grid"


def test_model_status_endpoint():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "mode" in data
    assert "loaded" in data
    assert "class_names" in data


def test_detect_endpoint_invalid_extension():
    response = client.post(
        "/api/detect",
        data={"tower_id": "TWR-TEST-01"},
        files={"file": ("notes.txt", b"plain text data", "text/plain")}
    )
    assert response.status_code in [400, 415]


def test_detect_endpoint_missing_tower_id():
    img_bytes = get_sample_image_bytes()
    response = client.post(
        "/api/detect",
        data={"tower_id": "   "},
        files={"file": ("tower.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400


def test_full_inspection_lifecycle():
    # 1. Ingest image and run detection
    img_bytes = get_sample_image_bytes()
    detect_res = client.post(
        "/api/detect",
        data={
            "tower_id": "TWR-999-DELTA",
            "location": "North Substation Grid 4",
            "confidence": 0.25
        },
        files={"file": ("drone_feed.jpg", img_bytes, "image/jpeg")}
    )
    assert detect_res.status_code == 200
    insp = detect_res.json()
    insp_id = insp["id"]

    assert insp["tower_id"] == "TWR-999-DELTA"
    assert insp["review_status"] == "Pending Review"
    assert "original_url" in insp
    assert "annotated_url" in insp

    # 2. Verify inspection appears in history
    list_res = client.get("/api/inspections?search=TWR-999")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(item["id"] == insp_id for item in items)

    # 3. Retrieve individual inspection details
    detail_res = client.get(f"/api/inspections/{insp_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == insp_id

    # 4. Update review status
    patch_res = client.patch(
        f"/api/inspections/{insp_id}/review",
        json={"review_status": "Verified"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["review_status"] == "Verified"

    # 5. Download PDF report
    pdf_res = client.get(f"/api/reports/{insp_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF")

    # 6. Download CSV report
    csv_res = client.get(f"/api/reports/{insp_id}/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "TWR-999-DELTA" in csv_res.text

    # 7. Check dashboard stats
    dash_res = client.get("/api/dashboard/stats")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_inspections"] >= 1
    assert "category_distribution" in dash_data
    assert "model_status" in dash_data

    # 8. Clean up / delete inspection
    del_res = client.delete(f"/api/inspections/{insp_id}")
    assert del_res.status_code == 200

    # 9. Confirm deletion
    get_after_del = client.get(f"/api/inspections/{insp_id}")
    assert get_after_del.status_code == 404
