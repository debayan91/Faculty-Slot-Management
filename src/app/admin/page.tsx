'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, writeBatch, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import type { Faculty, Slot } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Trash2, UserX, UserPlus, Database } from 'lucide-react';
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
import { theoryClasses, labClasses } from '@/lib/timetable';

type TimetableSlot = {
  code: string;
  day: string;
  startTime: string;
  endTime: string;
};

const getNextDateForDay = (dayOfWeek: string): Date => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = days.findIndex(d => d.toLowerCase() === dayOfWeek.toLowerCase());
  const now = new Date();
  now.setDate(now.getDate() + (targetDayIndex + 7 - now.getDay()) % 7);
  return now;
};

const parseTime = (timeStr: string): [number, number] => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) { // Midnight case
        hours = 0;
    }
    return [hours, minutes];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSeeding, setIsSeeding] = useState(false);
  const [slotsData, slotsLoading] = useCollection(firestore ? collection(firestore, 'slots') : null);
  const [facultiesData, facultiesLoading] = useCollectionData(firestore ? collection(firestore, 'faculties'): null);
  
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);
  
  const allSlots: Slot[] = useMemo(() =>
      slotsData ? (slotsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot))) : [],
    [slotsData]
  );

  const faculties = useMemo(() => (facultiesData as Faculty[]) || [], [facultiesData]);
  const facultyMap = useMemo(() => {
    const map = new Map<string, string>();
    faculties.forEach(f => map.set(f.empId, f.name));
    return map;
  }, [faculties]);

  const handleSeedDatabase = async () => {
    if (!firestore) return;
    const confirmSeed = confirm("Are you sure you want to seed the database? This will create slots for the entire upcoming week and may create duplicates if run more than once per week.");
    if (!confirmSeed) return;

    setIsSeeding(true);
    toast({ title: 'Seeding database...', description: 'Please wait.' });

    try {
        const batch = writeBatch(firestore);
        const allTimetableSlots = [...theoryClasses, ...labClasses];

        for (const timetableSlot of allTimetableSlots) {
            const date = getNextDateForDay(timetableSlot.day);
            const [startHours, startMinutes] = parseTime(timetableSlot.startTime);
            date.setHours(startHours, startMinutes, 0, 0);
            
            const slotDatetime = date.toISOString();

            // Check for existing slot to avoid duplicates
             const q = query(collection(firestore, 'slots'), where('slotDatetime', '==', slotDatetime), where('courseId', '==', timetableSlot.code));
             const existingSlots = await getDocs(q);
 
             if (existingSlots.empty) {
                const newSlotRef = doc(collection(firestore, 'slots'));
                batch.set(newSlotRef, {
                    courseId: timetableSlot.code,
                    slotDatetime: slotDatetime,
                    durationMinutes: 50,
                    isBooked: false,
                    bookedBy: null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
             }
        }

        await batch.commit();
        toast({ title: 'Database Seeded', description: 'All slots for the next week have been created.' });
    } catch (error: any) {
        console.error("Error seeding database:", error);
        toast({ variant: 'destructive', title: 'Seeding Failed', description: error.message });
    } finally {
        setIsSeeding(false);
    }
  };
  
  const handleAction = async (action: 'release' | 'delete' | 'assign', slotId: string, facultyEmpId?: string) => {
    if (!firestore) return;
    
    if (action !== 'assign') {
      const confirmAction = confirm(`Are you sure you want to ${action} this slot?`);
      if (!confirmAction) return;
    }

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

  const renderTimetable = (timetable: TimetableSlot[], slotType: 'Theory' | 'Lab') => {
    return (
      <Tabs defaultValue={daysOfWeek[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
          {daysOfWeek.map(day => (
            <TabsTrigger key={`${slotType}-${day}`} value={day}>{day}</TabsTrigger>
          ))}
        </TabsList>
        {daysOfWeek.map(day => (
          <TabsContent key={`${slotType}-${day}`} value={day}>
            <div className="space-y-2 mt-4">
              {timetable.filter(ts => ts.day === day).map(ts => {
                // Find the corresponding slot from Firestore
                const dbSlot = allSlots.find(s => s.courseId === ts.code && new Date(s.slotDatetime).getDay() === (daysOfWeek.indexOf(day) + 1) % 7);
                const slotId = dbSlot?.id;

                return (
                  <div key={ts.code + ts.startTime} className="grid grid-cols-1 md:grid-cols-4 items-center p-3 border rounded-lg gap-4">
                    <div className="md:col-span-1">
                      <p className="font-semibold text-base">{ts.startTime} - {ts.endTime}</p>
                      <p className="text-sm text-muted-foreground">Code: {ts.code}</p>
                    </div>
                    <div className="md:col-span-1">
                      <p className={`text-sm font-medium ${dbSlot?.isBooked ? 'text-destructive' : 'text-primary'}`}>
                        {dbSlot?.isBooked ? `Booked: ${facultyMap.get(dbSlot.bookedBy!) || 'Unknown'}` : 'Available'}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-2 w-full justify-start md:justify-end">
                      {slotId && dbSlot?.isBooked && (
                        <Button variant="outline" size="sm" onClick={() => handleAction('release', slotId)} title="Release Slot">
                          <UserX className="mr-2 h-4 w-4" /> Release
                        </Button>
                      )}
                      {slotId && !dbSlot?.isBooked && (
                         <Select onValueChange={(empId) => handleAction('assign', slotId, empId)}>
                            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(faculty => (
                                  <SelectItem key={faculty.id} value={faculty.empId}>{faculty.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                      )}
                      {slotId && (
                        <Button variant="destructive" size="sm" onClick={() => handleAction('delete', slotId)} title="Delete Slot">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      )}
                       {!slotId && <p className="text-xs text-muted-foreground self-center">Not in DB</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    )
  };
    
  const loading = adminLoading || slotsLoading || facultiesLoading || isSeeding;

  if (loading && !isSeeding) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       {loading && isSeeding && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Seeding Database...</p>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                    Manage all theory and lab slots from here. You have full control.
                </CardDescription>
            </div>
            <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                <Database className="mr-2 h-4 w-4" />
                Seed Database for Week
            </Button>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="theory" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="theory">Theory Timetable</TabsTrigger>
                    <TabsTrigger value="lab">Lab Timetable</TabsTrigger>
                </TabsList>
                <TabsContent value="theory" className="mt-4">
                  {renderTimetable(theoryClasses, 'Theory')}
                </TabsContent>
                <TabsContent value="lab" className="mt-4">
                  {renderTimetable(labClasses, 'Lab')}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
