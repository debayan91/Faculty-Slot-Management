import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export function initializeFirebase() {
  return { app: firebaseApp, auth, firestore: db };
}
