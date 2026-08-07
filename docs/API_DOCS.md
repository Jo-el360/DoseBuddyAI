# DoseBuddy AI - API Specification (REST & OpenAPI)

Base URL: `http://localhost:8000/api/v1`

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/api/v1/medications` | Fetch patient medications |
| `POST` | `/api/v1/medications` | Add new medication |
| `PUT` | `/api/v1/medications/{id}` | Update medication details |
| `DELETE` | `/api/v1/medications/{id}` | Remove medication |
| `POST` | `/api/v1/dosage/confirm` | Log medication confirmation & blood glucose |
| `GET` | `/api/v1/dosage/logs` | Fetch dosage history logs |
| `POST` | `/api/v1/ai/generate-reminder` | Generate Gemini AI personalized reminder |
| `POST` | `/api/v1/ai/chat` | Interactive voice/text chat with DoseBuddy AI |
| `POST` | `/api/v1/caregiver/alert-missed-dose` | Trigger FCM alert to caregiver |

---

## Detailed Payload Schemas

### 1. `POST /api/v1/ai/generate-reminder`
**Request Body:**
```json
{
  "patient_name": "Maria",
  "medication_name": "Metformin HCL",
  "dosage": "500 mg",
  "instructions": "Take with breakfast",
  "meal_relation": "With meal",
  "blood_sugar_check_required": true,
  "time_of_day": "Morning"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Good morning Maria! It is time for your 500mg Metformin. Please remember to check your blood glucose level first and take your medicine right with your breakfast!"
}
```

### 2. `POST /api/v1/caregiver/alert-missed-dose`
**Query Parameters:**
- `caregiver_fcm_token`: string
- `patient_name`: string
- `medication_name`: string
- `scheduled_time`: string

**Response:**
```json
{
  "fcm_message_id": "projects/dosebuddy-ai/messages/fcm_0900_alert",
  "status": "DELIVERED",
  "notification": {
    "title": "🚨 Dose Alert: Maria Missed Medication",
    "body": "Maria did not confirm taking Lantus Insulin scheduled for 09:00 PM."
  }
}
```
