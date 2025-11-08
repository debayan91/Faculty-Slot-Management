
'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { format, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bookSlot } from '@/firebase/firestore/slot-booking';
import type { Slot } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Calendar as CalendarIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function SlotCard({ slot, onBook, isLoading }: { slot: Slot, onBook: (slotId: string) => void, isLoading: boolean }) {
    const { faculty } = useUser();
    const isBookedByCurrentUser = faculty && slot.booked_by === faculty.uid;

    return (
        <Card className={`transition-all ${isBookedByCurrentUser ? 'border-green-500' : ''}`}>
            <CardHeader>
                <CardTitle>{slot.courseName || 'Unnamed Course'}</CardTitle>
                <CardDescription>{format(new Date(slot.slot_datetime.toDate()), 'p')} - {slot.room || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    {slot.is_booked ? (
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            <span className="text-sm font-semibold">
                                Booked by {isBookedByCurrentUser ? 'you' : (slot.faculty_name || 'another faculty')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-yellow-500">
                            <AlertTriangle />
                            <span className="text-sm font-semibold">Available</span>
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => onBook(slot.id)}
                    disabled={isLoading || slot.is_booked}
                    variant={isBookedByCurrentUser ? 'outline' : 'default'}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isBookedByCurrentUser ? 'Booked' : 'Book Slot'}
                </Button>
            </CardContent>
        </Card>
    );
}

export default function CourseRegistration() {
    const { user, faculty, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [bookingSlotId, setBookingSlotId] = useState<string | null>(null); // To track which slot is being booked

    const slotsQuery = useMemo(() => {
        if (!firestore || !date) return null;
        const start = startOfDay(date);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        return query(
            collection(firestore, 'slots'),
            where('slot_datetime', '>=', Timestamp.fromDate(start)),
            where('slot_datetime', '<=', Timestamp.fromDate(end))
        );
    }, [firestore, date]);

    const [slotsSnapshot, slotsLoading, slotsError] = useCollection(slotsQuery);

    const availableSlots: Slot[] = useMemo(() => {
        if (!slotsSnapshot) return [];
        return slotsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Slot))
            .filter(slot => slot.is_bookable)
            .sort((a, b) => a.slot_datetime.toDate().getTime() - b.slot_datetime.toDate().getTime());
    }, [slotsSnapshot]);

    const handleBookSlot = async (slotId: string) => {
        if (!firestore || !user || !faculty) {
            toast({ title: "Error", description: "You must be logged in to book a slot.", variant: "destructive" });
            return;
        }

        if (!confirm("Are you sure you want to book this slot?")) return;

        setBookingSlotId(slotId);
        try {
            await bookSlot(firestore, slotId, user.uid, faculty.name);
            toast({ title: "Success!", description: "Slot booked successfully." });
        } catch (error: any) {
            console.error("Error booking slot:", error);
            toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
        } finally {
            setBookingSlotId(null);
        }
    };

    if (userLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Book an Available Slot</CardTitle>
                    <CardDescription>Welcome, {faculty?.name || user?.email}!</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                     <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/my-booked-slots">My Booked Slots</Link>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full sm:w-[280px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                {slotsLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : slotsError ? (
                    <p className="text-destructive">Error loading slots. Please try again later.</p>
                ) : availableSlots.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold">No Available Slots</h3>
                        <p className="text-muted-foreground mt-2">There are no bookable slots for this day. Please select another date.</p>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableSlots.map(slot => (
                            <SlotCard
                                key={slot.id}
                                slot={slot}
                                onBook={handleBookSlot}
                                isLoading={bookingSlotId === slot.id}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
