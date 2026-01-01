'use client';

import type { User } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc, type Firestore } from 'firebase/firestore';

import { useAuth, useFirestore } from '@/firebase';
import { type Faculty, getFacultyProfile } from '@/firebase/firestore/user-profiles';

export type UserState = {
  user: User | null;
  faculty: Faculty | null;
  isAuthorized: boolean | null; // null means we haven't checked yet
  loading: boolean;
};

async function checkAuthorization(db: Firestore, email: string): Promise<boolean> {
  if (!db || !email) return false;
  try {
    // The document ID is the email address itself for easy lookup
    const authEmailRef = doc(db, 'authorized_emails', email);
    const docSnap = await getDoc(authEmailRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking authorization:', error);
    return false;
  }
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userState, setUserState] = useState<UserState>({
    user: auth.currentUser,
    faculty: null,
    isAuthorized: null,
    loading: true,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserState({ user: null, faculty: null, isAuthorized: false, loading: false });
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUserState((prevState) => ({ ...prevState, loading: true, isAuthorized: null }));

      if (user && user.email) {
        // User is signed in. Check their authorization status first.
        const isAuthorized = await checkAuthorization(firestore, user.email);

        if (isAuthorized) {
          // If authorized, fetch their faculty profile.
          try {
            const facultyProfile = await getFacultyProfile(firestore, user.uid);
            setUserState({ user, faculty: facultyProfile, isAuthorized: true, loading: false });
          } catch (error) {
            console.error('[useUser] Failed to fetch faculty profile:', error);
            // Still authorized, but profile fetch failed.
            setUserState({ user, faculty: null, isAuthorized: true, loading: false });
          }
        } else {
          // User is not authorized.
          setUserState({ user, faculty: null, isAuthorized: false, loading: false });
        }
      } else {
        // User is signed out or has no email.
        setUserState({ user: null, faculty: null, isAuthorized: false, loading: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  return userState;
}
