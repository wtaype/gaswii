// src/feature/auth/components/login.js
// 🔐 Controlador de inicio de sesión (Usuario o Correo)

import { wiTip } from '../../../core/widev/witip.js';
import { iniciarSesion } from '../auth.js';
import { mostrarFeedback } from './feedback.js';

export async function ejecutarLogin(userInputEl, passInputEl, feedbackEl, idioma = 'es') {
  const userInput = userInputEl ? userInputEl.value.trim() : '';
  const pass = passInputEl ? passInputEl.value : '';

  if (!userInput) {
    wiTip(userInputEl, idioma === 'en' ? 'Enter username or email' : 'Ingresa tu usuario o correo', 'warning', 2000);
    userInputEl?.focus();
    return null;
  }

  if (!pass || pass.length < 6) {
    wiTip(passInputEl, idioma === 'en' ? 'Minimum 6 characters' : 'Mínimo 6 caracteres', 'warning', 2000);
    passInputEl?.focus();
    return null;
  }

  if (feedbackEl) {
    mostrarFeedback(feedbackEl, idioma === 'en' ? 'Connecting securely...' : 'Conectando de forma segura...', 'info');
  }

  try {
    const res = await iniciarSesion(userInput, pass);
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, idioma === 'en' ? 'Access granted! Redirecting...' : '¡Acceso exitoso! Entrando...', 'success');
    }
    return res;
  } catch (err) {
    console.error('Error de login:', err);
    let msg = idioma === 'en' ? 'Incorrect user, email, or password.' : 'Usuario, correo o contraseña incorrectos.';
    if (err.code === 'auth/user-not-found' || err.message === 'Usuario no encontrado') {
      msg = idioma === 'en' ? 'User not found. Check or use your email.' : 'Usuario no encontrado. Revisa o usa tu correo.';
    }
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, msg, 'error');
    }
    wiTip(userInputEl, msg, 'error', 2500);
    throw err;
  }
}
