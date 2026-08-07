# DoseBuddy AI - Local Setup & Running Guide

## Prerequisites

- **Node.js** v18+ & **npm** (for web runner & preview)
- **Python** 3.11+ (for FastAPI backend)
- **Flutter SDK** 3.19+ (for mobile/web frontend)
- **Docker & Docker Compose** (for containerized execution)
- **Gemini API Key** (configured in environment)

---

## Quick Start via Docker

1. Clone the repository and copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Provide your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Run the complete backend with Docker Compose:
   ```bash
   cd backend
   docker-compose up --build -d
   ```
4. Access the API documentation at `http://localhost:8000/docs`.

---

## Manual Local Setup

### 1. FastAPI Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Flutter Frontend (Dart)
```bash
cd frontend
flutter pub get
flutter run -d chrome  # or flutter run for mobile device/emulator
```

### 3. Web Companion & Full Stack Live App
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the full web companion, code explorer, and live Gemini AI engine.

---

## Running Unit Tests

To run pytest unit tests on backend services:
```bash
cd backend
pytest tests/ -v
```
