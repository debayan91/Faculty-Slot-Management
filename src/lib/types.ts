
import { Timestamp } from "firebase/firestore";

// ----------------------------------------------------------------------------
// Core Data Structures
// ----------------------------------------------------------------------------

/**
 * Represents a single slot within a schedule template.
 * Stored as an array within a ScheduleTemplate document.
 */
export interface TemplateSlot {
    startTime: string; // e.g., "09:00"
    duration: number;  // in minutes
    courseName?: string;
    facultyName?: string;
    room?: string;
    isBookable?: boolean;
    slot_code?: string; // Optional: A unique code for this type of slot
}

/**
 * Defines the structure for a schedule template.
 * These are stored in the 'schedule_templates' collection and are used as a base
 * to generate the daily slots. The document ID is the day of the week (e.g., 'monday').
 */
export interface ScheduleTemplate {
    id: string; // Document ID (e.g., 'monday')
    day: string; // e.g., 'Monday'
    slots: TemplateSlot[];
}

/**
 * Represents a specific, final slot document in the main 'slots' collection.
 * This is the structure that users will interact with for booking.
 */
export interface Slot {
    id: string;                 // The document ID from Firestore
    slot_datetime: Timestamp;   // Firestore Timestamp object for exact date and time
    duration_minutes: number;
    course_name: string | null;
    faculty_name: string | null; // Can be pre-filled by admin or filled on booking
    room_number: string | null;
    is_bookable: boolean;       // Admin sets this to true to allow booking
    is_booked: boolean;
    booked_by: string | null;   // The faculty's user ID (uid) who booked it
    slot_code: string | null;
}


/**
 * Represents an authorized email document in the 'authorized_emails' collection.
 */
export interface AuthorizedEmail {
    id: string;      // The document ID (typically the email address itself)
    email: string;
    addedAt: Timestamp; // Firestore Timestamp
}

/**
 * Defines the structure for a user's public profile.
 * Stored in the 'faculties' collection.
 */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'faculty' | 'admin'; // Example roles
}
