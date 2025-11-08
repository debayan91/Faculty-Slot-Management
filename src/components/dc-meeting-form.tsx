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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
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
      scholarRegistrationNumber: '',
      scholarName: '',
      meetingType: '',
    },
  });

  const onSubmit = async (values: DCMeetingFormValues) => {
    if (!user || !faculty || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit this form.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDCMeetingLog(firestore, {
        facultyUid: user.uid,
        empId: faculty.empId,
        facultyName: faculty.name,
        facultyEmail: faculty.email,
        ...values,
      });

      toast({
        title: 'Form Submitted',
        description: 'You can now proceed to book a slot.',
      });
      onSuccess(); // Notify parent component to show the booking UI
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>DC Meeting Slot Booking</CardTitle>
        <CardDescription>
          Please fill out the details below before booking your slot. This is required for each session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Emp ID</Label>
                <Input value={faculty?.empId || ''} disabled />
              </div>
               <div className="space-y-2">
                <Label>Name</Label>
                <Input value={faculty?.name || ''} disabled />
              </div>
            </div>
             <div className="space-y-2">
              <Label>Email</Label>
              <Input value={faculty?.email || ''} disabled />
            </div>

            <FormField
              control={form.control}
              name="scholarRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scholar Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 21PHD0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scholarName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scholar Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the scholar's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of DC Meeting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="First Meeting">First Meeting</SelectItem>
                      <SelectItem value="Review Meeting">Review Meeting</SelectItem>
                      <SelectItem value="Thesis Submission Review">Thesis Submission Review</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit and Proceed to Booking
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
