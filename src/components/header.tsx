'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navButtons } from '@/config/nav-links';
import { ThemeToggle } from './theme-toggle';
import { AdminToggler } from './admin-toggler';
import { useState } from 'react';

export function Header() {
  const { user, isAuthorized, loading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logged Out', description: 'See you next time!' });
  };

  const isLoginPage = pathname === '/auth';

  if (loading) return null;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background'>
      <div className='container flex h-20 max-w-screen-2xl items-center justify-between px-6'>
        {/* Brand Logo - EXTRA LARGE with overflow */}
        <Link href='/' className='flex items-center gap-5 group'>
          <div className='relative w-36 h-36 -my-8'>
            <Image
              src='/logo.webp'
              alt='SCOPE Logo'
              fill
              className='object-contain dark:brightness-0 dark:invert'
              priority
            />
          </div>
          <div className='hidden sm:flex flex-col'>
            <span className='font-bold text-xl tracking-tight text-foreground'>SCOPE</span>
            <span className='text-[10px] text-muted-foreground uppercase tracking-widest'>
              Research Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-8'>
          {user && isAuthorized && !isLoginPage && (
            <nav className='flex items-center gap-2'>
              {navButtons.slice(0, 2).map((button) => {
                const isActive = pathname === button.href || pathname.startsWith(button.href);
                return (
                  <Link
                    key={button.name}
                    href={button.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                  >
                    {button.name}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className='flex items-center gap-3'>
            <ThemeToggle />

            {user && (
              <>
                <div className='h-6 w-px bg-border mx-2' />
                <div className='flex items-center gap-3'>
                  {isAuthorized && <AdminToggler />}
                  <Button
                    onClick={handleLogout}
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-foreground h-10 w-10'
                  >
                    <LogOut className='h-5 w-5' />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className='md:hidden flex items-center gap-3'>
          <ThemeToggle />
          {user && (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='h-10 w-10'
            >
              {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && user && (
        <div className='md:hidden border-t border-border bg-background px-6 py-6 space-y-6 animate-fade-in'>
          {isAuthorized && !isLoginPage && (
            <nav className='flex flex-col space-y-2'>
              {navButtons.slice(0, 2).map((button) => (
                <Link
                  key={button.name}
                  href={button.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    pathname === button.href
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary',
                  )}
                >
                  <button.icon className='mr-4 h-5 w-5' />
                  {button.name}
                </Link>
              ))}
            </nav>
          )}
          <div className='pt-4 border-t border-border'>
            <div className='flex items-center justify-between mb-4 px-1'>
              <div className='flex flex-col'>
                <span className='text-base font-medium'>{user.displayName || 'User'}</span>
                <span className='text-sm text-muted-foreground'>{user.email}</span>
              </div>
              <AdminToggler />
            </div>
            <Button onClick={handleLogout} variant='outline' size='lg' className='w-full'>
              Log Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
