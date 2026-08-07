# DoseBuddy AI - Clean Architecture Documentation

## System Architecture Overview

DoseBuddy AI is designed with **Clean Architecture** principles to separate concerns between presentation, domain logic, external services, and data persistence.

```
+-----------------------------------------------------------------------+
|                         FLUTTER FRONTEND                              |
|   +---------------------+   +-------------------+  +---------------+  |
|   |  Patient Home Screen|   | Meds Manager (CRUD|  | Caregiver Web |  |
|   +----------+----------+   +---------+---------+  +-------+-------+  |
|              |                        |                    |          |
|              +------------------------+--------------------+          |
|                                       |                               |
|                               (HTTP / REST / FCM)                     |
+---------------------------------------+-------------------------------+
                                        |
+---------------------------------------v-------------------------------+
|                         FASTAPI PYTHON BACKEND                        |
|   +---------------------------------------------------------------+   |
|   |                      Main FastAPI Router                      |   |
|   +--------+--------------------------+-------------------+-------+   |
|            |                          |                   |           |
|  +---------v----------+      +--------v--------+  +-------v--------+  |
|  |  Gemini AI Service |      |   Firestore Service | FCM Push Alert |  |
|  | (gemini-3.6-flash) |      |   (CRUD & Logs) |  |   Service      |  |
|  +---------+----------+      +--------+--------+  +-------+--------+  |
+------------|--------------------------|-------------------|-----------+
             |                          |                   |
             v                          v                   v
      Google Gemini API          Firebase Firestore    Caregiver Device
                                                        (Push / SMS)
```

## Key Technical Decisions

1. **Elderly Accessibility Layer**:
   - Material 3 Design with customizable text scale and high-contrast toggle.
   - Text-To-Speech (TTS) voice announcements using Gemini-crafted empathetic prompts.
   - Single-tap dose confirmations with visual pill representations.

2. **Gemini AI Personalization Engine**:
   - Uses `gemini-3.6-flash` via `@google/genai` on backend.
   - Tailors reminder tone based on medication constraints (e.g. reminding patient to eat with Metformin or check blood glucose before taking insulin).

3. **Escalation & Caregiver Safety Net**:
   - Automatic 15-minute grace period before dispatching an FCM alert to the caregiver's device.
   - Detailed adherence logs with optional blood glucose entries.
