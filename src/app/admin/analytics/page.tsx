'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slot } from '@/lib/types';
import { Activity, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [totalSlots, setTotalSlots] = useState(0);
  const [bookedSlots, setBookedSlots] = useState(0);
  const [slotsByStatus, setSlotsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [slotsByDay, setSlotsByDay] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const q = query(collection(db, 'slots'));
      const querySnapshot = await getDocs(q);
      const slots = querySnapshot.docs.map((doc) => doc.data() as Slot);

      const total = slots.length;
      const booked = slots.filter((slot) => slot.is_booked).length;

      setTotalSlots(total);
      setBookedSlots(booked);

      setSlotsByStatus([
        { name: 'Booked', value: booked },
        { name: 'Available', value: total - booked },
      ]);

      const dayMap: Record<string, number> = {};
      slots.forEach((slot) => {
        if (slot.is_booked && slot.slot_datetime) {
          const date = slot.slot_datetime.toDate();
          const day = date.toLocaleDateString('en-US', { weekday: 'short' });
          dayMap[day] = (dayMap[day] || 0) + 1;
        }
      });

      const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const chartData = daysOrder.map((day) => ({
        name: day,
        value: dayMap[day] || 0,
      }));

      setSlotsByDay(chartData);
    };

    fetchStats();
  }, []);

  const utilizationRate = totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(1) : '0';

  return (
    <div className='flex-1 space-y-6 p-4 md:p-8 animate-fade-in'>
      <h1 className='text-2xl font-bold tracking-tight'>Analytics</h1>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='bg-card'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Slots</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totalSlots}</div>
            <p className='text-xs text-muted-foreground'>Scheduled sessions</p>
          </CardContent>
        </Card>
        <Card className='bg-card'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Utilization</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{utilizationRate}%</div>
            <div className='flex items-center gap-2 mt-2'>
              <div className='h-2 flex-1 bg-secondary rounded-full overflow-hidden'>
                <div
                  className='h-full bg-foreground transition-all'
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
              <span className='text-xs text-muted-foreground'>
                {bookedSlots}/{totalSlots}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <AnalyticsCharts slotsByStatus={slotsByStatus} slotsByDay={slotsByDay} />
    </div>
  );
}
