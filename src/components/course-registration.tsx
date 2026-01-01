'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  runTransaction,
  doc,
} from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { startOfDay } from 'date-fns';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Slot } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface CourseRegistrationProps {
  onSuccess: () => void;
}

export default function CourseRegistration({ onSuccess }: CourseRegistrationProps) {
  const { user, faculty } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // Simplified query - removed compound index requirement
  const slotsQuery = useMemo(() => {
    if (!firestore || !selectedDate) return null;
    const start = startOfDay(selectedDate);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);

    // Query without orderBy to avoid index requirement - will sort in memory
    return query(
      collection(firestore, 'slots'),
      where('slot_datetime', '>=', Timestamp.fromDate(start)),
      where('slot_datetime', '<=', Timestamp.fromDate(end)),
    );
  }, [firestore, selectedDate]);

  const [slotsSnapshot, slotsLoading, slotsError] = useCollection(slotsQuery);

  // Filter bookable slots in memory and sort
  const slots = useMemo(() => {
    if (!slotsSnapshot) return [];
    return slotsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Slot)
      .filter((slot) => slot.is_bookable)
      .sort((a, b) => a.slot_datetime.toDate().getTime() - b.slot_datetime.toDate().getTime());
  }, [slotsSnapshot]);

  const handleBookSlot = async (slotId: string, slotTime: Date) => {
    if (!user || !faculty || !firestore) return;
    setBookingSlotId(slotId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const slotRef = doc(firestore, 'slots', slotId);
        const slotDoc = await transaction.get(slotRef);
        if (!slotDoc.exists()) throw new Error('Slot does not exist.');
        const slotData = slotDoc.data() as Slot;
        if (slotData.is_booked) throw new Error('Slot already booked.');

        transaction.update(slotRef, {
          is_booked: true,
          booked_by: user.uid,
          booked_by_email: faculty.email,
          booked_at: Timestamp.now(),
        });
      });

      toast({
        title: 'Slot Booked!',
        description: `Successfully booked for ${format(slotTime, 'p')}.`,
        action: <CheckCircle className='h-5 w-5' />,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message,
      });
    } finally {
      setBookingSlotId(null);
    }
  };

  return (
    <div className='space-y-6 animate-fade-in'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg border border-border bg-card'>
        <div>
          <h2 className='font-semibold'>Select a Date</h2>
          <p className='text-sm text-muted-foreground'>View available slots.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0 bg-popover border-border' align='end'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {slotsLoading ? (
        <div className='flex justify-center py-16'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </div>
      ) : slotsError ? (
        <div className='p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg text-sm'>
          <p className='font-medium'>Error loading availability</p>
          <p className='text-xs mt-1 opacity-80'>{slotsError.message}</p>
          <p className='text-xs mt-2'>
            This may require a Firestore index. Check the browser console for a link to create it.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className='text-center py-16 border border-dashed border-border rounded-lg bg-card'>
          <CalendarIcon className='mx-auto h-10 w-10 text-muted-foreground/50 mb-2' />
          <h3 className='font-medium'>No Available Slots</h3>
          <p className='text-sm text-muted-foreground'>No bookable slots found for this date.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {slots.map((slot) => {
            const isMyBooking = slot.booked_by === user?.uid;
            const isBooked = slot.is_booked;

            return (
              <Card
                key={slot.id}
                className={cn('transition-all bg-card', isBooked && !isMyBooking && 'opacity-50')}
              >
                <CardHeader className='p-4 pb-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-2xl font-bold font-mono'>
                      {format(slot.slot_datetime.toDate(), 'HH:mm')}
                    </span>
                    {isMyBooking && <Badge>Yours</Badge>}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {slot.room_number ? `Room ${slot.room_number}` : 'Remote'}
                  </p>
                </CardHeader>

                <CardContent className='p-4 pt-0'>
                  <p className='text-sm truncate'>{slot.course_name || 'General Session'}</p>
                  <p className='text-xs text-muted-foreground truncate'>{slot.faculty_name}</p>
                </CardContent>

                <CardFooter className='p-4 pt-0'>
                  {isBooked ? (
                    <Button disabled variant='secondary' className='w-full'>
                      {isMyBooking ? 'Booked by You' : 'Unavailable'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBookSlot(slot.id, slot.slot_datetime.toDate())}
                      disabled={!!bookingSlotId}
                      className='w-full'
                    >
                      {bookingSlotId === slot.id ? (
                        <Loader2 className='animate-spin h-4 w-4' />
                      ) : (
                        'Book Slot'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
