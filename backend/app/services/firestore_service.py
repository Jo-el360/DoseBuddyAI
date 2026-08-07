from typing import List, Dict, Any
import datetime

# Mock / Firestore Storage Driver for DoseBuddy AI
_IN_MEMORY_MEDICATIONS: List[Dict[str, Any]] = [
    {
        "id": "med_1",
        "name": "Metformin HCL",
        "dosage": "500 mg",
        "frequency": "Twice Daily",
        "time_slots": ["08:00 AM", "06:30 PM"],
        "instructions": "Take with meal (Breakfast & Dinner) to avoid stomach upset.",
        "requires_blood_sugar_check": True,
        "target_glucose_min": 80,
        "target_glucose_max": 130,
        "pill_color": "Oval White Pill #500"
    },
    {
        "id": "med_2",
        "name": "Lantus Insulin Glargine",
        "dosage": "18 Units",
        "frequency": "Once Daily",
        "time_slots": ["09:00 PM"],
        "instructions": "Subcutaneous injection before bedtime. Always log blood glucose.",
        "requires_blood_sugar_check": True,
        "target_glucose_min": 90,
        "target_glucose_max": 140,
        "pill_color": "Pen Injector - Clear"
    },
    {
        "id": "med_3",
        "name": "Jardiance (Empagliflozin)",
        "dosage": "10 mg",
        "frequency": "Once Daily",
        "time_slots": ["08:00 AM"],
        "instructions": "Take in the morning with a full glass of water.",
        "requires_blood_sugar_check": False,
        "target_glucose_min": 80,
        "target_glucose_max": 130,
        "pill_color": "Round Light Yellow"
    },
    {
        "id": "med_4",
        "name": "Lisinopril",
        "dosage": "10 mg",
        "frequency": "Once Daily",
        "time_slots": ["08:00 AM"],
        "instructions": "Blood pressure protection for kidneys. Take every morning.",
        "requires_blood_sugar_check": False,
        "target_glucose_min": 80,
        "target_glucose_max": 130,
        "pill_color": "Pink Round Tablet"
    }
]

_IN_MEMORY_LOGS: List[Dict[str, Any]] = [
    {
        "id": "log_101",
        "medication_id": "med_1",
        "patient_id": "patient_123",
        "confirmed_at": "2026-08-03 08:12 AM",
        "status": "CONFIRMED",
        "glucose_reading": 112,
        "notes": "Felt good after breakfast."
    },
    {
        "id": "log_102",
        "medication_id": "med_3",
        "patient_id": "patient_123",
        "confirmed_at": "2026-08-03 08:15 AM",
        "status": "CONFIRMED",
        "glucose_reading": 112,
        "notes": "Taken with water."
    }
]

async def get_medications(patient_id: str) -> List[Dict[str, Any]]:
    return _IN_MEMORY_MEDICATIONS

async def add_medication(patient_id: str, med_data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"med_{len(_IN_MEMORY_MEDICATIONS) + 1}"
    med_data["id"] = new_id
    _IN_MEMORY_MEDICATIONS.append(med_data)
    return med_data

async def update_medication(patient_id: str, med_id: str, med_data: Dict[str, Any]) -> Dict[str, Any]:
    for idx, item in enumerate(_IN_MEMORY_MEDICATIONS):
        if item["id"] == med_id:
            med_data["id"] = med_id
            _IN_MEMORY_MEDICATIONS[idx] = med_data
            return med_data
    return med_data

async def delete_medication(patient_id: str, med_id: str) -> bool:
    global _IN_MEMORY_MEDICATIONS
    initial_len = len(_IN_MEMORY_MEDICATIONS)
    _IN_MEMORY_MEDICATIONS = [m for m in _IN_MEMORY_MEDICATIONS if m["id"] != med_id]
    return len(_IN_MEMORY_MEDICATIONS) < initial_len

async def log_dosage_confirmation(log_data: Dict[str, Any]) -> Dict[str, Any]:
    log_data["id"] = f"log_{len(_IN_MEMORY_LOGS) + 1}"
    _IN_MEMORY_LOGS.insert(0, log_data)
    return log_data

async def get_adherence_logs(patient_id: str) -> List[Dict[str, Any]]:
    return _IN_MEMORY_LOGS
