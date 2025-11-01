
"use client";

import { useState } from "react";
import { MOCK_COURSES } from "@/lib/mock-data";
import type { Course, Slot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { bookSlot } from "@/firebase/firestore/slots";
import { CardDescription, CardTitle } from "./ui/card";

function formatSlotTime(date: Date) {
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} @ ${time}`;
}

function getDisplayTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function CourseRegistration() {
  const { user, faculty, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [slotsData, slotsLoading, slotsError] = useCollection(collection(firestore, "slots"));

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [currentView, setCurrentView] = useState("courseSelection");
  const [isLoading, setIsLoading] = useState(false);

  const resetApp = () => {
    setSelectedCourse(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    setCurrentView("courseSelection");
  };

  const loading = userLoading || slotsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !faculty) {
    return (
      <div className="flex justify-center items-center h-screen -mt-24">
        <div className="text-center">
          <h1 className="main-heading">Welcome to the Faculty Portal</h1>
          <p className="sub-heading">Please <Link href="/login" className="underline text-primary">log in</Link> to register for courses.</p>
        </div>
      </div>
    )
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedDay(null);
    setSelectedSlot(null);
    setCurrentView("daySelection");
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setSelectedSlot(null);
    setCurrentView("slotSelection");
  };

  const handleSlotSelect = async (slot: Slot) => {
    if (!faculty) return;
    const formattedTime = formatSlotTime(new Date(slot.slotDatetime));
    const isConfirmed = confirm(
      `Confirm booking for ${selectedCourse?.name} at ${formattedTime}?`
    );
    if (isConfirmed) {
      setIsLoading(true);
      try {
        await bookSlot(firestore, slot.id, faculty.empId);
        // We need to shape the selected slot to have the right data for confirmation screen
        const confirmedSlot = { ...slot, time: formattedTime };
        setSelectedSlot(confirmedSlot as any); // hack for now for demonstration
        setCurrentView("confirmation");
      } catch (error: any) {
        console.error("Failed to book slot:", error);
        alert(`Error booking slot: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const allSlots: Slot[] = slotsData ? slotsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot)) : [];
  
  const getAvailableDays = () => {
    if (!selectedCourse) return [];
    
    // A slot is available if it matches the course and has no teacher assigned
    const courseSlots = allSlots.filter(slot => slot.subjectCode === selectedCourse.id && !slot.teacherEmpId);
    const availableDays = [...new Set(courseSlots.map(slot => new Date(slot.slotDatetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })))];
    
    return availableDays;
  };
  
  const getSlotsForDay = () => {
    if (!selectedCourse || !selectedDay) return [];
    
    return allSlots.filter(slot => {
        const slotDate = new Date(slot.slotDatetime);
        const slotDayString = slotDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return slot.subjectCode === selectedCourse.id && slotDayString === selectedDay;
    });
  }

  return (
    <div className="card-container w-full max-w-2xl mx-auto">
      {(isLoading || loading) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {currentView === "courseSelection" && selectedCourse === null && (
        <div id="course-selection-section">
           <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="main-heading">
                Register for <span className="gradient-text">New Courses</span>
              </h1>
              <h2 className="sub-heading">Welcome, <span className="gradient-text">{faculty?.name || user?.email}</span>!</h2>
            </div>
            <Button asChild>
                <Link href="/my-booked-slots">My Booked Slots</Link>
            </Button>
           </div>
          <p className="mb-6 text-light">1. Please select a course to continue.</p>
          <div className="space-y-4">
            {MOCK_COURSES.map((course) => (
              <button key={course.id} className="course-card w-full" onClick={() => handleCourseSelect(course)}>
                <h3 className="font-medium-theme text-lg text-normal">{course.name}</h3>
                <p className="text-light text-sm mt-1">{course.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentView === "daySelection" && selectedCourse && (
        <div id="day-selection-section" className="section-divider">
          <h2 className="section-heading">Select a Day</h2>
          <p className="mb-6 text-light">2. Choose a day for <span className="font-medium-theme text-normal">{selectedCourse.name}</span>.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {getAvailableDays().length > 0 ? (
                getAvailableDays().map((day) => (
                    <Button key={day} variant="secondary" className="supabase-button supabase-button-secondary" onClick={() => handleDaySelect(day)}>
                    {day}
                    </Button>
                ))
                ) : (
                <p className="text-light col-span-full">No available days for this course.</p>
             )}
          </div>
           <Button variant="link" onClick={() => setCurrentView('courseSelection')} className="mt-4">Back to courses</Button>
        </div>
      )}

      {currentView === "slotSelection" && selectedCourse && selectedDay &&(
         <div id="slot-selection-section" className="section-divider">
            <h2 className="section-heading">Select a Time Slot</h2>
            <p className="mb-6 text-light">3. Available slots for <span className="font-medium-theme text-normal">{selectedCourse.name}</span> on <span className="font-medium-theme text-normal">{selectedDay}</span>.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getSlotsForDay().map(slot => (
                    <Button 
                        key={slot.id} 
                        className="slot-button"
                        variant="secondary"
                        disabled={!!slot.teacherEmpId}
                        onClick={() => handleSlotSelect(slot)}
                    >
                        {getDisplayTime(new Date(slot.slotDatetime))}
                    </Button>
                ))}
            </div>
            <Button variant="link" onClick={() => setCurrentView('daySelection')} className="mt-4">Back to day selection</Button>
         </div>
      )}

      {currentView === 'confirmation' && selectedSlot && (
        <div id="confirmation-section" className="section-divider text-center">
          <div className="flex justify-center mb-5">
            <CheckCircle className="w-20 h-20 text-primary" />
          </div>
          <h2 className="section-heading !text-center">Registration Confirmed!</h2>
          <p className="sub-heading !text-center !mb-1">Thank you, <span className="font-medium-theme text-normal">{faculty?.name}</span>.</p>
          <p className="mb-4 text-light">
            Your slot for <span className="font-medium-theme text-normal">{selectedCourse?.name}</span> on <span className="font-medium-theme text-normal">{(selectedSlot as any).time}</span> is booked.
          </p>
          <p className="text-sm mb-6 text-light">A confirmation email has been *simulated* to <span className="font-medium-theme text-light">{user?.email}</span>.</p>

          <Button onClick={resetApp} className="supabase-button">Register for Another Course</Button>
        </div>
      )}
    </div>
  );
}
