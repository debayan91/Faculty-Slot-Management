'use client';

import { useUser } from '@/firebase';
import AuthForm from '@/components/auth-form';
import { Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading, isAuthorized } = useUser();

  if (loading) {
    return null;
  }

  // Authenticated & Authorized View - Simplified
  if (user && isAuthorized) {
    return (
      <main className='flex-grow container max-w-screen-lg py-12 px-4 animate-fade-in'>
        <div className='space-y-8'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Welcome, {user.displayName?.split(' ')[0] || 'Faculty'}.
            </h1>
            <p className='text-muted-foreground'>
              Access your research tools and manage schedules.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <Link href='/slot-booking-for-dcm' className='block'>
              <div className='p-6 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all group'>
                <Calendar className='h-6 w-6 mb-3 text-muted-foreground group-hover:text-foreground transition-colors' />
                <h3 className='font-semibold mb-1'>Slot Booking</h3>
                <p className='text-sm text-muted-foreground'>
                  Book and manage your DC meeting slots.
                </p>
              </div>
            </Link>
            <Link href='/documents' className='block'>
              <div className='p-6 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all group'>
                <FileText className='h-6 w-6 mb-3 text-muted-foreground group-hover:text-foreground transition-colors' />
                <h3 className='font-semibold mb-1'>Documents</h3>
                <p className='text-sm text-muted-foreground'>
                  Access important research documents.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Unauthenticated View
  return (
    <main className='flex-grow flex flex-col items-center justify-center p-6 md:p-12'>
      <div className='w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
        {/* Left Side: Hero Text */}
        <div className='space-y-6 text-center lg:text-left animate-slide-up'>
          <p className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
            VIT Business School
          </p>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]'>
            Research Portal.
          </h1>
          <p className='text-lg text-muted-foreground max-w-md mx-auto lg:mx-0'>
            A platform for slot booking, meeting management, and resource access.
          </p>
        </div>

        {/* Right Side: Auth Form */}
        <div className='w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto animate-fade-in'>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
