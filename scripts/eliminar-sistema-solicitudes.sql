-- Script para eliminar completamente el sistema de solicitudes de cambio
-- CUIDADO: Esta operación es IRREVERSIBLE y eliminará TODOS los datos

-- Eliminar tablas relacionadas con solicitudes de cambio
DROP TABLE IF EXISTS "SolicitudCambio" CASCADE;

-- Eliminar cualquier tabla relacionada con desarrolladores si existe
DROP TABLE IF EXISTS "DesarrolladorSolicitud" CASCADE;
DROP TABLE IF EXISTS "ComentarioDesarrollo" CASCADE;
DROP TABLE IF EXISTS "PlanesTecnicos" CASCADE;

-- Eliminar tablas de seguimiento si existen
DROP TABLE IF EXISTS "HistorialSolicitud" CASCADE;
DROP TABLE IF EXISTS "EstadoSolicitud" CASCADE;

-- Si hay usuarios con rol de desarrollador, actualizar sus roles
UPDATE "Usuario" 
SET "rol_usu" = 'USUARIO' 
WHERE "rol_usu" = 'DESARROLLADOR';

-- Opcional: También eliminar el rol de MASTER si solo se usaba para solicitudes
-- UPDATE "Usuario" 
-- SET "rol_usu" = 'ADMIN' 
-- WHERE "rol_usu" = 'MASTER';

-- Limpiar cualquier referencia en otras tablas si existe
-- (Agregar aquí cualquier otra limpieza necesaria)

COMMIT; 