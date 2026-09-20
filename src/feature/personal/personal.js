// src/feature/personal/personal.js
// Controlador de cliente unificado para Feature Personal (Gaswii Solgas Surquillo)
// Cero TypeScript · 100% JavaScript Nativo · Integrado con widev.js y auth/sesion.js

import { Notificacion, wiConfirmar, getls } from '@widev';
import { salir } from '@/feature/auth/sesion.js';

// Exponer en window para utilidades modulares
window.Notificacion = Notificacion;
window.wiConfirmar = wiConfirmar;

export function inicializarPersonal() {
  // 1. Desactivar estrictamente cualquier autocompletado en el buscador
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.value = '';
  }

  // 2. Hidratación de Datos Reales del Usuario desde wiSmile (Firebase Auth)
  const user = getls('wiSmile');
  if (user) {
    const avatarImg = document.getElementById('topbarUserImg');
    const topName = document.getElementById('topbarUserName');
    const dropName = document.getElementById('dropdownUserName');
    const dropEmail = document.getElementById('dropdownUserEmail');

    // Usar la foto/avatar real de Firebase smiles (no iniciales)
    if (avatarImg && (user.foto || user.avatar)) {
      avatarImg.src = user.foto || user.avatar;
    }
    if (topName && (user.nombre || user.usuario)) {
      topName.textContent = user.nombre || user.usuario;
    }
    if (dropName && (user.nombre || user.usuario)) {
      dropName.textContent = user.nombre || user.usuario;
    }
    if (dropEmail && user.email) {
      dropEmail.textContent = user.email;
    }
  }

  // 3. Navegación entre Módulos
  const navItems = document.querySelectorAll('.ps-nav-item');
  const panels = document.querySelectorAll('.ps-panel');

  function switchPanel(targetId) {
    navItems.forEach(item => {
      const isTarget = item.getAttribute('data-panel-target') === targetId;
      item.classList.toggle('active', isTarget);
    });

    panels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${targetId}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-panel-target');
      if (target) switchPanel(target);
    });
  });

  document.querySelectorAll('[data-jump-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.getAttribute('data-jump-to');
      if (dest) {
        closeDropdown();
        switchPanel(dest);
      }
    });
  });

  // 4. Colapsar / Expandir Sidebar
  const btnCollapse = document.getElementById('btnCollapseSidebar');
  const iconCollapse = document.getElementById('iconCollapse');
  const labelCollapse = document.getElementById('labelCollapse');

  function toggleSidebar() {
    const isCollapsed = document.documentElement.classList.toggle('is-collapsed');
    try {
      localStorage.setItem('gaswii_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch (e) {}

    if (iconCollapse && labelCollapse) {
      if (isCollapsed) {
        iconCollapse.className = 'fa-solid fa-arrow-right-long';
        labelCollapse.textContent = 'Expandir';
      } else {
        iconCollapse.className = 'fa-solid fa-arrow-left-long';
        labelCollapse.textContent = 'Colapsar';
      }
    }
  }

  btnCollapse?.addEventListener('click', toggleSidebar);

  // 5. Conmutador de Temas (Futuro / Luz)
  const btnTheme = document.getElementById('btnThemeToggle');
  btnTheme?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'futuro';
    const next = current === 'futuro' ? 'luz' : 'futuro';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('gaswii-theme', next);
    } catch (e) {}

    if (window.Notificacion) {
      window.Notificacion(
        `Tema cambiado a ${next === 'futuro' ? 'Modo Futuro (Oscuro)' : 'Modo Luz (Claro)'}`,
        'info',
        2000
      );
    }
  });

  // 6. Dropdown Flotante del Usuario
  const btnUserDropdown = document.getElementById('btnUserDropdownTrigger');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const btnLogoutSession = document.getElementById('btnLogoutSession');

  function toggleDropdown(e) {
    e?.stopPropagation();
    const isOpen = userDropdownMenu?.classList.toggle('active');
    btnUserDropdown?.classList.toggle('open', isOpen);
  }

  function closeDropdown() {
    userDropdownMenu?.classList.remove('active');
    btnUserDropdown?.classList.remove('open');
  }

  btnUserDropdown?.addEventListener('click', toggleDropdown);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ps-user-container')) {
      closeDropdown();
    }
  });

  // 7. Cierre de Sesión Seguro (widev wiConfirmar + auth/sesion.js)
  btnLogoutSession?.addEventListener('click', async () => {
    closeDropdown();
    if (window.wiConfirmar) {
      const conf = await window.wiConfirmar('¿Estás seguro de que deseas cerrar tu sesión administrativa?', {
        titulo: 'Cerrar Sesión',
        tipo: 'danger',
        siTexto: 'Sí, Salir',
        noTexto: 'Cancelar'
      });
      if (conf) {
        if (window.Notificacion) {
          window.Notificacion('Sesión cerrada correctamente', 'info', 2500);
        }
        setTimeout(() => {
          salir();
        }, 700);
      }
    } else {
      salir();
    }
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPersonal);
} else {
  inicializarPersonal();
}
