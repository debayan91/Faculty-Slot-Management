
import { type User as FirebaseUser } from "firebase/auth";
import type { Faculty as FacultyDoc } from "@/firebase/firestore/users";

// We can extend the base user with our own faculty profile data
export interface User extends FirebaseUser, Partial<FacultyDoc> {}

export interface Course {
  id: string;
  name: string;
  description: string;
}

// Update Slot type to match Firestore schema
export interface Slot {
  id: string; // The document ID from Firestore
  slotDatetime: string;
  durationMinutes: number;
  subjectCode: string;
  teacherEmpId?: string | null;
}
