// src/feature/personal/modulos/negocio/dataNegocio.js
// Capa de Datos Local-First de Negocio con Sincronización en Segundo Plano con Firestore
// Colección: 'negocio' · Documento: 'principal' · 100% JS Nativo · Integrado con @widev

import { savels, getls, formatearFechaParaInput } from '@widev';
import { db } from '@core/servicios/firebase.js';
import { doc, setDoc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

export const STORAGE_KEY = 'minegocio';
export const OLD_STORAGE_KEY = 'gaswii_negocio_config';
export const COLECCION_NEGOCIO = 'negocio';
export const DOC_NEGOCIO_ID = 'principal';

// Esquema Base Neutro y Oficial en Memoria (Cero Dependencia de JSON Estáticos)
export const ESQUEMA_BASE_NEGOCIO = {
  id: DOC_NEGOCIO_ID,
  principal: true,
  identidad: {
    nombre: "Solgas Surquillo",
    nombreCorto: "Solgas Surquillo",
    razonSocial: "Distribuidor Autorizado OSINERGMIN Reg. 208492",
    ruc: "20601234567",
    registroOsinergmin: "Reg. 208492",
    marcaRespaldo: "Solgas S.A.",
    lanzamientoFecha: "2001-04-13",
    logo: "/imgwii/logo.webp",
    imagenSede: "/imgwii/hero.webp"
  },
  contacto: {
    telefono: "+51 936 369 384",
    telefonoFijo: "(01) 241-1234",
    telefonoLimpio: "51936369384",
    whatsapp: "51936369384",
    whatsappMensaje: "¡Hola Solgas Surquillo! Deseo pedir un balón de gas para entrega a domicilio.",
    email: "pedidos@solgassurquillo.com",
    horario: "Lunes a Domingo: 6:00 a.m. a 11:00 p.m. (365 días)",
    horarioEn: "Monday to Sunday: 6:00 a.m. to 11:00 p.m. (365 days)"
  },
  ubicacion: {
    direccion: "Jr. Dante 260, Surquillo, Lima 15047",
    distrito: "Surquillo",
    ciudad: "Lima",
    pais: "PE",
    mapsUrl: "https://maps.app.goo.gl/s86EmxowFcKetJWL8",
    coordenadas: {
      lat: -12.1177408,
      lng: -77.0226796
    }
  },
  zonas: [
    { id: "surquillo", distrito: "Surquillo", tiempoMin: 9, tiempoMax: 18, unidad: "min", tag: "Sede Central Express", activo: true },
    { id: "miraflores", distrito: "Miraflores", tiempoMin: 15, tiempoMax: 20, unidad: "min", tag: "Ruta Directa", activo: true },
    { id: "san-borja", distrito: "San Borja", tiempoMin: 15, tiempoMax: 22, unidad: "min", tag: "Ruta Directa", activo: true },
    { id: "san-isidro", distrito: "San Isidro", tiempoMin: 18, tiempoMax: 25, unidad: "min", tag: "Ruta Directa", activo: true }
  ],
  metricas: {
    clientes: "25K+",
    balanza: "100%",
    years: "25+",
    dias: "365"
  },
  redes: {
    facebook: "https://facebook.com/solgassurquillo",
    instagram: "https://instagram.com/solgassurquillo",
    tiktok: "https://tiktok.com/@solgassurquillo"
  }
};

// Parser ultraligero de campos de la REST API de Firestore
export function parseFirestoreDoc(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.mapValue) res[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else if (v.arrayValue) res[k] = (v.arrayValue.values || []).map(item => item.mapValue ? parseFirestoreDoc(item.mapValue.fields || {}) : Object.values(item)[0]);
  }
  return res;
}

// Lectura en tiempo de compilación (Astro SSG / Cloudflare Build) directo desde la REST API
let _datosBuildFirestore = null;
if (typeof window === 'undefined') {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://firestore.googleapis.com/v1/projects/gaswii/databases/(default)/documents/negocio/principal', {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      _datosBuildFirestore = parseFirestoreDoc(json.fields || {});
    }
  } catch (err) {
    console.warn('[dataNegocio] Build-time Firestore fetch diferido/fallback:', err?.message || err);
  }
}

let _memoriaNegocio = null;

export function getUsuarioActivo() {
  const u = getls('wiSmile') || {};
  return {
    userId: u.uid || u.id || 'personal_local',
    email: u.email || 'personal@solgassurquillo.com',
    autor: u.nombre || u.usuario || 'Solgas Personal'
  };
}

// Calcula los años de experiencia automáticamente a partir de una fecha YYYY-MM-DD o Timestamp
export function calcularAnosTrayectoria(fechaInput) {
  if (!fechaInput) return '';
  let dateObj = null;

  if (fechaInput?.seconds) {
    dateObj = new Date(fechaInput.seconds * 1000);
  } else if (typeof fechaInput === 'string') {
    dateObj = new Date(fechaInput.includes('T') ? fechaInput : `${fechaInput}T12:00:00`);
  } else if (fechaInput instanceof Date) {
    dateObj = fechaInput;
  }

  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const dif = new Date().getFullYear() - dateObj.getFullYear();
  return dif > 0 ? `${dif}+` : '1';
}

export function obtenerDatosNegocio() {
  if (_memoriaNegocio) {
    return _memoriaNegocio;
  }
  try {
    const local = getls(STORAGE_KEY) || getls(OLD_STORAGE_KEY);
    if (local && typeof local === 'object' && local.identidad && local.identidad.nombre) {
      _memoriaNegocio = normalizarConfig(local);
      return _memoriaNegocio;
    }
  } catch (e) {}

  // En Node (build time de Cloudflare/Astro): usa los datos frescos de Firestore REST
  if (_datosBuildFirestore && _datosBuildFirestore.identidad?.nombre) {
    _memoriaNegocio = normalizarConfig(_datosBuildFirestore);
    return _memoriaNegocio;
  }

  // Fallback canónico base
  _memoriaNegocio = normalizarConfig(ESQUEMA_BASE_NEGOCIO);
  return _memoriaNegocio;
}

export function guardarDatosNegocioLocal(config) {
  try {
    const normalizado = normalizarConfig(config);
    _memoriaNegocio = normalizado;
    savels(STORAGE_KEY, normalizado);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gaswii:negocio-actualizado', { detail: normalizado }));
    }
  } catch (e) {}
}

export function guardarDatosNegocio(input = {}) {
  const actual = obtenerDatosNegocio();
  const usuario = getUsuarioActivo();

  // Parsear fecha de lanzamiento
  const fechaStr = input.identidad?.lanzamientoFecha || actual.identidad?.lanzamientoFecha || "";
  const yearsCalc = calcularAnosTrayectoria(fechaStr);

  const configActualizada = {
    ...actual,
    id: DOC_NEGOCIO_ID,
    principal: true,
    identidad: {
      ...actual.identidad,
      ...(input.identidad || {}),
      lanzamientoFecha: fechaStr
    },
    contacto: {
      ...actual.contacto,
      ...(input.contacto || {})
    },
    ubicacion: {
      ...actual.ubicacion,
      ...(input.ubicacion || {})
    },
    zonas: Array.isArray(input.zonas) ? input.zonas : (actual.zonas || []),
    metricas: {
      ...actual.metricas,
      ...(input.metricas || {}),
      years: yearsCalc
    },
    redes: {
      ...actual.redes,
      ...(input.redes || {})
    },
    userId: usuario.userId,
    email: usuario.email,
    autor: usuario.autor
  };

  guardarDatosNegocioLocal(configActualizada);

  // Sincronización en segundo plano con Firestore
  sincronizarNegocioFirestore(configActualizada, fechaStr);

  return configActualizada;
}

// Transforma la fecha a Timestamp nativo de Firestore
async function sincronizarNegocioFirestore(config, fechaStr) {
  if (!db) return;
  try {
    let timestampLanzamiento = null;
    if (fechaStr) {
      try {
        timestampLanzamiento = Timestamp.fromDate(new Date(`${fechaStr}T12:00:00`));
      } catch (e) {}
    }

    const payload = {
      id: DOC_NEGOCIO_ID,
      principal: true,
      identidad: {
        ...config.identidad,
        ...(timestampLanzamiento ? { lanzamiento: timestampLanzamiento } : {})
      },
      contacto: config.contacto,
      ubicacion: config.ubicacion,
      zonas: config.zonas,
      metricas: config.metricas,
      redes: config.redes,
      userId: config.userId,
      email: config.email,
      autor: config.autor,
      actualizado: serverTimestamp()
    };

    // Reemplaza el documento completo para eliminar campos planos huérfanos
    await setDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID), payload);
  } catch (err) {
    console.warn('[dataNegocio] Sincronización diferida Firestore:', err?.message || err);
  }
}

// Carga inicial reactiva desde Firestore si existe
export async function sincronizarDesdeFirestore() {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID));
    if (snap.exists()) {
      const data = snap.data();
      // Validar si el documento en Firestore está corrupto o incompleto
      if (!data.identidad || !data.identidad.nombre) {
        const canónico = normalizarConfig(ESQUEMA_BASE_NEGOCIO);
        guardarDatosNegocio(canónico);
        return canónico;
      }
      let fechaLanz = "";
      if (data.identidad?.lanzamiento) {
        fechaLanz = formatearFechaParaInput(data.identidad.lanzamiento);
      } else if (data.identidad?.lanzamientoFecha) {
        fechaLanz = data.identidad.lanzamientoFecha;
      }
      const normalizado = normalizarConfig({
        ...data,
        identidad: {
          ...data.identidad,
          lanzamientoFecha: fechaLanz
        }
      });
      guardarDatosNegocioLocal(normalizado);
      return normalizado;
    } else {
      // Si no existe, inicializar en Firestore con la estructura canónica oficial
      const canónico = normalizarConfig(ESQUEMA_BASE_NEGOCIO);
      guardarDatosNegocio(canónico);
      return canónico;
    }
  } catch (err) {
    console.warn('[dataNegocio] Lectura Firestore:', err?.message || err);
  }
  return null;
}

export const consultarNegocioDesdeFirestore = sincronizarDesdeFirestore;

function normalizarConfig(c = {}) {
  const base = JSON.parse(JSON.stringify(ESQUEMA_BASE_NEGOCIO));
  return {
    ...base,
    ...c,
    identidad: { ...base.identidad, ...(c.identidad || {}) },
    contacto: { ...base.contacto, ...(c.contacto || {}) },
    ubicacion: { ...base.ubicacion, ...(c.ubicacion || {}) },
    zonas: Array.isArray(c.zonas) && c.zonas.length > 0 ? c.zonas : base.zonas,
    metricas: { ...base.metricas, ...(c.metricas || {}) },
    redes: { ...base.redes, ...(c.redes || {}) }
  };
}
