
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { seedScheduleTemplates } from '@/firebase/firestore/template-setup';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, DatabaseZap } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"

export default function TemplateManagerPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedTemplates = async () => {
    if (!firestore) return;

    setIsLoading(true);
    toast({
      title: 'Seeding Database...',
      description: 'Creating schedule templates for all weekdays.',
    });

    try {
      const result = await seedScheduleTemplates(firestore);
      toast({
        title: 'Templates Created!',
        description: result.message,
      });
      // Optionally redirect or show a success message
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    // Or a more friendly "access denied" message
    router.push('/'); 
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center"><DatabaseZap className="mr-2"/> Schedule Template Manager</CardTitle>
          <CardDescription>
            Use this tool to create the initial schedule templates in your Firestore database. This only needs to be done once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTitle>What does this do?</AlertTitle>
            <AlertDescription>
              Clicking the button below will create 5 documents in your `schedule_templates` collection in Firestore, one for each day from Monday to Friday. These documents define the time slots for a standard day and are required for the main "Schedule CMS" to generate daily schedules.
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full" 
            onClick={handleSeedTemplates} 
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 animate-spin" /> Seeding...</>
            ) : (
              'Seed Default Templates (Mon-Fri)'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    