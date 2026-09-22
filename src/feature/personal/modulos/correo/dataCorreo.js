// src/feature/personal/modulos/correo/dataCorreo.js
// 🎯 Capa de Datos Local-First de Envíos de Correo con Sincronización Firestore y Resend API
// Colección: 'correos' · Documento: 'correo_{timestamp}' · 100% JS Nativo · Integrado con @widev

import { savels, getls } from '@widev';
import { db } from '@core/servicios/firebase.js';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getUsuarioActivo } from '../negocio/dataNegocio.js';

export const STORAGE_KEY = 'gaswii_correos_historial';
export const STORAGE_KEY_AJUSTES = 'gaswii_correo_ajustes';
export const COLECCION_CORREOS = 'correos';

// Memoria volátil en sesión
let _memoriaCorreos = null;

/**
 * Obtiene los ajustes predeterminados de correo
 */
export function obtenerAjustesCorreo() {
  const guardado = getls(STORAGE_KEY_AJUSTES);
  return {
    remitenteNombre: guardado?.remitenteNombre || 'Solgas Surquillo',
    remitenteEmail: guardado?.remitenteEmail || 'pedidos@solgassurquillo.com',
    responderA: guardado?.responderA || 'pedidos@solgassurquillo.com',
    dominio: 'solgassurquillo.com'
  };
}

/**
 * Guarda los ajustes predeterminados de correo
 */
export function guardarAjustesCorreo(nuevos = {}) {
  const actual = obtenerAjustesCorreo();
  const actualizado = { ...actual, ...nuevos };
  savels(STORAGE_KEY_AJUSTES, actualizado);
  return actualizado;
}

/**
 * Obtiene la API Key de Resend (desde variables de entorno)
 */
function getResendApiKey() {
  return (
    import.meta.env.PUBLIC_RESEND_API_KEY ||
    import.meta.env.RESEND_API_KEY ||
    ''
  ).trim();
}

/**
 * Formatea una fecha a formato amigable en español: "21 Sep 2026, 12:38 pm"
 */
function formatearFechaLegible(dateObj = new Date()) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

/**
 * Limpia y extrae una dirección de correo válida evitando símbolos extra o envoltorios erróneos
 */
export function limpiarEmail(str = '') {
  if (!str || typeof str !== 'string') return '';
  const match = str.match(/<([^>]+)>/);
  const email = (match ? match[1] : str).trim();
  return email.replace(/[<>\s]/g, '').trim();
}

/**
 * Formatea el remitente estrictamente bajo el estándar requerido por Resend:
 * "Nombre Remitente <email@dominio.com>"
 */
export function formatearRemitente(nombre = '', email = '') {
  const emailPuro = limpiarEmail(email) || 'pedidos@solgassurquillo.com';
  const nombrePuro = (nombre || 'Solgas Surquillo').replace(/[<>]/g, '').trim();

  // Asegurar que el dominio de salida coincida con el dominio autenticado
  const dominioValido = 'solgassurquillo.com';
  const emailFinal = emailPuro.toLowerCase().endsWith(`@${dominioValido}`)
    ? emailPuro
    : 'pedidos@solgassurquillo.com';

  return `${nombrePuro} <${emailFinal}>`;
}

/**
 * Obtiene el historial de correos enviados (Caché local primero, luego memoria)
 */
export function obtenerCorreos() {
  if (_memoriaCorreos) return _memoriaCorreos;

  try {
    const local = getls(STORAGE_KEY);
    if (Array.isArray(local)) {
      _memoriaCorreos = local;
      return _memoriaCorreos;
    }
  } catch (e) {}

  _memoriaCorreos = [];
  return _memoriaCorreos;
}

/**
 * Guarda un correo en la caché local
 */
export function guardarCorreoLocal(correo) {
  const actual = obtenerCorreos();
  // Evitar duplicados por ID
  const filtrados = actual.filter(c => c.id !== correo.id);
  const nuevoHistorial = [correo, ...filtrados];
  _memoriaCorreos = nuevoHistorial;
  savels(STORAGE_KEY, nuevoHistorial);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gaswii:correo-enviado', { detail: correo }));
  }
}

/**
 * Envía un correo electrónico a través de la API de Resend y lo registra en Firestore 'correos'
 */
export async function enviarCorreo({
  para,
  nombre = '',
  cc = [],
  asunto,
  tipo = 'general',
  mensaje = '',
  html = '',
  pedidoId = '',
  clienteId = '',
  desde = '',
  responderA = ''
} = {}) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error('Falta la clave RESEND_API_KEY en las variables de entorno.');
  }

  if (!para) {
    throw new Error('Debes indicar al menos un correo de destinatario.');
  }

  if (!asunto) {
    throw new Error('El asunto del correo no puede estar vacío.');
  }

  const ajustes = obtenerAjustesCorreo();
  const remitenteFinal = desde 
    ? (desde.includes('<') ? desde : `${ajustes.remitenteNombre} <${limpiarEmail(desde)}>`)
    : formatearRemitente(ajustes.remitenteNombre, ajustes.remitenteEmail);

  const responderAFinal = responderA 
    ? limpiarEmail(responderA) 
    : (limpiarEmail(ajustes.responderA) || 'pedidos@solgassurquillo.com');

  // Limpiar y asegurar formato de los destinatarios
  const rawDestinatarios = Array.isArray(para)
    ? para
    : [para];

  const destinatariosArray = rawDestinatarios
    .map(p => {
      const emailLimpio = limpiarEmail(p);
      return emailLimpio;
    })
    .filter(Boolean);

  if (destinatariosArray.length === 0) {
    throw new Error('El correo del destinatario no tiene un formato válido.');
  }

  // Limpiar y asegurar formato de las copias (CC)
  const rawCc = Array.isArray(cc)
    ? cc
    : (typeof cc === 'string' && cc ? cc.split(',') : []);

  const ccArray = rawCc
    .map(c => limpiarEmail(c))
    .filter(Boolean);

  // 1. Enviar a través de la API REST oficial de Resend
  const payloadResend = {
    from: remitenteFinal,
    to: destinatariosArray,
    subject: asunto,
    html: html || `<p>${mensaje.replace(/\n/g, '<br/>')}</p>`
  };

  if (ccArray.length > 0) {
    payloadResend.cc = ccArray;
  }
  if (responderAFinal) {
    payloadResend.reply_to = responderAFinal;
  }

  let respuestaResend = null;
  try {
    // Conexión directa al Microservicio Autónomo de Cloudflare Worker
    // Maneja CORS, llamadas seguras a Resend y es reutilizable para cualquier negocio
    const endpoint = 'https://gaswii-correo.lourdesinformatica10.workers.dev/enviar';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadResend)
    });

    respuestaResend = await res.json();

    if (!res.ok) {
      let errorMsg = respuestaResend?.message || `Error en Resend HTTP ${res.status}`;
      if (errorMsg.includes('Invalid `from` field') || errorMsg.includes('Invalid `to` field')) {
        errorMsg = 'Formato de remitente o destinatario no válido. Se espera un correo limpio.';
      } else if (errorMsg.includes('not verified')) {
        errorMsg = 'El dominio de envío debe ser solgassurquillo.com (verificado en Resend).';
      }
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('[dataCorreo] Error al enviar con Resend:', err);
    throw err;
  }

  // 2. Preparar documento oficial para Firestore con campos raíz limpios
  const ahora = new Date();
  const timestamp = ahora.getTime();
  const docId = `correo_${timestamp}`;
  const usuario = getUsuarioActivo();

  const registroCorreo = {
    id: docId,
    resendId: respuestaResend?.id || '',
    estado: 'enviado',
    destinatario: {
      para: destinatariosArray.join(', '),
      nombre: nombre || '',
      cc: ccArray
    },
    remitente: {
      desde,
      responderA
    },
    mensaje: {
      asunto,
      tipo,
      resumen: mensaje ? mensaje.substring(0, 90) : asunto,
      html: html || ''
    },
    relacion: {
      pedidoId: pedidoId || '',
      clienteId: clienteId || ''
    },
    autor: usuario.autor || 'Personal Solgas',
    userId: usuario.userId || '',
    email: usuario.email || '',
    fecha: formatearFechaLegible(ahora),
    creado: serverTimestamp()
  };

  // 3. Guardar en caché local inmediatamente (0ms UI feedback)
  guardarCorreoLocal({
    ...registroCorreo,
    creado: timestamp
  });

  // 4. Guardar en Firestore en segundo plano (asíncrono)
  if (db) {
    setDoc(doc(db, COLECCION_CORREOS, docId), registroCorreo).catch(err => {
      console.warn('[dataCorreo] Error al sincronizar con Firestore:', err?.message || err);
    });
  }

  return registroCorreo;
}

/**
 * Carga los correos más recientes desde Firestore y actualiza la caché local
 */
export async function sincronizarCorreosDesdeFirestore() {
  if (!db) return obtenerCorreos();

  try {
    const q = query(
      collection(db, COLECCION_CORREOS),
      orderBy('creado', 'desc'),
      limit(50)
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
      const remotos = snap.docs.map(d => {
        const data = d.data();
        let fechaFormateada = data.fecha;
        if (!fechaFormateada && data.creado?.seconds) {
          fechaFormateada = formatearFechaLegible(new Date(data.creado.seconds * 1000));
        }
        return {
          ...data,
          id: d.id,
          fecha: fechaFormateada || 'Reciente'
        };
      });

      _memoriaCorreos = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.warn('[dataCorreo] Error al leer historial de Firestore:', err?.message || err);
  }

  return obtenerCorreos();
}
