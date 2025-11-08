
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cancelBooking } from '@/firebase/firestore/slot-booking';
import type { Slot } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MyBookedSlotsPage() {
    const { user, faculty, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookedSlotsQuery = useMemo(() => {
        if (!firestore || !user) return null;

        return query(
            collection(firestore, 'slots'),
            where('booked_by', '==', user.uid),
            where('slot_datetime', '>=', Timestamp.now())
        );
    }, [firestore, user]);

    const [bookedSlotsSnapshot, bookedSlotsLoading, bookedSlotsError] = useCollection(bookedSlotsQuery);

    const mySlots: Slot[] = useMemo(() => {
        if (!bookedSlotsSnapshot) return [];
        return bookedSlotsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Slot))
            .sort((a, b) => a.slot_datetime.toDate().getTime() - b.slot_datetime.toDate().getTime());
    }, [bookedSlotsSnapshot]);

    const handleCancelBooking = async (slotId: string) => {
        if (!firestore) return;

        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await cancelBooking(firestore, slotId);
            toast({ title: "Booking Cancelled", description: "Your slot has been successfully cancelled." });
        } catch (error: any) {
            console.error("Error cancelling booking:", error);
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        }
    };

    if (userLoading || bookedSlotsLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Booked Slots</CardTitle>
                    <CardDescription>Here are all of your upcoming booked slots. You can cancel them here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {bookedSlotsError && <p className="text-destructive">Error loading your bookings.</p>}
                    {mySlots.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold">No Upcoming Bookings</h3>
                            <p className="text-muted-foreground mt-2">You have not booked any slots yet.</p>
                            <Button asChild className="mt-4">
                                <Link href="/slot-booking-for-dcm">Book a Slot</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {mySlots.map(slot => (
                                <Card key={slot.id} className="flex justify-between items-center p-4">
                                    <div>
                                        <h4 className="font-semibold">{slot.courseName}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {format(slot.slot_datetime.toDate(), 'PPP p')}
                                        </p>
                                    </div>
                                    <Button variant="destructive" onClick={() => handleCancelBooking(slot.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
