// src/negocio.js
// 🎯 Fachada Canónica, Reactiva y Universal de Negocio y Productos (Gaswii Web)
// Fuente Primaria: Firestore ('negocio/principal' y 'productos')
// Respaldo Local-First: LocalStorage ('gaswii_negocio', 'gaswii_productos')
// Respaldo Semilla Offline: src/semillas/negocio.json, productos.json, configurar.js
// 100% Cero Dependencias Circulares: No depende de ningún feature interno.

import wii from './wii.js';
import negocioSemilla from './semillas/negocio.json';
import productosSemilla from './semillas/productos.json';
import blogsSemilla from './semillas/blogs.json';
import {
  configurarSistema,
  configurarPersonal,
  configurarCliente,
  configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
} from './semillas/configurar.js';

export const configSemilla = configurarSistema;
export {
  configurarSistema,
  configurarPersonal,
  configurarCliente,
  configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
};

export const STORAGE_KEY_NEGOCIO = 'wi_negocio';
export const OLD_STORAGE_KEY_NEGOCIO = 'gaswii_negocio';
export const LEGACY_STORAGE_KEY_NEGOCIO = 'minegocio';
export const STORAGE_KEY_PRODUCTOS = 'wi_productos';
export const OLD_STORAGE_KEY_PRODUCTOS = 'gaswii_productos';
export const COLECCION_NEGOCIO = 'negocio';
export const DOC_NEGOCIO_ID = 'principal';

// Medios de pago aceptados oficiales
export const MEDIOS_PAGO_BASE = [
  { nombre: "Efectivo", icon: "fa-money-bill-wave" },
  { nombre: "Yape", icon: "fa-mobile-screen-button" },
  { nombre: "Plin", icon: "fa-mobile-screen-button" },
  { nombre: "Transferencia", icon: "fa-building-columns" }
];

// =============================================================================
// 1. PARSER CANÓNICO Y ULTRALIGERO DE CAMPOS FIRESTORE REST API (0 dependencias)
// =============================================================================
export function parseFirestoreDoc(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.mapValue) res[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else if (v.arrayValue) {
      res[k] = (v.arrayValue.values || []).map(item =>
        item.mapValue ? parseFirestoreDoc(item.mapValue.fields || {}) : Object.values(item)[0]
      );
    }
  }
  return res;
}

// =============================================================================
// 2. NORMALIZADOR COMPACTO DE NEGOCIO (Cascada: Entrada -> Semilla -> Vacío "")
// =============================================================================
export function normalizarConfig(c = {}) {
  const cfg = c && typeof c === 'object' ? c : {};
  const base = negocioSemilla || {};

  return {
    id: cfg.id || base.id || DOC_NEGOCIO_ID,
    principal: Boolean(cfg.principal ?? base.principal ?? true),
    moneda: cfg.moneda || base.moneda || configurarSistema.parametros.moneda || 'PEN',
    idiomaPrincipal: cfg.idiomaPrincipal || base.idiomaPrincipal || 'es',
    idiomas: Array.isArray(cfg.idiomas) && cfg.idiomas.length > 0 ? cfg.idiomas : (base.idiomas || ['es', 'en']),
    titulo: cfg.titulo || base.titulo || '',
    subtitulo: cfg.subtitulo ?? base.subtitulo ?? '',
    hero: {
      titulo: cfg.hero?.titulo ?? base.hero?.titulo ?? '',
      subtitulo: cfg.hero?.subtitulo ?? base.hero?.subtitulo ?? '',
      imagen: cfg.hero?.imagen ?? base.hero?.imagen ?? '',
      alt: cfg.hero?.alt ?? base.hero?.alt ?? '',
      precioHero: cfg.hero?.precioHero ?? base.hero?.precioHero ?? '',
      servicio: cfg.hero?.servicio ?? base.hero?.servicio ?? '',
      descripcion: cfg.hero?.descripcion ?? base.hero?.descripcion ?? ''
    },
    identidad: {
      nombre: (cfg.identidad?.nombre || base.identidad?.nombre || '').replace(/Surquilloo/gi, 'Surquillo'),
      nombreCorto: (cfg.identidad?.nombreCorto || base.identidad?.nombreCorto || '').replace(/Surquilloo/gi, 'Surquillo'),
      razonSocial: cfg.identidad?.razonSocial || base.identidad?.razonSocial || '',
      ruc: cfg.identidad?.ruc || base.identidad?.ruc || '',
      registroOsinergmin: cfg.identidad?.registroOsinergmin || base.identidad?.registroOsinergmin || '',
      marcaRespaldo: cfg.identidad?.marcaRespaldo || base.identidad?.marcaRespaldo || '',
      lanzamientoFecha: cfg.identidad?.lanzamientoFecha || base.identidad?.lanzamientoFecha || '',
      logo: cfg.identidad?.logo || base.identidad?.logo || '/imgwii/logo.webp',
      logoFull: cfg.identidad?.logoFull || base.identidad?.logoFull || '/imgwii/logo_full.webp',
      imagenSede: cfg.identidad?.imagenSede || base.identidad?.imagenSede || '/imgwii/hero.webp',
      especialista: cfg.identidad?.especialista || base.identidad?.especialista || '',
      colegiatura: cfg.identidad?.colegiatura || base.identidad?.colegiatura || base.identidad?.registroOsinergmin || '',
      titulo: cfg.identidad?.titulo || base.identidad?.titulo || '',
      cargo: cfg.identidad?.cargo || base.identidad?.cargo || '',
      grado: cfg.identidad?.grado || base.identidad?.grado || '',
      bio: cfg.identidad?.bio || base.identidad?.bio || '',
      bioEn: cfg.identidad?.bioEn || base.identidad?.bioEn || '',
      enfoques: cfg.identidad?.enfoques || base.identidad?.enfoques || '',
      enfoquesEn: cfg.identidad?.enfoquesEn || base.identidad?.enfoquesEn || '',
      nombreEn: cfg.identidad?.nombreEn || base.identidad?.nombreEn || '',
      nombreCortoEn: cfg.identidad?.nombreCortoEn || base.identidad?.nombreCortoEn || ''
    },
    contacto: {
      pais: cfg.contacto?.pais || base.contacto?.pais || 'PE',
      paisCode: cfg.contacto?.paisCode || base.contacto?.paisCode || '51',
      telefono: cfg.contacto?.telefono || base.contacto?.telefono || '',
      telefonoFijo: cfg.contacto?.telefonoFijo || base.contacto?.telefonoFijo || '',
      telefonoSecundario: cfg.contacto?.telefonoSecundario || base.contacto?.telefonoSecundario || '',
      telefonoLimpio: cfg.contacto?.telefonoLimpio || base.contacto?.telefonoLimpio || '',
      whatsapp: cfg.contacto?.whatsapp || base.contacto?.whatsapp || '',
      whatsappMensaje: cfg.contacto?.whatsappMensaje || base.contacto?.whatsappMensaje || {
        es: '',
        en: ''
      },
      whatsappMensajeEn: cfg.contacto?.whatsappMensajeEn || (typeof (cfg.contacto?.whatsappMensaje || base.contacto?.whatsappMensaje) === 'object' ? (cfg.contacto?.whatsappMensaje || base.contacto?.whatsappMensaje)?.en : '') || '',
      email: cfg.contacto?.email || base.contacto?.email || '',
      horario: cfg.contacto?.horario || base.contacto?.horario || {
        es: '',
        en: ''
      },
      horarioEn: cfg.contacto?.horarioEn || (typeof (cfg.contacto?.horario || base.contacto?.horario) === 'object' ? (cfg.contacto?.horario || base.contacto?.horario)?.en : '') || ''
    },
    ubicacion: {
      direccion: cfg.ubicacion?.direccion || base.ubicacion?.direccion || '',
      distrito: cfg.ubicacion?.distrito || base.ubicacion?.distrito || '',
      ciudad: cfg.ubicacion?.ciudad || base.ubicacion?.ciudad || '',
      pais: cfg.ubicacion?.pais || base.ubicacion?.pais || 'PE',
      referencia: cfg.ubicacion?.referencia || base.ubicacion?.referencia || '',
      mapsUrl: cfg.ubicacion?.mapsUrl || base.ubicacion?.mapsUrl || '',
      coordenadas: cfg.ubicacion?.coordenadas || base.ubicacion?.coordenadas || { lat: 0, lng: 0 }
    },
    sedes: (Array.isArray(cfg.sedes) && cfg.sedes.length > 0) ? cfg.sedes : (Array.isArray(base.sedes) && base.sedes.length > 0 ? base.sedes : []),
    horarios: cfg.horarios || cfg.contacto?.horario || base.contacto?.horario || {},
    zonas: Array.isArray(cfg.zonas) ? cfg.zonas : (base.zonas || []),
    metricas: cfg.metricas || base.metricas || { years: '26+', clientes: '26K+', balanza: '100%', dias: '365' },
    redes: cfg.redes || base.redes || {},
    seo: {
      titulo: cfg.seo?.titulo || base.seo?.titulo || {},
      descripcion: cfg.seo?.descripcion || base.seo?.descripcion || {},
      keywords: cfg.seo?.keywords || base.seo?.keywords || {},
      imagen: cfg.seo?.imagen || base.seo?.imagen || cfg.hero?.imagen || cfg.identidad?.logo || base.hero?.imagen || base.identidad?.logo || '/imgwii/logo.webp',
      imagenAlt: cfg.seo?.imagenAlt || base.seo?.imagenAlt || {},
      imagenCaption: cfg.seo?.imagenCaption || base.seo?.imagenCaption || {},
      descripcionNegocio: cfg.seo?.descripcionNegocio || base.seo?.descripcionNegocio || {},
      rangoPrecios: cfg.seo?.rangoPrecios || base.seo?.rangoPrecios || '',
      currenciesAccepted: cfg.seo?.currenciesAccepted || base.seo?.currenciesAccepted || 'PEN',
      paymentAccepted: cfg.seo?.paymentAccepted || base.seo?.paymentAccepted || [],
      schemaTypes: cfg.seo?.schemaTypes || base.seo?.schemaTypes || ['LocalBusiness'],
      faqs: Array.isArray(cfg.seo?.faqs) && cfg.seo.faqs.length > 0 ? cfg.seo.faqs : (base.seo?.faqs || [])
    }
  };
}

// =============================================================================
// 3. OBTENCIÓN DE DATOS DE NEGOCIO (Build SSG + Runtime Local-First)
// =============================================================================
let _datosBuildFirestore = null;

if (typeof window === 'undefined') {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'gaswii';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/negocio/principal`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      _datosBuildFirestore = parseFirestoreDoc(json.fields || {});
    }
  } catch (err) {}
}

export function obtenerDatosNegocio() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(STORAGE_KEY_NEGOCIO) || localStorage.getItem(OLD_STORAGE_KEY_NEGOCIO) || localStorage.getItem(LEGACY_STORAGE_KEY_NEGOCIO);
      if (local) {
        const parsed = JSON.parse(local);
        const data = parsed?.value || parsed;
        if (data && typeof data === 'object') return normalizarConfig(data);
      }
    } catch (e) {}
  }
  if (_datosBuildFirestore) {
    return normalizarConfig(_datosBuildFirestore);
  }
  return normalizarConfig(negocioSemilla);
}

export const obtenerNegocioLocal = obtenerDatosNegocio;

/**
 * Sincroniza datos frescos desde Firestore en cliente
 */
export async function sincronizarNegocioDesdeFirestore() {
  if (typeof window === 'undefined') return obtenerDatosNegocio();
  try {
    const { db } = await import('./core/servicios/firebase.js');
    if (!db) return obtenerDatosNegocio();
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID));
    if (snap.exists()) {
      const data = snap.data();
      const normalizado = normalizarConfig(data);
      try {
        localStorage.setItem(STORAGE_KEY_NEGOCIO, JSON.stringify(normalizado));
      } catch (e) {}
      return normalizado;
    }
  } catch (err) {
    // Fallback Local-First
  }
  return obtenerDatosNegocio();
}

// =============================================================================
// 4. NORMALIZADOR Y CONSULTA CANÓNICA DE PRODUCTOS
// =============================================================================
export function normalizarProductoFirestore(docRaw = {}) {
  const item = docRaw.fields ? parseFirestoreDoc(docRaw.fields) : docRaw;
  const id = item.id || (docRaw.name ? docRaw.name.split('/').pop() : '');
  const precio = Number(item.precio ?? item.price ?? item.precioPEN ?? 0);

  const getTxt = (v) => (typeof v === 'object' && v !== null ? (v.es || '') : (v || ''));
  const getTxtEn = (v, alt) => (typeof v === 'object' && v !== null ? (v.en || '') : (alt || ''));

  return {
    id,
    slug: item.slug || id,
    nombre: getTxt(item.nombre),
    nombreEn: getTxtEn(item.nombre, item.nombreEn),
    descripcion: getTxt(item.descripcion),
    descripcionEn: getTxtEn(item.descripcion, item.descripcionEn),
    precioPEN: precio,
    precio: precio,
    precioEnvase: Number(item.precioEnvase ?? 0),
    stock: Number(item.stock ?? 0),
    stockMin: Number(item.stockMin ?? 5),
    estado: item.estado || 'activo',
    tipoCategoria: item.tipoCategoria || 'gas',
    tipo: getTxt(item.tipo),
    tipoEn: getTxtEn(item.tipo, item.tipoEn),
    tipoUso: getTxt(item.tipoUso),
    tipoUsoEn: getTxtEn(item.tipoUso, item.tipoUsoEn),
    valvula: getTxt(item.valvula),
    valvulaEn: getTxtEn(item.valvula, item.valvulaEn),
    peso: getTxt(item.peso),
    pesoEn: getTxtEn(item.peso, item.pesoEn),
    pesoFull: getTxt(item.pesoFull),
    pesoFullEn: getTxtEn(item.pesoFull, item.pesoFullEn),
    nombreCorto: getTxt(item.nombreCorto) || getTxt(item.nombre),
    modalidad: getTxt(item.modalidad) || getTxt(item.delivery),
    enfoque: getTxt(item.enfoque),
    caracteristicas: Array.isArray(item.garantias?.es) ? item.garantias.es : (Array.isArray(item.caracteristicas) ? item.caracteristicas : []),
    caracteristicasEn: Array.isArray(item.garantias?.en) ? item.garantias.en : (Array.isArray(item.caracteristicasEn) ? item.caracteristicasEn : []),
    garantias: Array.isArray(item.garantias?.es) ? item.garantias.es : (Array.isArray(item.garantias) ? item.garantias : (Array.isArray(item.caracteristicas) ? item.caracteristicas : [])),
    garantiasEn: Array.isArray(item.garantias?.en) ? item.garantias.en : (Array.isArray(item.garantiasEn) ? item.garantiasEn : (Array.isArray(item.caracteristicasEn) ? item.caracteristicasEn : [])),
    delivery: getTxt(item.delivery),
    deliveryEn: getTxtEn(item.delivery, item.deliveryEn),
    seguridad: getTxt(item.seguridad),
    seguridadEn: getTxtEn(item.seguridad, item.seguridadEn),
    imagen: item.imagen || '/imgwii/productos/BALON-10KG.webp',
    badge: getTxt(item.badge) || (item.tagClase === 'badge-fire' ? 'Más Pedido' : ''),
    badgeEn: getTxtEn(item.badge, item.badgeEn) || (item.tagClase === 'badge-fire' ? 'Most Popular' : ''),
    badgeIcon: item.badgeIcon || 'fa-solid fa-star',
    tagClase: item.tagClase || 'badge-fire',
    orden: Number(item.orden ?? 1),
    pin: Boolean(item.pin)
  };
}

let _productosBuildFirestore = Array.isArray(productosSemilla) ? productosSemilla.map(p => normalizarProductoFirestore(p)) : [];

export async function consultarProductosFirestoreFresco() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(STORAGE_KEY_PRODUCTOS) || localStorage.getItem(OLD_STORAGE_KEY_PRODUCTOS);
      if (local) {
        const parsed = JSON.parse(local);
        const lista = Array.isArray(parsed) ? parsed : (parsed?.value || null);
        if (Array.isArray(lista) && lista.length > 0) {
          return lista.filter(p => p.estado !== 'pausado' && p.estado !== 'inactivo');
        }
      }
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'gaswii';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/productos`, {
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
  } catch (err) {}

  return _productosBuildFirestore;
}

if (typeof window === 'undefined') {
  await consultarProductosFirestoreFresco();
}

let _blogsBuildFirestore = Array.isArray(blogsSemilla) ? blogsSemilla : [];

export async function consultarBlogsFirestoreFresco() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('wi_blogs_data_v3');
      if (local) {
        const parsed = JSON.parse(local);
        const lista = Array.isArray(parsed) ? parsed : (parsed?.value || null);
        if (Array.isArray(lista) && lista.length > 0) {
          return lista.filter(b => b.activo !== false);
        }
      }
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'gaswii';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.documents) && json.documents.length > 0) {
        const blogs = json.documents
          .map(d => {
            const parsed = parseFirestoreDoc(d.fields || {});
            const id = parsed.id || (d.name ? d.name.split('/').pop() : '');
            return { id, ...parsed };
          })
          .filter(b => b.activo !== false);
        if (blogs.length > 0) {
          _blogsBuildFirestore = blogs;
          return blogs;
        }
      }
    }
  } catch (err) {}

  return _blogsBuildFirestore;
}

if (typeof window === 'undefined') {
  await consultarBlogsFirestoreFresco();
}

function calcularAnosTrayectoria(fechaStr) {
  if (!fechaStr) return 26;
  try {
    const inicio = new Date(fechaStr);
    const actual = new Date();
    const dif = actual.getFullYear() - inicio.getFullYear();
    return dif > 0 ? dif : 26;
  } catch (e) {
    return 26;
  }
}

// =============================================================================
// 5. FACHADA OFICIAL DATOSNEGOCIO (Consumida por Toda la Aplicación)
// =============================================================================
export const datosNegocio = {
  get raw() { return obtenerDatosNegocio(); },
  get identidad() { return this.raw.identidad || {}; },
  get contacto() { return this.raw.contacto || {}; },
  get ubicacion() { return this.raw.ubicacion || {}; },
  get sedes() { return this.raw.sedes || []; },
  get horarios() { return this.raw.horarios || this.contacto?.horario || {}; },
  get slogan() { return this.subtitulo; },
  get linkweb() { return (this.raw.redes?.web || this.raw.linkweb || wii.linkweb || '').replace(/\/$/, '') + '/'; },
  get linkWhatsapp() { return `https://wa.me/${this.whatsappLimpio}`; },
  get id() { return this.raw.id || DOC_NEGOCIO_ID; },
  get titulo() { return this.raw.titulo || this.raw.identidad?.titulo || ''; },
  get subtitulo() { return this.raw.subtitulo || this.raw.identidad?.subtitulo || ''; },
  get idiomaPrincipal() { return this.raw.idiomaPrincipal || 'es'; },
  get idiomas() { return this.raw.idiomas || ['es', 'en']; },
  get nombre() { return (this.raw.identidad?.nombre || '').replace(/Surquilloo/gi, 'Surquillo'); },
  get nombreCorto() { return (this.raw.identidad?.nombreCorto || this.nombre).replace(/Surquilloo/gi, 'Surquillo'); },
  get razonSocial() { return this.raw.identidad?.razonSocial || ''; },
  get autorizacion() { return this.razonSocial; },
  get ruc() { return this.raw.identidad?.ruc || ''; },
  get registroOsinergmin() { return this.raw.identidad?.registroOsinergmin || ''; },
  get marcaRespaldo() { return this.raw.identidad?.marcaRespaldo || ''; },
  get especialista() { return this.raw.identidad?.especialista || this.nombre; },
  get colegiatura() { return this.raw.identidad?.colegiatura || this.registroOsinergmin; },
  get cargo() { return this.raw.identidad?.cargo || this.raw.identidad?.titulo || ''; },
  get registroColegio() { return this.registroOsinergmin ? `${this.registroOsinergmin} · Registro Vigente OSINERGMIN` : ''; },
  get colegiaturaNumero() { return (this.colegiatura || '').replace(/\D/g, ''); },
  get grado() { return this.raw.identidad?.grado || ''; },
  get enfoques() { return this.raw.identidad?.enfoques || ''; },
  get bio() { return this.raw.identidad?.bio?.es || (typeof this.raw.identidad?.bio === 'string' ? this.raw.identidad.bio : '') || ''; },
  get logo() { return this.raw.identidad?.logo || '/imgwii/logo.webp'; },
  get logoCircle() { return this.logo; },
  get logoFull() { return this.raw.identidad?.logoFull || '/imgwii/logo_full.webp'; },
  get fotoEspecialista() { return this.raw.identidad?.imagenSede || this.imagenSede || '/imgwii/hero.webp'; },
  get imagenSede() { return this.raw.identidad?.imagenSede || '/imgwii/hero.webp'; },
  get experienciaAnos() {
    return calcularAnosTrayectoria(this.raw.identidad?.lanzamientoFecha);
  },
  get moneda() { return this.raw.moneda || configurarSistema.parametros.moneda || 'PEN'; },
  get telefono() { return this.raw.contacto?.telefono || ''; },
  get telefonoMostrado() { return this.telefono; },
  get telefonoFijo() { return this.raw.contacto?.telefonoFijo || ''; },
  get telefonoLimpio() {
    return this.raw.contacto?.telefonoLimpio || (this.telefono || '').replace(/\D/g, '');
  },
  get telefonoRaw() { return this.telefonoLimpio; },
  get whatsapp() { return this.raw.contacto?.whatsapp || ''; },
  get whatsappLimpio() { return (this.whatsapp || '').replace(/\D/g, ''); },
  get whatsappMensaje() {
    const m = this.raw.contacto?.whatsappMensaje;
    return typeof m === 'object' && m !== null ? (m.es || '') : (m || '');
  },
  get whatsappMensajeEn() {
    const m = this.raw.contacto?.whatsappMensaje;
    return typeof m === 'object' && m !== null ? (m.en || '') : (this.raw.contacto?.whatsappMensajeEn || this.whatsappMensaje);
  },
  getWhatsappMensaje(idioma = 'es') {
    return idioma === 'en' ? this.whatsappMensajeEn : this.whatsappMensaje;
  },
  get email() { return this.raw.contacto?.email || ''; },
  get direccionSede() { return this.raw.ubicacion?.direccion || ''; },
  get distritoSede() { return this.raw.ubicacion?.distrito || ''; },
  get ciudad() { return this.raw.ubicacion?.ciudad || ''; },
  get pais() { return this.raw.ubicacion?.pais || 'PE'; },
  get codigoPostal() { return this.raw.ubicacion?.codigoPostal || ''; },
  get mapsUrl() { return this.raw.ubicacion?.mapsUrl || ''; },
  get coordenadas() { return this.raw.ubicacion?.coordenadas || { lat: 0, lng: 0 }; },
  get horario() {
    const h = this.raw.contacto?.horario;
    return typeof h === 'object' && h !== null ? (h.es || '') : (h || '');
  },
  get horarioEn() {
    const h = this.raw.contacto?.horario;
    return typeof h === 'object' && h !== null ? (h.en || '') : (this.raw.contacto?.horarioEn || '');
  },
  getHorario(idioma = 'es') {
    return idioma === 'en' ? this.horarioEn : this.horario;
  },
  get horarios() { return this.raw.horarios || {}; },
  get metricas() { return this.raw.metricas || {}; },
  get redes() { return this.raw.redes || {}; },
  get redesOrden() { return this.raw.redesOrden || []; },

  get sedes() {
    if (Array.isArray(this.raw.sedes) && this.raw.sedes.length > 0) return this.raw.sedes;
    return [];
  },

  get zonas() {
    if (Array.isArray(this.raw.zonas) && this.raw.zonas.length > 0) return this.raw.zonas;
    return [];
  },

  get distritos() {
    const zonas = this.raw.zonas || [];
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
      { id: 'miraflores', nombre: 'Miraflores', tiempo: '15 - 20 min', tag: 'Ruta Directa', tagEn: 'Direct Route' },
      { id: 'san-borja', nombre: 'San Borja', tiempo: '15 - 22 min', tag: 'Ruta Directa', tagEn: 'Direct Route' },
      { id: 'san-isidro', nombre: 'San Isidro', tiempo: '18 - 25 min', tag: 'Ruta Directa', tagEn: 'Direct Route' }
    ];
  },

  get config() { return configurarSistema; },
  get productos() { return _productosBuildFirestore; },
  get servicios() { return this.productos; },
  get blogs() { return _blogsBuildFirestore; },
  get asesorias() { return []; },
  get talleres() { return []; },
  get todosServicios() { return this.productos; },
  get seo() { return this.raw.seo || null; },
  get mediosPago() { return MEDIOS_PAGO_BASE; }
};

if (typeof window !== 'undefined') {
  const actualizarMemoria = (det) => {
    if (det && typeof det === 'object') {
      _datosBuildFirestore = normalizarConfig(det);
    }
  };
  window.addEventListener('wi:negocio-actualizado', (e) => actualizarMemoria(e.detail));
  window.addEventListener('gaswii:negocio-actualizado', (e) => actualizarMemoria(e.detail));
}

export default datosNegocio;