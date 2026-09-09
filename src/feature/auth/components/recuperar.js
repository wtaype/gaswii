// src/feature/auth/components/recuperar.js
// 🔑 Módulo de recuperación de contraseña con wiTip y feedback

import { wiTip } from '../../../core/widev/witip.js';
import { recuperarPassword } from '../auth.js';
import { mostrarFeedback } from './feedback.js';

export async function procesarRecuperacion(inputEl, feedbackEl, idioma = 'es') {
  if (!inputEl) return;
  const valor = inputEl.value.trim();

  if (!valor) {
    wiTip(inputEl, idioma === 'en' ? 'Enter your username or email' : 'Ingresa tu usuario o correo', 'warning', 2500);
    inputEl.focus();
    return;
  }

  if (feedbackEl) {
    mostrarFeedback(feedbackEl, idioma === 'en' ? 'Sending reset link...' : 'Enviando enlace de restablecimiento...', 'info');
  }

  try {
    const emailDestino = await recuperarPassword(valor);
    if (feedbackEl) {
      mostrarFeedback(
        feedbackEl,
        idioma === 'en'
          ? `Reset link sent to ${emailDestino}. Check your inbox!`
          : `¡Enlace enviado a ${emailDestino}! Revisa tu bandeja de entrada.`,
        'success'
      );
    }
    wiTip(inputEl, idioma === 'en' ? 'Link sent!' : '¡Enlace enviado con éxito!', 'success', 3000);
  } catch (err) {
    console.error('Error al recuperar clave:', err);
    if (feedbackEl) {
      mostrarFeedback(
        feedbackEl,
        idioma === 'en'
          ? 'User not found. Check spelling or use your registered email.'
          : 'Usuario no encontrado. Revisa o ingresa tu correo registrado.',
        'error'
      );
    }
    wiTip(inputEl, idioma === 'en' ? 'User not found' : 'No encontramos este usuario', 'error', 2500);
  }
}
