
'use client';
import {
  doc,
  updateDoc,
  serverTimestamp,
  type Firestore,
  getDoc,
  runTransaction,
} from 'firebase/firestore';

export async function bookSlot(db: Firestore, slotId: string, facultyEmpId: string) {
  const slotRef = doc(db, 'slots', slotId);

  try {
    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (!slotSnap.exists()) {
        throw new Error("Slot does not exist!");
      }
      
      const slotData = slotSnap.data();
      if (slotData.teacherEmpId) {
        throw new Error("This slot has already been assigned to a teacher.");
      }

      transaction.update(slotRef, {
        teacherEmpId: facultyEmpId,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (e: any) {
    console.error("Transaction failed: ", e);
    throw e; // Re-throw the error to be caught by the calling function
  }
}
