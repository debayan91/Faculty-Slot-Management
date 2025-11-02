import { Course } from './types';

export const MOCK_USER_EMAIL = "jane.doe@university.edu";

export const MOCK_COURSES: Course[] = [
  { id: "C1", name: "Advanced Pedagogy", description: "A deep dive into modern teaching methods." },
  { id: "C2", name: "Digital Learning Tools", description: "Master tools for online education." },
  { id: "C3", name: "AI in the Classroom", description: "Integrating generative AI responsibly." }
];

// This is an example of what the schedule templates might look like in Firestore.
// You should seed your database with these templates.
export const MOCK_SCHEDULE_TEMPLATES = {
  monday: {
    day: "Monday",
    slots: [
      { startTime: "09:00", duration: 50 },
      { startTime: "10:00", duration: 50 },
      { startTime: "11:00", duration: 50 },
      { startTime: "12:00", duration: 50 },
      { startTime: "14:00", duration: 50 },
      { startTime: "15:00", duration: 50 },
    ]
  },
  // You can add templates for Tuesday, Wednesday, etc.
};
