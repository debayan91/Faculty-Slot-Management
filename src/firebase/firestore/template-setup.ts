
'use client';

import {
  collection,
  writeBatch,
  doc,
  type Firestore,
  getDocs,
} from 'firebase/firestore';
import { parse } from 'date-fns';
import { theoryClasses, labClasses } from '@/lib/timetable';
import { ScheduleTemplate } from '@/lib/types';

function parseTime(timeStr: string) {
    return parse(timeStr, 'h:mm a', new Date());
}

/**
 * Creates default schedule templates for Monday to Friday in the `schedule_templates` collection.
 * It will not overwrite existing templates.
 */
export async function seedScheduleTemplates(db: Firestore) {
  const templatesCollection = collection(db, 'schedule_templates');
  const existingTemplates = await getDocs(templatesCollection);
  const existingDays = new Set(existingTemplates.docs.map(doc => doc.id));

  const batch = writeBatch(db);
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  let templatesCreated = 0;

  daysOfWeek.forEach(day => {
    if (existingDays.has(day)) {
      console.log(`Template for ${day} already exists. Skipping.`);
      return;
    }

    const dayNameTitleCase = day.charAt(0).toUpperCase() + day.slice(1);
    const theoryForDay = theoryClasses.filter(c => c.day === dayNameTitleCase);
    const labsForDay = labClasses.filter(c => c.day === dayNameTitleCase);

    const allSlotsForDay = [...theoryForDay, ...labsForDay].map(s => {
        const startTime = parseTime(s.startTime);
        const endTime = parseTime(s.endTime);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        return {
            startTime: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
            duration: duration > 0 ? duration : 50,
            course_name: s.code
        }
    }).sort((a,b) => a.startTime.localeCompare(b.startTime));
    

    const newTemplate: Omit<ScheduleTemplate, 'id'> = {
      day: dayNameTitleCase,
      slots: allSlotsForDay,
    };

    const templateRef = doc(db, 'schedule_templates', day);
    batch.set(templateRef, newTemplate);
    templatesCreated++;
  });

  if (templatesCreated === 0) {
    return { success: true, message: 'All templates already exist. No new templates were created.' };
  }

  await batch.commit();
  return { success: true, message: `Successfully created ${templatesCreated} new schedule templates.` };
}

    