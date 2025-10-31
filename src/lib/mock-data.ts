import { Course, Slot, User } from './types';

export const MOCK_USER_EMAIL = "jane.doe@university.edu";

export const MOCK_COURSES: Course[] = [
  { id: "C1", name: "Advanced Pedagogy", description: "A deep dive into modern teaching methods." },
  { id: "C2", name: "Digital Learning Tools", description: "Master tools for online education." },
  { id: "C3", name: "AI in the Classroom", description: "Integrating generative AI responsibly." }
];

export const MOCK_SLOTS: { [courseId: string]: Slot[] } = {
  "C1": [
    { id: "S1", time: "Mon, Oct 30 @ 10:00 AM", isBooked: false },
    { id: "S2", time: "Mon, Oct 30 @ 02:00 PM", isBooked: true },
    { id: "S3", time: "Tue, Oct 31 @ 10:00 AM", isBooked: false },
    { id: "S9", time: "Tue, Oct 31 @ 11:00 AM", isBooked: false },
  ],
  "C2": [
    { id: "S4", time: "Wed, Nov 1 @ 09:00 AM", isBooked: false },
    { id: "S5", time: "Wed, Nov 1 @ 11:00 AM", isBooked: false },
    { id: "S10", time: "Thu, Nov 2 @ 09:00 AM", isBooked: false },
  ],
  "C3": [
    { id: "S6", time: "Mon, Oct 30 @ 04:00 PM", isBooked: true },
    { id: "S7", time: "Tue, Oct 31 @ 04:00 PM", isBooked: true },
    { id: "S8", time: "Wed, Nov 1 @ 04:00 PM", isBooked: false },
  ]
};
