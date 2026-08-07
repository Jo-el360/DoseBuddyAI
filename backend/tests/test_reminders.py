import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_reminder_endpoint():
    payload = {
        "patient_name": "Maria",
        "medication_name": "Metformin HCL",
        "dosage": "500 mg",
        "instructions": "Take with breakfast",
        "meal_relation": "With breakfast",
        "blood_sugar_check_required": True,
        "time_of_day": "Morning"
    }
    response = client.post("/api/v1/ai/generate-reminder", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert "Maria" in data["message"] or "Metformin" in data["message"] or "remember" in data["message"].lower()

def test_caregiver_alert_trigger():
    response = client.post(
        "/api/v1/caregiver/alert-missed-dose",
        params={
            "caregiver_fcm_token": "fcm_test_token_999",
            "patient_name": "Maria",
            "medication_name": "Lantus Insulin",
            "scheduled_time": "09:00 PM"
        }
    )
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["status"] == "DELIVERED"
    assert "Lantus Insulin" in res_json["notification"]["body"]
