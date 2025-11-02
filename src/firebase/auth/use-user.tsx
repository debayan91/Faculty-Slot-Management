
'use client';

import type { User } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth, useFirestore } from '@/firebase';
import { type Faculty, getFacultyProfile } from '@/firebase/firestore/user-profiles';

export type UserState = {
  user: User | null;
  faculty: Faculty | null;
  loading: boolean;
};

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userState, setUserState] = useState<UserState>({
    user: auth.currentUser, // Initialize with currentUser if available
    faculty: null,
    loading: true,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserState({ user: null, faculty: null, loading: false });
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUserState(prevState => ({ ...prevState, loading: true }));
      if (user) {
        // User is signed in. Fetch their profile.
        try {
          const facultyProfile = await getFacultyProfile(firestore, user.uid);
          setUserState({ user, faculty: facultyProfile, loading: false });
        } catch (error) {
          console.error("Failed to fetch faculty profile:", error);
          // Still set loading to false, but profile will be null
          setUserState({ user, faculty: null, loading: false });
        }
      } else {
        // User is signed out.
        setUserState({ user: null, faculty: null, loading: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  return userState;
}
