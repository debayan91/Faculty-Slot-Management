'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export interface DCMeetingLog {
  facultyUid: string;
  empId: string;
  facultyName: string;
  facultyEmail: string;
  scholarRegistrationNumber: string;
  scholarName: string;
  meetingType: string;
  submittedAt: any;
}

/**
 * Saves a DC Meeting log entry to Firestore.
 */
export async function createDCMeetingLog(
  db: Firestore,
  logData: Omit<DCMeetingLog, 'submittedAt'>,
) {
  if (!db) {
    throw new Error('Firestore instance is not available.');
  }

  const logCollectionRef = collection(db, 'dc_meeting_logs');

  await addDoc(logCollectionRef, {
    ...logData,
    submittedAt: serverTimestamp(),
  });
}
