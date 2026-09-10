# Portal de cliente · diagnóstico y propuesta view27

Fecha: 10 de septiembre de 2026. Alcance: revisión del código actual y preview local de un cliente registrado. No se modifica inicio, autenticación ni el portal real. Hay cambios de trabajo previos en esas áreas que se conservan.

## Estado actual

| Área | Lo que existe | Mejora necesaria |
| --- | --- | --- |
| Identidad | Firebase Auth, correo/usuario y Google; perfil `smiles/{uid}`, caché `wiSmile`, avatar, plan, puntos y direcciones. | Estados claros de carga, sesión vencida y error. La autorización debe comprobarse con Firebase y reglas del servidor; la caché no es autorización. |
| Estructura | `clientePage.astro`, cinco pestañas y seis secciones reutilizables; layout `Principal` compartido con navegación comercial. | Un espacio propio de cuenta, jerarquía más clara y acceso rápido a las tareas frecuentes. |
| Resumen | Reorden, nivel de gas y puntos; abundancia de badges y mensajes de garantía. | Priorizar pedido activo y compra; simplificar mensajes y distinguir datos, estimaciones y promesas comerciales. |
| Pedidos | Historial leído desde `gaswii_pedidos_cliente` en localStorage; sin consulta remota en el controlador revisado. | Historial por UID, consistente entre dispositivos y cuentas. Estados verificables, filtros y detalle. No asumir “Entregado” cuando falta el estado. |
| Seguimiento | Radar con parámetros y estado sin despacho. | No afirmar GPS en vivo sin fuente de ubicación. La imagen por defecto `/imgwii/delivery_driver_on_motorcycle.webp` no está entre los recursos disponibles. |
| Direcciones | Guardar y eliminar sincronizan el perfil. | Validación, error visible, edición y elección de predeterminada. Al eliminar la principal, elegir otra. Reorden usa la primera dirección, mientras resumen busca la predeterminada: unificar criterio. |
| Acciones | Algunos botones llaman funciones globales opcionales. | En los archivos revisados no se encuentra asignación global para `mostrarFormularioNuevaDireccion`, `eliminarDireccionCliente` y `pedirReordenExpress`. Verificar y conectar el recorrido completo: hoy el botón puede quedar sin efecto. |
| Puntos | Saldo del perfil; 50 por defecto, meta fija de 200 para un balón. | Validar política real, movimientos, expiración y canje; impedir que el cliente pueda adjudicarse saldo. |
| Comprobantes | El controlador dibuja siempre un estado vacío. | Integrar documentos emitidos y autorizados por cliente, con carga, error y descarga. |
| Nivel de gas | Valores predeterminados de 100 %, 32 días y recarga “Hoy”. | Datos reales de recarga y una fórmula explícita. Etiquetar como estimación; no presentarlo como medición o certificación. |
| Accesibilidad e idioma | Diccionarios ES/EN y selección de pestañas parcialmente etiquetada; varios textos siguen escritos directamente en JS. | Navegación con teclado, foco, modales accesibles, contraste, móvil e internacionalización completa. |
| Renderizado de datos | Historial y direcciones se insertan con plantillas `innerHTML`. | Usar nodos y `textContent` para datos del usuario; evitar interpretar contenido como HTML. |

El diagnóstico es de código: no se verificaron reglas desplegadas de Firestore, transacciones reales, GPS ni emisión fiscal.

## Diseño propuesto y preview creada

Ruta: `/view27`. Cliente ficticia: **Valeria Mendoza**, cuenta activa VIP. El fixture sigue los campos de `auth.js`, pero no importa el controlador de login, no autentica, no escribe en `wiSmile`, no llama a Firebase y no envía pedidos. Así se puede revisar el resultado posterior al login sin interferir con una sesión real.

- Escritorio: navegación lateral, barra de cuenta y una superficie de trabajo centrada en pedidos. En móvil, navegación inferior fija con área segura, tarjetas en una columna, historial sin scroll horizontal y diálogos inferiores.
- Identidad visual: naranja de SOLGAS para acciones, fondo neutro, bloque verde profundo para puntos, tipografías locales Outfit/Poppins, bordes discretos y menos badges.
- Resumen: pedido activo y etapas, favorito con precio del catálogo, beneficio próximo, estimación de recarga e historial.
- Cinco secciones navegables más perfil: pedidos con filtros; edición temporal de dirección; puntos y movimientos; muestra de comprobante sin validez fiscal; datos de cuenta.
- Interacciones: detalle de pedido, revisión y simulación de compra, edición de dirección, ajuste ilustrativo de consumo y cambio claro/oscuro. Los modales se cierran con Escape y restituyen foco al botón de origen.
- Reutilización: `core/widev/nombre.js` para nombre e iniciales, variables tipográficas de `core/wicss/witema.css`, catálogo central `negocio.js`, logo, balón, fuentes y Font Awesome de `public`.
- Aislamiento: CSS y JavaScript integrados en `src/pages/view27.astro` para versionar en un único archivo; carpeta `src/feature/cliente/preview` eliminada. CSS bajo `.v27`, JS de módulo sin funciones globales, metadato `noindex`, estado efímero. El recargo de página restablece los ejemplos.

## Plan para pasar al feature real

### 1. Acordar diseño y cerrar decisiones de negocio

Revisar `/view27` en escritorio y móvil. Acordar estructura, densidad, lenguaje, tarjeta de pedido y apariencia de la cuenta. Confirmar las preguntas de abajo antes de mostrar beneficios o seguimiento como reales.

Criterio de salida: recorrido aprobado de resumen → revisar compra → confirmar, además de pedido vacío y primer cliente.

### 2. Extraer componentes sin afectar inicio

Crear un layout específico de cliente, componentes de navegación, tarjeta de pedido, resumen de compra y diálogo compartido. Migrar gradualmente las secciones del feature, conservar las rutas y diccionarios actuales. Centralizar espacios, tamaños y colores; traducir todo el contenido productivo. Mantener `/view27` como referencia hasta cerrar la integración.

Criterio de salida: navegación, teclado, foco, 200 % de ampliación, tema claro/oscuro y anchos de 360, 768 y 1440 px comprobados; sin desbordamiento horizontal del documento.

### 3. Conectar perfil y direcciones

Adaptar `escucharAuth` a estados de carga/autenticado/invitado/error. Renderizar el modelo de perfil mediante un adaptador, con caché separada por UID y limpieza al cambiar de cuenta. Guardar direcciones con confirmación de persistencia, errores recuperables y una única dirección principal. Reusar esa selección en todo el flujo de compra.

Criterio de salida: una cuenta no muestra datos de otra; editar o borrar dirección persiste correctamente; un fallo remoto no aparece como éxito.

### 4. Completar el ciclo de pedidos

Definir la fuente oficial de pedidos y sus estados. Conectar historial por cliente, revisión de producto/precio/dirección/pago y prevención de envío duplicado. Si WhatsApp sigue siendo el canal, mostrar “solicitud enviada” hasta recibir confirmación del negocio, sin fabricar un despacho. Para seguimiento, consumir el estado operativo y su hora de actualización; añadir mapa únicamente si hay datos fiables.

Criterio de salida: primera compra, repetición, pedido activo, cancelado, entregado, error y reintento coherentes entre dispositivos.

### 5. Beneficios, estimación y comprobantes

Puntos y canjes calculados y validados en servidor; historial de movimientos auditable. Estimación basada en fecha de recarga y consumo declarado, con explicación del cálculo y opción sin datos. Comprobantes obtenidos del proveedor fiscal, limitados al cliente propietario, con descarga real.

Criterio de salida: no hay saldos, tiempos, certificaciones ni documentos ficticios en el portal productivo.

### 6. Validar y activar

Probar acceso con correo/usuario y Google, cierre y vencimiento de sesión, cambios de cuenta, errores de red, datos vacíos y direcciones largas. Revisar reglas de Firestore y propiedad de pedidos/comprobantes. Probar recorridos reales en móvil, teclado, ambos idiomas y temas. Revisar los paquetes JS grandes reportados por la compilación y cargar dependencias del feature bajo demanda cuando corresponda.

## Preguntas abiertas (no bloquean la preview)

1. ¿WhatsApp continuará confirmando pedidos o habrá checkout y registro directo en la web?
2. ¿Existe ya un servicio operativo de pedidos/repartidores o se construirá? ¿Tiene ubicación real y hora estimada?
3. ¿Son definitivas las reglas de 200 puntos por recarga gratis? ¿Cómo se ganan, vencen y canjean?
4. ¿Qué proveedor emite los comprobantes y qué documentos están disponibles para descargar?
5. ¿El cálculo de consumo se basará en pedidos anteriores, información del cliente o mediciones?
6. ¿La cuenta final debe conservar el header comercial completo? La propuesta usa un layout propio de cliente y conserva la identidad de SOLGAS.

## Validación de esta entrega

- `npm run build`: completado, incluida la ruta `/view27`; aviso sobre algunos paquetes de más de 500 kB en la compilación global.
- No se cambiaron dependencias ni los archivos productivos de inicio, auth, core o cliente.
- No se han probado transacciones productivas. La preview es una propuesta interactiva con fixtures.
- Revisión visual e interacciones en navegador pendientes; la compilación no sustituye esas pruebas.

Referencia de implementación consultada conforme a AGENTS.md: [rutas](https://docs.astro.build/en/guides/routing/), [componentes](https://docs.astro.build/en/basics/astro-components/) y [estilos de Astro](https://docs.astro.build/en/guides/styling/).
