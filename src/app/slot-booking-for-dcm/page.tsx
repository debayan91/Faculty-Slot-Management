'use client';

import CourseRegistration from '@/components/course-registration';
import { DCSessionProvider } from '@/context/DCSessionProvider';

export default function SlotBookingPage() {
  return (
    <div className='container mx-auto p-4 md:p-8'>
      <DCSessionProvider>
        <CourseRegistration />
      </DCSessionProvider>
    </div>
  );
}
