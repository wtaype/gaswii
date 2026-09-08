// src/core/widev/tema.js
// 🎨 Gestor Centralizado de Temas Visuales (witema) - Sin FOUC y 100% Confiable

export const witemas = {
  futuro: '#05080c',
  luz: '#f4f7fb',
  cielo: '#0EBEFF',
  dulce: '#FF5C69',
  paz: '#29C72E',
  oro: '#FFDA34',
  mora: '#7000FF',
  formal: '#1d4ed8'
};

/**
 * Aplica el tema inmediatamente al DOM y actualiza localStorage y meta theme-color
 */
export function setTema(name) {
  if (!name) return;
  const themeName = (name === 'luz' || name === 'futuro') ? name : 'futuro';
  const color = witemas[themeName] || '#05080c';
  
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.dataset.theme = themeName;
    
    // Actualizar meta theme-color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;

    // Actualizar icono del botón de tema si existe
    const icon = document.getElementById('icon_theme');
    if (icon) {
      icon.className = themeName === 'futuro' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    // Resaltar botones de tema activo si existen
    document.querySelectorAll('.tema').forEach(x => {
      x.classList.toggle('mtha', x.dataset?.ths === themeName);
    });
  }

  // Guardar como cadena simple y directa para compatibilidad total con anti-FOUC
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wiTema', themeName);
    }
  } catch (e) {}
}

/**
 * Obtiene el tema guardado o detecta la preferencia del sistema operativo
 */
export function getTemaActual() {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('wiTema');
      if (saved === 'luz' || saved === 'futuro') return saved;
    } catch (e) {}
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'futuro' : 'luz';
  }
  return 'futuro';
}

/**
 * Inicializa el tema activo
 */
export function witema(defaultTheme = 'futuro') {
  if (typeof document === 'undefined') return;
  const theme = getTemaActual() || defaultTheme;
  setTema(theme);
}
