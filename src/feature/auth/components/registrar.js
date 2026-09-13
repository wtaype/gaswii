// src/feature/auth/components/registrar.js
// Plantilla de registro, sanitizacion, validaciones y creacion de cuenta bajo demanda
// Solgas Surquillo (Gaswii)

import { wiSpin, Mensaje, wiTip, wiRateLimit } from '../../../core/widev/widev.js';
import { entrar } from '../sesion.js';
import { campo, mapearErrorAuth } from './ingresar.js';
import { t } from '../idioma/idioma.js';
import { camposRegistro } from '../data/campos.js';
import { auth } from '../../../core/config/firebase-auth.ts';
import { db } from '../../../core/config/firebase-db.ts';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, limit, serverTimestamp } from 'firebase/firestore';

// --- SANITIZACIÓN ESTRICTA ---
export const sanName    = v => v.replace(/[<>="'`;/\\$}{]/g, '').replace(/\s{2,}/g, ' ');
export const sanEmail   = v => v.replace(/[<>="'`;/\\$}{ ]/g, '').toLowerCase().trim();
export const sanUser    = v => v.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
export const sanCelular = v => v.replace(/[^0-9+ ]/g, '').trim();

const sans = { sanName, sanEmail, sanUser, sanCelular };

// Debounce unificado
const debounce = (fn, ms = 500) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };

// Reglas de validación — síncronas, mensajes del JSON
export const reglas = {
  regEmail:     [sanEmail,   v => /^[\w.-]+([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v) || t().val_invalid_email],
  regUsuario:   [sanUser,    v => v.length >= 3 || t().val_min3],
  regNombre:    [sanName,    v => v.length > 0  || t().val_nombre_requerido],
  regCelular:   [sanCelular, v => v.length >= 9  || t().val_celular_min9],
  regPassword:  [v => v,     v => v.length >= 6  || t().val_min6],
  regPassword1: [v => v,     v => v === (document.getElementById('regPassword')?.value || '') || t().val_pass_no_match]
};

// Template HTML del formulario de registro — itera camposRegistro
export const tplRegistrar = () => {
  const txt = t();
  const inputs = camposRegistro.map(c => campo(c.ico, c.tipo, c.id, txt[c.key_ph], c.ojo)).join('');
  return `
  <div class="wilg_head">
    <img src="/imgwii/logo.webp" alt="Solgas Surquillo" class="wilg_brand_logo" onerror="this.src='/favicon.ico'">
    <h2>${txt.registro_titulo}</h2>
    <p>${txt.registro_sub}</p>
  </div>
  <button type="button" class="wilg_btn_google" id="btnGoogle">
    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> ${txt.google_registro}
  </button>
  <div class="wilg_or"><span>${txt.o_completa_datos}</span></div>
  <div class="wilg_grid">${inputs}</div>
  <button type="button" id="Registrar" class="wilg_btn inactivo" disabled>
    <i class="fa-solid fa-user-plus"></i> ${txt.btn_registro}
  </button>
  <div class="wilg_links_col">
    <p class="wilg_foot_row">
      <span>${txt.ya_tengo_cuenta}</span>
      <span class="wilg_log">${txt.link_ya_tengo_cuenta}</span>
    </p>
  </div>`;
};

// Comprobación del botón de registro
export const checkRegisterBtn = () => {
  const btn = document.getElementById('Registrar');
  if (!btn) return;
  const ok = camposRegistro.every(c => document.getElementById(c.id)?.value.trim().length > 0);
  btn.classList.toggle('inactivo', !ok);
  btn.disabled = !ok;
};

// Comprobación del botón Completar Google
export const checkCompleteBtn = () => {
  const btn = document.getElementById('CompletarGoogle');
  if (!btn) return;
  const ok = (document.getElementById('regUsuario')?.value.trim().length || 0) >= 3;
  btn.classList.toggle('inactivo', !ok);
  btn.disabled = !ok;
};

// Validar un campo individual
export const checkField = (el, force = false) => {
  if (!el) return;
  const [san, rule] = reglas[el.id] || [];
  if (!san || !rule) return;
  const val = san(el.value);
  if (val !== el.value) el.value = val;
  const result = rule(val);
  if (result !== true) {
    if (force || val.length > 0) wiTip(el, result, 'error');
  } else {
    wiTip(el, '', 'ok');
  }
};

// Verificación de disponibilidad de usuario en Firestore (debounced)
export const checkUsuarioDisponible = debounce(async (el) => {
  const val = sanUser(el.value);
  if (val.length < 3) return;
  try {
    const snap = await getDocs(query(collection(db, 'smiles'), where('usuario', '==', val), limit(1)));
    wiTip(el, snap.empty ? t().tip_user_ok : t().tip_user_exists, snap.empty ? 'ok' : 'error');
  } catch { /* silencioso */ }
});

// Verificación de disponibilidad de email en Firestore (debounced)
export const checkEmailDisponible = debounce(async (el) => {
  const val = sanEmail(el.value);
  if (!/^[\w.-]+([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val)) return;
  try {
    const snap = await getDocs(query(collection(db, 'smiles'), where('email', '==', val), limit(1)));
    wiTip(el, snap.empty ? t().tip_email_ok : t().tip_email_exists, snap.empty ? 'ok' : 'error');
  } catch { /* silencioso */ }
});

// Registrar usuario
export const registrarUsuario = async (btn) => {
  const txt = t();

  const datos = Object.fromEntries(
    camposRegistro.map(c => {
      const el = document.getElementById(c.id);
      const san = c.san ? sans[c.san] : v => v;
      return [c.id, san(el?.value.trim() || '')];
    })
  );

  // Validación de todos los campos
  for (const c of camposRegistro) {
    const rule = reglas[c.regla];
    if (!rule) continue;
    const result = rule[1](datos[c.id] || '');
    if (result !== true) {
      const el = document.getElementById(c.id);
      if (el) wiTip(el, result, 'error');
      return;
    }
  }

  if (!wiRateLimit('registro', 3, 60)) return Mensaje(txt.err_too_many, 'error');

  wiSpin(btn, true, txt.btn_registro + '...');
  try {
    const { user } = await createUserWithEmailAndPassword(auth, datos.regEmail, datos.regPassword);

    const profile = {
      uid: user.uid, email: datos.regEmail, nombre: datos.regNombre,
      usuario: datos.regUsuario, celular: datos.regCelular, foto: '',
      rol: 'cliente', plan: 'estandar', activo: true, estado: 'activo',
      puntos: 0, direcciones: []
    };

    // updateProfile y setDoc en paralelo
    await Promise.all([
      updateProfile(user, { displayName: datos.regNombre }),
      setDoc(doc(db, 'smiles', user.uid), { ...profile, creado: serverTimestamp(), actualizado: serverTimestamp() })
    ]);

    entrar(profile);
  } catch (e) {
    console.error('Registro error:', e);
    Mensaje(mapearErrorAuth(e), 'error');
  } finally {
    wiSpin(btn, false);
  }
};
