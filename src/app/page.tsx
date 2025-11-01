"use client";

import { useUser } from "@/firebase";
import CourseRegistration from "@/components/course-registration";
import LoginForm from "@/components/login-form";
import { Loader2 } from "lucide-react";
import { BookOpenCheck } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center -mt-24">
        <div className="container mx-auto p-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <LoginForm />
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
               <BookOpenCheck className="h-16 w-16 text-primary mb-4" />
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Welcome to the Faculty Slot Management Portal
              </h1>
              <p className="text-lg text-muted-foreground">
                Please sign in to manage your course schedules, book available slots, and view your timetable.
              </p>
               <p className="text-lg text-muted-foreground mt-4">
                This portal provides a centralized system for faculty members to seamlessly coordinate their teaching responsibilities.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start p-4 md:p-8">
      <CourseRegistration />
    </main>
  );
}
