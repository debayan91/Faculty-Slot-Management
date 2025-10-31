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
        // Return null instead of logging an error, as this is an expected case for new users.
        return null;
    }
}

export async function createFacultyProfile(db: Firestore, userId: string, data: Omit<Faculty, 'userId'>) {
    const facultyRef = doc(db, 'faculties', userId);
    // The user document may not exist yet, so we don't need to check with getDoc first.
    // setDoc with { merge: true } will create it if it's missing, or update it if it exists.
    // For this flow, we only expect to be creating.
    await setDoc(facultyRef, {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
