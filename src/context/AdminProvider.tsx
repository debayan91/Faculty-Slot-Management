'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdminState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session storage for admin status on initial load
    const storedIsAdmin = sessionStorage.getItem('isAdmin') === 'true';
    setIsAdminState(storedIsAdmin);
    setLoading(false);
  }, []);

  const setIsAdmin = (isAdmin: boolean) => {
    setIsAdminState(isAdmin);
    // Persist admin status in session storage
    if (isAdmin) {
      sessionStorage.setItem('isAdmin', 'true');
    } else {
      sessionStorage.removeItem('isAdmin');
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, loading }}>
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
