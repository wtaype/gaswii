// src/feature/personal/modulos.js
// Registro y configuración central de módulos para el Feature Personal (Solgas Surquillo)
// Permite activar/desactivar módulos con la bandera 'activo' fácilmente

export const modulos = [
  { id: 'dashboard', nombre: 'Dashboard',  icono: 'fa-solid fa-chart-pie',          activo: true },
  { id: 'notepad',   nombre: 'Notepad',    icono: 'fa-solid fa-note-sticky',        activo: true },
  { id: 'business',  nombre: 'Mi negocio', icono: 'fa-solid fa-store',              activo: true },
  { id: 'products',  nombre: 'Productos',  icono: 'fa-solid fa-box-archive',        activo: true },
  { id: 'sunat',     nombre: 'SUNAT',      icono: 'fa-solid fa-file-invoice-dollar', activo: true },
  { id: 'email',     nombre: 'Correo',     icono: 'fa-solid fa-envelope',           activo: true },
  { id: 'gallery',   nombre: 'Galeria',    icono: 'fa-solid fa-images',             activo: true },
  { id: 'posts',     nombre: 'Entradas',   icono: 'fa-solid fa-newspaper',          activo: true },
  { id: 'pages',     nombre: 'Páginas',    icono: 'fa-solid fa-file-lines',         activo: true },
  { id: 'staff',     nombre: 'Personal',   icono: 'fa-solid fa-users',              activo: true },
  { id: 'customers', nombre: 'Clientes',   icono: 'fa-solid fa-address-book',       activo: true, badge: '124' },
  { id: 'whatsapp',  nombre: 'WhatsApp',   icono: 'fa-brands fa-whatsapp',          activo: true },
  { id: 'profile',   nombre: 'Mi perfil',  icono: 'fa-solid fa-user-gear',          activo: true },
  { id: 'settings',  nombre: 'Ajustes',    icono: 'fa-solid fa-gear',               activo: true }
];

// Obtener solo los módulos habilitados para el sidebar
export const getModulosActivos = () => modulos.filter(m => m.activo);
