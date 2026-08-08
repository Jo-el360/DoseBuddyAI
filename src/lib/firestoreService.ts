import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Medication, DosageLog, UserProfile } from '../types';

export const firestoreService = {
  // Fetch user profile from users/{userId}/profile/info
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    const docPath = `users/${userId}/profile/info`;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'info');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return null;
    }
  },

  // Save/Update user profile to users/{userId}/profile/info
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!userId) return;
    const docPath = `users/${userId}/profile/info`;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'info');
      await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  // Fetch medications from users/{userId}/medications
  async getMedications(userId: string): Promise<Medication[]> {
    if (!userId) return [];
    const colPath = `users/${userId}/medications`;
    try {
      const colRef = collection(db, 'users', userId, 'medications');
      const snap = await getDocs(colRef);
      const list: Medication[] = [];
      snap.forEach((d) => list.push(d.data() as Medication));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colPath);
      return [];
    }
  },

  // Save or update medication to users/{userId}/medications/{medId}
  async saveMedication(userId: string, med: Medication): Promise<void> {
    if (!userId || !med.id) return;
    const docPath = `users/${userId}/medications/${med.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'medications', med.id);
      await setDoc(docRef, med, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  // Delete medication from users/{userId}/medications/{medId}
  async deleteMedication(userId: string, medId: string): Promise<void> {
    if (!userId || !medId) return;
    const docPath = `users/${userId}/medications/${medId}`;
    try {
      const docRef = doc(db, 'users', userId, 'medications', medId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Fetch dosage logs from users/{userId}/dosage_logs
  async getDosageLogs(userId: string): Promise<DosageLog[]> {
    if (!userId) return [];
    const colPath = `users/${userId}/dosage_logs`;
    try {
      const colRef = collection(db, 'users', userId, 'dosage_logs');
      const snap = await getDocs(colRef);
      const list: DosageLog[] = [];
      snap.forEach((d) => list.push(d.data() as DosageLog));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colPath);
      return [];
    }
  },

  // Save dosage log to users/{userId}/dosage_logs/{logId}
  async saveDosageLog(userId: string, log: DosageLog): Promise<void> {
    if (!userId || !log.id) return;
    const docPath = `users/${userId}/dosage_logs/${log.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'dosage_logs', log.id);
      await setDoc(docRef, log, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },
};
