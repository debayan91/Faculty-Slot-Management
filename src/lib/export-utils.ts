import { Slot } from './types';
import { format } from 'date-fns';

interface ExportableSlot {
  date: string;
  time: string;
  course: string;
  faculty: string;
  room: string;
  status: string;
  bookedBy?: string;
  bookedByEmail?: string;
}

function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function slotsToCSVData(slots: Slot[], includeBookerInfo = false): ExportableSlot[] {
  return slots.map((slot) => {
    const base: ExportableSlot = {
      date: format(slot.slot_datetime.toDate(), 'yyyy-MM-dd'),
      time: format(slot.slot_datetime.toDate(), 'HH:mm'),
      course: slot.course_name || 'N/A',
      faculty: slot.faculty_name || 'N/A',
      room: slot.room_number || 'N/A',
      status: slot.is_booked ? 'Booked' : 'Available',
    };
    if (includeBookerInfo) {
      base.bookedBy = slot.booked_by || '';
      base.bookedByEmail = slot.booked_by_email || '';
    }
    return base;
  });
}

export function exportToCSV(
  data: ExportableSlot[],
  filename: string,
  includeBookerInfo = false,
): void {
  const headers = includeBookerInfo
    ? [
        'Date',
        'Time',
        'Course',
        'Faculty',
        'Room',
        'Status',
        'Booked By (UID)',
        'Booked By (Email)',
      ]
    : ['Date', 'Time', 'Course', 'Faculty', 'Room', 'Status'];

  const rows = data.map((row) => {
    const base = [row.date, row.time, row.course, row.faculty, row.room, row.status];
    if (includeBookerInfo) {
      base.push(row.bookedBy || '', row.bookedByEmail || '');
    }
    return base.map(escapeCSV).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
