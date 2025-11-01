'use client';

import { doc, updateDoc, serverTimestamp, type Firestore, deleteDoc } from 'firebase/firestore';

// Releases a slot, making it available again
export async function releaseSlot(db: Firestore, slotId: string) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, {
    isBooked: false,
    bookedBy: null,
    updatedAt: serverTimestamp(),
  });
}

// Deletes a slot document permanently
export async function deleteSlot(db: Firestore, slotId: string) {
  const slotRef = doc(db, 'slots', slotId);
  await deleteDoc(slotRef);
}

// Assigns a slot to a specific faculty member
export async function assignSlot(db: Firestore, slotId: string, facultyEmpId: string) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, {
    isBooked: true,
    bookedBy: facultyEmpId,
    updatedAt: serverTimestamp(),
  });
}
