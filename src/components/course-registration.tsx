"use client";

import { useState } from "react";
import { MOCK_COURSES, MOCK_SLOTS, MOCK_USER_EMAIL } from "@/lib/mock-data";
import type { User, Course, Slot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

export default function CourseRegistration() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentView, setCurrentView] = useState("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [slotsData, setSlotsData] = useState(MOCK_SLOTS);

  const resetApp = () => {
    setCurrentUser(null);
    setSelectedCourse(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    setErrorMessage("");
    setCurrentView("verification");
  };

  const handleVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);
    const empId = formData.get("empId") as string;
    const fullName = formData.get("fullName") as string;

    if (!empId || !fullName) {
      setErrorMessage("Please enter both fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({
        empId,
        name: fullName,
        email: MOCK_USER_EMAIL,
      });
      setCurrentView("courseSelection");
      setIsLoading(false);
    }, 500);
  };

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

  const handleSlotSelect = (slot: Slot) => {
    const isConfirmed = confirm(
      `Confirm booking for ${selectedCourse?.name} at ${slot.time}?`
    );
    if (isConfirmed) {
      setIsLoading(true);
      setTimeout(() => {
        // Simulate booking
        const updatedSlots = { ...slotsData };
        const courseSlots = updatedSlots[selectedCourse!.id];
        const slotIndex = courseSlots.findIndex((s) => s.id === slot.id);
        if (slotIndex > -1) {
          updatedSlots[selectedCourse!.id][slotIndex].isBooked = true;
        }
        setSlotsData(updatedSlots);
        setSelectedSlot(slot);
        setCurrentView("confirmation");
        setIsLoading(false);
      }, 500);
    }
  };
  
  const getAvailableDays = () => {
    if (!selectedCourse) return [];
    const slots = slotsData[selectedCourse.id] || [];
    const availableDays = slots
      .filter((slot) => !slot.isBooked)
      .map((slot) => slot.time.split(",")[0])
      .filter((day, index, self) => self.indexOf(day) === index);
    return availableDays;
  };

  return (
    <div className="card-container w-full max-w-2xl mx-auto">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {currentView === "verification" && (
        <div id="verification-section">
          <h1 className="main-heading">
            Register for <span className="gradient-text">New Courses</span>
          </h1>
          <p className="sub-heading">
            Start by verifying your faculty details below.
          </p>

          <form onSubmit={handleVerification}>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
              <div className="mb-4 md:mb-0">
                <Label htmlFor="empId" className="block text-sm font-medium mb-2 text-light">Employee ID</Label>
                <Input type="text" id="empId" name="empId" className="input-field" placeholder="e.g., E-1001" defaultValue="E-1001" />
              </div>
              <div>
                <Label htmlFor="fullName" className="block text-sm font-medium mb-2 text-light">Full Name</Label>
                <Input type="text" id="fullName" name="fullName" className="input-field !mb-0" placeholder="e.g., Dr. Jane Doe" defaultValue="Dr. Jane Doe" />
              </div>
            </div>

            <Button type="submit" className="supabase-button mt-6 w-full" disabled={isLoading}>
              Verify & Proceed
            </Button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </div>
      )}

      {currentView === "courseSelection" && selectedCourse === null && (
        <div id="course-selection-section" className="section-divider">
          <h2 className="section-heading">Welcome, <span className="gradient-text">{currentUser?.name}</span>!</h2>
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
                {slotsData[selectedCourse.id].filter(slot => slot.time.startsWith(selectedDay!)).map(slot => (
                    <Button 
                        key={slot.id} 
                        className="slot-button"
                        variant="secondary"
                        disabled={slot.isBooked}
                        onClick={() => handleSlotSelect(slot)}
                    >
                        {slot.time.split('@')[1].trim()}
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
          <p className="sub-heading !text-center !mb-1">Thank you, <span className="font-medium-theme text-normal">{currentUser?.name}</span>.</p>
          <p className="mb-4 text-light">
            Your slot for <span className="font-medium-theme text-normal">{selectedCourse?.name}</span> on <span className="font-medium-theme text-normal">{selectedSlot.time}</span> is booked.
          </p>
          <p className="text-sm mb-6 text-light">A confirmation email has been *simulated* to <span className="font-medium-theme text-light">{currentUser?.email}</span>.</p>

          <Button onClick={resetApp} className="supabase-button">Register for Another Course</Button>
        </div>
      )}
    </div>
  );
}
