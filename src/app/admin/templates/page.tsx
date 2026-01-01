'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Save, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const jsonTemplateExample = JSON.stringify(
  [
    {
      startTime: '09:00',
      courseName: 'DC Meeting',
      facultyName: '',
      room: '101',
      isBookable: true,
    },
    {
      startTime: '10:00',
      courseName: 'DC Meeting',
      facultyName: '',
      room: '101',
      isBookable: true,
    },
    {
      startTime: '11:00',
      courseName: 'DC Meeting',
      facultyName: '',
      room: '101',
      isBookable: true,
    },
    {
      startTime: '14:00',
      courseName: 'DC Meeting',
      facultyName: '',
      room: '101',
      isBookable: true,
    },
    {
      startTime: '15:00',
      courseName: 'DC Meeting',
      facultyName: '',
      room: '101',
      isBookable: true,
    },
  ],
  null,
  2,
);

export default function TemplatesPage() {
  const db = useFirestore();
  const [activeDay, setActiveDay] = useState(DAYS_OF_WEEK[0]);
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTemplate = useCallback(
    async (day: string) => {
      if (!db) return;
      setLoading(true);
      try {
        const templateRef = doc(db, 'schedule_templates', day);
        const docSnap = await getDoc(templateRef);
        setTemplateContent(
          docSnap.exists() ? JSON.stringify(docSnap.data().slots, null, 2) : jsonTemplateExample,
        );
      } catch (error) {
        console.error(`Error fetching ${day} template:`, error);
        toast({
          title: 'Error',
          description: `Could not load ${day} template.`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [db, toast],
  );

  useEffect(() => {
    fetchTemplate(activeDay);
  }, [activeDay, fetchTemplate]);

  const handleSave = async () => {
    if (!db) return;
    let parsedSlots;
    try {
      parsedSlots = JSON.parse(templateContent);
      if (!Array.isArray(parsedSlots)) throw new Error('Template must be a JSON array.');
    } catch (error: any) {
      toast({ title: 'Invalid JSON', description: error.message, variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const templateRef = doc(db, 'schedule_templates', activeDay);
      await setDoc(templateRef, { day: activeDay, slots: parsedSlots });
      toast({ title: 'Template Saved!', description: `${activeDay} schedule updated.` });
    } catch (error) {
      console.error(`Error saving ${activeDay} template:`, error);
      toast({
        title: 'Error',
        description: 'Could not save the template.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='container mx-auto p-4 md:p-8 animate-fade-in space-y-6'>
      <h1 className='text-2xl font-bold tracking-tight'>Schedule Templates</h1>

      <Alert>
        <Info className='h-4 w-4' />
        <AlertTitle>How Templates Work</AlertTitle>
        <AlertDescription>
          Templates define the default slot structure for each day. When you "Generate" a schedule
          on the Admin Dashboard, it uses the template for that day of the week to create the slots.
        </AlertDescription>
      </Alert>

      <Card className='bg-card'>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Daily Configuration</CardTitle>
          <CardDescription>Edit the JSON array of slot objects for each day.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDay} onValueChange={setActiveDay} className='w-full'>
            <TabsList className='grid w-full grid-cols-7 mb-4 bg-secondary'>
              {DAYS_OF_WEEK.map((day) => (
                <TabsTrigger
                  key={day}
                  value={day}
                  className='capitalize text-xs data-[state=active]:bg-background'
                >
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
            {DAYS_OF_WEEK.map((day) => (
              <TabsContent key={day} value={day} className='mt-0'>
                {loading ? (
                  <div className='flex items-center justify-center h-80'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Textarea
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      rows={14}
                      placeholder='Enter your JSON template here...'
                      className='font-mono text-sm resize-none bg-secondary/30'
                    />
                    <div className='flex justify-between items-center'>
                      <p className='text-xs text-muted-foreground'>
                        Fields: startTime, courseName, facultyName, room, isBookable
                      </p>
                      <Button onClick={handleSave} disabled={saving || !db}>
                        {saving ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Save className='mr-2 h-4 w-4' />
                        )}
                        {saving ? 'Saving...' : 'Save Template'}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
