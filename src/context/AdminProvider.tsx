
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  loading: boolean;
  previousPath: string | null;
  setPreviousPath: (path: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdminState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousPath, setPreviousPathState] = useState<string | null>(null);

  useEffect(() => {
    // Check session storage for admin status on initial load
    const storedIsAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const storedPath = sessionStorage.getItem('previousPath');
    setIsAdminState(storedIsAdmin);
    setPreviousPathState(storedPath);
    setLoading(false);
  }, []);

  const setIsAdmin = (isAdmin: boolean) => {
    setIsAdminState(isAdmin);
    // Persist admin status in session storage
    if (isAdmin) {
      sessionStorage.setItem('isAdmin', 'true');
    } else {
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('previousPath'); // Clear path when exiting admin mode
    }
  };

  const setPreviousPath = (path: string) => {
    setPreviousPathState(path);
    sessionStorage.setItem('previousPath', path);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, loading, previousPath, setPreviousPath }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
