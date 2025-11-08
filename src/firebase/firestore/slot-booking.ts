
import {
    type Firestore,
    doc,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
import { Slot } from '@/lib/types';

/**
 * Books a slot for a user, ensuring it is still available.
 * This function uses a transaction to prevent double-bookings.
 */
export async function bookSlot(db: Firestore, slotId: string, userId: string, facultyName: string) {
    const slotRef = doc(db, 'slots', slotId);

    return runTransaction(db, async (transaction) => {
        const slotDoc = await transaction.get(slotRef);
        if (!slotDoc.exists()) {
            throw new Error("This slot does not exist.");
        }

        const slot = slotDoc.data() as Slot;

        if (slot.is_booked) {
            throw new Error("This slot has already been booked by someone else.");
        }

        if (!slot.is_bookable) {
            throw new Error("This slot is not available for booking.");
        }

        transaction.update(slotRef, {
            is_booked: true,
            booked_by: userId,
            faculty_name: facultyName
        });
    });
}

/**
 * Cancels a user's booking for a slot.
 */
export async function cancelBooking(db: Firestore, slotId: string) {
    const slotRef = doc(db, 'slots', slotId);

    return runTransaction(db, async (transaction) => {
        const slotDoc = await transaction.get(slotRef);
        if (!slotDoc.exists()) {
            throw new Error("This slot does not exist.");
        }

        transaction.update(slotRef, {
            is_booked: false,
            booked_by: null,
            faculty_name: null
        });
    });
}
