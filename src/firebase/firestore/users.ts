
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
  id: string; // Add id to the interface
  empId: string;
  userId?: string; // Is on the document, but not required for creation
  name: string;
  email: string;
  department?: string;
  role: 'faculty' | 'admin';
}

export interface Slot extends DocumentData {
  id: string;
  slotDatetime: string;
  durationMinutes: number;
  courseId: string;
  isBooked: boolean;
  bookedBy?: string;
}

export async function getFacultyProfile(db: Firestore, userId: string): Promise<Faculty | null> {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (facultySnap.exists()) {
        return { id: facultySnap.id, ...facultySnap.data() } as Faculty;
    } else {
        // Return null instead of logging an error, as this is an expected case for new users.
        return null;
    }
}

export async function createFacultyProfile(db: Firestore, userId: string, data: Omit<Faculty, 'userId' | 'id'>) {
    const facultyRef = doc(db, 'faculties', userId);
    const facultySnap = await getDoc(facultyRef);

    if (!facultySnap.exists()) {
      await setDoc(facultyRef, {
          ...data,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });
    }
}
