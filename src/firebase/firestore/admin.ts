
'use client';

import { doc, updateDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

// Unassigns a teacher from a slot, making it available
export async function unassignTeacher(db: Firestore, slotId: string) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, {
    teacherEmpId: null,
    updatedAt: serverTimestamp(),
  });
}

// Updates the subject code for a specific slot
export async function updateSlotSubject(db: Firestore, slotId: string, newSubjectCode: string) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, {
    subjectCode: newSubjectCode,
    updatedAt: serverTimestamp(),
  });
}


// Assigns a slot to a specific faculty member (updates teacher)
export async function updateSlotTeacher(db: Firestore, slotId: string, facultyEmpId: string) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, {
    teacherEmpId: facultyEmpId,
    updatedAt: serverTimestamp(),
  });
}
