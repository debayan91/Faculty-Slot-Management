
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Slot, ScheduleTemplate } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Calendar as CalendarIcon, Trash2, Wand2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteScheduleForDate, generateScheduleForDate, updateSlot } from '@/firebase/firestore/schedule-management';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const EditableCell = ({ slotId, field, value, onSave }: { slotId: string, field: keyof Slot, value: string | null, onSave: (slotId: string, field: keyof Slot, value: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    const handleSave = () => {
      onSave(slotId, field, currentValue || '');
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <Input
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="h-8"
          />
          <Button size="sm" onClick={handleSave} className='h-8'>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className='h-8'>Cancel</Button>
        </div>
      );
    }

    return (
      <div onClick={() => setIsEditing(true)} className="min-h-[2rem] cursor-pointer">
        {value || <span className="text-muted-foreground">Empty</span>}
      </div>
    );
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Check for templates
  const templatesQuery = useMemo(() => firestore ? collection(firestore, 'schedule_templates') : null, [firestore]);
  const [templatesSnapshot, templatesLoading] = useCollection(templatesQuery);
  const templatesExist = useMemo(() => (templatesSnapshot?.docs.length ?? 0) > 0, [templatesSnapshot]);

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

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  const slots: Slot[] = useMemo(() => {
    if (!slotsSnapshot) return [];
    return slotsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Slot))
        .sort((a, b) => (a.slot_datetime as any).toMillis() - (b.slot_datetime as any).toMillis());
  }, [slotsSnapshot]);

  const handleGenerateSchedule = async () => {
    if (!firestore || !date) return;

    setIsLoading(true);
    toast({ title: 'Generating Schedule...', description: `Creating slots for ${date.toLocaleDateString()}`});

    try {
      await generateScheduleForDate(firestore, date);
      toast({ title: 'Schedule Generated!', description: 'Slots have been created successfully.', variant: 'default' });
    } catch (error: any) {
      console.error("Error generating schedule:", error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!firestore || !date) return;

    setIsLoading(true);
    toast({ title: 'Deleting Schedule...', description: `Removing all slots for ${date.toLocaleDateString()}`});

    try {
        await deleteScheduleForDate(firestore, date);
        toast({ title: 'Schedule Deleted', description: 'All slots for the selected day have been removed.' });
    } catch(error: any) {
        console.error("Error deleting schedule:", error);
        toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdate = async (slotId: string, field: keyof Slot, value: any) => {
    if (!firestore) return;
    try {
        await updateSlot(firestore, slotId, { [field]: value });
        toast({ title: 'Slot Updated', description: `The ${field.replace('_', ' ')} has been changed.` });
    } catch (error: any) {
        console.error("Error updating slot:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  if (adminLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect is handled by useEffect
  }

  const generationDisabled = isLoading || !templatesExist || (slots && slots.length > 0);
  const deletionDisabled = isLoading || !templatesExist || !slots || slots.length === 0;


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Schedule CMS</CardTitle>
                <CardDescription>
                    Generate, view, and manage daily schedules.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full sm:w-[280px] justify-start text-left font-normal"
                        disabled={!templatesExist}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>

                <Button onClick={handleGenerateSchedule} disabled={generationDisabled} className="w-full sm:w-auto">
                    <Wand2 className="mr-2 h-4 w-4" /> Generate
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={deletionDisabled} className="w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all {slots.length} slots for {date?.toLocaleDateString()}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSchedule}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </CardHeader>
        <CardContent>
            {!templatesExist ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>First-Time Setup Required</AlertTitle>
                <AlertDescription>
                  Welcome! Before you can generate schedules, you need to create the daily templates.
                  <Button asChild variant="link" className="p-0 h-auto ml-1">
                    <Link href="/admin/templates">Go to Template Manager to seed them.</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : slotsLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : slots.length === 0 ? (
                 <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">No Schedule Found</h3>
                    <p className="text-muted-foreground mt-2">
                        There is no schedule generated for {date?.toLocaleDateString()}.<br/>
                        Click the "Generate" button to create one from the daily template.
                    </p>
                 </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="w-[100px]">Bookable</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">
                        {format(new Date((slot.slot_datetime as any).toDate()), 'p')}
                      </TableCell>
                      <TableCell>
                        <EditableCell slotId={slot.id} field="course_name" value={slot.course_name} onSave={handleUpdate} />
                      </TableCell>
                      <TableCell>
                        <EditableCell slotId={slot.id} field="faculty_name" value={slot.faculty_name} onSave={handleUpdate} />
                      </TableCell>
                       <TableCell>
                        <EditableCell slotId={slot.id} field="room_number" value={slot.room_number} onSave={handleUpdate} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id={`bookable-${slot.id}`}
                                checked={slot.is_bookable}
                                onCheckedChange={(value) => handleUpdate(slot.id, 'is_bookable', value)}
                            />
                        </div>
                      </TableCell>
                      <TableCell>
                        {slot.is_booked ?
                            <span className="flex items-center text-green-500"><CheckCircle className="mr-2 h-4 w-4"/> Booked</span> :
                            <span className="flex items-center text-yellow-500"><AlertTriangle className="mr-2 h-4 w-4"/> Open</span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
