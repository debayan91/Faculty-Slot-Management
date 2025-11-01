'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, getDocs, query } from 'firebase/firestore';
import type { Faculty, Slot } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Trash2, UserX, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { releaseSlot, deleteSlot, assignSlot } from '@/firebase/firestore/admin';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [slotsData, slotsLoading] = useCollection(firestore ? collection(firestore, 'slots') : null);
  const [facultiesData, facultiesLoading] = useCollectionData(firestore ? collection(firestore, 'faculties'): null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  const allSlots: Slot[] = useMemo(
    () =>
      slotsData
        ? (slotsData.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Slot[])
        : [],
    [slotsData]
  );
  
  const faculties = useMemo(() => (facultiesData as Faculty[]) || [], [facultiesData]);

  const facultyMap = useMemo(() => {
    const map = new Map<string, string>();
    faculties.forEach((f) => map.set(f.empId, f.name));
    return map;
  }, [faculties]);

  const slotsByDay = useMemo(() => {
    const groups: Record<string, Slot[]> = {};
    allSlots.forEach((slot) => {
      try {
        const day = format(new Date(slot.slotDatetime), 'yyyy-MM-dd');
        if (!groups[day]) {
          groups[day] = [];
        }
        groups[day].push(slot);
      } catch (e) {
        console.error(`Invalid date for slot ${slot.id}: ${slot.slotDatetime}`);
      }
    });
     // Sort slots within each day
     for (const day in groups) {
      groups[day].sort((a, b) => new Date(a.slotDatetime).getTime() - new Date(b.slotDatetime).getTime());
    }
    return groups;
  }, [allSlots]);

  const sortedDays = useMemo(
    () => Object.keys(slotsByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [slotsByDay]
  );
    
  const loading = adminLoading || slotsLoading || facultiesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Or a more explicit access denied message
  }

  const handleAction = async (
    action: 'release' | 'delete' | 'assign',
    slotId: string,
    facultyEmpId?: string
  ) => {
    if (!firestore) return;
    
    const confirmAction = confirm(`Are you sure you want to ${action} this slot?`);
    if (!confirmAction) return;

    try {
      if (action === 'release') {
        await releaseSlot(firestore, slotId);
        toast({ title: 'Slot Released', description: 'The slot is now available.' });
      } else if (action === 'delete') {
        await deleteSlot(firestore, slotId);
        toast({ title: 'Slot Deleted', description: 'The slot has been permanently removed.' });
      } else if (action === 'assign' && facultyEmpId) {
        await assignSlot(firestore, slotId, facultyEmpId);
        toast({ title: 'Slot Assigned', description: 'The slot has been assigned to the selected faculty.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: `Error performing ${action}`, description: error.message });
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage all course slots from here. You have full control.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDays.length > 0 ? (
          <Tabs defaultValue={sortedDays[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1">
              {sortedDays.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {format(new Date(day), 'EEE, MMM d')}
                </TabsTrigger>
              ))}
            </TabsList>
            {sortedDays.map((day) => (
              <TabsContent key={day} value={day}>
                <div className="space-y-4 mt-4">
                  {slotsByDay[day].map((slot) => (
                    <div key={slot.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                      <div className="mb-4 sm:mb-0">
                        <p className="font-semibold text-lg">
                          {format(new Date(slot.slotDatetime), 'h:mm a')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Course ID: {slot.courseId || 'N/A'}
                        </p>
                        <p className={`text-sm font-medium ${slot.isBooked ? 'text-destructive' : 'text-primary'}`}>
                          {slot.isBooked
                            ? `Booked by: ${facultyMap.get(slot.bookedBy!) || 'Unknown'}`
                            : 'Available'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {slot.isBooked && (
                           <Button variant="outline" size="sm" onClick={() => handleAction('release', slot.id)} title="Release Slot">
                            <UserX className="mr-2 h-4 w-4" /> Release
                          </Button>
                        )}
                        {!slot.isBooked && (
                           <Select onValueChange={(empId) => handleAction('assign', slot.id, empId)}>
                            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="flex items-center px-3 py-1.5">
                                 <UserPlus className="mr-2 h-4 w-4" />
                                 <span className="text-sm">Assign to faculty</span>
                                </div>
                                {faculties.map(faculty => (
                                <SelectItem key={faculty.id} value={faculty.empId}>{faculty.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        )}
                         <Button variant="destructive" size="sm" onClick={() => handleAction('delete', slot.id)} title="Delete Slot">
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          ) : (
            <p className="text-center text-muted-foreground py-10">No slots found in the database.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
