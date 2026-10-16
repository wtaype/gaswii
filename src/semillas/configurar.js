// src/semillas/configurar.js
// 🎛️ Tablero de Control Maestro de la Aplicación (Gaswii Web)
// Configuración centralizada de capacidades, módulos, canales y parámetros globales.
// 100% JS Nativo · 0ms de latencia · Soporta orden posicional natural y comentarios.

// =============================================================================
// 1. SISTEMA & CONTROL DE ACTUALIZACIONES (Estándar Enterprise 6 Dígitos)
// =============================================================================
export const configurarSistema = {
  id: 'gaswii',
  modeloNegocio: 'delivery_y_distribucion_glp',
  modeloCatalogo: 'productos', // 'productos' | 'servicios'

  // 🧭 Menú de Navegación Dinámico y Desacoplado (Cascada de Marca Blanca)
  navegacion: [
    { id: 'pesaje',      label: { es: 'Pesaje',      en: 'Weighing' },    href: '#pesaje',      icono: 'fa-scale-balanced', color: 'color-brand-blue' },
    { id: 'productos',   label: { es: 'Productos',   en: 'Products' },    href: '#productos',   icono: 'fa-fire',           color: 'color-primary' },
    { id: 'seguridad',   label: { es: 'Seguridad',   en: 'Safety' },      href: '#seguridad',   icono: 'fa-shield-halved',  color: 'color-emerald' },
    { id: 'calculadora', label: { es: 'Calculadora', en: 'Calculator' },  href: '#calculadora', icono: 'fa-calculator',     color: 'color-gold' },
    { id: 'mapa-sede',   label: { es: 'Ubicación',   en: 'Location' },    href: '#mapa-sede',   icono: 'fa-location-dot',   color: 'color-brand-blue' },
    { id: 'nosotros',    label: { es: 'Nosotros',    en: 'About Us' },    href: '#nosotros',    icono: 'fa-building',       color: 'color-primary' },
    { id: 'blog',        label: { es: 'Blog',        en: 'Blog' },        href: '/blog',        icono: 'fa-newspaper',      color: 'color-gold' }
  ],

  // 🚀 Control de Versión y Despliegues (MMNNPP: 02.00.00 -> 200000)
  version: '2.0.0',
  versionCode: 200000,
  versionNota: 'Golden Boilerplate v2.0: Hub maestro de semillas, Bio-link oficial, 0ms y 16 módulos.',
  actualizado: '2026-10-13',

  // 🛡️ Banderas de Estado del Sistema
  modoDemo: false,              // true = modo presentación (protege datos reales)
  modoMantenimiento: false,     // true = aviso temporal de mantenimiento
  temaDefecto: 'futuro',        // 'futuro' (oscuro) | 'luz' (claro)

  // 💰 Parámetros Comerciales y de Operación
  parametros: {
    moneda: 'PEN',
    simboloMoneda: 'S/',
    pais: 'PE',
    igvTasa: 0.18,
    modalidades: [
      'Delivery a Domicilio Express (15-20 min)',
      'Recojo en Planta / Base Central'
    ],
    distritosCobertura: [
      'Surquillo',
      'Miraflores',
      'San Borja',
      'San Isidro'
    ],
    tiposValvula: [
      'Premium (Click-On 20mm)',
      'Normal (Rosca Tradicional)'
    ],
    regimenesTributarios: [
      'Régimen Especial de Renta (RER)',
      'Régimen MYPE Tributario (RMT)',
      'Régimen General (RG)',
      'Nuevo Régimen Único Simplificado (NRUS)'
    ]
  },

  // 🗄️ Colecciones Canónicas de Firestore
  colecciones: {
    usuarios: 'smiles',
    catalogo: 'productos',
    negocio: 'negocio',
    comprobantes: 'comprobantes',
    soporte: 'soporte',
    correos: 'correos',
    entradas: 'entradas',
    paginas: 'paginas',
    galeria: 'galeria',
    notepad: 'notepad'
  },

  // 🗺️ Rutas Maestras del Sistema
  rutas: {
    inicio: '/',
    login: '/login',
    cliente: '/cliente',
    personal: '/personal',
    redes: '/redes',
    terminos: '/terminos',
    privacidad: '/privacidad',
    roles: {
      cliente: '/cliente',
      personal: '/personal',
      gestor: '/personal',
      admin: '/personal'
    }
  },

  // 🏷️ Terminología Adaptable al Giro GLP
  terminologia: {
    catalogoTitulo: 'Balones de Gas & Accesorios GLP',
    catalogoTituloCorto: 'Catálogo de Balones',
    catalogoSubtitulo: 'SELECCIONA TUS BALONES O ACCESORIOS',
    itemSingular: 'Balón de Gas',
    itemsPlural: 'balones',
    aliasDireccionDefault: 'Domicilio / Entrega',
    selloConfianza: 'GARANTÍA DE PESO EXACTO EN PUERTA',
    selloIcono: 'fa-solid fa-weight-scale',
    garantiaCorta: 'OSINERGMIN Reg. 208492',
    grupo1Titulo: 'Balones Hogar (10 kg / 5 kg)',
    grupo2Titulo: 'Balones Comerciales (45 kg)',
    campoEspecialCliente: 'Tipo de Válvula',
    comprobanteConceptoDefault: 'Recarga de Balón de Gas GLP',
    rolClienteNombre: 'Cliente Gaswii',
    rolPersonalNombre: 'Despachador / Técnico',
    buscadorPlaceholder: 'Buscar balones, accesorios, válvulas...',
    notaPedidoPlaceholder: 'Indica número de departamento, timbre o referencia para el repartidor...',
    modalidadDefecto: 'Delivery Express a Domicilio (15-20 min)',
    modalidadLabel: 'Llegada en 15 a 20 min',
    enfoqueDefecto: 'Pesaje verificado con balanza digital',
    btnWhatsapp: 'WhatsApp Pedidos',
    directorioTitulo: 'Directorio de Clientes & Empresas',
    directorioSub: 'Gestión centralizada de clientes residenciales y comerciales con historial de pedidos y despacho directo.'
  }
};

// =============================================================================
// 2. MÓDULOS DE PERSONAL (Backoffice - 16 Módulos Oficiales)
// El orden en pantalla es exactamente la posición en el array (Alt + ↑ / ↓)
// Iconos: nombre directo ('store') o 'fab:marca' para redes ('fab:whatsapp')
// =============================================================================
export const configurarPersonal = {
  moduloDefecto: 'dashboard',
  modulos: [
    { id: 'dashboard', nombre: 'Dashboard',   icono: 'chart-pie',           activo: true },
    { id: 'negocio',   nombre: 'Mi negocio',  icono: 'store',               activo: true },
    { id: 'productos', nombre: 'Productos',   icono: 'box-archive',         activo: true },
    { id: 'galeria',   nombre: 'Galería',     icono: 'images',              activo: true },
    { id: 'correo',    nombre: 'Correo',      icono: 'envelope',            activo: true },
    { id: 'clientes',  nombre: 'Clientes',    icono: 'address-book',        activo: true, badge: '124' },
    { id: 'sunat',     nombre: 'SUNAT',       icono: 'file-invoice-dollar', activo: true },
    { id: 'blogs',     nombre: 'Blogs',       icono: 'newspaper',           activo: true },
    { id: 'whatsapp',  nombre: 'WhatsApp',    icono: 'fab:whatsapp',        activo: true },
    { id: 'personal',  nombre: 'Personal',    icono: 'users',               activo: true },
    { id: 'notepad',   nombre: 'Notepad',     icono: 'note-sticky',         activo: true },
    { id: 'perfil',    nombre: 'Mi perfil',   icono: 'user-gear',           activo: true },
    { id: 'ajustes',   nombre: 'Ajustes',     icono: 'gear',                activo: true },

    { id: 'ayuda',     nombre: 'Ayuda',       icono: 'headset',             activo: true },
    { id: 'aprender',  nombre: 'Aprender',    icono: 'graduation-cap',      activo: true }
  ]
};

// =============================================================================
// 3. MÓDULOS DE CLIENTE (Portal del Cliente)
// =============================================================================
export const configurarCliente = {
  moduloDefecto: 'pedidos',
  modulos: [
    { id: 'pedidos',   nombre: 'Pedir gas',   icono: 'bolt',                activo: true },
    { id: 'direccion', nombre: 'Direcciones', icono: 'map-location-dot',    activo: true, badge: '2' },
    { id: 'cuenta',    nombre: 'Mi cuenta',   icono: 'user-gear',           activo: true },
    { id: 'soporte',   nombre: 'Soporte',     icono: 'headset',             activo: true }
  ]
};

// =============================================================================
// 4. CANALES DE REDES (Bio-Link Oficial & Enlaces Directos)
// =============================================================================
export const configurarRedes = {
  canales: [
    { id: 'whatsapp',  nombre: 'WhatsApp SOS',  icono: 'fab:whatsapp',    badge: 'Pedidos Express', activo: true },
    { id: 'telefono',  nombre: 'Central Fija',  icono: 'phone',           badge: 'Llamada Directa', activo: true },
    { id: 'web',       nombre: 'Web Oficial',   icono: 'globe',           badge: 'Portal Online',   activo: true },
    { id: 'facebook',  nombre: 'Facebook',     icono: 'fab:facebook-f',  badge: 'Comunidad',       activo: true },
    { id: 'instagram', nombre: 'Instagram',    icono: 'fab:instagram',   badge: 'Promociones',     activo: true },
    { id: 'tiktok',    nombre: 'TikTok',       icono: 'fab:tiktok',      badge: 'Consejos & Tips', activo: true },
    { id: 'maps',      nombre: 'Ubicación Sede', icono: 'location-dot',    badge: 'Planta Surquillo',activo: true }
  ]
};

// =============================================================================
// 5. HELPERS INTELIGENTES DE ALTO RENDIMIENTO (0ms)
// =============================================================================

/**
 * Resuelve la clase FontAwesome normalizando 'chart-pie' a 'fa-solid fa-chart-pie'
 * o 'fab:whatsapp' a 'fa-brands fa-whatsapp'
 * @param {string} ico
 * @returns {string}
 */
export const resolverIcono = (ico = '') => {
  if (!ico) return '';
  if (ico.includes('fa-')) return ico;
  if (ico.startsWith('fab:')) return `fa-brands fa-${ico.slice(4)}`;
  return `fa-solid fa-${ico}`;
};

/**
 * Consulta si un módulo de Personal está activo en el sistema
 * @param {string} id - Identificador del módulo ('sunat', 'correo', etc.)
 * @returns {boolean}
 */
export const tieneCapacidad = (id) =>
  configurarPersonal.modulos.some(m => m.id === id && m.activo);

/**
 * Obtiene los módulos activos de Personal en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getModulosPersonal = () =>
  configurarPersonal.modulos
    .filter(m => m.activo)
    .map(m => {
      const clase = resolverIcono(m.icono);
      return { ...m, icono: clase, iconoClase: clase };
    });

/**
 * Obtiene los módulos activos del Portal Cliente en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getModulosCliente = () =>
  configurarCliente.modulos
    .filter(m => m.activo)
    .map(m => {
      const clase = resolverIcono(m.icono);
      return { ...m, icono: clase, iconoClase: clase };
    });

/**
 * Obtiene los canales de redes activos en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getCanalesRedes = () =>
  configurarRedes.canales
    .filter(c => c.activo)
    .map(c => {
      const clase = resolverIcono(c.icono);
      return { ...c, icono: clase, iconoClase: clase };
    });

// Exportación por defecto consolidada para máxima interoperabilidad
export default {
  sistema: configurarSistema,
  personal: configurarPersonal,
  cliente: configurarCliente,
  redes: configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
};
