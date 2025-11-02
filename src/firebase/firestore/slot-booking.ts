
'use client';
import {
  doc,
  updateDoc,
  serverTimestamp,
  type Firestore,
  runTransaction,
} from 'firebase/firestore';

// This function is for a FACULTY member to book an available slot
export async function bookSlot(db: Firestore, slotId: string, facultyUserId: string, facultyName: string) {
  const slotRef = doc(db, 'slots', slotId);

  try {
    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (!slotSnap.exists()) {
        throw new Error("Slot does not exist!");
      }
      
      const slotData = slotSnap.data();
      if (!slotData.is_bookable) {
        throw new Error("This slot is not available for booking.");
      }
      if (slotData.is_booked) {
        throw new Error("This slot has already been booked by another faculty member.");
      }

      transaction.update(slotRef, {
        is_booked: true,
        booked_by: facultyUserId, // Use the unique User ID
        faculty_name: facultyName, // Also store the name for easier display
      });
    });
  } catch (e: any) {
    console.error("Transaction failed: ", e);
    throw e; // Re-throw the error to be caught by the calling function
  }
}

// This function is for a FACULTY member to cancel their own booking
export async function cancelBooking(db: Firestore, slotId: string, facultyUserId: string) {
    const slotRef = doc(db, 'slots', slotId);
  
    try {
      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        if (!slotSnap.exists()) {
          throw new Error("Slot does not exist!");
        }
        
        const slotData = slotSnap.data();
        if (slotData.booked_by !== facultyUserId) {
          throw new Error("You can only cancel your own bookings.");
        }
  
        transaction.update(slotRef, {
          is_booked: false,
          booked_by: null,
          faculty_name: null,
        });
      });
    } catch (e: any) {
      console.error("Transaction failed: ", e);
      throw e;
    }
  }

    

    

