// src/feature/auth/components/registro.js
// 🔍 Validaciones en tiempo real para registro con wiTip y 2 columnas

import { wiTip } from '../../../core/widev/witip.js';
import { existeUsuario, existeEmail, limpiarUsuario, registrarCuenta } from '../auth.js';
import { mostrarFeedback } from './feedback.js';

let debounceUserTimer = null;
let debounceEmailTimer = null;

/**
 * Valida disponibilidad del nombre de usuario con wiTip
 */
export async function validarUsuarioEnVivo(inputEl, idioma = 'es') {
  if (!inputEl) return false;
  clearTimeout(debounceUserTimer);

  const raw = inputEl.value.trim();
  if (!raw) return false;

  const limpio = limpiarUsuario(raw);
  inputEl.value = limpio;

  if (limpio.length < 3) {
    wiTip(inputEl, idioma === 'en' ? 'Minimum 3 characters' : 'Mínimo 3 caracteres', 'warning', 2000);
    inputEl.dataset.valido = 'false';
    return false;
  }

  return new Promise((resolve) => {
    debounceUserTimer = setTimeout(async () => {
      const existe = await existeUsuario(limpio);
      if (existe) {
        wiTip(inputEl, idioma === 'en' ? 'Username already taken' : 'Este usuario ya está en uso', 'error', 2500);
        inputEl.dataset.valido = 'false';
        resolve(false);
      } else {
        wiTip(inputEl, idioma === 'en' ? 'Username available!' : '¡Usuario disponible!', 'success', 2000);
        inputEl.dataset.valido = 'true';
        resolve(true);
      }
    }, 350);
  });
}

/**
 * Valida formato y disponibilidad del correo electrónico con wiTip
 */
export async function validarEmailEnVivo(inputEl, idioma = 'es') {
  if (!inputEl) return false;
  clearTimeout(debounceEmailTimer);

  const email = inputEl.value.trim().toLowerCase();
  if (!email) return false;

  const regex = /^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!regex.test(email)) {
    wiTip(inputEl, idioma === 'en' ? 'Invalid email format' : 'Correo electrónico no válido', 'warning', 2000);
    inputEl.dataset.valido = 'false';
    return false;
  }

  return new Promise((resolve) => {
    debounceEmailTimer = setTimeout(async () => {
      const existe = await existeEmail(email);
      if (existe) {
        wiTip(inputEl, idioma === 'en' ? 'Email already registered' : 'Este correo ya tiene cuenta', 'error', 2500);
        inputEl.dataset.valido = 'false';
        resolve(false);
      } else {
        wiTip(inputEl, idioma === 'en' ? 'Email available!' : '¡Correo disponible!', 'success', 2000);
        inputEl.dataset.valido = 'true';
        resolve(true);
      }
    }, 350);
  });
}

/**
 * Valida coincidencia de contraseñas con wiTip
 */
export function validarPasswordConfirm(passEl, confirmEl, idioma = 'es') {
  if (!confirmEl || !passEl) return false;
  const p1 = passEl.value;
  const p2 = confirmEl.value;

  if (!p2) return false;

  if (p1 !== p2) {
    wiTip(confirmEl, idioma === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden', 'error', 2200);
    confirmEl.dataset.valido = 'false';
    return false;
  } else {
    wiTip(confirmEl, idioma === 'en' ? 'Passwords match' : 'Las contraseñas coinciden', 'success', 1800);
    confirmEl.dataset.valido = 'true';
    return true;
  }
}

/**
 * Ejecuta el registro completo con validación y llamadas seguras
 */
export async function ejecutarRegistro({ nombreEl, celularEl, usuarioEl, emailEl, passEl, passConfirmEl, feedbackEl, idioma = 'es' }) {
  const nombre = nombreEl?.value.trim() || '';
  const celular = celularEl?.value.trim() || '';
  const usuario = limpiarUsuario(usuarioEl?.value.trim() || '');
  const email = emailEl?.value.trim().toLowerCase() || '';
  const pass = passEl?.value || '';
  const passConfirm = passConfirmEl?.value || '';

  if (!nombre) {
    wiTip(nombreEl, idioma === 'en' ? 'Enter your name' : 'Ingresa tu nombre completo', 'warning', 2000);
    nombreEl?.focus();
    return null;
  }

  if (!celular) {
    wiTip(celularEl, idioma === 'en' ? 'Enter your phone number' : 'Ingresa tu celular de contacto', 'warning', 2000);
    celularEl?.focus();
    return null;
  }

  if (!usuario || usuario.length < 3) {
    wiTip(usuarioEl, idioma === 'en' ? 'Username too short' : 'El usuario debe tener al menos 3 letras', 'warning', 2000);
    usuarioEl?.focus();
    return null;
  }

  if (!email) {
    wiTip(emailEl, idioma === 'en' ? 'Enter your email' : 'Ingresa tu correo electrónico', 'warning', 2000);
    emailEl?.focus();
    return null;
  }

  if (!pass || pass.length < 6) {
    wiTip(passEl, idioma === 'en' ? 'Minimum 6 characters' : 'La contraseña debe tener al menos 6 caracteres', 'warning', 2000);
    passEl?.focus();
    return null;
  }

  if (pass !== passConfirm) {
    wiTip(passConfirmEl, idioma === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden', 'error', 2000);
    passConfirmEl?.focus();
    return null;
  }

  if (feedbackEl) {
    mostrarFeedback(feedbackEl, idioma === 'en' ? 'Creating your account...' : 'Creando tu cuenta...', 'info');
  }

  try {
    const res = await registrarCuenta(email, pass, nombre, celular, usuario);
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, idioma === 'en' ? 'Account created! Welcome!' : '¡Cuenta creada! Bienvenido a Gaswii...', 'success');
    }
    return res;
  } catch (err) {
    console.error('Error al registrar cuenta:', err);
    let msg = idioma === 'en' ? 'Registration error. Check your information.' : 'Error al registrarte. Revisa tus datos.';
    if (err.code === 'auth/email-already-in-use') {
      msg = idioma === 'en' ? 'Email already in use. Please sign in.' : 'Este correo ya tiene cuenta. Inicia sesión.';
      wiTip(emailEl, msg, 'error', 2500);
    } else if (err.code === 'auth/weak-password') {
      msg = idioma === 'en' ? 'Password is too weak.' : 'La contraseña es muy débil.';
      wiTip(passEl, msg, 'warning', 2500);
    }
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, msg, 'error');
    }
    throw err;
  }
}
