import React, { useState } from 'react';
import { BookOpen, Terminal, Layers, Server, Play, ShieldAlert, Cpu } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'architecture' | 'api'>('setup');

  return (
    <div className="space-y-6">
      {/* Docs Navigation Header */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold">DoseBuddy AI Documentation & Run Guide</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Complete setup instructions, Clean Architecture specifications, and REST API documentation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'setup' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚀 Run & Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'architecture' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            🏗️ Clean Architecture
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'api' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            🔌 API Docs & Schemas
          </button>
        </div>
      </div>

      {/* Tab 1: Setup & Run */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-sky-600" />
              <span>Quick Start via Docker Compose</span>
            </h3>
            <p className="text-slate-600 text-sm">
              Run the full DoseBuddy AI Python FastAPI backend, PostgreSQL/Firestore adapters, and FCM notification services with a single command:
            </p>

            <div className="p-4 bg-slate-950 text-sky-300 rounded-xl font-mono text-sm space-y-2 border border-slate-800">
              <div className="text-slate-500"># 1. Clone repository & configure Gemini API Key</div>
              <div>cp .env.example .env</div>
              <div>export GEMINI_API_KEY="your_gemini_api_key"</div>
              <br />
              <div className="text-slate-500"># 2. Build and launch backend container</div>
              <div>cd backend</div>
              <div>docker-compose up --build -d</div>
              <br />
              <div className="text-slate-500"># 3. Verify health & open OpenAPI Swagger Docs</div>
              <div>curl http://localhost:8000/health</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>Run FastAPI Backend (Python)</span>
              </h4>
              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs space-y-1">
                <div>cd backend</div>
                <div>python -m venv venv</div>
                <div>source venv/bin/activate</div>
                <div>pip install -r requirements.txt</div>
                <div>uvicorn main:app --reload --port 8000</div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-sky-600" />
                <span>Run Flutter App (Dart)</span>
              </h4>
              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs space-y-1">
                <div>cd frontend</div>
                <div>flutter pub get</div>
                <div>flutter run -d chrome</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clean Architecture */}
      {activeTab === 'architecture' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-sky-600" />
            <h3 className="text-2xl font-bold text-slate-900">Clean Architecture Design</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
              <h4 className="font-bold text-sky-950 text-lg">1. Flutter Presentation Layer</h4>
              <p className="text-slate-700 text-sm">
                Material 3 design with accessibility settings (Large Text, High Contrast, TTS Voice). Provides single-tap dose confirmation and caregiver dashboard.
              </p>
            </div>

            <div className="p-5 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
              <h4 className="font-bold text-teal-950 text-lg">2. FastAPI Backend Core</h4>
              <p className="text-slate-700 text-sm">
                Modular routers (`/medications`, `/ai/generate-reminder`, `/caregiver/alert-missed-dose`). Pydantic models for type safety.
              </p>
            </div>

            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <h4 className="font-bold text-amber-950 text-lg">3. Firebase & Gemini Services</h4>
              <p className="text-slate-700 text-sm">
                Firestore rules for patient/caregiver security, FCM high-priority push alerts, and Gemini 3.6 Flash for empathetic reminder generation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Specs */}
      {activeTab === 'api' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Server className="w-7 h-7 text-sky-600" />
            <h3 className="text-2xl font-bold text-slate-900">REST API Specifications</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold">POST /api/v1/ai/generate-reminder</div>
              <p className="text-slate-400 font-sans text-sm">
                Generates a warm, personalized reminder via Gemini 3.6 Flash taking meal relations and blood sugar checks into account.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold">POST /api/v1/caregiver/alert-missed-dose</div>
              <p className="text-slate-400 font-sans text-sm">
                Dispatches high-priority Firebase Cloud Messaging push notification to caregiver's mobile device when dose is unconfirmed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
