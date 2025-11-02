
'use client';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';

export interface Faculty extends DocumentData {
  id: string; // The document ID, which is the same as the user's uid
  empId: string;
  userId?: string; 
  name: string;
  email: string;
  department?: string;
  role: 'faculty' | 'admin';
}

export async function getFacultyProfile(db: Firestore, userId: string): Promise<Faculty | null> {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (facultySnap.exists()) {
        return { id: facultySnap.id, ...facultySnap.data() } as Faculty;
    } else {
        return null;
    }
}

export async function createFacultyProfile(db: Firestore, userId: string, data: { name: string, email: string, role: 'faculty' | 'admin' }) {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (!facultySnap.exists()) {
      await setDoc(facultyRef, {
          empId: userId.slice(0, 8), // For mock purposes
          ...data,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      }, { merge: true });
    }
}

    