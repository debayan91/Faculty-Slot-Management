
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

// List of routes that are publicly accessible or part of the auth flow
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/unauthorized', '/admin/auth'];

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
      // If they are on a public page (like /login or /unauthorized), redirect to home
      if (isPublicRoute && pathname !== '/') {
        // Exception: allow authorized users to still access admin auth
        if (pathname === '/admin/auth') return;
        router.push('/');
      }
    } else if (user && !isAuthorized) {
      // User is logged in but NOT authorized
      // If they are not on the unauthorized page, redirect them there
      if (pathname !== '/unauthorized') {
        router.push('/unauthorized');
      }
    } else {
      // User is not logged in
      // If trying to access a protected page, redirect to the login page (which is '/')
      if (!isPublicRoute) {
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

  // This logic prevents content "flickering" while redirects are in flight.
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!user && !isPublicRoute) {
    // If not logged in and trying to access protected route, show nothing while redirecting.
    return null;
  }
  if (user && !isAuthorized && pathname !== '/unauthorized') {
     // If logged in, not authorized, and not on the unauthorized page, show nothing.
    return null;
  }


  return <>{children}</>;
}
