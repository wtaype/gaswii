// src/feature/personal/modulos/notepad/notepad.js
// Controlador Frontend Autónomo de Notepad (70% Canvas / 30% Lista Resumida)
// Cero TypeScript · 100% JavaScript Nativo · Local-First · Integración widev.js
// Utiliza Aliases: @widev

import { Notificacion, wiSpin, wiEditor, wiAtajo } from '@widev';
import {
  obtenerNotas,
  guardarNotaData,
  eliminarNotaData,
  togglePinNotaData,
  toggleDoneNotaData,
  recortar10Palabras
} from './dataNotepad.js';

export function inicializarNotepad() {
  const panelNotepad = document.getElementById('panel-notepad');
  if (!panelNotepad) return;

  const notepadCompactList = document.getElementById('notepadCompactList');
  const notepadBadgeCount = document.getElementById('notepadBadgeCount');
  const notepadTitle = document.getElementById('notepadTitle');
  const notepadContent = document.getElementById('notepadContent');
  const notepadCurrentId = document.getElementById('notepadCurrentId');
  const noteEditorStatus = document.getElementById('noteEditorStatus');
  const noteCharCount = document.getElementById('noteCharCount');
  const noteWordCount = document.getElementById('noteWordCount');
  const tagPillGroup = document.getElementById('tagPillGroup');
  const btnSaveNotepadFull = document.getElementById('btnSaveNotepadFull');
  const btnClearNote = document.getElementById('btnClearNote');
  const btnNewNoteCanvas = document.getElementById('btnNewNoteCanvas');
  const btnPinCanvas = document.getElementById('btnPinCanvas');

  let currentActiveTag = 'Urgente';
  let currentIsPinned = false;

  // 1. Integración con wiEditor (Markdown + Preview + Galería + Atajos Ctrl+B/I)
  if (notepadContent && typeof wiEditor === 'function') {
    try {
      wiEditor(notepadContent);
    } catch (err) {
      console.warn('[wiEditor] Inicialización básica:', err);
    }
  }

  // 2. Contadores de caracteres y palabras en tiempo real
  function updateCounts() {
    const val = notepadContent?.value || '';
    const chars = val.length;
    const words = val.trim() ? val.trim().split(/\s+/).filter(Boolean).length : 0;
    if (noteCharCount) noteCharCount.textContent = `${chars} caracteres`;
    if (noteWordCount) noteWordCount.textContent = `${words} palabras`;
  }

  notepadContent?.addEventListener('input', updateCounts);

  // 3. Selección de Tags
  tagPillGroup?.querySelectorAll('.ps-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      tagPillGroup.querySelectorAll('.ps-tag-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentActiveTag = pill.getAttribute('data-tag') || 'Urgente';
    });
  });

  function setTagPill(tag) {
    currentActiveTag = tag;
    tagPillGroup?.querySelectorAll('.ps-tag-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-tag') === tag);
    });
  }

  function setPinState(pinned) {
    currentIsPinned = Boolean(pinned);
    if (btnPinCanvas) {
      btnPinCanvas.classList.toggle('active', currentIsPinned);
      btnPinCanvas.innerHTML = currentIsPinned
        ? '<i class="fa-solid fa-thumbtack"></i> Fijada'
        : '<i class="fa-regular fa-thumbtack"></i> Fijar';
    }
  }

  btnPinCanvas?.addEventListener('click', () => {
    setPinState(!currentIsPinned);
  });

  // 4. Renderizado de la Lista Resumida (30%)
  function renderNotes() {
    const notas = obtenerNotas();
    if (notepadBadgeCount) {
      notepadBadgeCount.textContent = `${notas.length} ${notas.length === 1 ? 'nota' : 'notas'}`;
    }

    if (!notepadCompactList) return;

    if (notas.length === 0) {
      notepadCompactList.innerHTML = `
        <div class="np-empty-state">
          <i class="fa-regular fa-note-sticky np-empty-icon"></i>
          <p class="np-empty-title">Sin apuntes aún</p>
          <p class="np-empty-sub">Comienza a redactar en el editor y presiona <strong>Guardar Nota</strong>.</p>
        </div>
      `;
      return;
    }

    notepadCompactList.innerHTML = notas.map(n => {
      const resumen = recortar10Palabras(n.contenido || n.titulo);
      const isActive = notepadCurrentId?.value === n.id;
      const isPinned = Boolean(n.pin);
      const isDone = Boolean(n.done);

      return `
        <div class="np-summary-card ${isActive ? 'active' : ''} ${isPinned ? 'pinned' : ''} ${isDone ? 'done' : ''}" data-note-id="${n.id}">
          <div class="np-card-top">
            <span class="np-card-title">
              ${isPinned ? '<i class="fa-solid fa-thumbtack" style="color:var(--brand-orange); margin-right:4px; font-size:10px;"></i>' : ''}
              ${n.titulo || 'Sin título'}
            </span>
            <span class="ps-badge ps-badge-blue" style="font-size:10px; padding:1px 5px;">${n.tag || 'General'}</span>
          </div>
          <p class="np-card-snippet">${resumen}</p>
          <div class="np-card-meta">
            <span>${n.actualizado || n.creado || ''}</span>
            <div style="display:flex; gap:6px;">
              <button type="button" class="np-btn-icon-action btn-pin-note ${isPinned ? 'active' : ''}" title="${isPinned ? 'Desfijar nota' : 'Fijar arriba'}" style="color:${isPinned ? 'var(--brand-orange)' : 'var(--muted)'};">
                <i class="fa-solid fa-thumbtack"></i>
              </button>
              <button type="button" class="np-btn-icon-action btn-toggle-done" title="${isDone ? 'Marcar como pendiente' : 'Marcar como completada'}" style="color:${isDone ? 'var(--green)' : 'var(--muted)'};">
                <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
              </button>
              <button type="button" class="np-btn-icon-action btn-delete-note" title="Eliminar nota" style="color:var(--muted);">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Eventos al hacer clic en una nota de la lista
    notepadCompactList.querySelectorAll('.np-summary-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-toggle-done') || e.target.closest('.btn-delete-note') || e.target.closest('.btn-pin-note')) {
          return;
        }
        const id = card.getAttribute('data-note-id');
        const targetNote = obtenerNotas().find(item => item.id === id);
        if (targetNote) loadNoteIntoEditor(targetNote);
      });
    });

    // Fijar nota (Pin)
    notepadCompactList.querySelectorAll('.btn-pin-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.np-summary-card');
        const id = card?.getAttribute('data-note-id');
        if (id) {
          togglePinNotaData(id);
          if (notepadCurrentId?.value === id) {
            setPinState(!currentIsPinned);
          }
          renderNotes();
        }
      });
    });

    // Toggle Done
    notepadCompactList.querySelectorAll('.btn-toggle-done').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.np-summary-card');
        const id = card?.getAttribute('data-note-id');
        if (id) {
          toggleDoneNotaData(id);
          renderNotes();
        }
      });
    });

    // Eliminar nota
    notepadCompactList.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.np-summary-card');
        const id = card?.getAttribute('data-note-id');
        if (id) {
          eliminarNotaData(id);
          if (notepadCurrentId?.value === id) {
            clearEditor();
          } else {
            renderNotes();
          }
          Notificacion('Nota eliminada del Notepad', 'warning', 2000);
        }
      });
    });
  }

  // 5. Cargar nota en el Canvas
  function loadNoteIntoEditor(note) {
    if (!notepadTitle || !notepadContent) return;
    notepadCurrentId.value = note.id;
    notepadTitle.value = note.titulo || '';
    notepadContent.value = note.contenido || note.texto || '';
    setTagPill(note.tag || 'Urgente');
    setPinState(Boolean(note.pin));
    if (noteEditorStatus) {
      noteEditorStatus.textContent = `Editando apunte (${note.actualizado || note.creado || 'Guardado'})`;
    }
    updateCounts();
    renderNotes();
  }

  // 6. Limpiar Canvas para nueva nota
  function clearEditor() {
    if (!notepadTitle || !notepadContent) return;
    notepadCurrentId.value = '';
    notepadTitle.value = '';
    notepadContent.value = '';
    setTagPill('Urgente');
    setPinState(false);
    if (noteEditorStatus) noteEditorStatus.textContent = 'Nueva nota en blanco';
    updateCounts();
    renderNotes();
  }

  btnClearNote?.addEventListener('click', clearEditor);
  btnNewNoteCanvas?.addEventListener('click', () => {
    clearEditor();
    notepadTitle?.focus();
  });

  // 7. Navegación fluida: Tab en Título pasa directo al Editor de Texto
  notepadTitle?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      notepadContent?.focus();
    }
  });

  // 8. Rutina Central de Guardado de Nota (Local-First + Firestore + Notificacion + wiSpin)
  function guardarNotaActual() {
    const titulo = notepadTitle?.value?.trim();
    const contenido = notepadContent?.value?.trim();

    if (!contenido && !titulo) {
      Notificacion('Escribe al menos un título o contenido en la nota', 'warning', 2500);
      return;
    }

    // Activar spinner de carga en el botón
    if (btnSaveNotepadFull) {
      wiSpin(btnSaveNotepadFull, true, 'Guardando...');
    }

    const existingId = notepadCurrentId?.value;
    const notaData = {
      id: existingId || undefined,
      titulo: titulo || 'Nota sin título',
      contenido: contenido,
      contenidoMD: contenido,
      tag: currentActiveTag,
      pin: currentIsPinned,
      done: false
    };

    const notaGuardada = guardarNotaData(notaData);
    if (notepadCurrentId) notepadCurrentId.value = notaGuardada.id;
    if (noteEditorStatus) noteEditorStatus.textContent = `Guardado (${notaGuardada.actualizado})`;

    setTimeout(() => {
      if (btnSaveNotepadFull) {
        wiSpin(btnSaveNotepadFull, false);
      }
      renderNotes();
      Notificacion('Nota guardada con éxito en tu Notepad', 'success', 2500);
    }, 350);
  }

  btnSaveNotepadFull?.addEventListener('click', guardarNotaActual);

  // 9. Atajo Ctrl + S (usando wiAtajo de widev.js y soporte en campos de texto)
  wiAtajo('ctrl+s', () => {
    const panel = document.getElementById('panel-notepad');
    if (panel && panel.classList.contains('active')) {
      guardarNotaActual();
    }
  });

  // Captura directa dentro del formulario para anular el diálogo del navegador y guardar al instante
  const atajoGuardarFormulario = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      guardarNotaActual();
    }
  };

  notepadTitle?.addEventListener('keydown', atajoGuardarFormulario);
  notepadContent?.addEventListener('keydown', atajoGuardarFormulario);
  panelNotepad?.addEventListener('keydown', atajoGuardarFormulario);

  // Inicializar estado limpio
  renderNotes();
  const notas = obtenerNotas();
  if (notas.length > 0) {
    loadNoteIntoEditor(notas[0]);
  } else {
    clearEditor();
  }
}

// Auto-inicialización si el DOM ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNotepad);
} else {
  inicializarNotepad();
}
