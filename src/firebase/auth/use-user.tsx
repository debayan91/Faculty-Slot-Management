'use client';

import type { User } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth, useFirestore } from '@/firebase';
import { type Faculty, getFacultyProfile } from '@/firebase/firestore/users';

export type UserState = {
  user: User | null;
  faculty: Faculty | null;
  loading: boolean;
};

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userState, setUserState] = useState<UserState>({
    user: auth?.currentUser ?? null,
    faculty: null,
    loading: true,
  });

  useEffect(() => {
    if (auth && firestore) {
      const unsubscribe = onIdTokenChanged(auth, async (user) => {
        if (user) {
          const facultyProfile = await getFacultyProfile(firestore, user.uid);
          setUserState({ user, faculty: facultyProfile, loading: false });
        } else {
          setUserState({ user: null, faculty: null, loading: false });
        }
      });
      return () => unsubscribe();
    } else {
      // If auth or firestore is not available, we are not authenticated.
      setUserState({ user: null, faculty: null, loading: false });
    }
  }, [auth, firestore]);

  return userState;
}
