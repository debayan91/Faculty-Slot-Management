
'use client';
import {
  doc,
  updateDoc,
  serverTimestamp,
  type Firestore,
  getDoc,
} from 'firebase/firestore';

export async function bookSlot(db: Firestore, slotId: string, facultyEmpId: string) {
    const slotRef = doc(db, 'slots', slotId);

    // Check if slot is already booked in a transaction to be safe
    const slotSnap = await getDoc(slotRef);
    if (slotSnap.exists() && slotSnap.data().isBooked) {
        throw new Error("This slot has already been booked by someone else.");
    }

    await updateDoc(slotRef, {
        isBooked: true,
        bookedBy: facultyEmpId,
        updatedAt: serverTimestamp(),
    });
}
