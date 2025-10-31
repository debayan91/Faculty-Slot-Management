'use client';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export interface Faculty extends DocumentData {
  empId: string;
  userId?: string; // Is on the document, but not required for creation
  name: string;
  email: string;
  department?: string;
  role: 'faculty' | 'admin';
}

export async function getFacultyProfile(db: Firestore, userId: string): Promise<Faculty | null> {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (facultySnap.exists()) {
        return facultySnap.data() as Faculty;
    } else {
        return null;
    }
}

export async function createFacultyProfile(db: Firestore, userId: string, data: Omit<Faculty, 'userId'>) {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (!facultySnap.exists()) {
        await setDoc(facultyRef, {
            ...data,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }
}
