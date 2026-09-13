// src/feature/auth/firebaseAuthLoader.js
// Carga perezosa (Lazy Load) centralizada de Firebase SDK bajo demanda
// Solgas Surquillo (Gaswii)

let _loader = null;

/**
 * Carga e inicializa Firebase Auth, Firestore y App Check solo cuando es estrictamente necesario.
 * Retorna una promesa en caché con todas las utilidades requeridas.
 */
export const loadFirebaseAuth = () => {
  if (!_loader) {
    _loader = Promise.all([
      import('../../core/config/firebase-auth.ts'),
      import('../../core/config/firebase-db.ts'),
      import('firebase/auth'),
      import('firebase/firestore')
    ]).then(([{ auth, googleProvider }, { db }, fbAuth, fbDb]) => ({
      auth,
      googleProvider,
      db,
      ...fbAuth,
      ...fbDb
    })).catch((err) => {
      _loader = null;
      throw err;
    });
  }
  return _loader;
};

/**
 * Precarga no bloqueante en segundo plano (usada al abrir el modal o enfocar un input)
 */
export const precargarFirebaseAuth = () => {
  if (typeof window !== 'undefined' && !_loader) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => { loadFirebaseAuth().catch(() => {}); });
    } else {
      setTimeout(() => { loadFirebaseAuth().catch(() => {}); }, 100);
    }
  }
};
