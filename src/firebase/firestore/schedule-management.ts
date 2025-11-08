
import {
    type Firestore,
    doc,
    getDoc,
    collection,
    writeBatch,
    Timestamp,
    runTransaction,
    query,
    where,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { ScheduleTemplate } from '@/lib/types';
import { format, parse } from 'date-fns';

/**
 * Generates a schedule for a given date by creating individual slot documents
 * based on the template for that day of the week.
 */
export async function generateScheduleForDate(db: Firestore, date: Date) {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const templateRef = doc(db, 'schedule_templates', dayOfWeek);
    
    try {
        const templateSnap = await getDoc(templateRef);

        if (!templateSnap.exists()) {
            return {
                success: false,
                message: `Template for '${dayOfWeek}' not found. Please create it first.`
            };
        }

        const template = templateSnap.data() as ScheduleTemplate;

        if (!Array.isArray(template.slots) || template.slots.length === 0) {
            return {
                success: false,
                message: `Template '${dayOfWeek}' is empty or invalid.`
            };
        }

        // Check if slots already exist for this date to prevent duplicates
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const existingSlotsQuery = query(
            collection(db, 'slots'),
            where('slot_datetime', '>=', startOfDay),
            where('slot_datetime', '<=', endOfDay)
        );

        const existingSlotsSnap = await getDocs(existingSlotsQuery);
        if (!existingSlotsSnap.empty) {
            return {
                success: false,
                message: `Schedule for ${format(date, 'yyyy-MM-dd')} already exists. Delete it first to regenerate.`
            };
        }

        // Create a new batch write
        const batch = writeBatch(db);

        template.slots.forEach(templateSlot => {
            const [hours, minutes] = templateSlot.startTime.split(':').map(Number);
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hours, minutes, 0, 0);

            const newSlotDocRef = doc(collection(db, 'slots'));
            
            batch.set(newSlotDocRef, {
                slot_datetime: Timestamp.fromDate(slotDateTime),
                duration_minutes: templateSlot.duration || 60,
                is_bookable: templateSlot.isBookable !== undefined ? templateSlot.isBookable : false,
                is_booked: false,
                booked_by: null,
                course_name: templateSlot.courseName || null,
                faculty_name: templateSlot.facultyName || null,
                room_number: templateSlot.room || null,
                slot_code: templateSlot.slot_code || null,
            });
        });

        await batch.commit();

        return { success: true, message: `Successfully generated ${template.slots.length} slots.` };

    } catch (error: any) {
        console.error("Error in generateScheduleForDate:", error);
        return { success: false, message: 'An unexpected error occurred: ' + error.message };
    }
}

/**
 * Deletes all slot documents within a given date range.
 */
export async function deleteSchedulesByDateRange(db: Firestore, startDate: Date, endDate: Date) {
    const start = new Date(startDate.setHours(0,0,0,0));
    const end = new Date(endDate.setHours(23,59,59,999));

    const slotsRef = collection(db, 'slots');
    const q = query(slotsRef, where('slot_datetime', '>=', start), where('slot_datetime', '<=', end));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: true, message: 'No slots found in the selected date range to delete.' };
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return { success: true, message: `Successfully deleted ${querySnapshot.size} slots.` };
    } catch(error: any) {
        console.error("Error deleting slots:", error);
        return { success: false, message: 'An error occurred during deletion: ' + error.message };
    }
}

/**
 * Retrieves all slot documents within a given date range.
 */
export async function getSchedulesByDateRange(db: Firestore, startDate: Date, endDate: Date) {
    const start = new Date(startDate.setHours(0,0,0,0));
    const end = new Date(endDate.setHours(23,59,59,999));

    const slotsRef = collection(db, 'slots');
    const q = query(
        slotsRef,
        where('slot_datetime', '>=', start),
        where('slot_datetime', '<=', end),
        orderBy('slot_datetime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const slots: any[] = [];
    querySnapshot.forEach(doc => {
        slots.push({ id: doc.id, ...doc.data() });
    });

    return slots;
}
