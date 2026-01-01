'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DCSessionContextType {
  isDCSessionActive: boolean;
  setDCSessionActive: (isActive: boolean) => void;
}

const DCSessionContext = createContext<DCSessionContextType | undefined>(undefined);

export function DCSessionProvider({ children }: { children: ReactNode }) {
  const [isDCSessionActive, setDCSessionActive] = useState(false);

  const value = {
    isDCSessionActive,
    setDCSessionActive,
  };

  return <DCSessionContext.Provider value={value}>{children}</DCSessionContext.Provider>;
}

export function useDCSession() {
  const context = useContext(DCSessionContext);
  if (context === undefined) {
    throw new Error('useDCSession must be used within a DCSessionProvider');
  }
  return context;
}
