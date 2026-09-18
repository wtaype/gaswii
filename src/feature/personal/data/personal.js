// src/feature/personal/data/personal.js
// Directorio de colaboradores operativos, repartidores motorizados y personal de planta
// Se sincroniza con Firestore en segundo plano

export const equipoPersonal = [
  {
    id: 'PER-001',
    nombre: 'Carlos Mendoza',
    rol: 'Repartidor Motorizado',
    tipoRol: 'personal',
    telefono: '987 112 233',
    dni: '44556677',
    area: 'Moto Torito 02 (4521-3F)',
    turno: 'Mañana (07:30 - 15:30)',
    entregasMes: 412,
    activo: true
  },
  {
    id: 'PER-002',
    nombre: 'Luis Ramos',
    rol: 'Repartidor Motorizado',
    tipoRol: 'personal',
    telefono: '981 998 877',
    dni: '70891234',
    area: 'Moto Furgón 01 (8912-7B)',
    turno: 'Intermedio (08:00 - 16:00)',
    entregasMes: 388,
    activo: true
  },
  {
    id: 'PER-003',
    nombre: 'Jorge Peralta',
    rol: 'Conductor Camión',
    tipoRol: 'personal',
    telefono: '992 334 455',
    dni: '10293847',
    area: 'Camión Distribución (B9C-812)',
    turno: 'Mañana (07:00 - 15:00)',
    entregasMes: 195,
    activo: false
  },
  {
    id: 'PER-004',
    nombre: 'Rosa Quispe',
    rol: 'Almacén, Pesaje & Limpieza',
    tipoRol: 'personal',
    telefono: '976 221 144',
    dni: '71882233',
    area: 'Planta Jr. Dante 260',
    turno: 'Tarde (08:00 - 17:00)',
    entregasMes: 820,
    activo: true
  }
];
