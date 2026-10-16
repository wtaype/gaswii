// src/feature/personal/modulos/productos/dataProductos.js
// 🎯 Capa Canónica Local-First de Productos & Catálogo: Firestore + Caché Local + Semilla
// Colección: 'productos' · Semilla: src/semillas/productos.json
// Integrado con @widev, Firebase SDK y solicitarActualizacionWeb

import { savels, getls } from '@widev';
import { db } from '@core/servicios/firebase.js';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import productosSemilla from '../../../../semillas/productos.json';
import { solicitarActualizacionWeb } from '../../lib/actualizar.js';
import { actualizarCentral, eliminarCentral } from '@core/servicios/actualizar.js';

export const STORAGE_KEY = 'wi_productos';
export const OLD_STORAGE_KEY = 'wi_servicios';
export const COLECCION_PRODUCTOS = 'productos';
export const COLECCION_SERVICIOS = COLECCION_PRODUCTOS; // Compatibilidad retroactiva

import { parseFirestoreDoc } from '@/negocio.js';

export { parseFirestoreDoc };

// Generador de ID y Slug amigable
export function generarSlug(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Normalizador neutro de estructura de Servicio / Asesoría
export function normalizarProducto(p = {}) {
  const prod = p && typeof p === 'object' ? p : {};
  const nombreEs = prod.nombre?.es || (typeof prod.nombre === 'string' ? prod.nombre : '');
  const idDefault = prod.id || (nombreEs ? generarSlug(nombreEs) : `srv-${Date.now()}`);

  const tipo = (prod.tipo === 'asesoria' || prod.tipo === 'taller') ? 'asesoria' : 'servicio';

  // Garantías bilingües
  const garantiasEs = Array.isArray(prod.garantias?.es)
    ? prod.garantias.es
    : (Array.isArray(prod.garantias) ? prod.garantias : []);
  const garantiasEn = Array.isArray(prod.garantias?.en)
    ? prod.garantias.en
    : (Array.isArray(prod.garantiasEn) ? prod.garantiasEn : []);

  // Duración bilingüe
  const duracionEs = typeof prod.duracion === 'object' && prod.duracion !== null
    ? (prod.duracion.es || '')
    : (prod.duracion || '');
  const duracionEn = typeof prod.duracion === 'object' && prod.duracion !== null
    ? (prod.duracion.en || '')
    : (prod.duracionEn || '');

  // Modalidad bilingüe
  const modalidadEs = typeof prod.modalidad === 'object' && prod.modalidad !== null
    ? (prod.modalidad.es || '')
    : (prod.modalidad || '');
  const modalidadEn = typeof prod.modalidad === 'object' && prod.modalidad !== null
    ? (prod.modalidad.en || '')
    : (prod.modalidadEn || '');

  // Público bilingüe
  const publicoEs = typeof prod.publico === 'object' && prod.publico !== null
    ? (prod.publico.es || '')
    : (prod.publico || '');
  const publicoEn = typeof prod.publico === 'object' && prod.publico !== null
    ? (prod.publico.en || '')
    : (prod.publicoEn || '');

  // Badge bilingüe
  const badgeEs = typeof prod.badge === 'object' && prod.badge !== null
    ? (prod.badge.es || '')
    : (prod.badge || (prod.pin ? 'Recomendado' : ''));
  const badgeEn = typeof prod.badge === 'object' && prod.badge !== null
    ? (prod.badge.en || '')
    : (prod.badgeEn || (prod.pin ? 'Recommended' : ''));

  const precio = Number(prod.precioPEN ?? prod.precio ?? prod.price ?? 0);

  return {
    id: String(idDefault),
    slug: String(prod.slug || idDefault),
    tipo,
    estado: (prod.estado === 'pausado' || prod.activo === false) ? 'pausado' : 'activo',
    activo: prod.estado === 'pausado' || prod.activo === false ? false : true,
    pin: Boolean(prod.pin),
    orden: Number(prod.orden ?? 1),
    precioPEN: precio,
    precio: precio,
    enfoque: String(prod.enfoque || ''),
    imagen: String(prod.imagen || ''),
    badgeIcon: String(prod.badgeIcon || 'fa-solid fa-star'),
    tagClase: String(prod.tagClase || 'badge-serenidad'),
    actualizado: prod.actualizado || null,

    // Mapas Bilingües Oficiales
    nombre: {
      es: String(nombreEs),
      en: String(prod.nombre?.en || prod.nombreEn || '')
    },
    descripcion: {
      es: String(prod.descripcion?.es || (typeof prod.descripcion === 'string' ? prod.descripcion : '')),
      en: String(prod.descripcion?.en || prod.descripcionEn || '')
    },
    duracion: {
      es: duracionEs,
      en: duracionEn
    },
    modalidad: {
      es: modalidadEs,
      en: modalidadEn
    },
    publico: {
      es: publicoEs,
      en: publicoEn
    },
    badge: {
      es: badgeEs,
      en: badgeEn
    },
    garantias: {
      es: garantiasEs,
      en: garantiasEn
    }
  };
}

/**
 * Aplana un servicio bilingüe a un solo idioma para consumo directo en vistas
 */
export function aplanarProducto(prod, idioma = 'es') {
  if (!prod) return null;
  const p = normalizarProducto(prod);
  const lang = idioma === 'en' ? 'en' : 'es';

  return {
    ...p,
    nombre: p.nombre[lang] || p.nombre.es || '',
    descripcion: p.descripcion[lang] || p.descripcion.es || '',
    duracion: p.duracion[lang] || p.duracion.es || '',
    modalidad: p.modalidad[lang] || p.modalidad.es || '',
    publico: p.publico[lang] || p.publico.es || '',
    badge: p.badge[lang] || p.badge.es || '',
    garantias: (p.garantias[lang] && p.garantias[lang].length > 0) ? p.garantias[lang] : p.garantias.es
  };
}

let _memoriaProductos = null;

export function getUsuarioActivo() {
  const u = getls('wiSmile') || {};
  return {
    userId: u.uid || u.id || 'admin',
    email: u.email || '',
    autor: u.nombre || u.usuario || 'Usuario'
  };
}

/**
 * Obtiene los servicios almacenados en memoria, localStorage o semilla (Prioridad 1° Local / Firestore, 2° Semilla)
 */
export function obtenerProductosLocal() {
  if (_memoriaProductos && Array.isArray(_memoriaProductos) && _memoriaProductos.length > 0) {
    return _memoriaProductos;
  }

  // 1. Revisar localStorage (wi_productos, wi_servicios o gaswii_productos)
  try {
    const local = getls(STORAGE_KEY) || getls(OLD_STORAGE_KEY) || getls('gaswii_productos');
    if (Array.isArray(local) && local.length > 0) {
      _memoriaProductos = local.map(normalizarProducto).sort((a, b) => (a.orden || 999) - (b.orden || 999));
      savels(STORAGE_KEY, _memoriaProductos);
      return _memoriaProductos;
    }
  } catch (e) {}

  // 2. Fallback a Semilla oficial
  const semillas = (Array.isArray(productosSemilla) ? productosSemilla : []).map(normalizarProducto);
  _memoriaProductos = semillas;
  try {
    savels(STORAGE_KEY, semillas);
  } catch (e) {}

  return _memoriaProductos;
}

/**
 * Guarda el array de productos en caché local
 */
export function guardarProductosLocal(lista = []) {
  const normalizados = lista.map(normalizarProducto).sort((a, b) => (a.orden || 999) - (b.orden || 999));
  _memoriaProductos = normalizados;
  savels(STORAGE_KEY, normalizados);
  try {
    savels('gaswii_productos', normalizados);
  } catch (e) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wi:productos-actualizado', { detail: normalizados }));
    window.dispatchEvent(new CustomEvent('gaswii:productos-actualizado', { detail: normalizados }));
  }
  return normalizados;
}

/**
 * Sincroniza desde Firestore hacia Local-First o siembra la semilla si está vacía
 */
export async function sincronizarProductosFirestore(opciones = {}) {
  try {
    if (!db) {
      return { ok: true, origen: 'local', datos: obtenerProductosLocal() };
    }

    if (opciones.forzarSemilla) {
      const sembrados = await resembrarProductosDesdeSemilla();
      return { ok: true, origen: 'semilla_resembrada', datos: sembrados };
    }

    const colRef = collection(db, COLECCION_PRODUCTOS);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      const locales = await resembrarProductosDesdeSemilla();
      return { ok: true, origen: 'semilla_sembrada', datos: locales };
    }

    const remotos = snap.docs.map(d => {
      const data = d.data();
      delete data.userId;
      delete data.email;
      delete data.creado;
      return normalizarProducto({ id: d.id, ...data });
    });

    guardarProductosLocal(remotos);
    return { ok: true, origen: 'firestore', datos: remotos };
  } catch (err) {
    console.warn('[dataProductos] Sincronización Firestore:', err?.message || err);
    return { ok: false, error: err?.message, datos: obtenerProductosLocal() };
  }
}

/**
 * Resiembra y sincroniza en Firestore los productos canónicos de la semilla
 */
export async function resembrarProductosDesdeSemilla() {
  const semillas = (Array.isArray(productosSemilla) ? productosSemilla : []).map(normalizarProducto);
  if (db) {
    for (const item of semillas) {
      try {
        const payload = { ...item };
        delete payload.userId;
        delete payload.email;
        delete payload.creado;

        await setDoc(doc(db, COLECCION_PRODUCTOS, item.id), {
          ...payload,
          actualizado: serverTimestamp()
        });
      } catch (err) {
        console.warn('[dataProductos] Error al sembrar producto:', item.id, err);
      }
    }
  }
  guardarProductosLocal(semillas);
  solicitarActualizacionWeb({ motivo: 'productos-catalogo-canonico' });
  return semillas;
}

// Alias de retrocompatibilidad
export const resembrarServiciosDesdeSemilla = resembrarProductosDesdeSemilla;

/**
 * Guarda o actualiza un producto en Firestore y en local (100% limpio sin email ni userId)
 * Motor Central Zero-Waste: Local-First (0 ms) + Dirty Checking + Cloudflare Deploy en Segundo Plano
 */
export async function guardarProductoFirestore(productoRaw = {}) {
  const normalizado = normalizarProducto(productoRaw);

  const prodFinal = {
    ...normalizado,
    actualizado: new Date().toISOString()
  };
  delete prodFinal.userId;
  delete prodFinal.email;
  delete prodFinal.creado;

  // 1. Preparar lista para Local-First
  const actuales = obtenerProductosLocal();
  const idx = actuales.findIndex(p => p.id === prodFinal.id);
  if (idx >= 0) {
    actuales[idx] = prodFinal;
  } else {
    actuales.push(prodFinal);
  }

  // 2. Ejecutar mediante el Motor Central Zero-Waste
  await actualizarCentral({
    modulo: 'productos',
    coleccion: COLECCION_PRODUCTOS,
    docId: prodFinal.id,
    storageKey: STORAGE_KEY,
    evento: 'wi:productos-actualizado',
    datos: prodFinal,
    listaStorage: actuales,
    redeploy: true,
    mensajeExito: `Producto ${prodFinal.nombre.es || prodFinal.id} actualizado al instante`
  });

  return prodFinal;
}

/**
 * Cambia el estado de un producto (activo / pausado)
 */
export async function cambiarEstadoProducto(id, nuevoEstado) {
  const lista = obtenerProductosLocal();
  const item = lista.find(p => p.id === id);
  if (!item) return null;

  item.estado = nuevoEstado;
  item.activo = nuevoEstado === 'activo';
  return guardarProductoFirestore(item);
}

/**
 * Elimina un producto de local y Firestore mediante el motor central
 */
export async function eliminarProductoFirestore(id) {
  const lista = obtenerProductosLocal().filter(p => p.id !== id);

  await eliminarCentral({
    modulo: 'productos',
    coleccion: COLECCION_PRODUCTOS,
    docId: id,
    storageKey: STORAGE_KEY,
    evento: 'wi:productos-actualizado',
    listaActualizada: lista,
    redeploy: true,
    mensajeExito: 'Producto eliminado del catálogo'
  });

  return true;
}

export default {
  STORAGE_KEY,
  COLECCION_PRODUCTOS,
  COLECCION_SERVICIOS,
  obtenerProductosLocal,
  guardarProductosLocal,
  sincronizarProductosFirestore,
  resembrarServiciosDesdeSemilla,
  resembrarProductosDesdeSemilla,
  guardarProductoFirestore,
  cambiarEstadoProducto,
  eliminarProductoFirestore,
  normalizarProducto,
  aplanarProducto
};
