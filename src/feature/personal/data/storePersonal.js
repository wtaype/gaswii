// src/feature/personal/data/storePersonal.js
// Gestor de Estado Local-First (0ms de latencia) y Consulta en Segundo Plano con Firestore
// Conexión nativa con wiSmile (firma de operador) y widev/storage.js

import { getls, savels } from '../../../core/widev/storage.js';
import { getSmileLocal } from '../../auth/sesion.js';
import { equipoPersonal as staffSeed } from './personal.js';
import { productosIniciales as prodSeed } from './productos.js';

const STORAGE_KEYS = {
  STAFF: 'gaswii_personal_staff',
  PRODUCTOS: 'gaswii_personal_productos',
  CLIENTES: 'gaswii_personal_clientes',
  CPES: 'gaswii_personal_cpes'
};

const TTL_HOURS = 720; // 30 días de persistencia offline garantizada

// Sincronización asíncrona no bloqueante (Fire-and-forget) a Firestore
async function _syncToFirestore(coleccion, docId, data, isDelete = false) {
  if (typeof window === 'undefined') return;
  try {
    const { db } = await import('../../../core/config/firebase.ts');
    const { doc, setDoc, deleteDoc, serverTimestamp } = await import('firebase/firestore');

    const ref = doc(db, coleccion, String(docId));
    if (isDelete) {
      deleteDoc(ref).catch(err => console.warn(`[Sync Firestore Delete] ${coleccion}/${docId}:`, err));
      return;
    }

    const operador = getSmileLocal();
    const payload = {
      ...data,
      actualizadoEn: serverTimestamp(),
      auditOperador: operador ? { uid: operador.uid, nombre: operador.nombre || operador.usuario, rol: operador.rol } : 'anonimo'
    };

    setDoc(ref, payload, { merge: true }).catch(err => {
      console.warn(`[Sync Firestore] Fallo en segundo plano ${coleccion}/${docId}:`, err);
    });
  } catch (err) {
    console.warn('[Sync Firestore Error]:', err);
  }
}

// -------------------------------------------------------------
// 1. STORE DE PERSONAL & COLABORADORES
// -------------------------------------------------------------
export const personalStore = {
  listar() {
    let datos = getls(STORAGE_KEYS.STAFF);
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      datos = [...staffSeed];
      savels(STORAGE_KEYS.STAFF, datos, TTL_HOURS);
    }
    return datos;
  },

  obtener(id) {
    return this.listar().find(p => String(p.id) === String(id)) || null;
  },

  guardar(item) {
    const lista = this.listar();
    const operador = getSmileLocal();
    let guardado;

    if (item.id) {
      const idx = lista.findIndex(p => String(p.id) === String(item.id));
      if (idx !== -1) {
        guardado = {
          ...lista[idx],
          ...item,
          actualizado: new Date().toISOString(),
          userId: operador?.uid || lista[idx].userId || 'admin'
        };
        lista[idx] = guardado;
      } else {
        guardado = { ...item };
        lista.push(guardado);
      }
    } else {
      const nextNum = (lista.length + 1).toString().padStart(3, '0');
      guardado = {
        ...item,
        id: `PER-${nextNum}`,
        userId: operador?.uid || 'admin',
        creado: new Date().toISOString(),
        actualizado: new Date().toISOString(),
        activo: item.activo !== false,
        entregasMes: item.entregasMes || 0
      };
      lista.push(guardado);
    }

    savels(STORAGE_KEYS.STAFF, lista, TTL_HOURS);
    _syncToFirestore('colaboradores', guardado.id, guardado);
    return guardado;
  },

  cambiarEstado(id, activo) {
    const lista = this.listar();
    const item = lista.find(p => String(p.id) === String(id));
    if (item) {
      item.activo = !!activo;
      item.actualizado = new Date().toISOString();
      savels(STORAGE_KEYS.STAFF, lista, TTL_HOURS);
      _syncToFirestore('colaboradores', id, { activo: item.activo });
    }
    return item;
  },

  eliminar(id) {
    let lista = this.listar();
    lista = lista.filter(p => String(p.id) !== String(id));
    savels(STORAGE_KEYS.STAFF, lista, TTL_HOURS);
    _syncToFirestore('colaboradores', id, null, true);
    return lista;
  }
};

// -------------------------------------------------------------
// 2. STORE DE PRODUCTOS & STOCK (SOLO EN SOLES S/)
// -------------------------------------------------------------
export const productoStore = {
  listar() {
    let datos = getls(STORAGE_KEYS.PRODUCTOS);
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      datos = [...prodSeed];
      savels(STORAGE_KEYS.PRODUCTOS, datos, TTL_HOURS);
    }
    return datos;
  },

  obtener(id) {
    return this.listar().find(p => String(p.id) === String(id)) || null;
  },

  guardar(item) {
    const lista = this.listar();
    const operador = getSmileLocal();
    let guardado;

    if (item.id) {
      const idx = lista.findIndex(p => String(p.id) === String(item.id));
      if (idx !== -1) {
        guardado = {
          ...lista[idx],
          ...item,
          precio: Number(item.precio !== undefined ? item.precio : (item.precioPEN || lista[idx].precio)),
          costo: Number(item.costo !== undefined ? item.costo : (item.costoPEN || lista[idx].costo)),
          stockLlenos: Number(item.stockLlenos !== undefined ? item.stockLlenos : lista[idx].stockLlenos),
          stockVacios: Number(item.stockVacios !== undefined ? item.stockVacios : lista[idx].stockVacios),
          pin: item.pin !== undefined ? !!item.pin : (lista[idx].pin || false),
          actualizado: new Date().toISOString(),
          userId: operador?.uid || lista[idx].userId || 'admin'
        };
        lista[idx] = guardado;
      } else {
        guardado = { ...item };
        lista.push(guardado);
      }
    } else {
      const nextId = `prod-${Date.now().toString().slice(-4)}`;
      guardado = {
        ...item,
        id: nextId,
        codigo: item.codigo || `GAS-${(lista.length + 1).toString().padStart(3, '0')}`,
        userId: operador?.uid || 'admin',
        creado: new Date().toISOString(),
        actualizado: new Date().toISOString(),
        pin: !!item.pin,
        orden: lista.length + 1,
        precio: Number(item.precio || item.precioPEN || 65.0),
        costo: Number(item.costo || item.costoPEN || 48.0),
        stockLlenos: Number(item.stockLlenos) || 0,
        stockVacios: Number(item.stockVacios) || 0,
        tag: item.tag || 'badge-fire',
        activo: true
      };
      lista.push(guardado);
    }

    savels(STORAGE_KEYS.PRODUCTOS, lista, TTL_HOURS);
    _syncToFirestore('productos', guardado.id, guardado);
    return guardado;
  },

  ajustarStock(id, deltaLlenos = 0, deltaVacios = 0) {
    const lista = this.listar();
    const prod = lista.find(p => String(p.id) === String(id));
    if (prod) {
      prod.stockLlenos = Math.max(0, (prod.stockLlenos || 0) + deltaLlenos);
      prod.stockVacios = Math.max(0, (prod.stockVacios || 0) + deltaVacios);
      prod.actualizado = new Date().toISOString();
      savels(STORAGE_KEYS.PRODUCTOS, lista, TTL_HOURS);
      _syncToFirestore('productos', id, {
        stockLlenos: prod.stockLlenos,
        stockVacios: prod.stockVacios
      });
    }
    return prod;
  }
};

// -------------------------------------------------------------
// 3. STORE DE CLIENTES (CONSULTA REAL DE COLECCIÓN 'smiles')
// -------------------------------------------------------------
export const clienteStore = {
  listar() {
    return getls(STORAGE_KEYS.CLIENTES) || [];
  },

  obtener(id) {
    return this.listar().find(c => String(c.id) === String(id) || String(c.uid) === String(id)) || null;
  },

  // Consulta real de la colección 'smiles' filtrando por rol == 'cliente'
  async sincronizarSmilesClientes(onUpdate) {
    if (typeof window === 'undefined') return [];
    try {
      const { db } = await import('../../../core/config/firebase.ts');
      const { collection, query, where, getDocs } = await import('firebase/firestore');

      const q = query(collection(db, 'smiles'), where('rol', '==', 'cliente'));
      const querySnapshot = await getDocs(q);

      const lista = [];
      querySnapshot.forEach(docSnap => {
        const d = docSnap.data();
        const primerDir = Array.isArray(d.direcciones) && d.direcciones.length > 0 ? d.direcciones[0] : null;
        lista.push({
          id: docSnap.id,
          uid: docSnap.id,
          nombre: d.nombre ? `${d.nombre} ${d.apellidos || ''}`.trim() : (d.usuario || 'Cliente'),
          usuario: d.usuario || '',
          email: d.email || '',
          contacto: d.celular || d.telefono || 'Sin teléfono',
          tipoDoc: d.tipoDoc || 'DNI',
          numDoc: d.numDoc || d.dni || 'Sin documento',
          direccion: primerDir?.direccion || d.direccion || 'Surquillo',
          referencia: primerDir?.referencia || d.referencia || '',
          distrito: primerDir?.distrito || 'Surquillo',
          cilindroHabitual: d.cilindroHabitual || 'Balón SOLGAS Premium 10 kg',
          totalPedidos: d.totalPedidos || 0,
          totalFacturado: d.totalFacturado || 0.0,
          estadoAcceso: d.tienePassword ? 'Contraseña Creada' : 'Registrado por Nosotros',
          activo: d.activo !== false,
          puntos: d.puntos || 0,
          creado: d.creado || '',
          actualizado: d.actualizado || ''
        });
      });

      savels(STORAGE_KEYS.CLIENTES, lista, TTL_HOURS);
      if (typeof onUpdate === 'function') onUpdate(lista);
      return lista;
    } catch (e) {
      console.warn('[smiles sync error]:', e);
      return this.listar();
    }
  },

  guardar(item) {
    const lista = this.listar();
    let guardado;

    if (item.id || item.uid) {
      const targetId = item.id || item.uid;
      const idx = lista.findIndex(c => String(c.id) === String(targetId) || String(c.uid) === String(targetId));
      if (idx !== -1) {
        guardado = { ...lista[idx], ...item };
        lista[idx] = guardado;
      } else {
        guardado = { ...item };
        lista.push(guardado);
      }
    } else {
      const nextNum = (lista.length + 101).toString();
      guardado = {
        ...item,
        id: `CLI-${nextNum}`,
        fechaRegistro: new Date().toLocaleDateString('es-PE'),
        estadoAcceso: 'Registrado por Nosotros',
        tienePassword: false,
        totalPedidos: 0,
        totalFacturado: 0.0,
        activo: true
      };
      lista.unshift(guardado);
    }

    savels(STORAGE_KEYS.CLIENTES, lista, TTL_HOURS);
    return guardado;
  },

  cambiarEstado(id, activo) {
    const lista = this.listar();
    const item = lista.find(c => String(c.id) === String(id) || String(c.uid) === String(id));
    if (item) {
      item.activo = !!activo;
      savels(STORAGE_KEYS.CLIENTES, lista, TTL_HOURS);
      _syncToFirestore('smiles', item.uid || item.id, { activo: item.activo });
    }
    return item;
  }
};

// -------------------------------------------------------------
// 4. STORE DE COMPROBANTES SUNAT
// -------------------------------------------------------------
export const sunatStore = {
  listar() {
    return getls(STORAGE_KEYS.CPES) || [];
  },

  emitirCPE(cpeData) {
    const lista = this.listar();
    const nuevoCpe = {
      ...cpeData,
      id: `CPE-${Date.now()}`,
      fechaEmision: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString('es-PE')
    };

    lista.unshift(nuevoCpe);
    savels(STORAGE_KEYS.CPES, lista, TTL_HOURS);

    if (cpeData.productoId && cpeData.cantidad) {
      productoStore.ajustarStock(cpeData.productoId, -Math.abs(Number(cpeData.cantidad)), 0);
    }

    _syncToFirestore('comprobantes', nuevoCpe.serie || nuevoCpe.id, nuevoCpe);
    return nuevoCpe;
  }
};
