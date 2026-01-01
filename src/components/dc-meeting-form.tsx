'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { createDCMeetingLog } from '@/firebase/firestore/dc-meeting-logs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight } from 'lucide-react';

const formSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required.'),
  facultyName: z.string().min(1, 'Name is required.'),
  scholarRegistrationNumber: z.string().min(1, 'Scholar registration number is required.'),
  scholarName: z.string().min(1, 'Scholar name is required.'),
  meetingType: z.string().min(1, 'Please select a meeting type.'),
});

type DCMeetingFormValues = z.infer<typeof formSchema>;

interface DCMeetingFormProps {
  onSuccess: () => void;
}

export function DCMeetingForm({ onSuccess }: DCMeetingFormProps) {
  const { user, faculty } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DCMeetingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empId: faculty?.empId || '',
      facultyName: faculty?.name || '',
      scholarRegistrationNumber: '',
      scholarName: '',
      meetingType: '',
    },
  });

  const onSubmit = async (values: DCMeetingFormValues) => {
    if (!user || !faculty || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDCMeetingLog(firestore, {
        facultyUid: user.uid,
        facultyEmail: faculty.email,
        ...values,
      });
      toast({ title: 'Verified', description: 'Proceeding to slot booking...' });
      onSuccess();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex justify-center items-center px-4 animate-fade-in'>
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
          <CardDescription>Provide scholar and meeting information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-2 gap-4 p-3 rounded-md border bg-secondary/30'>
                <FormField
                  control={form.control}
                  name='empId'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className='text-xs text-muted-foreground'>Emp ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className='h-7 border-0 p-0 bg-transparent font-mono'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='facultyName'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className='text-xs text-muted-foreground'>Faculty Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className='h-7 border-0 p-0 bg-transparent' />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='scholarName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholar Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='scholarRegistrationNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reg. Number</FormLabel>
                      <FormControl>
                        <Input placeholder='21BCE0000' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='meetingType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type...' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='First Meeting'>First Meeting</SelectItem>
                        <SelectItem value='Review Meeting'>Review Meeting</SelectItem>
                        <SelectItem value='Thesis Submission Review'>
                          Thesis Submission Review
                        </SelectItem>
                        <SelectItem value='Other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className='animate-spin h-4 w-4' />
                ) : (
                  <>
                    <span>Verify & Continue</span> <ArrowRight className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
