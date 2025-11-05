
"use client";

import { useUser } from "@/firebase";
import LoginForm from "@/components/login-form";
import { Loader2 } from "lucide-react";
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading, faculty } = useUser();

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
            <div className="flex pt-[20%] flex-col items-center justify-center">
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
    <main className="flex flex-col items-center justify-center -mt-24 text-center">
        <div className="card-container w-full max-w-2xl mx-auto p-8">
            <BookOpenCheck className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="main-heading text-4xl">
                Welcome, <span className="gradient-text">{faculty?.name || user?.email}</span>!
            </h1>
            <p className="sub-heading text-xl mt-2">
                You are logged into the Faculty Slot Management Portal.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                    <Link href="/slot-booking-for-dcm">Book a Slot</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/my-booked-slots">View My Bookings</Link>
                </Button>
            </div>
        </div>
    </main>
  );
}
