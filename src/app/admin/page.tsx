'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  query,
  where,
  Timestamp,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { Slot, AuthorizedEmail } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Calendar as CalendarIcon,
  Trash2,
  Wand2,
  AlertCircle,
  PlusCircle,
  MailWarning,
  Users,
  Download,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  generateScheduleForDate,
  deleteSchedulesByDateRange,
} from '@/firebase/firestore/schedule-management';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { slotsToCSVData, exportToCSV } from '@/lib/export-utils';

const EditableCell = ({
  slotId,
  field,
  value,
  onSave,
}: {
  slotId: string;
  field: keyof Slot;
  value: string | null;
  onSave: (slotId: string, field: keyof Slot, value: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(slotId, field, currentValue || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className='flex gap-1'>
        <Input
          value={currentValue || ''}
          onChange={(e) => setCurrentValue(e.target.value)}
          className='h-7 w-full min-w-[80px] text-xs'
          autoFocus
        />
        <Button size='sm' onClick={handleSave} className='h-7 px-2 text-xs'>
          Save
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setIsEditing(false)}
          className='h-7 px-2 text-xs'
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className='min-h-[1.5rem] cursor-pointer rounded px-1 py-0.5 hover:bg-secondary transition-colors text-xs'
    >
      {value || <span className='text-muted-foreground italic'>—</span>}
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
    return authEmailsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuthorizedEmail);
  }, [authEmailsSnapshot]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newEmail) return;
    setIsSubmitting(true);
    try {
      await addAuthorizedEmail(firestore, newEmail);
      toast({ title: 'Authorized', description: `${newEmail} added.` });
      setNewEmail('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!firestore) return;
    if (!confirm(`Revoke access for ${email}?`)) return;
    try {
      await removeAuthorizedEmail(firestore, email);
      toast({ title: 'Revoked', description: `Access removed for ${email}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card className='bg-card'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Users className='h-4 w-4' /> User Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddEmail} className='flex gap-2 mb-4'>
          <Input
            type='email'
            placeholder='faculty@vit.ac.in'
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isSubmitting}
            required
            className='flex-1 h-9'
          />
          <Button type='submit' size='sm' disabled={isSubmitting} className='h-9'>
            {isSubmitting ? (
              <Loader2 className='animate-spin h-4 w-4' />
            ) : (
              <PlusCircle className='h-4 w-4' />
            )}
          </Button>
        </form>
        {authEmailsLoading ? (
          <div className='flex justify-center items-center h-20'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : authorizedEmails.length === 0 ? (
          <div className='text-center text-muted-foreground py-6 border border-dashed rounded-md'>
            <MailWarning className='mx-auto h-6 w-6 mb-1 opacity-50' />
            <p className='text-xs'>No users allowed yet.</p>
          </div>
        ) : (
          <div className='space-y-1 max-h-48 overflow-y-auto'>
            {authorizedEmails.map((emailDoc) => (
              <div
                key={emailDoc.id}
                className='flex justify-between items-center p-2 rounded-md hover:bg-secondary transition-colors'
              >
                <span className='text-sm font-mono text-muted-foreground'>{emailDoc.email}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 hover:text-destructive'
                  onClick={() => handleRemoveEmail(emailDoc.email)}
                >
                  <Trash2 className='h-3 w-3' />
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
    );
  }, [firestore, date]);

  const [slotsSnapshot, slotsLoading] = useCollection(slotsQuery);

  const slots: Slot[] = useMemo(() => {
    if (!slotsSnapshot || slotsSnapshot.docs.length === 0) return [];
    return slotsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Slot)
      .sort((a, b) => a.slot_datetime.toDate().getTime() - b.slot_datetime.toDate().getTime());
  }, [slotsSnapshot]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) router.push('/');
  }, [isAdmin, adminLoading, router]);

  const handleGenerateSchedule = async () => {
    if (!firestore || !date) return;
    setIsLoading(true);
    const result = await generateScheduleForDate(firestore, date);
    toast({
      title: result.success ? 'Generated' : 'Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    setIsLoading(false);
  };

  const handleDeleteSchedule = async () => {
    if (!firestore || !date) return;
    if (!confirm(`Delete all slots for ${format(date, 'PPP')}?`)) return;
    setIsLoading(true);
    const result = await deleteSchedulesByDateRange(firestore, startOfDay(date), startOfDay(date));
    toast({
      title: result.success ? 'Deleted' : 'Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    setIsLoading(false);
  };

  const handleUpdate = async (slotId: string, field: keyof Slot, value: any) => {
    if (!firestore) return;
    try {
      const slotRef = doc(firestore, 'slots', slotId);
      await updateDoc(slotRef, { [field]: value });
      toast({ title: 'Saved' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (adminLoading || checkingTemplates)
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className='container mx-auto p-4 md:p-8 space-y-6 animate-fade-in'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
        <div className='flex items-center gap-2'>
          <Link href='/admin/analytics'>
            <Button variant='outline' size='sm'>
              Analytics
            </Button>
          </Link>
          <Link href='/admin/templates'>
            <Button variant='outline' size='sm'>
              Templates
            </Button>
          </Link>
          <Button
            variant='outline'
            size='sm'
            onClick={async () => {
              if (!firestore) return;
              const allBookedQuery = query(
                collection(firestore, 'slots'),
                where('is_booked', '==', true),
              );
              const snapshot = await getDocs(allBookedQuery);
              const allBooked = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Slot);
              if (allBooked.length === 0) {
                toast({
                  title: 'No Data',
                  description: 'No bookings found.',
                  variant: 'destructive',
                });
                return;
              }
              const data = slotsToCSVData(allBooked, true);
              exportToCSV(data, 'all-bookings', true);
              toast({ title: 'Downloaded', description: `Exported ${allBooked.length} bookings.` });
            }}
          >
            <Download className='mr-2 h-4 w-4' /> Export All
          </Button>
        </div>
      </div>

      <Card className='bg-card'>
        <CardHeader className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4'>
          <CardTitle className='text-sm font-medium'>Schedule Management</CardTitle>
          <div className='flex flex-wrap items-center gap-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  size='sm'
                  className={cn('font-normal', !date && 'text-muted-foreground')}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {date ? format(date, 'PPP') : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0 bg-popover border-border'>
                <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleGenerateSchedule}
              disabled={isLoading || slots.length > 0}
              size='sm'
            >
              <Wand2 className='mr-1.5 h-4 w-4' /> Generate
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteSchedule}
              disabled={isLoading || slots.length === 0}
              size='sm'
            >
              <Trash2 className='mr-1.5 h-4 w-4' /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {!templatesExist && (
            <div className='p-4'>
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>No Templates</AlertTitle>
                <AlertDescription>
                  Create a schedule template first in the Templates page.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {slotsLoading ? (
            <div className='flex items-center justify-center h-48'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : slots.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center opacity-50'>
              <CalendarIcon className='h-8 w-8 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>
                No schedule for {date ? format(date, 'MMM do') : 'selected date'}.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[80px] text-xs'>Time</TableHead>
                    <TableHead className='text-xs'>Course</TableHead>
                    <TableHead className='text-xs'>Faculty</TableHead>
                    <TableHead className='text-xs'>Room</TableHead>
                    <TableHead className='w-[80px] text-center text-xs'>Status</TableHead>
                    <TableHead className='w-[60px] text-right text-xs'>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot: Slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className='font-mono text-xs py-2'>
                        {format(slot.slot_datetime.toDate(), 'HH:mm')}
                      </TableCell>
                      <TableCell className='py-2'>
                        <EditableCell
                          slotId={slot.id}
                          field='course_name'
                          value={slot.course_name}
                          onSave={handleUpdate}
                        />
                      </TableCell>
                      <TableCell className='py-2'>
                        <EditableCell
                          slotId={slot.id}
                          field='faculty_name'
                          value={slot.faculty_name}
                          onSave={handleUpdate}
                        />
                      </TableCell>
                      <TableCell className='py-2'>
                        <EditableCell
                          slotId={slot.id}
                          field='room_number'
                          value={slot.room_number}
                          onSave={handleUpdate}
                        />
                      </TableCell>
                      <TableCell className='text-center py-2'>
                        <Badge
                          variant={slot.is_booked ? 'default' : 'secondary'}
                          className='text-[10px]'
                        >
                          {slot.is_booked ? 'Booked' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right py-2'>
                        <Switch
                          checked={slot.is_bookable}
                          onCheckedChange={(value) => handleUpdate(slot.id, 'is_bookable', value)}
                          className='scale-75'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid md:grid-cols-2 gap-6'>
        <AuthorizedUsersManager />
      </div>
    </div>
  );
}
