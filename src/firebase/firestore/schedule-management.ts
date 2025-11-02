
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { ScheduleTemplate, Slot } from '@/lib/types';


/**
 * Generates and saves a full day's schedule to the 'slots' collection
 * based on a daily template from 'schedule_templates'.
 * It will not create duplicates if slots for that day already exist.
 */
export async function generateScheduleForDate(db: Firestore, date: Date) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];

  // 1. Check if slots for this date already exist to prevent duplication
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingSlotsQuery = query(
    collection(db, 'slots'),
    where('slot_datetime', '>=', Timestamp.fromDate(startOfDay)),
    where('slot_datetime', '<=', Timestamp.fromDate(endOfDay))
  );

  const existingSlotsSnapshot = await getDocs(existingSlotsQuery);
  if (!existingSlotsSnapshot.empty) {
    throw new Error(`Schedule already exists for ${date.toLocaleDateString()}. Found ${existingSlotsSnapshot.size} slots.`);
  }

  // 2. Fetch the schedule template for the given day
  const templateRef = doc(db, 'schedule_templates', dayName);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error(`Schedule template for '${dayName}' not found.`);
  }
  const template = templateSnap.data() as Omit<ScheduleTemplate, 'id'>;

  // 3. Create a batch write operation
  const batch = writeBatch(db);

  template.slots.forEach(templateSlot => {
    const [hours, minutes] = templateSlot.startTime.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const newSlot: Omit<Slot, 'id'> = {
      slot_datetime: Timestamp.fromDate(slotDateTime),
      duration_minutes: templateSlot.duration,
      course_name: 'Unavailable',
      faculty_name: null,
      room_number: null,
      is_bookable: false,
      is_booked: false,
      booked_by: null,
    };

    const newSlotRef = doc(collection(db, 'slots'));
    batch.set(newSlotRef, newSlot);
  });

  // 4. Commit the batch
  await batch.commit();
  return { success: true, message: `Successfully generated ${template.slots.length} slots for ${dayName}.`};
}

/**
 * Deletes all slot documents for a given date.
 * USE WITH CAUTION.
 */
export async function deleteScheduleForDate(db: Firestore, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'slots'),
    where('slot_datetime', '>=', Timestamp.fromDate(startOfDay)),
    where('slot_datetime', '<=', Timestamp.fromDate(endOfDay))
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return { success: true, message: 'No slots found to delete.' };
  }

  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return { success: true, message: `Deleted ${querySnapshot.size} slots.` };
}

/**
 * Updates a single slot document with new data.
 */
export async function updateSlot(db: Firestore, slotId: string, newData: Partial<Slot>) {
  const slotRef = doc(db, 'slots', slotId);
  await updateDoc(slotRef, newData);
}

    