
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
import { Loader2, UserX, Book, User, Database } from 'lucide-react';
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
import { unassignTeacher, updateSlotSubject, updateSlotTeacher } from '@/firebase/firestore/admin';
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
  if (targetDayIndex === -1) throw new Error("Invalid day of week");

  const now = new Date();
  const todayIndex = now.getDay();
  
  let dayDifference = targetDayIndex - todayIndex;
  
  if (dayDifference < 0 || (dayDifference === 0 && now.getHours() >= 23)) {
    dayDifference += 7;
  }
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + dayDifference);
  return targetDate;
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
    return [hours, minutes || 0];
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
  const allCourseCodes = useMemo(() => [...new Set([...theoryClasses, ...labClasses].map(c => c.code))], []);

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
    const confirmSeed = confirm("Are you sure you want to seed the database? This will create slots for the entire upcoming week based on the timetable. This action avoids creating duplicates.");
    if (!confirmSeed) return;

    setIsSeeding(true);
    toast({ title: 'Seeding database...', description: 'Please wait.' });

    try {
        const batch = writeBatch(firestore);
        const allTimetableSlots = [...theoryClasses, ...labClasses];
        let createdCount = 0;

        for (const timetableSlot of allTimetableSlots) {
            const date = getNextDateForDay(timetableSlot.day);
            const [startHours, startMinutes] = parseTime(timetableSlot.startTime);
            date.setHours(startHours, startMinutes, 0, 0);
            
            const slotDatetime = date.toISOString();

            // Check for existing slot to avoid duplicates
             const q = query(collection(firestore, 'slots'), 
                where('slotDatetime', '==', slotDatetime), 
                where('subjectCode', '==', timetableSlot.code)
             );
             const existingSlots = await getDocs(q);
 
             if (existingSlots.empty) {
                const newSlotRef = doc(collection(firestore, 'slots'));
                batch.set(newSlotRef, {
                    subjectCode: timetableSlot.code,
                    slotDatetime: slotDatetime,
                    durationMinutes: 50,
                    teacherEmpId: null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                createdCount++;
             }
        }

        await batch.commit();
        toast({ title: 'Database Seeded', description: `${createdCount} new slots created. The timetable is now in sync.` });
    } catch (error: any) {
        console.error("Error seeding database:", error);
        toast({ variant: 'destructive', title: 'Seeding Failed', description: error.message });
    } finally {
        setIsSeeding(false);
    }
  };
  
  const handleSubjectChange = async (slotId: string, newSubjectCode: string) => {
    if (!firestore) return;
    try {
      await updateSlotSubject(firestore, slotId, newSubjectCode);
      toast({ title: 'Subject Updated', description: `Slot subject changed to ${newSubjectCode}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  const handleTeacherChange = async (slotId: string, newTeacherEmpId: string) => {
    if (!firestore) return;
    try {
      if (newTeacherEmpId === 'UNASSIGNED') {
        await unassignTeacher(firestore, slotId);
        toast({ title: 'Teacher Unassigned', description: 'The slot is now available.' });
      } else {
        await updateSlotTeacher(firestore, slotId, newTeacherEmpId);
        const teacherName = facultyMap.get(newTeacherEmpId) || 'Unknown';
        toast({ title: 'Teacher Assigned', description: `Slot assigned to ${teacherName}.` });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Assignment Failed', description: error.message });
    }
  };
  
  const handleUnassignTeacher = async (slotId: string) => {
    if (!firestore) return;
    try {
        await unassignTeacher(firestore, slotId);
        toast({ title: 'Teacher Unassigned', description: 'The slot is now available.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
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
                const dateForSlot = getNextDateForDay(day);
                const [startHours, startMinutes] = parseTime(ts.startTime);
                dateForSlot.setHours(startHours, startMinutes, 0, 0);

                const dbSlot = allSlots.find(s => {
                    if (!s.slotDatetime) return false;
                    const slotDate = new Date(s.slotDatetime);
                    // Match by date parts and time, ignoring seconds/ms, to account for timezone differences
                    return slotDate.getFullYear() === dateForSlot.getFullYear() &&
                           slotDate.getMonth() === dateForSlot.getMonth() &&
                           slotDate.getDate() === dateForSlot.getDate() &&
                           slotDate.getHours() === dateForSlot.getHours() &&
                           slotDate.getMinutes() === dateForSlot.getMinutes() &&
                           s.subjectCode === ts.code;
                });
                
                const slotId = dbSlot?.id;
                
                return (
                  <div key={ts.code + ts.startTime} className="grid grid-cols-1 md:grid-cols-5 items-center p-3 border rounded-lg gap-4">
                    <div className="md:col-span-1">
                      <p className="font-semibold text-base">{ts.startTime} - {ts.endTime}</p>
                      <p className="text-sm text-muted-foreground">Original Code: {ts.code}</p>
                    </div>
                    
                    <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        {/* Subject Selector */}
                        <div className="flex items-center gap-2">
                           <Book className="h-4 w-4 text-muted-foreground" />
                           <Select 
                             value={dbSlot?.subjectCode} 
                             onValueChange={(newCode) => slotId && handleSubjectChange(slotId, newCode)}
                             disabled={!slotId}
                           >
                                <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                                    <SelectValue placeholder="Select Subject..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCourseCodes.map(code => (
                                      <SelectItem key={code} value={code}>{code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Teacher Selector */}
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground"/>
                            <Select 
                              value={dbSlot?.teacherEmpId || 'UNASSIGNED'} 
                              onValueChange={(empId) => slotId && handleTeacherChange(slotId, empId)}
                              disabled={!slotId}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                                    <SelectValue placeholder="Assign Teacher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                    {faculties.map(faculty => (
                                      <SelectItem key={faculty.id} value={faculty.empId}>{faculty.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Unassign Button */}
                        <div>
                        {slotId && dbSlot?.teacherEmpId && (
                            <Button variant="outline" size="sm" onClick={() => handleUnassignTeacher(slotId)} title="Unassign Teacher">
                               <UserX className="mr-2 h-4 w-4" /> Unassign
                            </Button>
                        )}
                        {!slotId && <p className="text-xs text-destructive self-center">Slot not in DB</p>}
                        </div>
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
       {isSeeding && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Seeding Database...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                    Manage subjects and teachers for all theory and lab slots.
                </CardDescription>
            </div>
            <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                <Database className="mr-2 h-4 w-4" />
                Seed/Verify Week's Slots
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
