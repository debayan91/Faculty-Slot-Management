
'use client';

import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

/**
 * Adds an email to the 'authorized_emails' collection.
 * The document ID will be the email itself to prevent duplicates.
 */
export async function addAuthorizedEmail(db: Firestore, email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format provided.');
  }

  const authorizedEmailRef = doc(db, 'authorized_emails', email);
  
  await setDoc(authorizedEmailRef, {
    email: email,
    addedAt: serverTimestamp(),
  });
}

/**
 * Removes an email from the 'authorized_emails' collection.
 */
export async function removeAuthorizedEmail(db: Firestore, email: string) {
    if (!email) {
        throw new Error('No email provided.');
    }

    const authorizedEmailRef = doc(db, 'authorized_emails', email);
    await deleteDoc(authorizedEmailRef);
}
