import { type User as FirebaseUser } from "firebase/auth";
import type { Faculty as FacultyDoc } from "@/firebase/firestore/users";

// We can extend the base user with our own faculty profile data
export interface User extends FirebaseUser, Partial<FacultyDoc> {}

export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Slot {
  id: string;
  time: string;
  isBooked: boolean;
}
