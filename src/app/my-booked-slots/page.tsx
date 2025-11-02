
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarOff, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import type { Slot } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cancelBooking } from '@/firebase/firestore/slot-booking';

const SlotCard = ({ slot }: { slot: Slot }) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!user || !user.uid || !slot.id) return;
    const isConfirmed = confirm(`Are you sure you want to cancel your booking for "${slot.course_name}"?`);
    if (isConfirmed) {
        try {
            await cancelBooking(firestore, slot.id, user.uid);
            toast({ title: 'Booking Cancelled', description: 'Your slot has been successfully cancelled.'});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Cancellation Failed', description: error.message });
        }
    }
  };

  return (
    <div className="border p-4 rounded-lg flex justify-between items-center">
      <div>
        <p className="font-semibold text-lg">{slot.course_name || <span className="text-muted-foreground italic">Unnamed Slot</span>}</p>
        <p className="text-muted-foreground">
          <span className="font-mono text-xs mr-2">{slot.slot_code}</span>
          {format(new Date((slot.slot_datetime as any).toDate()), 'eeee, MMMM do, yyyy @ p')}
        </p>
        {slot.room_number && <p className="text-sm">Room: {slot.room_number}</p>}
      </div>
      <Button variant="destructive" size="sm" onClick={handleCancel}>Cancel</Button>
    </div>
  );
}


export default function MyBookedSlotsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const slotsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collection(firestore, 'slots'),
        where('booked_by', '==', user.uid)
    );
  }, [firestore, user]);

  const [slotsSnapshot, slotsLoading] = useCollection(slotsQuery);

  const bookedSlots: Slot[] = useMemo(() => {
    if (!slotsSnapshot) return [];
    return slotsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Slot))
      .sort((a, b) => (a.slot_datetime as any).toMillis() - (b.slot_datetime as any).toMillis());
  }, [slotsSnapshot]);

  if (userLoading || slotsLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen -mt-24">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to view your booked slots.</p>
            <Link href="/" className="text-primary underline mt-4 inline-block">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>My Booked Slots ({bookedSlots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookedSlots.length > 0 ? (
             <div className="space-y-4">
              {bookedSlots.map(slot => <SlotCard key={slot.id} slot={slot} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No Booked Slots</h3>
              <p className="text-muted-foreground mt-2">
                You haven't booked any slots yet. Why not find one?
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Book a Slot</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
