// src/feature/auth/components/ingresar.js
// Formulario de inicio de sesión, plantillas localizadas y llamadas de autenticación bajo demanda
// Solgas Surquillo (Gaswii)

import { wiSpin, Mensaje } from '../../../core/widev/widev.js';
import { entrar } from '../sesion.js';
import { t } from '../idioma/idioma.js';
import { auth, googleProvider } from '../../../core/config/firebase-auth.ts';
import { db } from '../../../core/config/firebase-db.ts';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, getDocs,
  collection, query, where, limit, serverTimestamp
} from 'firebase/firestore';

// Mapeo de errores Firebase — claves del JSON, sin exponer códigos internos
export const mapearErrorAuth = (e) => {
  const txt = t();
  const map = {
    'auth/invalid-credential':    txt.err_invalid_credential,
    'auth/wrong-password':        txt.err_wrong_password,
    'auth/user-not-found':        txt.err_user_not_found,
    'auth/email-already-in-use':  txt.err_email_in_use,
    'auth/weak-password':         txt.err_weak_password,
    'auth/invalid-email':         txt.err_invalid_email,
    'auth/too-many-requests':     txt.err_too_many,
    'auth/popup-closed-by-user':  txt.err_popup_closed,
    'auth/network-request-failed':txt.err_network
  };
  return map[e?.code || ''] || txt.err_unexpected;
};

// Helper para dibujar campos de formulario
export const campo = (ico, tipo, id, place, ojo = false) => `
  <div class="wilg_grupo">
    <i class="fa-solid fa-${ico}"></i>
    <input type="${tipo}" id="${id}" placeholder="${place}" autocomplete="off">
    ${ojo ? '<i class="fa-solid fa-eye wilg_ojo"></i>' : ''}
  </div>`;

// Template HTML del formulario de ingreso
export const tplLogin = () => {
  const txt = t();
  return `
  <div class="wilg_head">
    <img src="/imgwii/logo.webp" alt="Solgas Surquillo" class="wilg_brand_logo" onerror="this.src='/favicon.ico'">
    <h2>${txt.bienvenido_de_vuelta}</h2>
    <p>${txt.bienvenido_sub}</p>
  </div>
  <button type="button" class="wilg_btn_google" id="btnGoogle">
    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> ${txt.btn_google}
  </button>
  <div class="wilg_or"><span>${txt.o_usa_email}</span></div>
  ${campo('envelope', 'text', 'email', txt.usuario_o_correo_ph)}
  ${campo('lock', 'password', 'password', txt.pass_ph, true)}
  <button type="button" id="Login" class="wilg_btn inactivo" disabled>
    <i class="fa-solid fa-right-to-bracket"></i> ${txt.btn_login}
  </button>
  <div class="wilg_links_col">
    <p class="wilg_foot_row">
      <span>${txt.no_tienes_cuenta}</span>
      <span class="wilg_reg">${txt.crear_cuenta_gratis}</span>
    </p>
    <span class="wilg_rec"><i class="fa-solid fa-key"></i> ${txt.link_olvidaste}</span>
  </div>`;
};

// Template HTML para completar usuario nuevo de Google SSO
export const tplUsername = () => {
  const txt = t();
  return `
  <div class="wilg_head">
    <img src="/imgwii/logo.webp" alt="Solgas Surquillo" class="wilg_brand_logo" onerror="this.src='/favicon.ico'">
    <h2>${txt.casi_listo}</h2>
    <p>${txt.casi_listo_sub}</p>
  </div>
  ${campo('user', 'text', 'regUsuario', txt.usuario_ph_google)}
  <button type="button" id="CompletarGoogle" class="wilg_btn inactivo" disabled>
    <i class="fa-solid fa-rocket"></i> ${txt.completar_registro}
  </button>`;
};

// Activar o desactivar botón de login según inputs
export const checkLoginBtn = () => {
  const loginBtn = document.getElementById('Login');
  if (!loginBtn) return;
  const ok = (document.getElementById('email')?.value.trim().length || 0) > 0
          && (document.getElementById('password')?.value.length || 0) >= 6;
  loginBtn.classList.toggle('inactivo', !ok);
  loginBtn.disabled = !ok;
};

// Iniciar sesión ordinaria (Soporta Email y Usuario con Firebase Real)
export const iniciarSesionOrdinaria = async (btn) => {
  const input = document.getElementById('email')?.value.trim() || '';
  const pass  = document.getElementById('password')?.value || '';
  if (!input || pass.length < 6) return;

  const txt = t();
  wiSpin(btn, true, txt.signing_in);
  try {
    let email = input;

    // Resolver username → email solo si no contiene '@'
    if (!input.includes('@')) {
      const q = query(collection(db, 'smiles'), where('usuario', '==', input.toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) throw { code: 'auth/user-not-found' };
      email = snap.docs[0].data().email;
    }

    const { user } = await signInWithEmailAndPassword(auth, email, pass);

    // Leer perfil de Firestore
    const docSnap = await getDoc(doc(db, 'smiles', user.uid));
    const profile = docSnap.exists()
      ? docSnap.data()
      : {
          uid: user.uid, email: user.email || email,
          nombre: user.displayName || 'Vecino Solgas',
          usuario: email.split('@')[0],
          rol: 'cliente', plan: 'vip', activo: true
        };

    if (!docSnap.exists()) {
      setDoc(doc(db, 'smiles', user.uid), { ...profile, creado: serverTimestamp(), actualizado: serverTimestamp() }).catch(() => {});
    }

    entrar(profile);
  } catch (e) {
    console.error('Login error:', e);
    Mensaje(mapearErrorAuth(e), 'error');
  } finally {
    wiSpin(btn, false);
  }
};

// Iniciar sesión con Google SSO
export const iniciarGoogleSSO = async (btn) => {
  wiSpin(btn, true, t().connecting);
  try {
    const res  = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const docRef  = doc(db, 'smiles', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      entrar(docSnap.data());
    } else {
      const profile = {
        uid: user.uid, email: user.email || '',
        nombre: user.displayName || 'Vecino Solgas',
        foto: user.photoURL || '',
        usuario: (user.email?.split('@')[0] || 'usuario') + '_' + Math.floor(100 + Math.random() * 900),
        rol: 'cliente', plan: 'vip', activo: true
      };
      setDoc(docRef, { ...profile, creado: serverTimestamp(), actualizado: serverTimestamp() }).catch(() => {});
      entrar(profile);
    }
  } catch (e) {
    if (e?.code !== 'auth/popup-closed-by-user') {
      console.error('Google SSO error:', e);
      Mensaje(mapearErrorAuth(e), 'error');
    }
  } finally {
    wiSpin(btn, false);
  }
};
