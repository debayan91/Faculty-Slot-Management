
"use client";

import { useState, useMemo } from "react";
import type { Slot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, Timestamp } from "firebase/firestore";
import { bookSlot } from "@/firebase/firestore/slots";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay } from 'date-fns';

function SlotCard({ slot, onBook, isBookedByOther, facultyName }: { slot: Slot, onBook: (slot: Slot) => void, isBookedByOther: boolean, facultyName: string | null }) {
    return (
        <div className="course-card flex flex-col sm:flex-row justify-between sm:items-center p-4">
            <div>
                <h3 className="font-medium-theme text-lg text-normal">{slot.course_name}</h3>
                <p className="text-light text-sm mt-1">
                    {format(new Date((slot.slot_datetime as any).toDate()), 'p')}
                    {slot.room_number && ` - Room: ${slot.room_number}`}
                </p>
                 {isBookedByOther && facultyName && (
                    <p className="text-xs text-destructive mt-1">Booked by {facultyName}</p>
                )}
            </div>
            <Button 
                onClick={() => onBook(slot)} 
                disabled={isBookedByOther}
                className="mt-2 sm:mt-0"
                size="sm"
            >
                {isBookedByOther ? 'Booked' : 'Book Slot'}
            </Button>
        </div>
    )
}

export default function CourseRegistration() {
  const { user, faculty, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [date, setDate] = useState(new Date()); // Default to today
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'confirmation'>('list');

  const slotsQuery = useMemo(() => {
    if (!firestore) return null;
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return query(
      collection(firestore, 'slots'),
      where('slot_datetime', '>=', Timestamp.fromDate(start)),
      where('slot_datetime', '<=', Timestamp.fromDate(end)),
      where('is_bookable', '==', true)
    );
  }, [firestore, date]);

  const [slotsSnapshot, slotsLoading] = useCollection(slotsQuery);

  const availableSlots: Slot[] = useMemo(() => {
    if (!slotsSnapshot) return [];
    return slotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot));
  }, [slotsSnapshot]);

  const handleBookSlot = async (slot: Slot) => {
    if (!faculty || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to book a slot.' });
        return;
    }
    const formattedTime = format(new Date((slot.slot_datetime as any).toDate()), 'p');
    const isConfirmed = confirm(
      `Confirm booking for ${slot.course_name} at ${formattedTime}?`
    );
    if (isConfirmed) {
      setIsLoading(true);
      try {
        await bookSlot(firestore, slot.id, user.uid, faculty.name);
        toast({ title: 'Slot Booked!', description: `You have successfully booked ${slot.course_name}.` });
        setView('confirmation');
      } catch (error: any) {
        console.error("Failed to book slot:", error);
        toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
      } finally {
        setIsLoading(false);
      }
    }
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
          <p className="sub-heading">Please <Link href="/" className="underline text-primary">log in</Link> to view and book course slots.</p>
        </div>
      </div>
    )
  }
  
  if (view === 'confirmation') {
    return (
        <div className="card-container w-full max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-5">
                <CheckCircle className="w-20 h-20 text-primary" />
            </div>
            <h2 className="section-heading !text-center">Registration Confirmed!</h2>
            <p className="sub-heading !text-center !mb-1">Thank you, <span className="font-medium-theme text-normal">{faculty?.name}</span>.</p>
            <p className="text-sm mb-6 text-light">A confirmation email has been *simulated* to <span className="font-medium-theme text-light">{user?.email}</span>.</p>

            <div className="flex justify-center gap-4">
                <Button onClick={() => setView('list')} className="supabase-button">Book Another Slot</Button>
                <Button asChild variant="outline">
                    <Link href="/my-booked-slots">View My Bookings</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="card-container w-full max-w-4xl mx-auto">
      {(isLoading) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="main-heading">
            Book an Available <span className="gradient-text">Slot</span>
          </h1>
          <h2 className="sub-heading">Welcome, <span className="gradient-text">{faculty?.name || user?.email}</span>!</h2>
        </div>
        <Button asChild>
            <Link href="/my-booked-slots">My Booked Slots</Link>
        </Button>
      </div>

      <div className="mb-6">
        {/* Date navigation will go here */}
      </div>

      <div className="space-y-4">
        {availableSlots.length > 0 ? availableSlots.map(slot => (
            <SlotCard 
                key={slot.id} 
                slot={slot} 
                onBook={handleBookSlot}
                isBookedByOther={slot.is_booked && slot.booked_by !== user.uid}
                facultyName={slot.faculty_name}
            />
        )) : (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No bookable slots found for this day.</p>
            </div>
        )}
      </div>

    </div>
  );
}
