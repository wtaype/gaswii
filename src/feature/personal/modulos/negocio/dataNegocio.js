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

// Esquema Base Neutro (Estructura Limpia sin Datos Semilla Quemados)
export const ESQUEMA_BASE_NEGOCIO = {
  id: DOC_NEGOCIO_ID,
  principal: true,
  identidad: {
    nombre: "",
    nombreCorto: "",
    razonSocial: "",
    ruc: "",
    registroOsinergmin: "",
    marcaRespaldo: "",
    lanzamientoFecha: "",
    logo: "",
    imagenSede: ""
  },
  contacto: {
    telefono: "",
    telefonoFijo: "",
    telefonoLimpio: "",
    whatsapp: "",
    whatsappMensaje: "",
    email: "",
    horario: "",
    horarioEn: ""
  },
  ubicacion: {
    direccion: "",
    distrito: "",
    ciudad: "",
    pais: "PE",
    mapsUrl: "",
    coordenadas: {
      lat: 0,
      lng: 0
    }
  },
  zonas: [],
  metricas: {
    clientes: "",
    balanza: "",
    years: "",
    dias: ""
  },
  redes: {
    facebook: "",
    instagram: "",
    tiktok: ""
  }
};

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
    if (local && typeof local === 'object' && local.identidad) {
      _memoriaNegocio = normalizarConfig(local);
      return _memoriaNegocio;
    }
  } catch (e) {}

  return normalizarConfig(ESQUEMA_BASE_NEGOCIO);
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

    await setDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID), payload, { merge: true });
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
    }
  } catch (err) {
    console.warn('[dataNegocio] Lectura Firestore:', err?.message || err);
  }
  return null;
}

function normalizarConfig(c = {}) {
  const base = JSON.parse(JSON.stringify(ESQUEMA_BASE_NEGOCIO));
  return {
    ...base,
    ...c,
    identidad: { ...base.identidad, ...(c.identidad || {}) },
    contacto: { ...base.contacto, ...(c.contacto || {}) },
    ubicacion: { ...base.ubicacion, ...(c.ubicacion || {}) },
    zonas: Array.isArray(c.zonas) ? c.zonas : base.zonas,
    metricas: { ...base.metricas, ...(c.metricas || {}) },
    redes: { ...base.redes, ...(c.redes || {}) }
  };
}
