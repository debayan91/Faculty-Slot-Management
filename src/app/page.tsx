
"use client";

import { useUser } from "@/firebase";
import LoginForm from "@/components/login-form";
import { BookOpenCheck, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="container mx-auto p-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-center justify-center">
              <LoginForm />
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <BookOpenCheck className="h-16 w-16 text-primary mb-4" />
              <h1 className="text-4xl font-bold tracking-tight">
                Faculty Slot Management Portal
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

  // This is the view for logged-in users, which you said you will build out later.
  // For now, it shows a simple welcome message.
  return (
     <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="container mx-auto p-4 text-center">
             <h1 className="text-4xl font-bold tracking-tight mb-4">
                Welcome, {user.displayName || user.email}!
              </h1>
              <p className="text-lg text-muted-foreground">
                You are successfully logged in.
              </p>
        </div>
    </main>
  );
}
