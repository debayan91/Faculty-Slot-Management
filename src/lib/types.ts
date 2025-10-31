import { type User as FirebaseUser } from "firebase/auth";
import { type Faculty } from "@/firebase/firestore/users";

export interface User extends FirebaseUser, Faculty {}

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
