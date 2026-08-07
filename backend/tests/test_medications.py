import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_list_medications():
    response = client.get("/api/v1/medications?patient_id=patient_123")
    assert response.status_code == 200
    meds = response.json()
    assert isinstance(meds, list)
    assert len(meds) >= 1
    assert meds[0]["name"] == "Metformin HCL"

def test_add_and_delete_medication():
    new_med = {
        "name": "Glipizide",
        "dosage": "5 mg",
        "frequency": "Once daily",
        "time_slots": ["07:30 AM"],
        "instructions": "Take 30 minutes before first meal of the day.",
        "requires_blood_sugar_check": True,
        "target_glucose_min": 70,
        "target_glucose_max": 130,
        "pill_color": "White Round Tablet"
    }
    
    # Create
    create_res = client.post("/api/v1/medications?patient_id=patient_123", json=new_med)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == "Glipizide"
    med_id = created["id"]
    
    # Delete
    del_res = client.delete(f"/api/v1/medications/{med_id}?patient_id=patient_123")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Medication deleted successfully"
