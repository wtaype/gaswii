// src/core/config/firebase-db.ts
// 📦 Instancia Singleton de Cloud Firestore para Gaswii
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'gaswii',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app);

export default { app, db };
