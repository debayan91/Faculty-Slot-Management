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
    user: null,
    faculty: null,
    loading: true,
  });

  useEffect(() => {
    if (auth && firestore) {
      // Set initial state from currentUser, if available, but keep loading true
      // until the onIdTokenChanged listener has had a chance to run.
      if (auth.currentUser) {
        getFacultyProfile(firestore, auth.currentUser.uid).then(facultyProfile => {
          // We set the user here to avoid a flicker, but loading remains true
          setUserState(prevState => ({ ...prevState, user: auth.currentUser, faculty: facultyProfile }));
        });
      } else {
        // If there's no current user, we can be pretty sure we're done loading.
        setUserState({ user: null, faculty: null, loading: false });
      }

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
        // If firebase services aren't available, we aren't loading.
        setUserState({ user: null, faculty: null, loading: false });
    }
  }, [auth, firestore]);

  return userState;
}
