// src/feature/auth/components/login.js
// 🔐 Controlador de inicio de sesión (Usuario o Correo)

import { wiTip } from '../../../core/widev/witip.js';
import { iniciarSesion } from '../auth.js';
import { mostrarFeedback } from './feedback.js';
import authEs from '../idioma/es.json';
import authEn from '../idioma/en.json';

export async function ejecutarLogin(userInputEl, passInputEl, feedbackEl, idioma = 'es') {
  const t = idioma === 'en' ? authEn : authEs;
  const userInput = userInputEl ? userInputEl.value.trim() : '';
  const pass = passInputEl ? passInputEl.value : '';

  if (!userInput) {
    wiTip(userInputEl, t.tip_enter_user, 'warning', 2000);
    userInputEl?.focus();
    return null;
  }

  if (!pass || pass.length < 6) {
    wiTip(passInputEl, t.tip_min_pass, 'warning', 2000);
    passInputEl?.focus();
    return null;
  }

  if (feedbackEl) {
    mostrarFeedback(feedbackEl, t.msg_connecting, 'info');
  }

  try {
    const res = await iniciarSesion(userInput, pass);
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, t.msg_login_ok, 'success');
    }
    return res;
  } catch (err) {
    console.error('Error de login:', err);
    let msg = t.err_login_credentials;
    if (err.code === 'auth/user-not-found' || err.message === 'Usuario no encontrado') {
      msg = t.err_user_not_found;
    }
    if (feedbackEl) {
      mostrarFeedback(feedbackEl, msg, 'error');
    }
    wiTip(userInputEl, msg, 'error', 2500);
    throw err;
  }
}
