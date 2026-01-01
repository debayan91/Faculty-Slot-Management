'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { createFacultyProfile } from '@/firebase/firestore/user-profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';

interface SignupFormProps {
  toggleForm: () => void;
}

export default function SignupForm({ toggleForm }: SignupFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await createFacultyProfile(firestore, user.uid, {
        empId: user.uid.slice(0, 8),
        name: fullName,
        email: user.email!,
        role: 'faculty',
      });

      toast({ title: 'Account Created', description: 'Welcome to SCOPE.' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createFacultyProfile(firestore, user.uid, {
        empId: user.uid.slice(0, 8),
        name: user.displayName || 'Google User',
        email: user.email!,
        role: 'faculty',
      });

      toast({ title: 'Welcome', description: 'Signed in with Google.' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full animate-fade-in'>
      <div className='rounded-lg border border-border bg-card p-6 space-y-6'>
        <div className='space-y-1.5'>
          <h2 className='text-xl font-semibold tracking-tight'>Create Account</h2>
          <p className='text-sm text-muted-foreground'>Join the research portal.</p>
        </div>

        <form onSubmit={handleSignUp} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='full-name'>Full Name</Label>
            <Input
              id='full-name'
              type='text'
              placeholder='Dr. Jane Smith'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='name@vit.ac.in'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button className='w-full' type='submit' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='animate-spin h-4 w-4' />
            ) : (
              <span className='flex items-center'>
                Get Started <ArrowRight className='ml-2 h-4 w-4' />
              </span>
            )}
          </Button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t border-border' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-card px-2 text-muted-foreground'>Or</span>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type='button'
        >
          <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
            <path
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              fill='#4285F4'
            />
            <path
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              fill='#34A853'
            />
            <path
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              fill='#FBBC05'
            />
            <path
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              fill='#EA4335'
            />
          </svg>
          Sign up with Google
        </Button>

        <div className='text-center text-sm text-muted-foreground'>
          Already a member?{' '}
          <button
            type='button'
            onClick={toggleForm}
            className='text-foreground font-medium underline underline-offset-2 hover:no-underline'
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
