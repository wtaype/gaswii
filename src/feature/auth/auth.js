// src/feature/auth/auth.js
// 🔐 Módulo de Autenticación Firebase SDK con Sincronización en 'smiles'
// Local-First: Guarda en localStorage 'wiSmile' de inmediato para 0ms de latencia,
// y sincroniza en segundo plano con Cloud Firestore en la colección 'smiles'.

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../core/config/firebase';
import { savels, getls, removels } from '../../core/widev/storage';

/**
 * Modelo de documento en Firestore: smiles/{uid}
 * {
 *   uid: string,
 *   usuario: string,
 *   email: string,
 *   nombre: string,
 *   foto: string,
 *   celular: string,
 *   rol: 'cliente' | 'personal',
 *   plan: 'estandar' | 'vip',
 *   activo: true,
 *   estado: 'activo' | 'suspendido',
 *   pin: 'Balón SOLGAS de 10 kg',
 *   puntos: 50,
 *   direcciones: Array<{ id, etiqueta, direccion, distrito, predeterminada }>,
 *   creado: timestamp,
 *   actualizado: timestamp
 * }
 */

export function limpiarUsuario(usuario = '') {
  return (usuario || '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/@.*$/, '')
    .replace(/gmailcom$|outlookcom$|hotmailcom$/, '')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Genera un identificador de usuario limpio y único
 */
export function generarUsuario(email = '', nombre = '') {
  const base = limpiarUsuario(nombre.trim()) || limpiarUsuario(email.split('@')[0]) || 'usuario';
  return `${base}_${Math.floor(100 + Math.random() * 900)}`;
}

export function generarAvatarUrl(nombre = '', usuario = '') {
  const semilla = encodeURIComponent(nombre || usuario || 'Gaswii');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${semilla}&backgroundColor=ff6600,0284c7,10b981`;
}

export async function sincronizarSmile(user, extraData = {}) {
  if (!user?.uid) return null;

  const docRef = doc(db, 'smiles', user.uid);
  let docSnap = null;
  try {
    docSnap = await getDoc(docRef);
  } catch (err) {
    console.warn('⚠️ Firestore offline o no disponible temporalmente:', err);
  }

  let smileData;

  if (docSnap && docSnap.exists()) {
    const existing = docSnap.data();
    const fotoFinal = user.photoURL || extraData.foto || existing.foto || generarAvatarUrl(existing.nombre || user.displayName, existing.usuario);
    
    smileData = { 
      ...existing, 
      ...extraData, 
      foto: fotoFinal,
      actualizado: new Date().toISOString() 
    };

    const updatePayload = {
      ...extraData,
      foto: fotoFinal,
      actualizado: serverTimestamp()
    };
    // Limpiar propiedades undefined para evitar errores de Firestore
    Object.keys(updatePayload).forEach(k => updatePayload[k] === undefined && delete updatePayload[k]);

    try {
      await updateDoc(docRef, updatePayload);
      console.log('✅ Documento smile actualizado en Firestore:', user.uid);
    } catch (e) {
      console.error('❌ Error al actualizar Firestore smile:', e);
    }
  } else {
    const nombreFinal = extraData.nombre || user.displayName || 'Vecino Solgas';
    const usuarioFinal = extraData.usuario || generarUsuario(user.email, nombreFinal);
    const fotoFinal = user.photoURL || extraData.foto || generarAvatarUrl(nombreFinal, usuarioFinal);

    // Registro inicial completo en Cloud Firestore
    smileData = {
      uid: user.uid,
      usuario: usuarioFinal,
      email: user.email || '',
      nombre: nombreFinal,
      foto: fotoFinal,
      celular: extraData.celular || '',
      rol: extraData.rol || 'cliente',
      plan: 'vip',
      activo: true,
      estado: 'activo',
      pin: extraData.pin || 'Balón SOLGAS de 10 kg',
      puntos: 50,
      direcciones: extraData.direcciones || [],
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString()
    };

    const setPayload = {
      ...smileData,
      creado: serverTimestamp(),
      actualizado: serverTimestamp()
    };
    Object.keys(setPayload).forEach(k => setPayload[k] === undefined && delete setPayload[k]);

    try {
      await setDoc(docRef, setPayload);
      console.log('✅ Documento smile CREADO en Firestore collection "smiles":', user.uid);
    } catch (e) {
      console.error('❌ Error crítico al crear Firestore smile inicial:', e);
      throw e;
    }
  }

  // Guardado Local-First ultra rápido (0ms)
  savels('wiSmile', smileData);
  return smileData;
}

/**
 * Resuelve el correo electrónico a partir de un nombre de usuario o retorna el mismo si ya es correo
 */
export async function resolverEmailPorUsuario(usuarioOrEmail = '') {
  const input = usuarioOrEmail.trim().toLowerCase();
  if (!input) return null;
  if (input.includes('@')) return input;

  const userClean = limpiarUsuario(input);
  try {
    const q = query(collection(db, 'smiles'), where('usuario', '==', userClean), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.email) return data.email;
    }
  } catch (err) {
    console.warn('Error resolviendo email por usuario:', err);
  }
  return null;
}

/**
 * Comprueba si un nombre de usuario ya existe en Firestore
 */
export async function existeUsuario(usuario = '') {
  const u = limpiarUsuario(usuario);
  if (!u || u.length < 3) return false;
  try {
    const q = query(collection(db, 'smiles'), where('usuario', '==', u), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.warn('Error verificando usuario:', e);
    return false;
  }
}

/**
 * Comprueba si un correo electrónico ya existe registrado
 */
export async function existeEmail(email = '') {
  const em = email.trim().toLowerCase();
  if (!em || !em.includes('@')) return false;
  try {
    const q = query(collection(db, 'smiles'), where('email', '==', em), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.warn('Error verificando correo:', e);
    return false;
  }
}

/**
 * Enviar enlace de restablecimiento de contraseña (soporta usuario o correo)
 */
export async function recuperarPassword(usuarioOrEmail = '') {
  let emailFinal = usuarioOrEmail.trim();
  if (!emailFinal.includes('@')) {
    const res = await resolverEmailPorUsuario(emailFinal);
    if (!res) {
      throw new Error('Usuario no encontrado');
    }
    emailFinal = res;
  }
  await sendPasswordResetEmail(auth, emailFinal);
  return emailFinal;
}

/**
 * Iniciar Sesión con Correo o Usuario y Contraseña
 */
export async function iniciarSesion(usuarioOrEmail, password) {
  let emailFinal = usuarioOrEmail.trim();
  if (!emailFinal.includes('@')) {
    const res = await resolverEmailPorUsuario(emailFinal);
    if (!res) {
      const err = new Error('Usuario no encontrado');
      err.code = 'auth/user-not-found';
      throw err;
    }
    emailFinal = res;
  }
  const cred = await signInWithEmailAndPassword(auth, emailFinal, password);
  const smile = await sincronizarSmile(cred.user);
  return { user: cred.user, smile };
}

/**
 * Crear Cuenta con Correo y Contraseña
 */
export async function registrarCuenta(email, password, nombre = '', celular = '', usuario = '') {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const foto = generarAvatarUrl(nombre, usuario);
  
  try {
    await updateProfile(cred.user, { displayName: nombre, photoURL: foto });
  } catch (pErr) {
    console.warn('No se pudo actualizar profile en Auth:', pErr);
  }

  const smile = await sincronizarSmile(cred.user, { 
    nombre, 
    celular, 
    usuario, 
    foto,
    rol: 'cliente' 
  });
  return { user: cred.user, smile };
}

/**
 * Iniciar Sesión con Google
 */
export async function iniciarConGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const smile = await sincronizarSmile(cred.user, { 
    nombre: cred.user.displayName,
    foto: cred.user.photoURL,
    rol: 'cliente' 
  });
  return { user: cred.user, smile };
}


/**
 * Cerrar Sesión
 */
export async function cerrarSesion() {
  await signOut(auth);
  removels('wiSmile');
}

/**
 * Obtener usuario actual desde Local-First o Firebase
 */
export function getSmileLocal() {
  const smile = getls('wiSmile');
  if (smile && smile.usuario) {
    smile.usuario = limpiarUsuario(smile.usuario);
  }
  return smile;
}

/**
 * Escuchador de estado de autenticación
 */
export function escucharAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const local = getSmileLocal();
      if (!local || local.uid !== user.uid) {
        const synced = await sincronizarSmile(user);
        callback(user, synced);
      } else {
        callback(user, local);
      }
    } else {
      callback(null, null);
    }
  });
}
