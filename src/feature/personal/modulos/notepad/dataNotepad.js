// src/feature/personal/modulos/notepad/dataNotepad.js
// Capa de Datos Local-First con Sincronización en Segundo Plano con Firestore
// Colección: 'notas_personal' · Zero TypeScript · 100% JavaScript Nativo
// Utiliza Aliases: @widev y @core

import { savels, getls } from '@widev';

export const STORAGE_KEY = 'gaswii_owner_notes';

export function getUsuarioActivo() {
  try {
    const u = getls('wiSmile');
    if (u) {
      return {
        userId: u.uid || u.id || 'anonimo',
        email: u.email || '',
        autor: u.nombre || u.usuario || 'Personal'
      };
    }
  } catch (e) {}
  return {
    userId: 'personal_local',
    email: 'personal@solgassurquillo.com',
    autor: 'Solgas Personal'
  };
}

export function recortar10Palabras(texto) {
  if (!texto) return '';
  const palabras = texto.trim().split(/\s+/);
  if (palabras.length <= 10) return palabras.join(' ');
  return palabras.slice(0, 10).join(' ') + '...';
}

function ordenarNotas(arr) {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    // 1. Fijadas primero
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    // 2. Más recientes primero
    const dateA = a.actualizadoTimestamp || (a.id ? a.id.replace(/\D/g, '') : 0);
    const dateB = b.actualizadoTimestamp || (b.id ? b.id.replace(/\D/g, '') : 0);
    return dateB > dateA ? 1 : -1;
  });
}

export function obtenerNotas() {
  try {
    const guardadas = getls(STORAGE_KEY);
    if (guardadas && Array.isArray(guardadas)) {
      // Filtrar semillas de prueba antiguas si existieran (n_101, n_102, n_103)
      const limpias = guardadas.filter(n => !['n_101', 'n_102', 'n_103'].includes(n.id));
      if (limpias.length !== guardadas.length) {
        guardarNotasLocal(limpias);
      }
      return ordenarNotas(limpias);
    }
  } catch (e) {}

  return [];
}

export function guardarNotasLocal(arr) {
  try {
    savels(STORAGE_KEY, ordenarNotas(arr));
  } catch (e) {}
}

export function guardarNotaData(notaInput) {
  const todas = obtenerNotas();
  const usuario = getUsuarioActivo();
  const ahora = new Date();
  const fechaStr = `${ahora.getDate()} ${ahora.toLocaleString('es-ES', { month: 'short' })}, ${ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const timestamp = ahora.getTime();

  let notaGuardada = null;

  if (notaInput.id) {
    const idx = todas.findIndex(n => n.id === notaInput.id);
    if (idx >= 0) {
      todas[idx] = {
        ...todas[idx],
        titulo: notaInput.titulo || 'Nota sin título',
        contenido: notaInput.contenido || '',
        contenidoMD: notaInput.contenidoMD || notaInput.contenido || '',
        tag: notaInput.tag || todas[idx].tag || 'Urgente',
        pin: typeof notaInput.pin === 'boolean' ? notaInput.pin : todas[idx].pin || false,
        done: typeof notaInput.done === 'boolean' ? notaInput.done : todas[idx].done || false,
        actualizado: fechaStr,
        actualizadoTimestamp: timestamp,
        resumen10: recortar10Palabras(notaInput.contenido || notaInput.titulo)
      };
      notaGuardada = todas[idx];
    }
  }

  if (!notaGuardada) {
    notaGuardada = {
      id: 'n_' + timestamp,
      titulo: notaInput.titulo || 'Nota sin título',
      contenido: notaInput.contenido || '',
      contenidoMD: notaInput.contenidoMD || notaInput.contenido || '',
      tag: notaInput.tag || 'Urgente',
      pin: Boolean(notaInput.pin),
      done: Boolean(notaInput.done),
      userId: usuario.userId,
      email: usuario.email,
      autor: usuario.autor,
      creado: fechaStr,
      creadoTimestamp: timestamp,
      actualizado: fechaStr,
      actualizadoTimestamp: timestamp,
      resumen10: recortar10Palabras(notaInput.contenido || notaInput.titulo)
    };
    todas.unshift(notaGuardada);
  }

  guardarNotasLocal(todas);

  // Sincronización en segundo plano fire-and-forget (0ms en UI)
  sincronizarNotaFirestoreEnSegundoPlano(notaGuardada);

  return notaGuardada;
}

export function eliminarNotaData(id) {
  let todas = obtenerNotas();
  todas = todas.filter(n => n.id !== id);
  guardarNotasLocal(todas);

  // Eliminación silenciosa en segundo plano de Firestore
  eliminarNotaFirestoreEnSegundoPlano(id);
  return todas;
}

export function togglePinNotaData(id) {
  const todas = obtenerNotas();
  const nota = todas.find(n => n.id === id);
  if (nota) {
    nota.pin = !nota.pin;
    guardarNotasLocal(todas);
    sincronizarNotaFirestoreEnSegundoPlano(nota);
  }
  return obtenerNotas();
}

export function toggleDoneNotaData(id) {
  const todas = obtenerNotas();
  const nota = todas.find(n => n.id === id);
  if (nota) {
    nota.done = !nota.done;
    guardarNotasLocal(todas);
    sincronizarNotaFirestoreEnSegundoPlano(nota);
  }
  return obtenerNotas();
}

// Background Firestore Operations usando el alias @core
async function sincronizarNotaFirestoreEnSegundoPlano(nota) {
  if (!nota || !nota.id) return;
  try {
    const { db } = await import('@core/servicios/firebase.js');
    const { doc, setDoc } = await import('firebase/firestore');
    if (!db) return;
    await setDoc(doc(db, 'notas_personal', nota.id), {
      ...nota,
      syncTimestamp: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Silencioso en background para no interrumpir el flujo del usuario
    console.warn('[dataNotepad] Sync background Firestore diferido:', err?.message || err);
  }
}

async function eliminarNotaFirestoreEnSegundoPlano(id) {
  if (!id) return;
  try {
    const { db } = await import('@core/servicios/firebase.js');
    const { doc, deleteDoc } = await import('firebase/firestore');
    if (!db) return;
    await deleteDoc(doc(db, 'notas_personal', id));
  } catch (err) {
    console.warn('[dataNotepad] Delete background Firestore diferido:', err?.message || err);
  }
}
