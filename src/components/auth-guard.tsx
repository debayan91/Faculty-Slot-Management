
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminProvider';

// List of routes that are publicly accessible or part of the auth flow
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/unauthorized', '/admin/auth'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useUser();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until user state is determined
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/auth';

    // If user is logged in and authorized
    if (user && isAuthorized) {
      // If they are on a public auth page (like /login or /unauthorized), redirect to home
      if (pathname === '/login' || pathname === '/signup' || pathname === '/unauthorized') {
        router.push('/');
      }
      // If they are an admin on a non-admin page, that's fine.
      // If they are NOT an admin but try to access admin pages, redirect.
      if (!isAdmin && isAdminRoute) {
        router.push('/admin/auth'); // or '/'
      }
      return;
    }

    // If user is logged in but NOT authorized
    if (user && !isAuthorized) {
      if (pathname !== '/unauthorized') {
        router.push('/unauthorized');
      }
      return;
    }

    // If user is NOT logged in
    if (!user) {
      if (!isPublicRoute) {
        router.push('/');
      }
      return;
    }

  }, [user, loading, isAuthorized, router, pathname, isAdmin]);

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
