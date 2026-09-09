// src/feature/auth/components/feedback.js
// Gestor de alertas de feedback sin estilos en línea (Cero CSS inline)

export function mostrarFeedback(feedbackEl, mensaje, tipo = 'info') {
  if (!feedbackEl) return;
  feedbackEl.textContent = mensaje;
  feedbackEl.className = `auth-feedback is-visible is-${tipo}`;
}

export function ocultarFeedback(feedbackEl) {
  if (!feedbackEl) return;
  feedbackEl.textContent = '';
  feedbackEl.className = 'auth-feedback';
}
