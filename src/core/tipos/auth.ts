// src/core/tipos/auth.ts
// 🔐 Definición centralizada de tipos TypeScript para la autenticación y perfil Smile de GasWii

export interface SmileDireccion {
  id?: string;
  etiqueta: string;
  direccion: string;
  distrito?: string;
  predeterminada?: boolean;
}

export interface SmileData {
  uid?: string;
  usuario?: string;
  email?: string;
  nombre?: string;
  foto?: string;
  celular?: string;
  rol?: 'cliente' | 'personal' | string;
  plan?: 'estandar' | 'vip' | string;
  activo?: boolean;
  estado?: 'activo' | 'suspendido' | string;
  pin?: string;
  puntos?: number;
  direcciones?: SmileDireccion[];
  creado?: any;
  actualizado?: any;
  [key: string]: any;
}
