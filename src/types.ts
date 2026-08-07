export type UserRole = 'patient' | 'caregiver' | 'doctor' | 'admin';

export type DailyRoutineType = 'Office' | 'College' | 'Home' | 'Travelling' | 'Night Shift' | 'Retired';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  age: number;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  emergencyContact: string;
  caregiverContact: string;
  preferredLanguage: string;
  country: string;
  timeZone: string;
  dailyRoutine: DailyRoutineType;
  wakeTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  isOnboarded: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export type MedCategory = 'Painkiller' | 'Diabetes' | 'Heart' | 'Vitamin' | 'Blood Pressure' | 'Other';

export interface Medication {
  id: string;
  userId?: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "Twice Daily", "Once Daily", "Weekly"
  timeSlots: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  instructions: string;
  requiresBloodSugarCheck: boolean;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  pillColor: string;
  category: MedCategory;
  foodRelation?: 'before_food' | 'after_food' | 'with_food';
  imageUrl?: string;
  prescriptionUrl?: string;
  doctorNotes?: string;
  pillsRemaining?: number;
  totalPillCapacity?: number;
  refillThreshold?: number;
}

export type DoseStatus = 'TAKEN' | 'SKIPPED' | 'SNOOZED' | 'HELP_NEEDED';

export interface DosageLog {
  id: string;
  medicationId: string;
  medicationName?: string;
  userId?: string;
  patientName: string;
  confirmedAt: string;
  status: DoseStatus;
  glucoseReading?: number;
  notes?: string;
  timestamp?: number;
}

export interface CaregiverAlert {
  id: string;
  sender: string;
  patientId?: string;
  patientName: string;
  medicationName?: string;
  scheduledTime?: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  timestamp: string;
  status?: 'DELIVERED' | 'DISPATCHED' | 'RESOLVED';
  fcmId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'alert' | 'system';
}

export interface RepositoryFile {
  path: string;
  category: 'backend' | 'frontend' | 'firebase' | 'docs';
  language: string;
  content: string;
}

export interface AppSystemLog {
  id: string;
  timestamp: string;
  event: string;
  userId?: string;
  level: 'info' | 'warning' | 'error';
  details: string;
}
