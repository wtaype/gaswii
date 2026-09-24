// src/feature/inicio/lib/modalPedido.js
// 🎯 Modal de Pedido Express Autónomo y On-Demand (0 KiB en carga inicial)
// Se inicializa exclusivamente cuando el usuario hace clic en "Pedir Balón a Domicilio"

export function abrirModalPedido(productoId = '') {
  console.log('[modalPedido] Abrir pedido express:', productoId);
}

export function cerrarModalPedido() {
  console.log('[modalPedido] Cerrar pedido express');
}

export default {
  abrirModalPedido,
  cerrarModalPedido
};
