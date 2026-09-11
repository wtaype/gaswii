/// <reference path="../.astro/types.d.ts" />

interface Window {
  toggleTema?: () => void;
  abrirDrawer?: () => void;
  cerrarDrawer?: () => void;
  abrirModalLogin?: () => void;
  cerrarModalLogin?: () => void;
  abrirModalPedido?: (productoPreseleccionado?: string) => void;
  cerrarModalPedido?: () => void;
  cerrarSesionHeader?: () => Promise<void>;
  cambiarTabPersonal?: (tabId: string) => void;
  moverEtapaPedido?: (id: string, etapa: string) => void;
}
