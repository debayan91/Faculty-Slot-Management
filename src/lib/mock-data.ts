import { Course } from './types';

export const MOCK_USER_EMAIL = "jane.doe@university.edu";

export const MOCK_COURSES: Course[] = [
  { id: "C1", name: "Advanced Pedagogy", description: "A deep dive into modern teaching methods." },
  { id: "C2", name: "Digital Learning Tools", description: "Master tools for online education." },
  { id: "C3", name: "AI in the Classroom", description: "Integrating generative AI responsibly." }
];

// MOCK_SLOTS is no longer needed as we will fetch from Firestore.
