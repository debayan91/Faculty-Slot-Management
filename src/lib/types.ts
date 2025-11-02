
import { type User as FirebaseUser } from "firebase/auth";
import type { Faculty as FacultyDoc } from "@/firebase/firestore/user-profiles";

// We can extend the base user with our own faculty profile data
export interface User extends FirebaseUser, Partial<FacultyDoc> {}

export interface Course {
  id: string;
  name:string;
  description: string;
}

// Represents one slot in a daily schedule template
export interface TemplateSlot {
  startTime: string; // "HH:mm"
  duration: number; // in minutes
  course_name: string;
}

// Represents the template for a whole day
export interface ScheduleTemplate {
  id: string; // "monday", "tuesday", etc.
  day: string;
  slots: TemplateSlot[];
}

// Represents a specific, final slot document in the main 'slots' collection
export interface Slot {
  id: string; // The document ID from Firestore
  slot_datetime: any; // Firestore Timestamp object - use .toDate()
  duration_minutes: number;
  course_name: string | null;
  faculty_name: string | null;
  room_number: string | null;
  is_bookable: boolean;
  is_booked: boolean;
  booked_by: string | null; // The faculty's user ID (uid)
}

    