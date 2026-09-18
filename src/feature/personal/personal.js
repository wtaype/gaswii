// src/feature/personal/personal.js
// Controlador Central Interactivo del Portal Gerencial Solgas Surquillo (Gaswii)
// Arquitectura Local-First (0ms), Consulta Real de 'smiles' (rol == 'cliente') en Firestore y wiSmile

import { salir, getSmileLocal, wiAuth } from '../auth/sesion.js';
import { Mensaje, abrirModal, cerrarModal, setTema, wiConfirmar } from '../../core/widev/widev.js';
import { personalStore, productoStore, clienteStore, sunatStore } from './data/storePersonal.js';

export function initPersonal() {
  if (typeof window === 'undefined') return;

  const idiomaActivo = document.documentElement.lang || 'es';
  const isEn = idiomaActivo === 'en';

  // -----------------------------------------------------------------
  // 0. VÍNCULO DE SESIÓN REAL CON wiSmile (CERO NOMBRES MOCK)
  // -----------------------------------------------------------------
  function sincronizarPerfilUsuario(user) {
    const nombre = user ? (user.nombre || user.usuario || 'Operador') : 'Operador';
    const iniciales = user ? (user.iniciales || nombre.substring(0, 2).toUpperCase()) : 'OP';
    const rolStr = (user?.rol || 'personal').toUpperCase();

    const bannerAdmin = document.getElementById('bannerAdminNombre');
    const topbarName = document.getElementById('topbarUserName');
    const topbarAvatar = document.getElementById('topbarAvatarInitials');
    const dropdownName = document.getElementById('dropdownUserName');
    const dropdownAvatar = document.getElementById('dropdownAvatarInitials');
    const dropdownRole = document.getElementById('dropdownUserRole');

    if (bannerAdmin) bannerAdmin.textContent = nombre;
    if (topbarName) topbarName.textContent = nombre;
    if (dropdownName) dropdownName.textContent = nombre;
    if (dropdownRole) dropdownRole.textContent = `Rol: ${rolStr}`;

    const pintarAvatar = (el) => {
      if (!el) return;
      if (user?.avatar && user.avatar.startsWith('http')) {
        el.innerHTML = `<img src="${user.avatar}" alt="${nombre}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent='${iniciales}'">`;
      } else {
        el.textContent = iniciales;
      }
    };

    pintarAvatar(topbarAvatar);
    pintarAvatar(dropdownAvatar);
  }

  // Carga inicial y escucha reactiva del bus wiAuth
  sincronizarPerfilUsuario(getSmileLocal());
  wiAuth.on((user) => sincronizarPerfilUsuario(user));

  // -----------------------------------------------------------------
  // 1. RELOJ EN VIVO & SALUDO DINÁMICO
  // -----------------------------------------------------------------
  function actualizarReloj() {
    const ahora = new Date();
    const horas = ahora.getHours();
    const horaStr = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const fechaStr = ahora.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const elemHora = document.getElementById('relojEnVivo');
    const elemFecha = document.getElementById('fechaEnVivo');
    const elemSaludo = document.getElementById('saludoDinamico');

    if (elemHora) elemHora.textContent = horaStr;
    if (elemFecha) elemFecha.textContent = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

    if (elemSaludo) {
      if (horas < 12) elemSaludo.textContent = isEn ? 'Good morning' : 'Buenos días';
      else if (horas < 19) elemSaludo.textContent = isEn ? 'Good afternoon' : 'Buenas tardes';
      else elemSaludo.textContent = isEn ? 'Good evening' : 'Buenas noches';
    }
  }
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // -----------------------------------------------------------------
  // 2. NAVEGACIÓN POR TABS (SIDEBAR, BOTTOM NAV Y KPIS)
  // -----------------------------------------------------------------
  const allNavTriggers = document.querySelectorAll('.v51-nav-btn[data-tab], .v51-bottom-nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.v51-tab-pane');

  function activarTab(tabId) {
    allNavTriggers.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    tabPanes.forEach(p => p.classList.toggle('active', p.id === tabId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.activarTab = activarTab;

  allNavTriggers.forEach(b => b.addEventListener('click', () => activarTab(b.dataset.tab)));

  document.querySelectorAll('[data-goto-tab]').forEach(el => {
    el.addEventListener('click', () => {
      const targetTab = el.getAttribute('data-goto-tab');
      if (targetTab) activarTab(targetTab);
    });
  });

  // -----------------------------------------------------------------
  // 3. DROPDOWN DE USUARIO EN TOPBAR
  // -----------------------------------------------------------------
  const btnUser = document.getElementById('btnUserDropdown');
  const userMenu = document.getElementById('userDropdownMenu');
  const userWrapper = document.getElementById('userDropdownWrapper');

  btnUser?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = userMenu?.classList.toggle('show');
    btnUser.classList.toggle('open', isOpen);
    btnUser.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!userWrapper?.contains(e.target)) {
      userMenu?.classList.remove('show');
      btnUser?.classList.remove('open');
      btnUser?.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('btnCerrarTurno')?.addEventListener('click', async () => {
    userMenu?.classList.remove('show');
    btnUser?.classList.remove('open');
    Mensaje('<i class="fa-solid fa-lock"></i> Finalizando turno seguro...', 'info');
    await salir();
  });

  document.getElementById('btnAjustesPlanta')?.addEventListener('click', () => {
    activarTab('tab-resumen');
    userMenu?.classList.remove('show');
    btnUser?.classList.remove('open');
  });

  // -----------------------------------------------------------------
  // 4. COLAPSAR SIDEBAR
  // -----------------------------------------------------------------
  const sidebar = document.getElementById('v51Sidebar');
  const btnCollapse = document.getElementById('btnToggleCollapse');
  const collapseIcon = document.getElementById('collapseIcon');

  btnCollapse?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
    const isCollapsed = sidebar?.classList.contains('collapsed');
    if (collapseIcon) {
      collapseIcon.className = isCollapsed ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left';
    }
  });

  // -----------------------------------------------------------------
  // 5. GESTOR MODULAR DE MODALES (widev/modales.js)
  // -----------------------------------------------------------------
  window.abrirModal = abrirModal;
  window.cerrarModal = cerrarModal;

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      if (modalId) cerrarModal(modalId);
    });
  });

  document.querySelectorAll('.v51-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.v51-modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // -----------------------------------------------------------------
  // 6. RECÁLCULO DINÁMICO DE KPIS (RESUMEN)
  // -----------------------------------------------------------------
  function actualizarKPIs() {
    const clientes = clienteStore.listar();
    const productos = productoStore.listar();
    const staff = personalStore.listar();
    const cpes = sunatStore.listar();

    const elemCli = document.getElementById('kpiClientesVal');
    const elemProd = document.getElementById('kpiProductosVal');
    const elemStaff = document.getElementById('kpiEquipoVal');
    const elemStaffMeta = document.getElementById('kpiEquipoMeta');
    const elemSunat = document.getElementById('kpiSunatVal');
    const elemStock = document.getElementById('kpiInventarioVal');
    const elemStockMeta = document.getElementById('kpiInventarioMeta');

    const totalLlenos = productos.reduce((acc, p) => acc + (Number(p.stockLlenos) || 0), 0);
    const totalVacios = productos.reduce((acc, p) => acc + (Number(p.stockVacios) || 0), 0);
    const activosStaff = staff.filter(s => s.activo).length;

    if (elemCli) elemCli.textContent = clientes.length;
    if (elemProd) elemProd.textContent = productos.length;
    if (elemStaff) elemStaff.textContent = staff.length;
    if (elemStaffMeta) elemStaffMeta.textContent = `${activosStaff} en turno activo`;
    if (elemSunat) elemSunat.textContent = (348 + cpes.length).toString();
    if (elemStock) elemStock.textContent = totalLlenos.toString();
    if (elemStockMeta) elemStockMeta.textContent = `${totalVacios} vacíos para canje`;
  }

  // -----------------------------------------------------------------
  // 7. GESTIÓN COMPLETA Y EDICIÓN DE PERSONAL
  // -----------------------------------------------------------------
  const tablaPersonalBody = document.getElementById('tablaPersonalBody');
  const prevStaffCard = document.getElementById('prevStaffCard');

  function seleccionarStaff(p) {
    if (!p) return;
    if (prevStaffCard) prevStaffCard.dataset.selectedId = p.id;

    document.querySelectorAll('.v51-staff-row').forEach(r => {
      r.classList.toggle('selected', r.dataset.id === String(p.id));
    });

    const avatarEl = document.getElementById('prevStaffAvatar');
    const nomEl = document.getElementById('prevStaffNombre');
    const rolEl = document.getElementById('prevStaffRol');
    const dniEl = document.getElementById('prevStaffDni');
    const telEl = document.getElementById('prevStaffTel');
    const areaEl = document.getElementById('prevStaffArea');
    const turnoEl = document.getElementById('prevStaffTurno');
    const entEl = document.getElementById('prevStaffEntregas');

    const iniciales = (p.nombre || 'OP').substring(0, 2).toUpperCase();
    if (avatarEl) avatarEl.textContent = iniciales;
    if (nomEl) nomEl.textContent = p.nombre;
    if (rolEl) rolEl.textContent = p.rol;
    if (dniEl) dniEl.textContent = p.dni;
    if (telEl) telEl.textContent = p.telefono;
    if (areaEl) areaEl.textContent = p.area || 'Planta Jr. Dante 260';
    if (turnoEl) turnoEl.textContent = p.turno || 'Turno Regular';
    if (entEl) entEl.textContent = p.entregasMes !== undefined ? `${p.entregasMes} entregas este mes` : 'En operaciones';
  }

  function renderTablaPersonal() {
    if (!tablaPersonalBody) return;
    const lista = personalStore.listar();
    const selectedId = prevStaffCard?.dataset.selectedId || lista[0]?.id;

    tablaPersonalBody.innerHTML = lista.map((p) => {
      const isSelected = String(p.id) === String(selectedId);
      return `
        <tr class="v51-staff-row ${isSelected ? 'selected' : ''}"
            data-id="${p.id}"
            data-nombre="${p.nombre}"
            data-rol="${p.rol}"
            data-tel="${p.telefono}"
            data-dni="${p.dni}"
            data-area="${p.area || ''}"
            data-turno="${p.turno || ''}"
            data-entregas="${p.entregasMes || 0}">
          <td>
            <strong>${p.nombre}</strong><br />
            <small style="color: var(--v51-text-muted);">DNI: ${p.dni}</small>
          </td>
          <td>
            <span class="v51-kpi-tag" style="font-size: 0.68rem;">${p.rol}</span>
          </td>
          <td>
            <span style="font-size: 0.78rem;">${p.area || 'Planta'}</span>
          </td>
          <td>
            <span>${p.telefono}</span>
          </td>
          <td>
            <label class="v51-apple-switch">
              <input type="checkbox" ${p.activo ? 'checked' : ''} class="apple-toggle-staff" data-id="${p.id}" data-nombre="${p.nombre}" />
              <span class="v51-switch-slider"></span>
            </label>
          </td>
        </tr>
      `;
    }).join('');

    tablaPersonalBody.querySelectorAll('.v51-staff-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.v51-apple-switch')) return;
        const staff = personalStore.obtener(row.dataset.id);
        if (staff) seleccionarStaff(staff);
      });
    });

    tablaPersonalBody.querySelectorAll('.apple-toggle-staff').forEach(sw => {
      sw.addEventListener('change', (e) => {
        const id = sw.dataset.id;
        const nombre = sw.dataset.nombre;
        const nuevoEstado = e.target.checked;
        personalStore.cambiarEstado(id, nuevoEstado);
        actualizarKPIs();
        Mensaje(`Colaborador ${nombre}: ${nuevoEstado ? 'Activo en Turno' : 'En Descanso'}`, nuevoEstado ? 'success' : 'warning');
      });
    });

    const seleccionado = personalStore.obtener(selectedId) || lista[0];
    if (seleccionado) seleccionarStaff(seleccionado);
  }

  document.getElementById('btnAgregarPersonal')?.addEventListener('click', () => {
    const form = document.getElementById('formNuevoPersonal');
    form?.reset();
    const idInput = document.getElementById('modalStaffId');
    const title = document.getElementById('modalStaffTitle');
    const submitBtn = document.getElementById('btnGuardarStaffSubmit');

    if (idInput) idInput.value = '';
    if (title) title.textContent = 'Agregar Colaborador';
    if (submitBtn) submitBtn.textContent = 'Registrar Personal';
    abrirModal('modalPersonal');
  });

  document.getElementById('btnEditarPersonalFicha')?.addEventListener('click', () => {
    const selectedId = prevStaffCard?.dataset.selectedId;
    if (!selectedId) {
      Mensaje('Selecciona un colaborador para editar.', 'warning');
      return;
    }

    const staff = personalStore.obtener(selectedId);
    if (!staff) return;

    const form = document.getElementById('formNuevoPersonal');
    form?.reset();

    const idInput = document.getElementById('modalStaffId');
    const title = document.getElementById('modalStaffTitle');
    const submitBtn = document.getElementById('btnGuardarStaffSubmit');
    const nomInput = document.getElementById('modalStaffNombre');
    const rolInput = document.getElementById('modalStaffRol');
    const dniInput = document.getElementById('modalStaffDni');
    const telInput = document.getElementById('modalStaffTel');
    const movilInput = document.getElementById('modalStaffMovil');
    const turnoInput = document.getElementById('modalStaffTurno');

    if (idInput) idInput.value = staff.id;
    if (title) title.textContent = `Editar ${staff.nombre}`;
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    if (nomInput) nomInput.value = staff.nombre || '';
    if (rolInput) rolInput.value = staff.rol || 'Repartidor Motorizado';
    if (dniInput) dniInput.value = staff.dni || '';
    if (telInput) telInput.value = staff.telefono || '';
    if (movilInput) movilInput.value = staff.area || '';
    if (turnoInput) turnoInput.value = staff.turno || '';

    abrirModal('modalPersonal');
  });

  document.getElementById('formNuevoPersonal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modalStaffId')?.value;
    const nombre = document.getElementById('modalStaffNombre')?.value?.trim();
    const rol = document.getElementById('modalStaffRol')?.value;
    const dni = document.getElementById('modalStaffDni')?.value?.trim();
    const telefono = document.getElementById('modalStaffTel')?.value?.trim();
    const area = document.getElementById('modalStaffMovil')?.value?.trim();
    const turno = document.getElementById('modalStaffTurno')?.value?.trim();

    if (!nombre || !dni || !telefono) {
      Mensaje('Por favor, completa los campos requeridos.', 'error');
      return;
    }

    const payload = {
      ...(id ? { id } : {}),
      nombre,
      rol,
      dni,
      telefono,
      area: area || 'Planta Jr. Dante 260',
      turno: turno || 'Turno Regular'
    };

    const guardado = personalStore.guardar(payload);
    cerrarModal('modalPersonal');

    renderTablaPersonal();
    seleccionarStaff(guardado);
    actualizarKPIs();

    Mensaje(`Colaborador "${nombre}" guardado exitosamente.`, 'success');
  });

  document.getElementById('btnStaffLlamar')?.addEventListener('click', () => {
    const tel = document.getElementById('prevStaffTel')?.textContent?.replace(/\s+/g, '');
    if (tel) window.open(`tel:${tel}`, '_self');
  });

  const filtroPersonal = document.getElementById('filtroPersonalInput');
  filtroPersonal?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#tablaPersonalBody tr');
    rows.forEach(row => {
      const nom = row.dataset.nombre?.toLowerCase() || '';
      const rol = row.dataset.rol?.toLowerCase() || '';
      const tel = row.dataset.tel?.toLowerCase() || '';
      const dni = row.dataset.dni?.toLowerCase() || '';
      const area = row.dataset.area?.toLowerCase() || '';
      const coincide = nom.includes(q) || rol.includes(q) || tel.includes(q) || dni.includes(q) || area.includes(q);
      row.style.display = coincide ? '' : 'none';
    });
  });

  // -----------------------------------------------------------------
  // 8. GESTIÓN DE PRODUCTOS (PRECIOS EN SOLES S/, PIN Y STOCK)
  // -----------------------------------------------------------------
  function vincularBotonesProductos() {
    document.querySelectorAll('.btn-abrir-editar-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const prod = productoStore.obtener(id);
        if (!prod) return;

        const titleEl = document.getElementById('modalProdTitle');
        const idEl = document.getElementById('modalProdId');
        const nomEl = document.getElementById('modalProdNombre');
        const precioEl = document.getElementById('modalProdPrecio');
        const costoEl = document.getElementById('modalProdCosto');
        const stockEl = document.getElementById('modalProdStock');
        const vaciosEl = document.getElementById('modalProdStockVacios');
        const pinEl = document.getElementById('modalProdPin');
        const valvulaEl = document.getElementById('modalProdValvula');

        const nom = typeof prod.nombre === 'object' ? (prod.nombre.es || prod.nombre.en) : prod.nombre;
        const val = typeof prod.valvula === 'object' ? (prod.valvula.es || prod.valvula.en) : (prod.valvula || '');

        if (titleEl) titleEl.textContent = `Editar ${nom}`;
        if (idEl) idEl.value = prod.id;
        if (nomEl) nomEl.value = nom;
        if (precioEl) precioEl.value = prod.precio || prod.precioPEN || 65;
        if (costoEl) costoEl.value = prod.costo || prod.costoPEN || 48;
        if (stockEl) stockEl.value = prod.stockLlenos;
        if (vaciosEl) vaciosEl.value = prod.stockVacios || 0;
        if (pinEl) pinEl.checked = !!prod.pin;
        if (valvulaEl) valvulaEl.value = val;

        abrirModal('modalProducto');
      });
    });
  }

  function refrescarTarjetasProductosDOM() {
    const productos = productoStore.listar();
    productos.forEach(p => {
      const card = document.querySelector(`.v51-prod-card[data-prod-id="${p.id}"]`);
      if (!card) return;

      const precio = Number(p.precio || p.precioPEN || 0);
      const priceVal = card.querySelector('.v51-prod-price-val');
      if (priceVal) priceVal.textContent = `S/ ${precio.toFixed(2)}`;

      const stockSmall = card.querySelector('.v51-prod-price-box div[style*="text-align: right;"] small');
      if (stockSmall) stockSmall.textContent = `${p.stockLlenos} llenos`;

      const btnEdit = card.querySelector('.btn-abrir-editar-prod');
      if (btnEdit) {
        btnEdit.dataset.precio = precio;
        btnEdit.dataset.costo = p.costo || p.costoPEN || 0;
        btnEdit.dataset.stock = p.stockLlenos;
        btnEdit.dataset.stockVacios = p.stockVacios || 0;
        btnEdit.dataset.pin = p.pin ? 'true' : 'false';
      }
    });

    actualizarKPIs();
  }

  document.getElementById('formProductoV49')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modalProdId')?.value;
    const nombre = document.getElementById('modalProdNombre')?.value?.trim();
    const precio = parseFloat(document.getElementById('modalProdPrecio')?.value || '0');
    const costo = parseFloat(document.getElementById('modalProdCosto')?.value || '0');
    const stockLlenos = parseInt(document.getElementById('modalProdStock')?.value || '0', 10);
    const stockVacios = parseInt(document.getElementById('modalProdStockVacios')?.value || '0', 10);
    const pin = document.getElementById('modalProdPin')?.checked || false;
    const valvula = document.getElementById('modalProdValvula')?.value?.trim();

    if (!id || !nombre) return;

    const prodActual = productoStore.obtener(id);
    const nombreActualizado = typeof prodActual?.nombre === 'object'
      ? { ...prodActual.nombre, es: nombre }
      : nombre;

    const valvulaActualizada = typeof prodActual?.valvula === 'object'
      ? { ...prodActual.valvula, es: valvula }
      : valvula;

    productoStore.guardar({
      id,
      nombre: nombreActualizado,
      precio,
      costo,
      stockLlenos,
      stockVacios,
      pin,
      valvula: valvulaActualizada
    });

    cerrarModal('modalProducto');
    refrescarTarjetasProductosDOM();
    Mensaje(`Ficha de "${nombre}" actualizada y sincronizada en Soles (S/).`, 'success');
  });

  document.getElementById('btnReponerStock')?.addEventListener('click', () => abrirModal('modalReponerStock'));

  document.getElementById('btnEnviarOrdenStockWa')?.addEventListener('click', () => {
    const s10 = document.getElementById('reponerSolgas10')?.value || '40';
    const s45 = document.getElementById('reponerSolgas45')?.value || '10';
    const m10 = document.getElementById('reponerMasgas10')?.value || '15';
    const msg = `*PEDIDO DE REPOSICIÓN - SOLGAS SURQUILLO*\n\nEstimados, solicitamos reposición para Jr. Dante 260:\n- Solgas 10kg: *${s10} llenos*\n- Solgas 45kg: *${s45} llenos*\n- Masgas 10kg: *${m10} llenos*\n\nVacíos listos para canje en base. Gracias!`;
    window.open(`https://wa.me/51936369384?text=${encodeURIComponent(msg)}`, '_blank');
    cerrarModal('modalReponerStock');
    Mensaje('Pedido de reposición enviado a Planta Central por WhatsApp.', 'success');
  });

  vincularBotonesProductos();

  // -----------------------------------------------------------------
  // 9. CLIENTES REALES DESDE COLECCIÓN 'smiles' (rol == 'cliente')
  // -----------------------------------------------------------------
  const tablaClientesBody = document.getElementById('tablaClientesBody');
  const emptyStateClientes = document.getElementById('emptyStateClientes');
  const tablaClientesMain = document.getElementById('tablaClientesMain');
  const prevCliCard = document.getElementById('prevCliCard');

  function seleccionarCliente(c) {
    if (!c) {
      if (prevCliCard) prevCliCard.dataset.selectedId = '';
      const nomEl = document.getElementById('prevCliNombre');
      if (nomEl) nomEl.textContent = 'Sin clientes registrados';
      return;
    }
    if (prevCliCard) prevCliCard.dataset.selectedId = c.id;

    document.querySelectorAll('.v51-cli-row').forEach(r => {
      r.classList.toggle('selected', r.dataset.id === String(c.id));
    });

    const avatarEl = document.getElementById('prevCliAvatar');
    const nomEl = document.getElementById('prevCliNombre');
    const docEl = document.getElementById('prevCliDoc');
    const telEl = document.getElementById('prevCliTel');
    const dirEl = document.getElementById('prevCliDir');
    const refEl = document.getElementById('prevCliRef');
    const cilEl = document.getElementById('prevCliCil');
    const conEl = document.getElementById('prevCliConsumo');
    const accEl = document.getElementById('prevCliEstadoAcceso');

    const iniciales = (c.nombre || 'CL').substring(0, 2).toUpperCase();
    if (avatarEl) avatarEl.textContent = iniciales;
    if (nomEl) nomEl.textContent = c.nombre;
    if (docEl) docEl.textContent = `${c.tipoDoc || 'DOC'}: ${c.numDoc || '---'}`;
    if (telEl) telEl.textContent = c.contacto || 'Sin teléfono';
    if (dirEl) dirEl.textContent = c.direccion || 'Surquillo';
    if (refEl) refEl.textContent = c.referencia || 'Sin referencia registrada';
    if (cilEl) cilEl.textContent = c.cilindroHabitual || 'Balón SOLGAS Premium 10 kg';
    if (conEl) conEl.textContent = `S/ ${parseFloat(c.totalFacturado || 0).toFixed(2)} (${c.totalPedidos || 0} pedidos)`;
    if (accEl) accEl.textContent = c.estadoAcceso || 'Cuenta Activa';
  }

  function renderTablaClientes() {
    if (!tablaClientesBody) return;
    const lista = clienteStore.listar();

    if (lista.length === 0) {
      if (emptyStateClientes) emptyStateClientes.style.display = 'block';
      if (tablaClientesMain) tablaClientesMain.style.display = 'none';
      seleccionarCliente(null);
      return;
    }

    if (emptyStateClientes) emptyStateClientes.style.display = 'none';
    if (tablaClientesMain) tablaClientesMain.style.display = 'table';

    const selectedId = prevCliCard?.dataset.selectedId || lista[0]?.id;

    tablaClientesBody.innerHTML = lista.map(c => {
      const isSelected = String(c.id) === String(selectedId);
      return `
        <tr class="v51-cli-row ${isSelected ? 'selected' : ''}"
            data-id="${c.id}"
            data-nombre="${c.nombre}"
            data-contacto="${c.contacto}"
            data-doc="${c.tipoDoc}: ${c.numDoc}"
            data-tel="${c.contacto}"
            data-dir="${c.direccion}"
            data-ref="${c.referencia || ''}"
            data-cil="${c.cilindroHabitual || ''}"
            data-pedidos="${c.totalPedidos || 0}"
            data-facturado="${c.totalFacturado || 0}"
            data-acceso="${c.estadoAcceso || ''}">
          <td>
            <strong>${c.nombre}</strong><br />
            <small style="color: var(--v51-text-muted); font-size: 0.72rem;">${c.direccion}</small>
          </td>
          <td>
            <span>${c.tipoDoc}: ${c.numDoc}</span>
          </td>
          <td>
            <span style="color: var(--v51-wa); font-weight: 600;"><i class="fa-brands fa-whatsapp"></i> ${c.contacto}</span>
          </td>
          <td>
            <label class="v51-apple-switch">
              <input type="checkbox" ${c.activo ? 'checked' : ''} class="apple-toggle-cli" data-id="${c.id}" data-nombre="${c.nombre}" />
              <span class="v51-switch-slider"></span>
            </label>
          </td>
        </tr>
      `;
    }).join('');

    tablaClientesBody.querySelectorAll('.v51-cli-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.v51-apple-switch')) return;
        const cli = clienteStore.obtener(row.dataset.id);
        if (cli) seleccionarCliente(cli);
      });
    });

    tablaClientesBody.querySelectorAll('.apple-toggle-cli').forEach(sw => {
      sw.addEventListener('change', (e) => {
        const id = sw.dataset.id;
        const nombre = sw.dataset.nombre;
        const nuevoEstado = e.target.checked;
        clienteStore.cambiarEstado(id, nuevoEstado);
        Mensaje(`Cliente ${nombre}: ${nuevoEstado ? 'Cuenta Activa' : 'Suspendida'}`, nuevoEstado ? 'success' : 'warning');
      });
    });

    const seleccionado = clienteStore.obtener(selectedId) || lista[0];
    if (seleccionado) seleccionarCliente(seleccionado);
  }

  // Sincronización en segundo plano con la colección real 'smiles'
  clienteStore.sincronizarSmilesClientes((listaActualizada) => {
    renderTablaClientes();
    actualizarKPIs();
  });

  const abrirRegistroCliente = () => {
    const form = document.getElementById('formNuevoCliente');
    form?.reset();
    const idInput = document.getElementById('modalCliId');
    const title = document.getElementById('modalCliTitle');
    const submitBtn = document.getElementById('btnGuardarClienteSubmit');

    if (idInput) idInput.value = '';
    if (title) title.textContent = 'Registrar Nuevo Cliente';
    if (submitBtn) submitBtn.textContent = 'Guardar Cliente en Base de Datos';
    abrirModal('modalCliente');
  };

  document.getElementById('btnRegistrarCliente')?.addEventListener('click', abrirRegistroCliente);
  document.getElementById('btnSidebarNuevoCliente')?.addEventListener('click', abrirRegistroCliente);

  document.getElementById('btnEditarClienteFicha')?.addEventListener('click', () => {
    const selectedId = prevCliCard?.dataset.selectedId;
    if (!selectedId) {
      Mensaje('Selecciona un cliente para editar.', 'warning');
      return;
    }

    const cli = clienteStore.obtener(selectedId);
    if (!cli) return;

    const form = document.getElementById('formNuevoCliente');
    form?.reset();

    const idInput = document.getElementById('modalCliId');
    const title = document.getElementById('modalCliTitle');
    const submitBtn = document.getElementById('btnGuardarClienteSubmit');
    const nomInput = document.getElementById('modalCliNombre');
    const tipoDocInput = document.getElementById('modalCliTipoDoc');
    const numDocInput = document.getElementById('modalCliNumDoc');
    const telInput = document.getElementById('modalCliTel');
    const balonInput = document.getElementById('modalCliBalon');
    const dirInput = document.getElementById('modalCliDir');
    const refInput = document.getElementById('modalCliRef');

    if (idInput) idInput.value = cli.id;
    if (title) title.textContent = `Editar ${cli.nombre}`;
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    if (nomInput) nomInput.value = cli.nombre || '';
    if (tipoDocInput) tipoDocInput.value = cli.tipoDoc || 'DNI';
    if (numDocInput) numDocInput.value = cli.numDoc || '';
    if (telInput) telInput.value = cli.contacto || '';
    if (balonInput) balonInput.value = cli.cilindroHabitual || 'Balón SOLGAS Premium 10 kg';
    if (dirInput) dirInput.value = cli.direccion || '';
    if (refInput) refInput.value = cli.referencia || '';

    abrirModal('modalCliente');
  });

  document.getElementById('formNuevoCliente')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modalCliId')?.value;
    const nombre = document.getElementById('modalCliNombre')?.value?.trim();
    const tipoDoc = document.getElementById('modalCliTipoDoc')?.value;
    const numDoc = document.getElementById('modalCliNumDoc')?.value?.trim();
    const contacto = document.getElementById('modalCliTel')?.value?.trim();
    const cilindroHabitual = document.getElementById('modalCliBalon')?.value;
    const direccion = document.getElementById('modalCliDir')?.value?.trim();
    const referencia = document.getElementById('modalCliRef')?.value?.trim();

    if (!nombre || !numDoc || !contacto || !direccion) {
      Mensaje('Por favor, completa los campos obligatorios del cliente.', 'error');
      return;
    }

    const payload = {
      ...(id ? { id } : {}),
      nombre,
      tipoDoc,
      numDoc,
      contacto,
      cilindroHabitual,
      direccion,
      referencia
    };

    const guardado = clienteStore.guardar(payload);
    cerrarModal('modalCliente');

    renderTablaClientes();
    seleccionarCliente(guardado);
    actualizarKPIs();

    Mensaje(`Cliente "${nombre}" guardado exitosamente.`, 'success');
  });

  const filtroClientes = document.getElementById('filtroClientesInput');
  filtroClientes?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#tablaClientesBody tr');
    rows.forEach(row => {
      const nom = row.dataset.nombre?.toLowerCase() || '';
      const doc = row.dataset.doc?.toLowerCase() || '';
      const tel = row.dataset.tel?.toLowerCase() || '';
      const dir = row.dataset.dir?.toLowerCase() || '';
      const coincide = nom.includes(q) || doc.includes(q) || tel.includes(q) || dir.includes(q);
      row.style.display = coincide ? '' : 'none';
    });
  });

  document.getElementById('btnCargarClienteEnSunat')?.addEventListener('click', () => {
    const nom = document.getElementById('prevCliNombre')?.textContent;
    const doc = document.getElementById('prevCliDoc')?.textContent?.replace(/\D+/g, '');
    const dir = document.getElementById('prevCliDir')?.textContent;

    const inpNom = document.getElementById('sunatInputClienteNombre');
    const inpDoc = document.getElementById('sunatInputClienteDoc');
    const inpDir = document.getElementById('sunatInputClienteDir');

    if (inpNom) inpNom.value = nom || '';
    if (inpDoc) inpDoc.value = doc || '';
    if (inpDir) inpDir.value = dir || '';

    activarTab('tab-sunat');
    actualizarTicket();
    Mensaje(`Datos de ${nom} cargados en facturación SUNAT.`, 'success');
  });

  document.getElementById('btnAbrirWaDirecto')?.addEventListener('click', () => {
    const tel = (document.getElementById('prevCliTel')?.textContent || '').replace(/\D+/g, '');
    const nom = document.getElementById('prevCliNombre')?.textContent || 'Cliente';
    if (!tel) {
      Mensaje('El cliente no tiene número de teléfono registrado.', 'warning');
      return;
    }
    const msg = `¡Hola ${nom}! Te saludamos de Solgas Surquillo (Jr. Dante 260). ¿En qué podemos ayudarte hoy?`;
    window.open(`https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  document.getElementById('btnPreviewEnviarLink')?.addEventListener('click', () => {
    const nom = document.getElementById('prevCliNombre')?.textContent || 'Cliente';
    const lblNom = document.getElementById('linkNombreCliente');
    const inpUrl = document.getElementById('inputUrlAcceso');
    if (lblNom) lblNom.textContent = nom;
    if (inpUrl) inpUrl.value = `https://gaswii.com/activar?token=CLI-${Math.floor(1000 + Math.random() * 9000)}`;
    abrirModal('modalLinkPassword');
  });

  document.getElementById('btnCopiarLink')?.addEventListener('click', () => {
    const inp = document.getElementById('inputUrlAcceso');
    if (inp) {
      inp.select();
      navigator.clipboard.writeText(inp.value);
      Mensaje('Enlace de activación copiado al portapapeles.', 'success');
    }
  });

  document.getElementById('btnEnviarWaLink')?.addEventListener('click', () => {
    const nom = document.getElementById('linkNombreCliente')?.textContent || 'Cliente';
    const link = document.getElementById('inputUrlAcceso')?.value || '';
    const tel = (document.getElementById('prevCliTel')?.textContent || '').replace(/\D+/g, '');
    const msg = `¡Hola ${nom}! Te saludamos de Solgas Surquillo (Jr. Dante 260). Tu cuenta express ha sido creada. Configura tu acceso aquí para pedir gas en 1 toque: ${link}`;
    window.open(`https://wa.me/51${tel || '936369384'}?text=${encodeURIComponent(msg)}`, '_blank');
    cerrarModal('modalLinkPassword');
    Mensaje('Invitación de acceso enviada por WhatsApp.', 'success');
  });

  // -----------------------------------------------------------------
  // 10. EMISIÓN REAL DE COMPROBANTES SUNAT (PRECIOS EN SOLES S/)
  // -----------------------------------------------------------------
  document.getElementById('btnElegirClienteBD')?.addEventListener('click', () => {
    const contenedor = document.getElementById('listaClientesBDModal');
    if (contenedor) {
      const clientes = clienteStore.listar();
      if (clientes.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: var(--v51-text-muted); padding: 2vh 0;">No hay clientes en la base de datos.</p>';
      } else {
        contenedor.innerHTML = clientes.map(c => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.8vh 0; border-bottom: 1px solid var(--v51-border);">
            <div>
              <strong>${c.nombre}</strong><br />
              <small style="color: var(--v51-text-muted);">${c.tipoDoc}: ${c.numDoc} · ${c.direccion}</small>
            </div>
            <button class="v51-btn-secondary btn-seleccionar-cli-bd" 
                    data-nombre="${c.nombre}" 
                    data-doc="${c.numDoc}" 
                    data-dir="${c.direccion}" 
                    type="button" 
                    style="padding: 0.4vh 0.8vw; font-size: 0.72rem;">
              Seleccionar
            </button>
          </div>
        `).join('');

        contenedor.querySelectorAll('.btn-seleccionar-cli-bd').forEach(btn => {
          btn.addEventListener('click', () => {
            const nom = btn.dataset.nombre || '';
            const doc = btn.dataset.doc || '';
            const dir = btn.dataset.dir || '';

            const inpNom = document.getElementById('sunatInputClienteNombre');
            const inpDoc = document.getElementById('sunatInputClienteDoc');
            const inpDir = document.getElementById('sunatInputClienteDir');

            if (inpNom) inpNom.value = nom;
            if (inpDoc) inpDoc.value = doc;
            if (inpDir) inpDir.value = dir;

            actualizarTicket();
            cerrarModal('modalElegirClienteBD');
            Mensaje(`Cliente "${nom}" cargado al comprobante.`, 'success');
          });
        });
      }
    }
    abrirModal('modalElegirClienteBD');
  });

  function actualizarTicket() {
    const tipo = document.getElementById('sunatTipoDoc')?.value || 'BOLETA';
    const cpes = sunatStore.listar();
    const correlativo = (cpes.length + 454).toString().padStart(6, '0');
    const serie = tipo === 'FACTURA' ? `F001-${correlativo}` : `B001-${correlativo}`;

    const serieDoc = document.getElementById('sunatSerieDoc');
    const ticketTipo = document.getElementById('ticketTipo');
    const ticketSerie = document.getElementById('ticketSerie');

    if (serieDoc) serieDoc.value = serie;
    if (ticketTipo) ticketTipo.textContent = tipo === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    if (ticketSerie) ticketSerie.textContent = serie;

    const nom = document.getElementById('sunatInputClienteNombre')?.value || 'Cliente General';
    const doc = document.getElementById('sunatInputClienteDoc')?.value || '00000000';
    const dir = document.getElementById('sunatInputClienteDir')?.value || 'Surquillo';
    const pago = document.getElementById('sunatSelectPago')?.value || 'Efectivo';

    const tCli = document.getElementById('ticketCliente');
    const tDoc = document.getElementById('ticketDoc');
    const tDir = document.getElementById('ticketDir');
    const tPago = document.getElementById('ticketPago');

    if (tCli) tCli.textContent = nom;
    if (tDoc) tDoc.textContent = doc;
    if (tDir) tDir.textContent = dir;
    if (tPago) tPago.textContent = pago;

    const selectProd = document.getElementById('sunatSelectProducto');
    const optProd = selectProd?.options[selectProd.selectedIndex];
    const precio = parseFloat(optProd?.value || '65.00');
    const nomProd = optProd?.dataset.nombre || 'Balón de Gas';
    const cant = parseInt(document.getElementById('sunatInputCantidad')?.value || '1', 10);

    const total = precio * cant;
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    const itemsEl = document.getElementById('ticketItems');
    if (itemsEl) {
      itemsEl.innerHTML = `
        <tr>
          <td>${cant}</td>
          <td>${nomProd}</td>
          <td style="text-align: right;">S/ ${total.toFixed(2)}</td>
        </tr>
      `;
    }

    const tSub = document.getElementById('ticketSubtotal');
    const tIGV = document.getElementById('ticketIGV');
    const tTot = document.getElementById('ticketTotal');

    if (tSub) tSub.textContent = `S/ ${subtotal.toFixed(2)}`;
    if (tIGV) tIGV.textContent = `S/ ${igv.toFixed(2)}`;
    if (tTot) tTot.textContent = `S/ ${total.toFixed(2)}`;
  }

  ['sunatTipoDoc', 'sunatInputClienteNombre', 'sunatInputClienteDoc', 'sunatInputClienteDir', 'sunatSelectProducto', 'sunatInputCantidad', 'sunatSelectPago'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', actualizarTicket);
    el?.addEventListener('change', actualizarTicket);
  });

  document.getElementById('btnEmitirCPE')?.addEventListener('click', () => {
    actualizarTicket();
    const tipo = document.getElementById('sunatTipoDoc')?.value || 'BOLETA';
    const serie = document.getElementById('sunatSerieDoc')?.value || 'CPE';
    const clienteNombre = document.getElementById('sunatInputClienteNombre')?.value || 'Cliente General';
    const clienteDoc = document.getElementById('sunatInputClienteDoc')?.value || '00000000';
    const direccion = document.getElementById('sunatInputClienteDir')?.value || 'Surquillo';
    const metodoPago = document.getElementById('sunatSelectPago')?.value || 'Efectivo';

    const selectProd = document.getElementById('sunatSelectProducto');
    const optProd = selectProd?.options[selectProd.selectedIndex];
    const precio = parseFloat(optProd?.value || '65.00');
    const nomProd = optProd?.dataset.nombre || 'Balón de Gas';
    const productoId = optProd?.dataset.id || 'solgas-10kg';
    const cantidad = parseInt(document.getElementById('sunatInputCantidad')?.value || '1', 10);
    const total = precio * cantidad;

    sunatStore.emitirCPE({
      tipo,
      serie,
      clienteNombre,
      clienteDoc,
      direccion,
      metodoPago,
      productoId,
      nomProd,
      cantidad,
      precioUnitario: precio,
      total
    });

    refrescarTarjetasProductosDOM();
    actualizarKPIs();
    actualizarTicket();

    Mensaje(`Comprobante ${serie} emitido a SUNAT por S/ ${total.toFixed(2)}.`, 'success');
  });

  // -----------------------------------------------------------------
  // 11. ASISTENTE INTELIGENTE WHATSAPP
  // -----------------------------------------------------------------
  const waSelect = document.getElementById('waSelectPlantilla');
  const waBubble = document.getElementById('waBubblePreview');
  const waNom = document.getElementById('waInputNombre');
  const waEta = document.getElementById('waInputEta');
  const waMoto = document.getElementById('waInputMoto');
  const waCobro = document.getElementById('waInputCobro');

  function actualizarWaBubble() {
    if (!waBubble) return;
    const tpl = waSelect?.value || 'ruta';
    const nom = waNom?.value || 'Estimado(a) Cliente';
    const eta = waEta?.value || '12–15 minutos';
    const moto = waMoto?.value || 'Repartidor de Turno';
    const cobro = waCobro?.value || 'S/ 65.00';

    if (tpl === 'ruta') {
      waBubble.textContent = `¡Hola ${nom}! 👋\nTe saludamos de *Solgas Surquillo (Jr. Dante 260)*.\n\n🛵 Tu balón de gas ya está *EN CAMINO*.\n⏱️ Tiempo estimado: *${eta}*.\n👤 Repartidor: *${moto}*.\n💵 Cobro: *${cobro}*.\n\n⚖️ Recuerda que tu balón cuenta con *pesaje digital obligatorio en puerta*. ¡Muchas gracias!`;
    } else if (tpl === 'cpe') {
      waBubble.textContent = `¡Hola ${nom}! 👋\nTe saludamos de *Solgas Surquillo (Jr. Dante 260)*.\n\n📄 Te adjuntamos tu comprobante oficial:\n💰 Total: *${cobro}*\n⚖️ Pesaje Confirmado: *10.05 kg (Inacal)*\n\n📥 Descarga tu PDF oficial SUNAT aquí:\nhttps://gaswii.com/cpe/B001-000454.pdf\n\n¡Gracias por tu preferencia! 🔥`;
    } else {
      waBubble.textContent = `¡Hola ${nom}! 👋\nConfirmamos la recepción de tu pedido:\n\n📦 Balón: *Balón SOLGAS Premium 10 kg*\n💰 Total: *${cobro}*\n📍 Dirección: *Surquillo*\n\nDespachando de inmediato. ¡Muchas gracias!`;
    }
  }

  [waSelect, waNom, waEta, waMoto, waCobro].forEach(el => el?.addEventListener('input', actualizarWaBubble));

  document.getElementById('btnEnviarWhatsAppOficial')?.addEventListener('click', () => {
    const tel = (document.getElementById('waInputDestino')?.value || '').replace(/\D+/g, '');
    const msg = waBubble?.textContent || '';
    if (!tel) {
      Mensaje('Ingresa un número de WhatsApp de destino.', 'warning');
      return;
    }
    window.open(`https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    Mensaje(`Abriendo WhatsApp oficial para ${tel}...`, 'success');
  });

  // -----------------------------------------------------------------
  // 12. ALTERNAR TEMA OSCURO / CLARO (widev/tema.js)
  // -----------------------------------------------------------------
  document.getElementById('btnToggleTheme')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const nuevo = (current === 'futuro' || current === 'dark') ? 'luz' : 'futuro';
    setTema(nuevo);
    Mensaje(`Tema cambiado a modo ${nuevo === 'futuro' ? 'Oscuro' : 'Claro'}`, 'info');
  });

  document.getElementById('btnAjustesUtil')?.addEventListener('click', () => {
    activarTab('tab-resumen');
    Mensaje('Ajustes operativos Jr. Dante 260 activos.', 'info');
  });

  document.getElementById('btnMiCuentaUtil')?.addEventListener('click', () => {
    const u = getSmileLocal();
    Mensaje(`Operador en turno: ${u?.nombre || u?.usuario || 'Operador'} (${u?.rol || 'Gestor'})`, 'info');
  });

  document.getElementById('btnNotifications')?.addEventListener('click', () => {
    Mensaje('3 pedidos de gas despachados en Surquillo.', 'info');
  });

  // -----------------------------------------------------------------
  // 13. RENDERIZADO INICIAL COMPLETO (0ms LOCAL-FIRST)
  // -----------------------------------------------------------------
  renderTablaPersonal();
  renderTablaClientes();
  refrescarTarjetasProductosDOM();
  actualizarKPIs();
  actualizarTicket();
  actualizarWaBubble();
}
