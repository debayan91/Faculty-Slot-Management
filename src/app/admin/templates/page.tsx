
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase'; // Correctly import the hook
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const jsonTemplateExample = JSON.stringify([
  { "startTime": "09:00", "courseName": "Introduction to Programming", "facultyName": "Dr. Smith", "room": "101", "isBookable": true },
  { "startTime": "10:00", "courseName": "Data Structures", "facultyName": "Dr. Jones", "room": "102", "isBookable": true },
  { "startTime": "11:00", "courseName": "", "facultyName": "", "room": "", "isBookable": false }
], null, 2);

export default function TemplatesPage() {
  const db = useFirestore(); // Use the hook to get the Firestore instance
  const [activeDay, setActiveDay] = useState(DAYS_OF_WEEK[0]);
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTemplate = useCallback(async (day: string) => {
    if (!db) return;
    setLoading(true);
    try {
      const templateRef = doc(db, 'schedule_templates', day);
      const docSnap = await getDoc(templateRef);
      if (docSnap.exists()) {
        const content = docSnap.data().slots;
        setTemplateContent(JSON.stringify(content, null, 2));
      } else {
        setTemplateContent(jsonTemplateExample);
      }
    } catch (error) {
      console.error(`Error fetching ${day} template:`, error);
      toast({ title: "Error", description: `Could not load the template for ${day}.`, variant: "destructive" });
      setTemplateContent('Error loading template. Please check the console.');
    } finally {
      setLoading(false);
    }
  }, [db, toast]);

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
      toast({
        title: "Invalid JSON Format",
        description: error.message || 'Please ensure the template is a valid JSON array of slot objects.',
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const templateRef = doc(db, 'schedule_templates', activeDay);
      await setDoc(templateRef, { day: activeDay, slots: parsedSlots });
      toast({
        title: "Template Saved!",
        description: `The schedule template for ${activeDay} has been successfully updated.`,
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      console.error(`Error saving ${activeDay} template:`, error);
      toast({ title: "Error", description: "Could not save the template.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule Templates</CardTitle>
        <CardDescription>
          Define the schedule for each day of the week. These templates will be used to generate the daily schedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 mb-4">
            {DAYS_OF_WEEK.map(day => (
              <TabsTrigger key={day} value={day} className="capitalize">{day}</TabsTrigger>
            ))}
          </TabsList>
          {DAYS_OF_WEEK.map(day => (
            <TabsContent key={day} value={day}>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    rows={20}
                    placeholder='Enter your JSON template here...'
                    className="font-mono bg-muted/20"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving || !db}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {saving ? 'Saving...' : `Save ${day.charAt(0).toUpperCase() + day.slice(1)} Template`}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
