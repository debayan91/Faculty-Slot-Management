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
import { slotsToCSVData, exportToCSV } from '@/lib/export-utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Calendar, Clock, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function MyBookedSlotsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookedSlotsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'slots'),
      where('booked_by', '==', user.uid),
      where('slot_datetime', '>=', Timestamp.now()),
    );
  }, [firestore, user]);

  const [bookedSlotsSnapshot, bookedSlotsLoading] = useCollection(bookedSlotsQuery);

  const mySlots: Slot[] = useMemo(() => {
    if (!bookedSlotsSnapshot) return [];
    return bookedSlotsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Slot)
      .sort((a, b) => a.slot_datetime.toDate().getTime() - b.slot_datetime.toDate().getTime());
  }, [bookedSlotsSnapshot]);

  const handleCancelBooking = async (slotId: string) => {
    if (!firestore) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await cancelBooking(firestore, slotId);
      toast({ title: 'Cancelled', description: 'Your slot has been cancelled.' });
    } catch (error: any) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleExport = () => {
    if (mySlots.length === 0) {
      toast({ title: 'No Data', description: 'No bookings to export.', variant: 'destructive' });
      return;
    }
    const data = slotsToCSVData(mySlots);
    exportToCSV(data, 'my-bookings');
    toast({ title: 'Downloaded', description: 'Your bookings have been exported.' });
  };

  if (userLoading || bookedSlotsLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-8 animate-fade-in space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button asChild variant='ghost' size='icon' className='h-8 w-8'>
            <Link href='/slot-booking-for-dcm'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>My Bookings</h1>
            <p className='text-sm text-muted-foreground'>Manage your upcoming appointments.</p>
          </div>
        </div>
        {mySlots.length > 0 && (
          <Button variant='outline' size='sm' onClick={handleExport}>
            <Download className='mr-2 h-4 w-4' /> Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {mySlots.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Calendar className='h-10 w-10 text-muted-foreground/50 mb-3' />
              <h3 className='font-medium'>No Bookings Found</h3>
              <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                You don't have any upcoming slots scheduled.
              </p>
              <Button asChild className='mt-4'>
                <Link href='/slot-booking-for-dcm'>Book a Slot</Link>
              </Button>
            </div>
          ) : (
            <div className='space-y-2'>
              {mySlots.map((slot) => (
                <div
                  key={slot.id}
                  className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border hover:bg-secondary/50 transition-colors'
                >
                  <div>
                    <h4 className='font-medium'>{slot.course_name || 'Meeting Session'}</h4>
                    <div className='flex items-center gap-3 text-sm text-muted-foreground mt-1'>
                      <span className='flex items-center'>
                        <Clock className='mr-1 h-3 w-3' />
                        {format(slot.slot_datetime.toDate(), 'PPP p')}
                      </span>
                      {slot.room_number && <span>Room {slot.room_number}</span>}
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-3 sm:mt-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30'
                    onClick={() => handleCancelBooking(slot.id)}
                  >
                    <Trash2 className='mr-1 h-3 w-3' /> Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
