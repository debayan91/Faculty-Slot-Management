
import { doc, setDoc, getDoc, collection, writeBatch, getDocs, query, where, deleteDoc, updateDoc, Timestamp, Firestore } from "firebase/firestore";
import { ScheduleTemplate } from "@/lib/types";

const DEFAULT_TEMPLATE_ID = 'default';

// Defines a standard 9-5 schedule with 1-hour slots
const defaultSlots = [
    { startTime: '09:00', duration: 60, slot_code: 'MOR-1' },
    { startTime: '10:00', duration: 60, slot_code: 'MOR-2' },
    { startTime: '11:00', duration: 60, slot_code: 'MOR-3' },
    { startTime: '12:00', duration: 60, slot_code: 'LUN-1' }, // Lunch
    { startTime: '13:00', duration: 60, slot_code: 'AFT-1' },
    { startTime: '14:00', duration: 60, slot_code: 'AFT-2' },
    { startTime: '15:00', duration: 60, slot_code: 'AFT-3' },
    { startTime: '16:00', duration: 60, slot_code: 'AFT-4' },
];

/**
 * Seeds the database with the default schedule template.
 * This is an idempotent operation, meaning it will not overwrite existing data.
 */
export async function seedDefaultScheduleTemplate(db: Firestore): Promise<{ success: boolean; message: string; }> {
    const templateRef = doc(db, 'schedule_templates', DEFAULT_TEMPLATE_ID);

    try {
        const docSnap = await getDoc(templateRef);

        if (docSnap.exists()) {
            return {
                success: false,
                message: `Template '${DEFAULT_TEMPLATE_ID}' already exists. Seeding was skipped.`,
            };
        }

        const newTemplate: Omit<ScheduleTemplate, 'id'> = {
            name: 'Default Schedule',
            slots: defaultSlots,
        };

        await setDoc(templateRef, newTemplate);

        return {
            success: true,
            message: `Successfully seeded the '${DEFAULT_TEMPLATE_ID}' schedule template.`,
        };

    } catch (error) {
        console.error("Error seeding database: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            success: false,
            message: `An error occurred during seeding: ${errorMessage}`,
        };
    }
}
