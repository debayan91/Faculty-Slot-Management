
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyBookedSlotsPage() {
  const { user, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen -mt-24">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to view your booked slots.</p>
            <Link href="/login" className="text-primary underline mt-4 inline-block">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>My Booked Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You have no booked slots yet.
          </p>
          {/* Placeholder for where the list of booked slots will go */}
        </CardContent>
      </Card>
    </div>
  );
}
