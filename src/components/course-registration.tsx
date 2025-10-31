"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./theme-toggle";
import { CheckCircle } from "lucide-react";

// --- Mock Data ---
const MOCK_USER_EMAIL = "jane.doe@university.edu";

const MOCK_COURSES = [
  { id: "C1", name: "Advanced Pedagogy", description: "A deep dive into modern teaching methods." },
  { id: "C2", name: "Digital Learning Tools", description: "Master tools for online education." },
  { id: "C3", name: "AI in the Classroom", description: "Integrating generative AI responsibly." }
];

const MOCK_SLOTS_DATA = {
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

// --- Type Definitions ---
type User = { empId: string; name: string; email: string };
type Course = typeof MOCK_COURSES[0];
type Slot = { id: string; time: string; isBooked: boolean };
type View = "verification" | "courseSelection" | "daySelection" | "slotSelection" | "confirmation";

export function CourseRegistration() {
  const { toast } = useToast();

  const [view, setView] = useState<View>("verification");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [empId, setEmpId] = useState("E-1001");
  const [fullName, setFullName] = useState("Dr. Jane Doe");
  const [errorMessage, setErrorMessage] = useState("");
  
  // State for booked slots
  const [mockSlots, setMockSlots] = useState(MOCK_SLOTS_DATA);

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!empId || !fullName) {
      setErrorMessage("Please enter both fields.");
      return;
    }
    const user = { empId, name: fullName, email: MOCK_USER_EMAIL };
    setCurrentUser(user);
    setView("courseSelection");
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedDay(null); // Reset day selection
    setSelectedSlot(null);
    setView("daySelection");
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setSelectedSlot(null);
    setView("slotSelection");
  };

  const handleSlotSelect = (slot: Slot) => {
    if (window.confirm(`Confirm booking for ${selectedCourse?.name} at ${slot.time}?`)) {
      setSelectedSlot(slot);

      // --- MOCK DATABASE UPDATE ---
      setMockSlots(prevSlots => {
        const updatedCourseSlots = [...(prevSlots[selectedCourse!.id] || [])];
        const slotIndex = updatedCourseSlots.findIndex(s => s.id === slot.id);
        if (slotIndex > -1) {
          updatedCourseSlots[slotIndex] = { ...updatedCourseSlots[slotIndex], isBooked: true };
        }
        return { ...prevSlots, [selectedCourse!.id]: updatedCourseSlots };
      });
      
      setView("confirmation");
      toast({
        title: "Registration Confirmed!",
        description: `Your slot for ${selectedCourse?.name} is booked.`,
      });
    }
  };

  const resetApp = () => {
    setView("verification");
    setCurrentUser(null);
    setSelectedCourse(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    setEmpId("E-1001");
    setFullName("Dr. Jane Doe");
    setErrorMessage("");
  };

  const availableDays = useMemo(() => {
    if (!selectedCourse) return [];
    const slots = mockSlots[selectedCourse.id] || [];
    return Array.from(new Set(
      slots.filter(slot => !slot.isBooked).map(slot => slot.time.split(',')[0])
    ));
  }, [selectedCourse, mockSlots]);

  const availableSlots = useMemo(() => {
    if (!selectedCourse || !selectedDay) return [];
    const slots = mockSlots[selectedCourse.id] || [];
    return slots.filter(slot => slot.time.startsWith(selectedDay));
  }, [selectedCourse, selectedDay, mockSlots]);

  return (
    <Card className="w-full max-w-2xl shadow-lg my-12" style={{boxShadow: '0 4px 25px hsl(var(--ring) / 0.15)'}}>
      <CardContent className="p-10">
        {view === "verification" && (
          <div>
            <h1 className="text-4xl font-medium text-center mb-2">
              Register for <span className="gradient-text">New Courses</span>
            </h1>
            <p className="text-muted-foreground text-center text-lg mb-8">
              Start by verifying your faculty details below.
            </p>
            <form onSubmit={handleVerification}>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <div className="mb-4 md:mb-0">
                  <Label htmlFor="empId" className="mb-2 block">Employee ID</Label>
                  <Input id="empId" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g., E-1001" />
                </div>
                <div>
                  <Label htmlFor="fullName" className="mb-2 block">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Dr. Jane Doe" />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 supabase-button">Verify & Proceed</Button>
              {errorMessage && <p className="text-red-500 mt-4 text-sm">{errorMessage}</p>}
            </form>
          </div>
        )}

        {view !== "verification" && <div className="border-t -mx-10 mb-8" />}

        {view === "courseSelection" && selectedCourse === null && (
          <div>
            <h2 className="text-2xl font-medium">Welcome, <span className="gradient-text">{currentUser?.name}</span>!</h2>
            <p className="text-muted-foreground mt-1 mb-6">1. Please select a course to continue.</p>
            <div className="space-y-4">
              {MOCK_COURSES.map(course => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="w-full text-left p-4 rounded-lg border bg-secondary hover:border-primary hover:bg-muted transition-all"
                >
                  <h3 className="font-medium text-lg">{course.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{course.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "daySelection" && selectedCourse && (
          <div>
              <h2 className="text-2xl font-medium">Select a Day</h2>
              <p className="text-muted-foreground mt-1 mb-6">2. Choose a day for <span className="font-medium text-foreground">{selectedCourse.name}</span>.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableDays.length > 0 ? (
                  availableDays.map(day => (
                    <Button
                      key={day}
                      variant="outline"
                      onClick={() => handleDaySelect(day)}
                      className={`supabase-button-secondary h-auto py-3 ${selectedDay === day ? 'button-selected' : ''}`}
                    >
                      {day}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No available days for this course.</p>
                )}
              </div>
          </div>
        )}
        
        {view === "slotSelection" && selectedCourse && selectedDay && (
          <div>
            <h2 className="text-2xl font-medium">Select a Time Slot</h2>
            <p className="text-muted-foreground mt-1 mb-6">3. Available slots for <span className="font-medium text-foreground">{selectedCourse.name} on {selectedDay}</span>.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    disabled={slot.isBooked}
                    onClick={() => handleSlotSelect(slot)}
                    className="h-auto py-3 disabled:line-through"
                  >
                    {slot.time.split('@')[1].trim()}
                  </Button>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full">No slots found for this day.</p>
              )}
            </div>
          </div>
        )}

        {view === "confirmation" && selectedSlot && (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <CheckCircle className="w-20 h-20 text-primary" />
            </div>
            <h2 className="text-2xl font-medium">Registration Confirmed!</h2>
            <p className="text-muted-foreground text-lg mt-1 mb-2">Thank you, <span className="font-medium text-foreground">{currentUser?.name}</span>.</p>
            <p className="text-muted-foreground mb-4">
              Your slot for <span className="font-medium text-foreground">{selectedCourse?.name}</span> on <span className="font-medium text-foreground">{selectedSlot.time}</span> is booked.
            </p>
            <p className="text-sm text-muted-foreground mb-6">A confirmation email has been *simulated* to <span className="font-medium text-foreground">{currentUser?.email}</span>.</p>
            <Button onClick={resetApp} className="w-full supabase-button">Register for Another Course</Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
