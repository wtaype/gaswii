// src/feature/personal/personal.js
// Controlador interactivo de cliente para el Portal Gerencial Solgas Surquillo
// Navegación por tabs, modales, emisión de comprobantes, buscador y seguridad

import { salir, getSmileLocal } from '../auth/sesion.js';

export function initPersonal() {
  if (typeof window === 'undefined') return;

  // 0. Sincronizar datos del usuario logueado en Topbar si existen
  const user = getSmileLocal();
  if (user) {
    const nombre = user.nombre || user.usuario || 'Gestor Propietario';
    const iniciales = user.iniciales || nombre.substring(0, 2).toUpperCase();
    const rolStr = user.rol ? user.rol.toUpperCase() : 'PERSONAL';

    const topbarName = document.getElementById('topbarUserName');
    const topbarAvatar = document.getElementById('topbarAvatarInitials');
    const dropdownName = document.getElementById('dropdownUserName');
    const dropdownAvatar = document.getElementById('dropdownAvatarInitials');
    const dropdownRole = document.getElementById('dropdownUserRole');

    if (topbarName) topbarName.textContent = nombre;
    if (dropdownName) dropdownName.textContent = nombre;
    if (dropdownRole) dropdownRole.textContent = `Rol: ${rolStr}`;

    const renderAvatar = (el) => {
      if (!el) return;
      if (user.avatar && user.avatar.startsWith('http')) {
        el.innerHTML = `<img src="${user.avatar}" alt="${nombre}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent='${iniciales}'">`;
      } else {
        el.textContent = iniciales;
      }
    };

    renderAvatar(topbarAvatar);
    renderAvatar(dropdownAvatar);
  }

  // 1. RELOJ EN VIVO GRANDE & SALUDO DINÁMICO
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
      if (horas < 12) elemSaludo.textContent = 'Buenos días';
      else if (horas < 19) elemSaludo.textContent = 'Buenas tardes';
      else elemSaludo.textContent = 'Buenas noches';
    }
  }
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // 2. TOAST GLOBAL
  const toast = document.getElementById('v51Toast');
  const toastMsg = document.getElementById('v51ToastMsg');
  let toastTimer = null;
  function showToast(msg) {
    if (!toast || !toastMsg) return;
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
  window.showToast = showToast;

  // 3. GESTOR DE TABS (SIDEBAR, BOTTOM NAV MÓVIL Y CARDS DE RESUMEN)
  const allNavTriggers = document.querySelectorAll('.v51-nav-btn[data-tab], .v51-bottom-nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.v51-tab-pane');

  function activarTab(tabId) {
    allNavTriggers.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });
    tabPanes.forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.activarTab = activarTab;

  allNavTriggers.forEach(b => b.addEventListener('click', () => activarTab(b.dataset.tab)));

  // Clicks desde cards de resumen hacia tabs específicos
  document.querySelectorAll('[data-goto-tab]').forEach(el => {
    el.addEventListener('click', () => {
      const targetTab = el.getAttribute('data-goto-tab');
      if (targetTab) activarTab(targetTab);
    });
  });

  // 4. DROPDOWN DE USUARIO EN TOPBAR (IR A TIENDA + CERRAR TURNO)
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

  // Cerrar Turno / Salir con wiAuth seguro
  document.getElementById('btnCerrarTurno')?.addEventListener('click', async () => {
    userMenu?.classList.remove('show');
    btnUser?.classList.remove('open');
    showToast('Finalizando turno seguro...');
    await salir();
  });

  // Ajustes desde dropdown
  document.getElementById('btnAjustesPlanta')?.addEventListener('click', () => {
    activarTab('tab-resumen');
    userMenu?.classList.remove('show');
    btnUser?.classList.remove('open');
  });

  // 5. COLAPSAR SIDEBAR
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

  // 6. MODALES (ABRIR, CERRAR Y TECLA ESCAPE)
  function abrirModal(id) { document.getElementById(id)?.classList.add('open'); }
  function cerrarModal(id) { document.getElementById(id)?.classList.remove('open'); }
  window.abrirModal = abrirModal;
  window.cerrarModal = cerrarModal;

  // Botones de cierre [data-close-modal]
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      if (modalId) cerrarModal(modalId);
    });
  });

  // Cierre al hacer click en el backdrop oscuro
  document.querySelectorAll('.v51-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  // Cerrar modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.v51-modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Botones de apertura de modales específicos
  document.getElementById('btnSidebarNuevoCliente')?.addEventListener('click', () => abrirModal('modalCliente'));
  document.getElementById('btnRegistrarCliente')?.addEventListener('click', () => abrirModal('modalCliente'));
  document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
    const title = document.getElementById('modalProdTitle');
    if (title) title.textContent = 'Nuevo Producto';
    const form = document.getElementById('formProductoV49');
    form?.reset();
    abrirModal('modalProducto');
  });
  document.getElementById('btnReponerStock')?.addEventListener('click', () => abrirModal('modalReponerStock'));
  document.getElementById('btnAgregarPersonal')?.addEventListener('click', () => abrirModal('modalPersonal'));
  document.getElementById('btnElegirClienteBD')?.addEventListener('click', () => abrirModal('modalElegirClienteBD'));

  document.getElementById('btnAjustesUtil')?.addEventListener('click', () => showToast('Ajustes operativos Jr. Dante 260 activos.'));
  document.getElementById('btnMiCuentaUtil')?.addEventListener('click', () => showToast(`Administrador: ${user?.nombre || 'Wilder Alarcón'}`));
  document.getElementById('btnNotifications')?.addEventListener('click', () => showToast('3 pedidos pendientes de entrega en Surquillo'));

  // 7. BUSCADOR DE CLIENTES EN TIEMPO REAL
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

  // 8. BUSCADOR DE PERSONAL EN TIEMPO REAL
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

  // 9. APPLE SWITCHES
  document.querySelectorAll('.apple-toggle-cli').forEach(t => {
    t.addEventListener('change', (e) => {
      showToast(`Cliente ${t.dataset.nombre}: ${e.target.checked ? 'Cuenta Activa' : 'Suspendida'}`);
    });
  });

  document.querySelectorAll('.apple-toggle-staff').forEach(t => {
    t.addEventListener('change', (e) => {
      showToast(`Colaborador ${t.dataset.nombre}: ${e.target.checked ? 'Activo en Turno' : 'En Descanso'}`);
    });
  });

  // 10. PREVIEW DE CLIENTE
  const cliRows = document.querySelectorAll('.v51-cli-row');
  cliRows.forEach(row => {
    row.addEventListener('click', () => {
      cliRows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');

      const nom = row.dataset.nombre || '';
      const avatarEl = document.getElementById('prevCliAvatar');
      const nomEl = document.getElementById('prevCliNombre');
      const docEl = document.getElementById('prevCliDoc');
      const telEl = document.getElementById('prevCliTel');
      const dirEl = document.getElementById('prevCliDir');
      const refEl = document.getElementById('prevCliRef');
      const cilEl = document.getElementById('prevCliCil');
      const conEl = document.getElementById('prevCliConsumo');
      const accEl = document.getElementById('prevCliEstadoAcceso');

      if (avatarEl) avatarEl.textContent = nom.substring(0, 2).toUpperCase();
      if (nomEl) nomEl.textContent = nom;
      if (docEl) docEl.textContent = row.dataset.doc || '';
      if (telEl) telEl.textContent = row.dataset.tel || '';
      if (dirEl) dirEl.textContent = row.dataset.dir || '';
      if (refEl) refEl.textContent = row.dataset.ref || '';
      if (cilEl) cilEl.textContent = row.dataset.cil || '';
      if (conEl) conEl.textContent = `S/ ${parseFloat(row.dataset.facturado || 0).toFixed(2)} (${row.dataset.pedidos} compras)`;
      if (accEl) accEl.textContent = row.dataset.acceso || '';
    });
  });

  // Enviar a SUNAT desde preview
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
    showToast(`Datos de ${nom} cargados en facturación SUNAT.`);
  });

  // Abrir WhatsApp directo con cliente
  document.getElementById('btnAbrirWaDirecto')?.addEventListener('click', () => {
    const tel = (document.getElementById('prevCliTel')?.textContent || '936369384').replace(/\s+/g, '');
    const nom = document.getElementById('prevCliNombre')?.textContent || 'Cliente';
    const msg = `¡Hola ${nom}! Te saludamos de Solgas Surquillo (Jr. Dante 260). ¿En qué podemos ayudarte hoy?`;
    window.open(`https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // Enlace de contraseña por modal
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
      showToast('Enlace copiado al portapapeles.');
    }
  });

  document.getElementById('btnEnviarWaLink')?.addEventListener('click', () => {
    const nom = document.getElementById('linkNombreCliente')?.textContent || 'Cliente';
    const link = document.getElementById('inputUrlAcceso')?.value || '';
    const msg = `¡Hola ${nom}! Te saludamos de Solgas Surquillo (Jr. Dante 260). Tu cuenta express ha sido creada. Crea tu contraseña aquí para pedir gas al instante: ${link}`;
    window.open(`https://wa.me/51987654321?text=${encodeURIComponent(msg)}`, '_blank');
    cerrarModal('modalLinkPassword');
    showToast('Invitación enviada por WhatsApp.');
  });

  // 11. PREVIEW DE PERSONAL
  const staffRows = document.querySelectorAll('.v51-staff-row');
  staffRows.forEach(row => {
    row.addEventListener('click', () => {
      staffRows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');

      const nom = row.dataset.nombre || '';
      const avatarEl = document.getElementById('prevStaffAvatar');
      const nomEl = document.getElementById('prevStaffNombre');
      const rolEl = document.getElementById('prevStaffRol');
      const dniEl = document.getElementById('prevStaffDni');
      const telEl = document.getElementById('prevStaffTel');
      const areaEl = document.getElementById('prevStaffArea');
      const turnoEl = document.getElementById('prevStaffTurno');
      const entEl = document.getElementById('prevStaffEntregas');

      if (avatarEl) avatarEl.textContent = nom.substring(0, 2).toUpperCase();
      if (nomEl) nomEl.textContent = nom;
      if (rolEl) rolEl.textContent = row.dataset.rol || '';
      if (dniEl) dniEl.textContent = row.dataset.dni || '';
      if (telEl) telEl.textContent = row.dataset.tel || '';
      if (areaEl) areaEl.textContent = row.dataset.area || '';
      if (turnoEl) turnoEl.textContent = row.dataset.turno || '';
      if (entEl) entEl.textContent = `${row.dataset.entregas} entregas este mes`;
    });
  });

  document.getElementById('btnStaffLlamar')?.addEventListener('click', () => {
    const tel = document.getElementById('prevStaffTel')?.textContent || '';
    window.open(`tel:${tel}`, '_self');
  });

  // 12. EDICIÓN DE PRODUCTOS
  document.querySelectorAll('.btn-abrir-editar-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const titleEl = document.getElementById('modalProdTitle');
      const idEl = document.getElementById('modalProdId');
      const nomEl = document.getElementById('modalProdNombre');
      const precioEl = document.getElementById('modalProdPrecio');
      const costoEl = document.getElementById('modalProdCosto');
      const stockEl = document.getElementById('modalProdStock');
      const valvulaEl = document.getElementById('modalProdValvula');

      if (titleEl) titleEl.textContent = `Editar ${btn.dataset.nombre}`;
      if (idEl) idEl.value = btn.dataset.id || '';
      if (nomEl) nomEl.value = btn.dataset.nombre || '';
      if (precioEl) precioEl.value = btn.dataset.precio || '';
      if (costoEl) costoEl.value = btn.dataset.costo || '';
      if (stockEl) stockEl.value = btn.dataset.stock || '';
      if (valvulaEl) valvulaEl.value = btn.dataset.valvula || '';
      abrirModal('modalProducto');
    });
  });

  document.getElementById('formProductoV49')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('modalProdNombre')?.value || 'Producto';
    showToast(`Ficha de "${nom}" actualizada exitosamente.`);
    cerrarModal('modalProducto');
  });

  document.getElementById('formNuevoCliente')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Cliente registrado en Solgas Surquillo.');
    cerrarModal('modalCliente');
  });

  document.getElementById('formNuevoPersonal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Personal agregado a la nómina.');
    cerrarModal('modalPersonal');
  });

  // 13. EMISIÓN DE COMPROBANTES SUNAT
  document.querySelectorAll('.btn-seleccionar-cli-bd').forEach(btn => {
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
      showToast(`Cliente ${nom} cargado desde Base de Datos.`);
    });
  });

  function actualizarTicket() {
    const tipo = document.getElementById('sunatTipoDoc')?.value || 'BOLETA';
    const serie = tipo === 'FACTURA' ? 'F001-000189' : 'B001-000453';
    
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
    const serie = document.getElementById('sunatSerieDoc')?.value || 'CPE';
    showToast(`Comprobante ${serie} emitido y enviado a SUNAT.`);
  });

  // 14. ASISTENTE WHATSAPP
  const waSelect = document.getElementById('waSelectPlantilla');
  const waBubble = document.getElementById('waBubblePreview');
  const waNom = document.getElementById('waInputNombre');
  const waEta = document.getElementById('waInputEta');
  const waMoto = document.getElementById('waInputMoto');
  const waCobro = document.getElementById('waInputCobro');

  function actualizarWaBubble() {
    if (!waBubble) return;
    const tpl = waSelect?.value || 'ruta';
    const nom = waNom?.value || 'Claudia Romero';
    const eta = waEta?.value || '12–15 minutos';
    const moto = waMoto?.value || 'Carlos Mendoza (Torito 02)';
    const cobro = waCobro?.value || 'S/ 65.00';

    if (tpl === 'ruta') {
      waBubble.textContent = `¡Hola ${nom}! 👋\nTe saludamos de *Solgas Surquillo (Jr. Dante 260)*.\n\n🛵 Tu balón de gas ya está *EN CAMINO*.\n⏱️ Tiempo estimado: *${eta}*.\n👤 Repartidor: *${moto}*.\n💵 Cobro: *${cobro}*.\n\n⚖️ Recuerda que tu balón cuenta con *pesaje digital obligatorio en puerta*. ¡Muchas gracias!`;
    } else if (tpl === 'cpe') {
      waBubble.textContent = `¡Hola ${nom}! 👋\nTe saludamos de *Solgas Surquillo (Jr. Dante 260)*.\n\n📄 Te adjuntamos tu comprobante oficial:\n💰 Total: *${cobro}*\n⚖️ Pesaje Confirmado: *10.05 kg (Inacal)*\n\n📥 Descarga tu PDF oficial SUNAT aquí:\nhttps://gaswii.com/cpe/B001-000452.pdf\n\n¡Gracias por tu preferencia! 🔥`;
    } else {
      waBubble.textContent = `¡Hola ${nom}! 👋\nConfirmamos la recepción de tu pedido:\n\n📦 Balón: *Balón SOLGAS Premium 10 kg*\n💰 Total: *${cobro}*\n📍 Dirección: *Av. Paseo de la República 4890, Miraflores*\n\nDespachando de inmediato. ¡Muchas gracias!`;
    }
  }

  [waSelect, waNom, waEta, waMoto, waCobro].forEach(el => el?.addEventListener('input', actualizarWaBubble));

  document.getElementById('btnEnviarWhatsAppOficial')?.addEventListener('click', () => {
    const tel = (document.getElementById('waInputDestino')?.value || '993456789').replace(/\s+/g, '');
    const msg = waBubble?.textContent || '';
    window.open(`https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast(`Abriendo WhatsApp para ${tel}...`);
  });

  // 15. REPOSICIÓN STOCK WHATSAPP
  document.getElementById('btnEnviarOrdenStockWa')?.addEventListener('click', () => {
    const s10 = document.getElementById('reponerSolgas10')?.value || '40';
    const s45 = document.getElementById('reponerSolgas45')?.value || '10';
    const m10 = document.getElementById('reponerMasgas10')?.value || '15';
    const msg = `*PEDIDO DE REPOSICIÓN - SOLGAS SURQUILLO*\n\nEstimados, requerimos reposición para Jr. Dante 260:\n- Solgas 10kg: *${s10} llenos*\n- Solgas 45kg: *${s45} llenos*\n- Masgas 10kg: *${m10} llenos*\n\nVacíos listos para canje en base. Gracias!`;
    window.open(`https://wa.me/51936369384?text=${encodeURIComponent(msg)}`, '_blank');
    cerrarModal('modalReponerStock');
    showToast('Pedido enviado a Planta Central por WhatsApp.');
  });

  // 16. ALTERNAR TEMA OSCURO / CLARO
  document.getElementById('btnToggleTheme')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const nuevo = current === 'futuro' || current === 'dark' ? 'luz' : 'futuro';
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem('wiTema_gaswii', nuevo);
    localStorage.setItem('wiTema', nuevo);
    showToast(`Tema cambiado a modo ${nuevo === 'futuro' ? 'Oscuro' : 'Claro'}`);
  });
}
