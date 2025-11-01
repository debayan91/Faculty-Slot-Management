
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAdmin } from '@/context/AdminProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminAuthPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { isAdmin, setIsAdmin } = useAdmin();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is not logged in and loading is finished, redirect them
    if (!userLoading && !user) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You must be logged in to access this page.' });
      router.push('/login');
    }
    // If user is already an admin, redirect to dashboard
    if (isAdmin) {
        router.push('/admin');
    }
  }, [user, userLoading, isAdmin, router, toast]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === 'password1234') {
      setIsAdmin(true);
      toast({ title: 'Admin Mode Activated', description: 'Redirecting to dashboard...' });
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Password',
        description: 'The password you entered is incorrect.',
      });
      setIsLoading(false);
      setPassword('');
    }
  };

  if (userLoading || !user || isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen -mt-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen -mt-24">
      <Card className="w-full max-w-sm">
        <form onSubmit={handlePasswordSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Verification</CardTitle>
            <CardDescription>
              Please enter the admin password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Enter Admin Mode'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

