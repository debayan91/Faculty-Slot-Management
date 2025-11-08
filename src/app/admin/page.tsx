
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, Timestamp, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Slot, AuthorizedEmail, ScheduleTemplate } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Calendar as CalendarIcon, Trash2, Wand2, CheckCircle, AlertTriangle, AlertCircle, PlusCircle, MailWarning } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateScheduleForDate, deleteSchedulesByDateRange } from '@/firebase/firestore/schedule-management';
import { addAuthorizedEmail, removeAuthorizedEmail } from '@/firebase/firestore/admin';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

function AuthorizedUsersManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const authEmailsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'authorized_emails'), orderBy('addedAt', 'desc'));
    }, [firestore]);

    const [authEmailsSnapshot, authEmailsLoading] = useCollection(authEmailsQuery);

    const authorizedEmails = useMemo(() => {
        if (!authEmailsSnapshot) return [];
        return authEmailsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuthorizedEmail));
    }, [authEmailsSnapshot]);


    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newEmail) return;

        setIsSubmitting(true);
        try {
            await addAuthorizedEmail(firestore, newEmail);
            toast({ title: 'Email Added', description: `${newEmail} is now an authorized user.` });
            setNewEmail('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to Add Email', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRemoveEmail = async (email: string) => {
        if (!firestore) return;
        if (!confirm(`Are you sure you want to remove access for ${email}?`)) return;

        try {
            await removeAuthorizedEmail(firestore, email);
            toast({ title: 'Email Removed', description: `${email} is no longer an authorized user.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to Remove Email', description: error.message });
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Authorized User Management</CardTitle>
                <CardDescription>Add or remove email addresses that are allowed to access the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddEmail} className="flex gap-2 mb-6">
                    <Input
                        type="email"
                        placeholder="new.user@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                        <span className="hidden sm:inline ml-2">Add Email</span>
                    </Button>
                </form>

                {authEmailsLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : authorizedEmails.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <MailWarning className="mx-auto h-12 w-12 mb-2" />
                        <p>No authorized emails found.</p>
                        <p className="text-sm">Add an email to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                        {authorizedEmails.map(emailDoc => (
                            <div key={emailDoc.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                                <span className="text-sm font-mono">{emailDoc.email}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveEmail(emailDoc.email)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  const [templatesExist, setTemplatesExist] = useState(true);
  const [checkingTemplates, setCheckingTemplates] = useState(true);

  useEffect(() => {
    const checkTemplates = async () => {
      if (!firestore) return;
      try {
        const templateCollection = collection(firestore, 'schedule_templates');
        const snapshot = await getDocs(templateCollection);
        setTemplatesExist(!snapshot.empty);
      } catch (e) {
        console.error("Error checking for templates:", e);
        setTemplatesExist(false);
      } finally {
        setCheckingTemplates(false);
      }
    };
    checkTemplates();
  }, [firestore]);


  const slotsQuery = useMemo(() => {
    if (!firestore || !date) return null;
    const start = startOfDay(date);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);

    return query(
        collection(firestore, 'slots'), 
        where('slot_datetime', '>=', Timestamp.fromDate(start)),
        where('slot_datetime', '<=', Timestamp.fromDate(end)),
        orderBy('slot_datetime', 'asc')
    );
  }, [firestore, date]);

  const [slotsSnapshot, slotsLoading] = useCollection(slotsQuery);

  const slots: Slot[] = useMemo(() => {
    if (!slotsSnapshot || slotsSnapshot.docs.length === 0) return [];
    return slotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot));
  }, [slotsSnapshot]);


  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  const handleGenerateSchedule = async () => {
    if (!firestore || !date) return;

    setIsLoading(true);
    toast({ title: 'Generating Schedule...', description: `Creating slots for ${format(date, "PPP")}`});

    const result = await generateScheduleForDate(firestore, date);

    if (result.success) {
      toast({ title: 'Schedule Generated!', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Generation Failed', description: result.message });
    }
    
    setIsLoading(false);
  };

  const handleDeleteSchedule = async () => {
    if (!firestore || !date) return;

    const confirmed = confirm(`Are you sure you want to delete the schedule for ${format(date, "PPP")}? This action cannot be undone.`);
    if (!confirmed) return;

    setIsLoading(true);
    toast({ title: 'Deleting Schedule...', description: `Removing schedule for ${format(date, "PPP")}`});

    const result = await deleteSchedulesByDateRange(firestore, startOfDay(date), startOfDay(date));

    if (result.success) {
        toast({ title: 'Schedule Deleted', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
    }

    setIsLoading(false);
  };

  const handleUpdate = async (slotId: string, field: keyof Slot, value: any) => {
    if (!firestore) return;
    try {
        const slotRef = doc(firestore, 'slots', slotId);
        await updateDoc(slotRef, { [field]: value });
        toast({ title: 'Slot Updated', description: `The ${String(field).replace('_', ' ')} has been changed.` });
    } catch (error: any) {
        console.error("Error updating slot:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  if (adminLoading || checkingTemplates) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }
  
  const generationDisabled = isLoading || slots.length > 0;
  const deletionDisabled = isLoading || slots.length === 0;

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
                
                <Button variant="destructive" onClick={handleDeleteSchedule} disabled={deletionDisabled} className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>

            </div>
        </CardHeader>
        <CardContent>
          {!templatesExist && !checkingTemplates && (
              <Alert variant="secondary" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Schedule Templates Found</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-3 mt-2">
                    <span>Your `schedule_templates` collection in Firestore is empty. You must create templates for each day of the week for the "Generate" function to work.</span>
                    <Button asChild variant="outline" className="p-2 h-auto">
                      <Link href="/admin/templates">Go to Template Manager</Link>
                    </Button>
                  </AlertDescription>
              </Alert>
            )}

            {slotsLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : slots.length === 0 ? (
                 <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">No Schedule Found</h3>
                    <p className="text-muted-foreground mt-2">
                        There is no schedule generated for {date ? format(date, "PPP") : 'the selected date'}.<br/>
                        {templatesExist ? 'Click the "Generate" button to create one.' : 'Please create day-of-the-week templates first.'}
                    </p>
                 </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Time</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="w-[100px]">Bookable</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot: Slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">
                        {format(slot.slot_datetime.toDate(), 'p')}
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
      
      <AuthorizedUsersManager />
    </div>
  );
}
