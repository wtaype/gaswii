// src/core/config/firebase.ts
// 🔥 Re-export unificado para retrocompatibilidad
export { app, auth, googleProvider } from './firebase-auth';
export { db } from './firebase-db';

import { app, auth, googleProvider } from './firebase-auth';
import { db } from './firebase-db';

export default { app, auth, googleProvider, db };