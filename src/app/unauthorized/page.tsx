'use client';

import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailWarning, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function UnauthorizedPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been logged out.' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  return (
    <div className='flex justify-center items-center h-screen -mt-24'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto bg-destructive/10 p-3 rounded-full w-fit'>
            <MailWarning className='h-10 w-10 text-destructive' />
          </div>
          <CardTitle className='mt-4 text-2xl'>Access Denied</CardTitle>
          <CardDescription>
            Your email address <span className='font-semibold text-foreground'>{user?.email}</span>{' '}
            is not authorized to access this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Please contact the system administrator to request access. Once your email has been
            approved, you will be able to log in.
          </p>
          <Button onClick={handleLogout} className='mt-6 w-full'>
            <LogOut className='mr-2 h-4 w-4' /> Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
