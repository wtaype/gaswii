// src/core/config/firebase-auth.ts
// 🔥 Instancia Singleton de Firebase Auth para Gaswii (Carga ligera bajo demanda)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

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
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default { app, auth, googleProvider };
