import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Pill, 
  ShieldAlert, 
  MessageSquareHeart, 
  FolderGit2, 
  BookOpen, 
  Contrast, 
  Type, 
  Radio, 
  BellRing,
  X,
  Settings,
  User,
  Shield,
  Camera,
  Sparkles,
  Download,
  LogOut
} from 'lucide-react';

import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

import { Medication, DosageLog, RepositoryFile, UserProfile, DoseStatus } from './types';
import { PatientView } from './components/PatientView';
import { CaregiverView } from './components/CaregiverView';
import { MedsManagerView } from './components/MedsManagerView';
import { AIChatView } from './components/AIChatView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { DocsView } from './components/DocsView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { OCRScanModal } from './components/OCRScanModal';

const DEFAULT_USER_PROFILE: UserProfile = {
  uid: 'user_default_001',
  email: 'user@dosebuddy.ai',
  fullName: 'John Doe',
  role: 'patient',
  age: 68,
  gender: 'Male',
  height: "5'9\"",
  weight: "170 lbs",
  bloodGroup: 'O+',
  medicalConditions: ['Type 2 Diabetes', 'Hypertension'],
  allergies: ['Penicillin'],
  emergencyContact: '+1 555-911-0000',
  caregiverContact: '+1 555-888-9999 (Dr. Carlos)',
  preferredLanguage: 'English',
  country: 'United States',
  timeZone: 'EST (UTC-5)',
  dailyRoutine: 'Home',
  wakeTime: '07:30 AM',
  sleepTime: '09:30 PM',
  breakfastTime: '08:00 AM',
  lunchTime: '01:00 PM',
  dinnerTime: '06:30 PM',
  isOnboarded: true,
  createdAt: new Date().toISOString(),
};

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med_1',
    name: 'Metformin HCL',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timeSlots: ['08:00 AM', '06:30 PM'],
    instructions: 'Take with meal (Breakfast & Dinner) to avoid stomach upset.',
    requiresBloodSugarCheck: true,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: 'White Oval Tablet #500',
    category: 'Diabetes',
    foodRelation: 'after_food',
    pillsRemaining: 18,
    totalPillCapacity: 60,
    refillThreshold: 10,
  },
  {
    id: 'med_2',
    name: 'Lantus Insulin Glargine',
    dosage: '18 Units',
    frequency: 'Once daily',
    timeSlots: ['09:00 PM'],
    instructions: 'Inject bedtime subcutaneous. Log blood glucose.',
    requiresBloodSugarCheck: true,
    targetGlucoseMin: 90,
    targetGlucoseMax: 140,
    pillColor: 'Clear Pen Injector',
    category: 'Diabetes',
    foodRelation: 'with_food',
    pillsRemaining: 6,
    totalPillCapacity: 30,
    refillThreshold: 7,
  },
  {
    id: 'med_3',
    name: 'Jardiance (Empagliflozin)',
    dosage: '10 mg',
    frequency: 'Once daily',
    timeSlots: ['08:00 AM'],
    instructions: 'Take in the morning with a full glass of water.',
    requiresBloodSugarCheck: false,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: 'Round Light Yellow',
    category: 'Diabetes',
    foodRelation: 'after_food',
    pillsRemaining: 28,
    totalPillCapacity: 30,
    refillThreshold: 7,
  },
  {
    id: 'med_4',
    name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    timeSlots: ['08:00 AM'],
    instructions: 'Blood pressure protection for kidneys. Take every morning.',
    requiresBloodSugarCheck: false,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: 'Pink Round Tablet',
    category: 'Blood Pressure',
    foodRelation: 'after_food',
    pillsRemaining: 8,
    totalPillCapacity: 30,
    refillThreshold: 10,
  },
];

const REPO_FILES: RepositoryFile[] = [
  {
    path: 'backend/main.py',
    category: 'backend',
    language: 'python',
    content: `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nfrom app.services.gemini_service import generate_personalized_reminder\n\napp = FastAPI(title="DoseBuddy AI API")\n\n@app.get("/health")\ndef health():\n    return {"status": "healthy"}\n\n@app.post("/api/v1/ai/generate-reminder")\nasync def reminder(req: dict):\n    return await generate_personalized_reminder(req)\n`,
  },
  {
    path: 'backend/app/services/gemini_service.py',
    category: 'backend',
    language: 'python',
    content: `from google import genai\nimport os\n\nasync def generate_personalized_reminder(req):\n    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))\n    prompt = f"Create a warm medication reminder for {req.get('patient_name')} taking into account their {req.get('daily_routine')} routine."\n    response = client.models.generate_content(model="gemini-3.6-flash", contents=prompt)\n    return {"message": response.text}\n`,
  },
  {
    path: 'backend/Dockerfile',
    category: 'backend',
    language: 'dockerfile',
    content: `FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]\n`,
  },
  {
    path: 'frontend/lib/main.dart',
    category: 'frontend',
    language: 'dart',
    content: `import 'package:flutter/material.dart';\nimport 'screens/patient_home_screen.dart';\nimport 'screens/login_screen.dart';\n\nvoid main() {\n  runApp(const DoseBuddyApp());\n}\n`,
  },
  {
    path: 'frontend/lib/models/user_model.dart',
    category: 'frontend',
    language: 'dart',
    content: `enum UserRole { patient, caregiver, doctor, admin }\n\nclass UserModel {\n  final String uid;\n  final String email;\n  final String fullName;\n  final UserRole role;\n  final String? phoneNumber;\n  final bool isOnboarded;\n  final bool emailVerified;\n\n  UserModel({\n    required this.uid,\n    required this.email,\n    required this.fullName,\n    this.role = UserRole.patient,\n    this.phoneNumber,\n    this.isOnboarded = true,\n    this.emailVerified = true,\n  });\n}\n`,
  },
  {
    path: 'frontend/lib/services/auth_service.dart',
    category: 'frontend',
    language: 'dart',
    content: `import 'package:firebase_auth/firebase_auth.dart';\nimport 'package:cloud_firestore/cloud_firestore.dart';\nimport '../models/user_model.dart';\n\nclass AuthService {\n  final FirebaseAuth _auth = FirebaseAuth.instance;\n  final FirebaseFirestore _firestore = FirebaseFirestore.instance;\n\n  Future<UserModel> registerWithEmailAndPassword({\n    required String email,\n    required String password,\n    required String fullName,\n    UserRole role = UserRole.patient,\n  }) async {\n    final credential = await _auth.createUserWithEmailAndPassword(email: email, password: password);\n    await credential.user?.sendEmailVerification();\n    final newUser = UserModel(uid: credential.user!.uid, email: email, fullName: fullName, role: role);\n    await _firestore.collection('users').doc(credential.user!.uid).set({\n      'email': email, 'fullName': fullName, 'role': role.name, 'emailVerified': false,\n    });\n    return newUser;\n  }\n\n  Future<UserModel> signInWithEmailAndPassword({\n    required String email,\n    required String password,\n  }) async {\n    final credential = await _auth.signInWithEmailAndPassword(email: email, password: password);\n    final doc = await _firestore.collection('users').doc(credential.user!.uid).get();\n    return UserModel(uid: credential.user!.uid, email: email, fullName: doc.data()?['fullName'] ?? 'User');\n  }\n}\n`,
  },
  {
    path: 'frontend/lib/screens/login_screen.dart',
    category: 'frontend',
    language: 'dart',
    content: `import 'package:flutter/material.dart';\nimport '../services/auth_service.dart';\nimport 'register_screen.dart';\nimport 'phone_auth_screen.dart';\n\nclass LoginScreen extends StatefulWidget {\n  const LoginScreen({Key? key}) : super(key: key);\n  @override\n  State<LoginScreen> createState() => _LoginScreenState();\n}\n`,
  },
  {
    path: 'frontend/lib/models/dosage_log.dart',
    category: 'frontend',
    language: 'dart',
    content: `class DosageLog {\n  final String id;\n  final String medicationId;\n  final String medicationName;\n  final String dosage;\n  final DateTime scheduledTime;\n  final DateTime? confirmedAt;\n  final String status;\n  final double? glucoseReading;\n  final String? notes;\n}\n`,
  },
  {
    path: 'frontend/lib/screens/dosage_history_screen.dart',
    category: 'frontend',
    language: 'dart',
    content: `import 'package:flutter/material.dart';\nimport '../models/dosage_log.dart';\n\nclass DosageHistoryScreen extends StatefulWidget {\n  const DosageHistoryScreen({super.key});\n  @override\n  State<DosageHistoryScreen> createState() => _DosageHistoryScreenState();\n}\n`,
  },
  {
    path: 'frontend/lib/screens/ai_assistant_screen.dart',
    category: 'frontend',
    language: 'dart',
    content: `import 'package:flutter/material.dart';\n\nclass AIAssistantScreen extends StatefulWidget {\n  const AIAssistantScreen({super.key});\n  @override\n  State<AIAssistantScreen> createState() => _AIAssistantScreenState();\n}\n`,
  },
  {
    path: 'firebase/firebase-blueprint.json',
    category: 'firebase',
    language: 'json',
    content: `{
  "entities": {
    "User": { "title": "User Profile", "properties": { "uid": { "type": "string" }, "email": { "type": "string" }, "fullName": { "type": "string" }, "role": { "type": "string" } } },
    "Medication": { "title": "Medication Entity", "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "dosage": { "type": "string" } } },
    "DosageLog": { "title": "Dosage Execution Log", "properties": { "id": { "type": "string" }, "status": { "type": "string" } } }
  },
  "firestore": {
    "/users/{userId}": { "schema": { "$ref": "#/entities/User" }, "description": "User profile collection" },
    "/medications/{medicationId}": { "schema": { "$ref": "#/entities/Medication" }, "description": "Medication collection" },
    "/logs/{logId}": { "schema": { "$ref": "#/entities/DosageLog" }, "description": "Dosage log collection" }
  }
}`,
  },
  {
    path: 'firebase/firestore.rules',
    category: 'firebase',
    language: 'javascript',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    match /users/{userId} { allow read, write: if isSignedIn(); }
    match /medications/{medicationId} { allow read, write: if isSignedIn(); }
    match /logs/{logId} { allow read, write: if isSignedIn(); }
    match /caregivers/{caregiverId} { allow read, write: if isSignedIn(); }
    match /notifications/{notificationId} { allow read, write: if isSignedIn(); }
  }
}`,
  },
  {
    path: 'docs/ARCHITECTURE.md',
    category: 'docs',
    language: 'markdown',
    content: `# DoseBuddy AI - Production Architecture\nFlutter Frontend -> FastAPI Python Backend -> Gemini 3.6 Flash & Firebase Cloud Firestore & Messaging.\n`,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'patient' | 'caregiver' | 'meds' | 'chat' | 'admin' | 'code' | 'docs'>('patient');
  
  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dosebuddy_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_USER_PROFILE;
  });

  // Display Accessibility States
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Modal Control States
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOcrOpen, setIsOcrOpen] = useState<boolean>(false);

  // Application Data Stores
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [confirmedLogs, setConfirmedLogs] = useState<DosageLog[]>([
    {
      id: 'log_1',
      medicationId: 'med_1',
      patientName: 'Maria Miller',
      confirmedAt: '08:12 AM',
      status: 'TAKEN',
      glucoseReading: 112,
    },
  ]);

  const [sseStatus, setSseStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [activeLiveAlert, setActiveLiveAlert] = useState<{ sender: string; message: string; timestamp: string } | null>(null);

  // Save profile updates to localStorage
  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    localStorage.setItem('dosebuddy_user_profile', JSON.stringify(updated));
  };

  // Firebase Real-Time Auth State Listener
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setUserProfile((prev) => {
          const nameFromEmail = user.email ? user.email.split('@')[0] : 'User';
          const resolvedName = user.displayName || (prev.fullName && prev.fullName !== 'John Doe' && prev.fullName !== 'Maria Miller' ? prev.fullName : nameFromEmail);
          const updated: UserProfile = {
            ...prev,
            uid: user.uid,
            email: user.email || prev.email,
            fullName: resolvedName,
          };
          localStorage.setItem('dosebuddy_user_profile', JSON.stringify(updated));
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    const guestProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      uid: 'guest_user',
      fullName: 'Guest User',
      email: 'guest@dosebuddy.ai',
      role: 'patient',
    };
    setUserProfile(guestProfile);
    localStorage.removeItem('dosebuddy_user_profile');
  };

  // Real-Time SSE Stream Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.onopen = () => {
        setSseStatus('connected');
      };

      eventSource.onerror = () => {
        setSseStatus('disconnected');
      };

      eventSource.addEventListener('INIT_STATE', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.medications?.length) setMedications(data.medications);
          if (data.dosageLogs?.length) setConfirmedLogs(data.dosageLogs);
          setSseStatus('connected');
        } catch (err) {
          console.error('Error parsing INIT_STATE:', err);
        }
      });

      eventSource.addEventListener('DOSE_LOGGED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.allLogs) {
            setConfirmedLogs(data.allLogs);
          } else if (data.log) {
            setConfirmedLogs((prev) => [data.log, ...prev]);
          }
        } catch (err) {
          console.error('Error parsing DOSE_LOGGED:', err);
        }
      });

      eventSource.addEventListener('MEDS_UPDATED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.medications) {
            setMedications(data.medications);
          }
        } catch (err) {
          console.error('Error parsing MEDS_UPDATED:', err);
        }
      });

      eventSource.addEventListener('ALERT_TRIGGERED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.alert) {
            setActiveLiveAlert({
              sender: data.alert.sender,
              message: data.alert.message,
              timestamp: data.alert.timestamp,
            });
          }
        } catch (err) {
          console.error('Error parsing ALERT_TRIGGERED:', err);
        }
      });
    } catch (err) {
      console.error('SSE connection error:', err);
      setSseStatus('disconnected');
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleConfirmDose = async (medId: string, status: DoseStatus = 'TAKEN', glucose?: number) => {
    if (status === 'TAKEN') {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === medId && m.pillsRemaining !== undefined) {
            return { ...m, pillsRemaining: Math.max(0, m.pillsRemaining - 1) };
          }
          return m;
        })
      );
    }

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId,
          patientName: userProfile.fullName,
          status,
          glucoseReading: glucose,
        }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setConfirmedLogs((prev) => [data.log, ...prev.filter((l) => l.id !== data.log.id)]);
      }
    } catch (err) {
      const newLog: DosageLog = {
        id: `log_${Date.now()}`,
        medicationId: medId,
        patientName: userProfile.fullName,
        confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status,
        glucoseReading: glucose,
      };
      setConfirmedLogs([newLog, ...confirmedLogs]);
    }
  };

  const handleRefillMedication = (id: string, refillAmount: number = 30) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const current = med.pillsRemaining ?? 0;
          const capacity = med.totalPillCapacity ?? 60;
          const updatedPills = Math.min(capacity, current + refillAmount);
          return { ...med, pillsRemaining: updatedPills };
        }
        return med;
      })
    );
  };

  const handleAddMedication = async (med: Medication) => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med),
      });
      const data = await res.json();
      if (data.success && data.medications) {
        setMedications(data.medications);
      } else {
        setMedications([...medications, med]);
      }
    } catch (err) {
      setMedications([...medications, med]);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.medications) {
        setMedications(data.medications);
      } else {
        setMedications(medications.filter((m) => m.id !== id));
      }
    } catch (err) {
      setMedications(medications.filter((m) => m.id !== id));
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100' 
        : isHighContrast 
        ? 'bg-yellow-50 text-black' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Toast Alert Banner */}
      {activeLiveAlert && (
        <div className="bg-amber-500 text-slate-950 px-6 py-3 shadow-lg flex items-center justify-between z-50 sticky top-0 font-bold animate-bounce">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 animate-pulse" />
            <div>
              <span className="text-xs uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded mr-2 font-black">
                Real-Time Caregiver Nudge
              </span>
              <span><strong>{activeLiveAlert.sender}:</strong> "{activeLiveAlert.message}"</span>
              <span className="text-xs font-normal opacity-80 ml-2">({activeLiveAlert.timestamp})</span>
            </div>
          </div>
          <button
            onClick={() => setActiveLiveAlert(null)}
            className="p-1 hover:bg-amber-600 rounded-lg text-slate-950 font-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-white'
          : isHighContrast 
          ? 'bg-yellow-300 border-black text-black' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('patient')}>
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-xl">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  DoseBuddy <span className="text-sky-600">AI</span>
                </h1>
                
                {/* Real-Time Stream Status Badge */}
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1.5 ${
                  sseStatus === 'connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Radio className={`w-3 h-3 ${sseStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  <span>{sseStatus === 'connected' ? 'Real-Time SSE Active' : 'Connecting Stream...'}</span>
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Smart Personal Health & Medication Companion
              </p>
            </div>
          </div>

          {/* User Controls & Modals */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOcrOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition hidden md:flex"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>OCR Scanner</span>
            </button>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition hidden sm:flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Routine Onboarding</span>
            </button>

            {/* Dynamic User Profile Header Status */}
            <div className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" title="Active Firebase Auth Session" />
              </div>

              <div className="text-left hidden sm:block pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {userProfile.fullName || 'Logged In User'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-sky-700 font-semibold mt-0.5">
                  <span className="capitalize">{userProfile.role}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-mono truncate max-w-[130px]">{userProfile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-1.5">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  title="Switch User / Login with other credentials"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Switch</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  title="Log Out from current session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Logout</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
              title="Settings & Display"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 py-2">
            {[
              { id: 'patient', label: 'Patient Dashboard', icon: HeartHandshake },
              { id: 'caregiver', label: 'Caregiver Portal & FCM', icon: ShieldAlert },
              { id: 'meds', label: 'Medicines Cabinet', icon: Pill },
              { id: 'chat', label: 'DoseBuddy AI Companion', icon: MessageSquareHeart },
              { id: 'admin', label: 'System Admin & Analytics', icon: Shield },
              { id: 'code', label: 'Repository Explorer', icon: FolderGit2 },
              { id: 'docs', label: 'Architecture & Run Docs', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'patient' && (
          <PatientView
            userProfile={userProfile}
            medications={medications}
            isHighContrast={isHighContrast}
            isLargeText={isLargeText}
            onConfirmDose={handleConfirmDose}
            confirmedLogs={confirmedLogs}
          />
        )}

        {activeTab === 'caregiver' && (
          <CaregiverView userProfile={userProfile} confirmedLogs={confirmedLogs} />
        )}

        {activeTab === 'meds' && (
          <MedsManagerView
            userProfile={userProfile}
            medications={medications}
            confirmedLogs={confirmedLogs}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onRefillMedication={handleRefillMedication}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatView userProfile={userProfile} medications={medications} />
        )}

        {activeTab === 'admin' && (
          <AdminView userProfile={userProfile} />
        )}

        {activeTab === 'code' && (
          <CodeExplorerView repoFiles={REPO_FILES} />
        )}

        {activeTab === 'docs' && (
          <DocsView />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(profile) => {
          handleSaveProfile(profile);
          if (!profile.isOnboarded) {
            setIsOnboardingOpen(true);
          }
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        isLargeText={isLargeText}
        setIsLargeText={setIsLargeText}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <OCRScanModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onExtractedMedication={(partialMed) => {
          const newMed: Medication = {
            id: `med_${Date.now()}`,
            name: partialMed.name || 'Scanned Medicine',
            dosage: partialMed.dosage || '1 Tablet',
            frequency: partialMed.frequency || 'Once Daily',
            timeSlots: ['08:00 AM'],
            instructions: partialMed.instructions || 'Take as directed.',
            requiresBloodSugarCheck: Boolean(partialMed.requiresBloodSugarCheck),
            targetGlucoseMin: 80,
            targetGlucoseMax: 130,
            pillColor: partialMed.pillColor || 'Standard Pill',
            category: partialMed.category || 'Diabetes',
            foodRelation: partialMed.foodRelation || 'after_food',
            imageUrl: partialMed.imageUrl,
          };
          handleAddMedication(newMed);
          setActiveTab('meds');
        }}
      />
    </div>
  );
}
