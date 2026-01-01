'use client';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { createContext, useContext, type ReactNode } from 'react';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
});

type FirebaseProviderProps = {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseProvider({ children, app, auth, firestore }: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => {
  const { app } = useFirebase();
  if (!app) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return app;
};

export const useAuth = () => {
  const { auth } = useFirebase();
  if (!auth) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return auth;
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  if (!firestore) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return firestore;
};
