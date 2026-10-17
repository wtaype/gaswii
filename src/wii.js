// src/wii.js
export const id = 'gaswii-web';
export const app = 'Solgas Surquillo';
export const by = '@wilder.taype';
export const linkweb = 'https://solgassurquillo.com/';
export const linkme = 'https://wtaype.github.io/';
export const version = 6.0;
export const versionName = 'v6';
export default { id, app, by, linkweb, linkme, version, versionName };

/** ACTUALIZAR AL TAG POR SEGURIDAD [TAG NUEVO] (1)
git tag v6 -m "Version v6" ; git push origin v6

ACTUALIZACIÓN AL MAIN PRINCIPAL DEL PROYECTO [MAIN] (2)
git add . ; git commit -m "Actualizacion Principal v6.10.10" ; git push origin main

// REEMPLAZAR TAG DE SEGURIDAD EXISTENTE [TAG REMPLAZO] (3)
git tag -d v6 ; git tag v6 -m "Version v3 actualizada" ; git push origin v3 --force

// Actualizar versiones de seguridad [ELIMINAR CARPETA - ARCHIVO ONLINE] (5)
git rm --cached skills-lock.json ; git commit -m "Archivo Eliminado" ; git push origin main
git rm -r --cached .claude/ ; git commit -m "Carpeta Eliminada" ; git push origin main
 ACTUALIZACION TAG[END] */
 