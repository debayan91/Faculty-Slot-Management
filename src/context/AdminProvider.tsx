'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  previousPath: string;
  setPreviousPath: (path: string) => void;
  // Kept for client-side toggling, though claims are the source of truth
  setIsAdmin: (isAdmin: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [claimsLoading, setClaimsLoading] = useState<boolean>(true);
  const [previousPath, setPreviousPath] = useState<string>('/');

  useEffect(() => {
    if (authLoading) {
      setClaimsLoading(true);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setClaimsLoading(false);
      return;
    }

    // Force a token refresh to get the latest claims.
    user
      .getIdTokenResult(true)
      .then((idTokenResult) => {
        const claims = idTokenResult.claims;
        // Check for the admin custom claim.
        if (claims.admin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setClaimsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching custom claims:', error);
        setIsAdmin(false);
        setClaimsLoading(false);
      });
  }, [user, authLoading]);

  const value = {
    isAdmin,
    setIsAdmin,
    loading: authLoading || claimsLoading,
    previousPath,
    setPreviousPath,
  };

  // The loading screen is handled here now to prevent layout shifts
  if (value.loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <p className='ml-4 text-lg'>Verifying permissions...</p>
      </div>
    );
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
