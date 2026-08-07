"""
DoseBuddy AI - FastAPI Backend Service
======================================
Production-ready backend for elderly diabetic medication reminders,
FCM caregiver notifications, and Gemini AI personalization.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import datetime
from app.config import settings
from app.services.gemini_service import generate_personalized_reminder, chat_with_dosebuddy
from app.services.fcm_service import send_caregiver_alert
from app.services.firestore_service import (
    get_medications,
    add_medication,
    update_medication,
    delete_medication,
    log_dosage_confirmation,
    get_adherence_logs
)

app = FastAPI(
    title="DoseBuddy AI API",
    description="Backend API powering DoseBuddy AI - Elderly Diabetic Medication Companion",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Flutter Web / Mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MedicationItem(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., example="Metformin HCL")
    dosage: str = Field(..., example="500mg")
    frequency: str = Field(..., example="Twice daily")
    time_slots: List[str] = Field(..., example=["08:00 AM", "06:30 PM"])
    instructions: str = Field(..., example="Take with meal")
    requires_blood_sugar_check: bool = Field(default=False)
    target_glucose_min: Optional[int] = Field(default=80)
    target_glucose_max: Optional[int] = Field(default=130)
    pill_color: str = Field(default="Blue/White")

class DosageConfirmation(BaseModel):
    medication_id: str
    patient_id: str
    confirmed_at: str
    status: str = Field(..., example="CONFIRMED")  # CONFIRMED, SNOOZED, SKIPPED
    glucose_reading: Optional[float] = None
    notes: Optional[str] = None

class ReminderRequest(BaseModel):
    patient_name: str
    medication_name: str
    dosage: str
    instructions: str
    meal_relation: str
    blood_sugar_check_required: bool
    time_of_day: str

class ChatMessage(BaseModel):
    message: str
    patient_name: Optional[str] = "Maria"

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "DoseBuddy AI Backend",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# Medication CRUD
@app.get("/api/v1/medications", response_model=List[MedicationItem], tags=["Medications"])
async def list_medications(patient_id: str = "patient_123"):
    return await get_medications(patient_id)

@app.post("/api/v1/medications", response_model=MedicationItem, tags=["Medications"])
async def create_medication(med: MedicationItem, patient_id: str = "patient_123"):
    return await add_medication(patient_id, med.dict())

@app.put("/api/v1/medications/{med_id}", response_model=MedicationItem, tags=["Medications"])
async def edit_medication(med_id: str, med: MedicationItem, patient_id: str = "patient_123"):
    return await update_medication(patient_id, med_id, med.dict())

@app.delete("/api/v1/medications/{med_id}", tags=["Medications"])
async def remove_medication(med_id: str, patient_id: str = "patient_123"):
    success = await delete_medication(patient_id, med_id)
    if not success:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted successfully"}

# Confirm Dosage Log
@app.post("/api/v1/dosage/confirm", tags=["Adherence"])
async def confirm_dose(log: DosageConfirmation):
    result = await log_dosage_confirmation(log.dict())
    return {"status": "success", "log_id": result.get("id")}

@app.get("/api/v1/dosage/logs", tags=["Adherence"])
async def get_logs(patient_id: str = "patient_123"):
    return await get_adherence_logs(patient_id)

# AI Gemini Personalized Reminder Endpoint
@app.post("/api/v1/ai/generate-reminder", tags=["AI Engine"])
async def generate_reminder_endpoint(req: ReminderRequest):
    return await generate_personalized_reminder(req)

@app.post("/api/v1/ai/chat", tags=["AI Engine"])
async def chat_endpoint(chat_req: ChatMessage):
    reply = await chat_with_dosebuddy(chat_req.message, chat_req.patient_name)
    return {"reply": reply}

# Caregiver Missed Dose Notification via FCM
@app.post("/api/v1/caregiver/alert-missed-dose", tags=["Caregiver Alerts"])
async def trigger_caregiver_alert(
    caregiver_fcm_token: str,
    patient_name: str,
    medication_name: str,
    scheduled_time: str
):
    result = await send_caregiver_alert(
        fcm_token=caregiver_fcm_token,
        patient_name=patient_name,
        medication_name=medication_name,
        scheduled_time=scheduled_time
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
