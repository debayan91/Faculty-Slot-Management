export interface User {
  empId: string;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Slot {
  id: string;
  time: string;
  isBooked: boolean;
}
