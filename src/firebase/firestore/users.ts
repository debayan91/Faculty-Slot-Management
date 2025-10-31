'use client';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { useFirestore } from '..';

export interface Faculty extends DocumentData {
  empId: string;
  userId: string;
  name: string;
  email: string;
  department?: string;
  role: 'faculty' | 'admin';
}

export async function getFacultyProfile(userId: string): Promise<Faculty | null> {
    const db = useFirestore();
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (facultySnap.exists()) {
        return facultySnap.data() as Faculty;
    } else {
        return null;
    }
}

export async function createFacultyProfile(userId: string, data: Omit<Faculty, 'userId' | 'updatedAt'>) {
    const db = useFirestore();
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    const facultyRef = doc(db, 'faculties', userId);
    await setDoc(facultyRef, {
        ...data,
        userId,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}
