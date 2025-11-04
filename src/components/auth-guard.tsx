
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

// List of routes that are publicly accessible
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/unauthorized'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until user state is determined
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user && isAuthorized) {
      // User is logged in and authorized
      if (isPublicRoute && pathname !== '/') {
        // If they are on a public page (like /login), redirect to home
        router.push('/');
      }
    } else if (user && !isAuthorized) {
      // User is logged in but NOT authorized
      if (pathname !== '/unauthorized') {
        router.push('/unauthorized');
      }
    } else {
      // User is not logged in
      if (!isPublicRoute) {
        // If trying to access a protected page, redirect to login
        router.push('/');
      }
    }
  }, [user, loading, isAuthorized, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flicker while redirecting
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!user && !isPublicRoute) {
    return null;
  }
  if (user && !isAuthorized && pathname !== '/unauthorized') {
    return null;
  }


  return <>{children}</>;
}
