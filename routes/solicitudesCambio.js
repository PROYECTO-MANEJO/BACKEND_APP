const { Router } = require('express');

// Importar controladores
const {
  crearSolicitud,
  obtenerSolicitudesUsuario,
  obtenerSolicitudPorId,
  obtenerTodasLasSolicitudes,
  responderSolicitud,
  editarSolicitud,
  actualizarEstadoSolicitud,
  obtenerEstadisticas,
  gestionarSolicitudTecnica,
  obtenerSolicitudAdmin,
  asignarDesarrollador,
  obtenerDesarrolladoresDisponibles,
  enviarSolicitud
} = require('../controllers/solicitudesCambio');

// Importar controlador de desarrolladores
const desarrolladorController = require('../controllers/desarrolladorController');

// Importar middlewares
const { validateJWT, validateAdmin, validateRoles } = require('../middlewares/validateJWT');
const {
  validarCreacionSolicitud,
  validarRespuestaSolicitud,
  validarEdicionSolicitud,
  validarActualizacionEstado,
  validarIdSolicitud,
  validarGestionTecnica
} = require('../middlewares/validacionSolicitudes');

const router = Router();

// ===================
// RUTAS PARA USUARIOS
// ===================

// Crear una nueva solicitud de cambio
// POST /api/solicitudes-cambio
router.post(
  '/solicitud-nueva',
  [validateJWT, ...validarCreacionSolicitud],
  crearSolicitud
);

// Obtener todas las solicitudes del usuario autenticado
// GET /api/solicitudes-cambio/mis-solicitudes
router.get(
  '/mis-solicitudes',
  validateJWT,
  obtenerSolicitudesUsuario
);

// Obtener una solicitud específica del usuario autenticado
// GET /api/solicitudes-cambio/mis-solicitudes/:id
router.get(
  '/mis-solicitudes/:id',
  [validateJWT, ...validarIdSolicitud],
  obtenerSolicitudPorId
);

// Enviar solicitud (BORRADOR → PENDIENTE)
// PUT /api/solicitudes-cambio/:id/enviar
router.put(
  '/:id/enviar',
  validateJWT,
  enviarSolicitud
);

// ========================
// RUTAS PARA ADMINISTRADORES
// ========================

// Obtener todas las solicitudes (solo administradores)
// GET /api/solicitudes-cambio/admin/todas
router.get(
  '/admin/todas',
  [validateJWT, validateAdmin],
  obtenerTodasLasSolicitudes
);

// Responder a una solicitud (aprobar/rechazar) - Solo administradores
// PUT /api/solicitudes-cambio/admin/:id/responder
router.put(
  '/admin/:id/responder',
  [validateJWT, validateAdmin, ...validarRespuestaSolicitud],
  responderSolicitud
);

// Editar una solicitud - Solo administradores
// PUT /api/solicitudes-cambio/admin/:id/editar
router.put(
  '/admin/:id/editar',
  [validateJWT, validateAdmin, ...validarEdicionSolicitud],
  editarSolicitud
);

// Actualizar el estado de una solicitud - Solo administradores
// PUT /api/solicitudes-cambio/admin/:id/estado
router.put(
  '/admin/:id/estado',
  [validateJWT, validateAdmin, ...validarActualizacionEstado],
  actualizarEstadoSolicitud
);

// Gestión técnica de una solicitud - Solo administradores
// PUT /api/solicitudes-cambio/admin/:id/gestion-tecnica
router.put(
  '/admin/:id/gestion-tecnica',
  [validateJWT, validateAdmin, ...validarGestionTecnica],
  gestionarSolicitudTecnica
);

// Obtener estadísticas de solicitudes - Solo administradores
// GET /api/solicitudes-cambio/admin/estadisticas
router.get(
  '/admin/estadisticas',
  [validateJWT, validateAdmin],
  obtenerEstadisticas
);

// =======================
// RUTAS ADICIONALES (PARA DESARROLLO)
// =======================

// Obtener una solicitud específica por ID (para administradores) - INCLUYE TODOS LOS CAMPOS TÉCNICOS
// GET /api/solicitudes-cambio/admin/:id
router.get(
  '/admin/:id',
  [validateJWT, validateAdmin, ...validarIdSolicitud],
  obtenerSolicitudAdmin
);

// Asignar desarrollador a una solicitud (admin)
// POST /api/solicitudes-cambio/:id/asignar-desarrollador
router.post(
  '/:id/asignar-desarrollador',
  [validateJWT, validateAdmin],
  asignarDesarrollador
);

// Obtener lista de desarrolladores disponibles (admin)
// GET /api/solicitudes-cambio/admin/desarrolladores/disponibles
router.get(
  '/admin/desarrolladores/disponibles',
  [validateJWT, validateAdmin],
  obtenerDesarrolladoresDisponibles
);

// ========================
// RUTAS PARA DESARROLLADORES
// ========================

// Obtener solicitudes asignadas a un desarrollador
// GET /api/solicitudes-cambio/desarrollador/:desarrolladorId
router.get(
  '/desarrollador/:desarrolladorId',
  validateJWT,
  desarrolladorController.getSolicitudesAsignadas
);

// Obtener una solicitud específica para desarrollador
// GET /api/solicitudes-cambio/desarrollador/solicitud/:id
router.get(
  '/desarrollador/solicitud/:id',
  validateJWT,
  desarrolladorController.getSolicitudEspecifica
);

// Actualizar estado de una solicitud (desarrolladores)
// POST /api/solicitudes-cambio/:id/estado
router.post(
  '/:id/estado',
  validateJWT,
  desarrolladorController.actualizarEstadoSolicitud
);

// Agregar comentario de desarrollo
// POST /api/solicitudes-cambio/:id/comentario-desarrollo
router.post(
  '/:id/comentario-desarrollo',
  validateJWT,
  desarrolladorController.agregarComentarioDesarrollo
);

module.exports = router; 