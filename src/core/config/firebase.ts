// src/core/config/firebase.ts
// 🔥 Instancia Base Singleton de Firebase para Gaswii con App Check Enterprise
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';

export const app: FirebaseApp = getApps()[0] || initializeApp({
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'gaswii',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL
});

export let appCheck: AppCheck | null = null;

if (typeof window !== 'undefined' && import.meta.env.PUBLIC_RECAPTCHA_WEB) {
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.PUBLIC_APPCHECK_DEBUG_TOKEN || true;
  }
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(import.meta.env.PUBLIC_RECAPTCHA_WEB),
      isTokenAutoRefreshEnabled: true
    });
  } catch {}
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db: Firestore = getFirestore(app);
export default app;