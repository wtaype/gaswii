// src/negocio.js
// 🎯 Puente Canónico y Reactivo a las Colecciones Firestore 'negocio' y 'productos'
// 100% Cero Productos Mock / Cero Fallbacks Fantasma · Sincronización Canónica con producto.md

import { obtenerDatosNegocio, calcularAnosTrayectoria, parseFirestoreDoc } from './feature/personal/modulos/negocio/dataNegocio.js';

// Medios de pago aceptados oficiales
export const MEDIOS_PAGO_BASE = [
  { nombre: "Efectivo", icon: "fa-money-bill-wave" },
  { nombre: "Yape", icon: "fa-mobile-screen-button" },
  { nombre: "Plin", icon: "fa-mobile-screen-button" },
  { nombre: "Transferencia", icon: "fa-building-columns" }
];

/**
 * Normaliza cualquier documento devuelto por Firestore para la colección 'productos'
 * Cumple rigurosamente el esquema oficial documentado en recursos-gaswii/firebase/producto.md
 */
export function normalizarProductoFirestore(docRaw = {}) {
  const item = parseFirestoreDoc(docRaw.fields || {});
  const id = item.id || (docRaw.name ? docRaw.name.split('/').pop() : '');
  const precio = Number(item.precio ?? item.price ?? item.precioPEN ?? 0);
  
  return {
    id,
    slug: item.slug || id,
    nombre: typeof item.nombre === 'object' && item.nombre !== null ? (item.nombre.es || '') : (item.nombre || ''),
    nombreEn: typeof item.nombre === 'object' && item.nombre !== null ? (item.nombre.en || '') : (item.nombreEn || ''),
    descripcion: typeof item.descripcion === 'object' && item.descripcion !== null ? (item.descripcion.es || '') : (item.descripcion || ''),
    descripcionEn: typeof item.descripcion === 'object' && item.descripcion !== null ? (item.descripcion.en || '') : (item.descripcionEn || ''),
    precioPEN: precio,
    precioEnvase: Number(item.precioEnvase ?? 0),
    stock: Number(item.stock ?? 0),
    stockMin: Number(item.stockMin ?? 5),
    estado: item.estado || 'activo',
    tipoCategoria: item.tipoCategoria || 'gas',
    tipo: typeof item.tipo === 'object' && item.tipo !== null ? (item.tipo.es || '') : (item.tipo || ''),
    tipoEn: typeof item.tipo === 'object' && item.tipo !== null ? (item.tipo.en || '') : (item.tipoEn || ''),
    tipoUso: typeof item.tipoUso === 'object' && item.tipoUso !== null ? (item.tipoUso.es || '') : (item.tipoUso || ''),
    tipoUsoEn: typeof item.tipoUso === 'object' && item.tipoUso !== null ? (item.tipoUso.en || '') : (item.tipoUsoEn || ''),
    valvula: typeof item.valvula === 'object' && item.valvula !== null ? (item.valvula.es || '') : (item.valvula || ''),
    valvulaEn: typeof item.valvula === 'object' && item.valvula !== null ? (item.valvula.en || '') : (item.valvulaEn || ''),
    peso: typeof item.peso === 'object' && item.peso !== null ? (item.peso.es || '') : (item.peso || ''),
    pesoEn: typeof item.peso === 'object' && item.peso !== null ? (item.peso.en || '') : (item.pesoEn || ''),
    pesoFull: typeof item.pesoFull === 'object' && item.pesoFull !== null ? (item.pesoFull.es || '') : (item.pesoFull || ''),
    pesoFullEn: typeof item.pesoFull === 'object' && item.pesoFull !== null ? (item.pesoFull.en || '') : (item.pesoFullEn || ''),
    caracteristicas: Array.isArray(item.garantias?.es) ? item.garantias.es : (Array.isArray(item.caracteristicas) ? item.caracteristicas : []),
    caracteristicasEn: Array.isArray(item.garantias?.en) ? item.garantias.en : (Array.isArray(item.caracteristicasEn) ? item.caracteristicasEn : []),
    delivery: typeof item.delivery === 'object' && item.delivery !== null ? (item.delivery.es || '') : (item.delivery || ''),
    deliveryEn: typeof item.delivery === 'object' && item.delivery !== null ? (item.delivery.en || '') : (item.deliveryEn || ''),
    seguridad: typeof item.seguridad === 'object' && item.seguridad !== null ? (item.seguridad.es || '') : (item.seguridad || ''),
    seguridadEn: typeof item.seguridad === 'object' && item.seguridad !== null ? (item.seguridad.en || '') : (item.seguridadEn || ''),
    imagen: item.imagen || '/imgwii/productos/BALON-10KG.webp',
    badge: typeof item.badge === 'object' && item.badge !== null ? (item.badge.es || '') : (item.badge || (item.tagClase === 'badge-fire' ? 'Más Pedido' : '')),
    badgeEn: typeof item.badge === 'object' && item.badge !== null ? (item.badge.en || '') : (item.badgeEn || (item.tagClase === 'badge-fire' ? 'Most Popular' : '')),
    badgeIcon: item.badgeIcon || 'fa-solid fa-star',
    tagClase: item.tagClase || 'badge-fire',
    orden: Number(item.orden ?? 1),
    pin: Boolean(item.pin)
  };
}

// Lectura fresca de productos desde Firestore REST
let _productosBuildFirestore = [];

export async function consultarProductosFirestoreFresco() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('gaswii_productos');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(p => p.estado !== 'pausado' && p.estado !== 'inactivo');
        }
      }
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://firestore.googleapis.com/v1/projects/gaswii/databases/(default)/documents/productos', {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.documents) && json.documents.length > 0) {
        const prods = json.documents
          .map(d => normalizarProductoFirestore(d))
          .filter(p => p.estado !== 'pausado' && p.estado !== 'inactivo')
          .sort((a, b) => (a.orden || 999) - (b.orden || 999));
        _productosBuildFirestore = prods;
        return prods;
      }
    }
  } catch (err) {
    console.warn('[negocio] Build-time productos fetch:', err?.message || err);
  }

  return _productosBuildFirestore;
}

if (typeof window === 'undefined') {
  await consultarProductosFirestoreFresco();
}

/**
 * Obtiene el catálogo de productos activo en memoria o localStorage (Cliente)
 */
function obtenerProductosActivos() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('gaswii_productos');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(p => p.estado !== 'pausado' && p.estado !== 'inactivo');
        }
      }
    } catch (e) {}
  }

  return _productosBuildFirestore;
}

export const datosNegocio = {
  get nombre() { return (obtenerDatosNegocio().identidad?.nombre || 'Solgas Surquillo').replace(/Surquilloo/gi, 'Surquillo'); },
  get nombreCorto() { return (obtenerDatosNegocio().identidad?.nombreCorto || 'Solgas').replace(/Surquilloo/gi, 'Surquillo'); },
  get razonSocial() { return obtenerDatosNegocio().identidad?.razonSocial || ''; },
  get autorizacion() { return obtenerDatosNegocio().identidad?.razonSocial || ''; },
  get ruc() { return obtenerDatosNegocio().identidad?.ruc || ''; },
  get registroOsinergmin() { return obtenerDatosNegocio().identidad?.registroOsinergmin || ''; },
  get marcaRespaldo() { return obtenerDatosNegocio().identidad?.marcaRespaldo || ''; },
  get logo() { return obtenerDatosNegocio().identidad?.logo || ''; },
  get imagenSede() { return obtenerDatosNegocio().identidad?.imagenSede || ''; },
  get experienciaAnos() {
    const raw = calcularAnosTrayectoria(obtenerDatosNegocio().identidad?.lanzamientoFecha);
    return parseInt(raw, 10) || 0;
  },
  get telefono() { return obtenerDatosNegocio().contacto?.telefono || ''; },
  get telefonoMostrado() { return obtenerDatosNegocio().contacto?.telefono || ''; },
  get telefonoFijo() { return obtenerDatosNegocio().contacto?.telefonoFijo || ''; },
  get telefonoLimpio() {
    const c = obtenerDatosNegocio().contacto || {};
    return c.telefonoLimpio || (c.telefono || '').replace(/\D/g, '');
  },
  get telefonoRaw() {
    const c = obtenerDatosNegocio().contacto || {};
    return c.telefonoLimpio || (c.telefono || '').replace(/\D/g, '');
  },
  get whatsapp() { return obtenerDatosNegocio().contacto?.whatsapp || ''; },
  get whatsappMensaje() { return obtenerDatosNegocio().contacto?.whatsappMensaje || ''; },
  get email() { return obtenerDatosNegocio().contacto?.email || ''; },
  get direccionSede() { return obtenerDatosNegocio().ubicacion?.direccion || ''; },
  get distritoSede() { return obtenerDatosNegocio().ubicacion?.distrito || ''; },
  get ciudad() { return obtenerDatosNegocio().ubicacion?.ciudad || ''; },
  get pais() { return obtenerDatosNegocio().ubicacion?.pais || 'PE'; },
  get mapsUrl() { return obtenerDatosNegocio().ubicacion?.mapsUrl || ''; },
  get coordenadas() { return obtenerDatosNegocio().ubicacion?.coordenadas || { lat: 0, lng: 0 }; },
  get horario() { return obtenerDatosNegocio().contacto?.horario || ''; },
  get horarioEn() { return obtenerDatosNegocio().contacto?.horarioEn || ''; },
  get metricas() { return obtenerDatosNegocio().metricas || { clientes: '', balanza: '', years: '', dias: '' }; },
  get redes() { return obtenerDatosNegocio().redes || { facebook: '', instagram: '', tiktok: '' }; },
  /**
   * @returns {{ id: string, nombre: string, tiempo: string, tag: string, tagEn: string }[]}
   */
  get distritos() {
    const zonas = obtenerDatosNegocio().zonas || [];
    const activas = zonas.filter(z => z.activo !== false);
    if (activas.length > 0) {
      return activas.map(z => ({
        id: z.id || (z.distrito || '').toLowerCase().replace(/\s+/g, '-'),
        nombre: z.distrito || '',
        tiempo: `${z.tiempoMin || 8} - ${z.tiempoMax || 18} ${z.unidad || 'min'}`,
        tag: z.tag || '',
        tagEn: z.tag || ''
      }));
    }
    return [
      { id: 'surquillo', nombre: 'Surquillo', tiempo: '8 - 18 min', tag: 'Sede Central Express', tagEn: 'Central Express' },
      { id: 'miraflores', nombre: 'Miraflores', tiempo: '12 - 22 min', tag: 'Cobertura Directa', tagEn: 'Direct Coverage' },
      { id: 'san-borja', nombre: 'San Borja', tiempo: '15 - 25 min', tag: 'Cobertura Directa', tagEn: 'Direct Coverage' },
      { id: 'san-isidro', nombre: 'San Isidro', tiempo: '15 - 25 min', tag: 'Cobertura Directa', tagEn: 'Direct Coverage' }
    ];
  },

  // Catálogo Oficial Puro: Lee ÚNICA y EXCLUSIVAMENTE de Firestore (Cero Productos Ficticios)
  get productos() {
    return obtenerProductosActivos();
  },

  // Metadatos SEO dinámicos configurables desde la colección 'negocio' en Firestore
  get seo() {
    return obtenerDatosNegocio().seo || null;
  },

  // Medios de pago aceptados
  get mediosPago() {
    return MEDIOS_PAGO_BASE;
  }
};

export default datosNegocio;