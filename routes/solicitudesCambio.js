const { Router } = require('express');
const { check } = require('express-validator');

// Importar controladores
const solicitudesCambioController = require('../controllers/solicitudesCambioController');
const desarrolladorController = require('../controllers/desarrolladorController');

// Importar middlewares
const { validateJWT } = require('../middlewares/validateJWT');
const { validateRoles } = require('../middlewares/validateJWT');
const {
  validarCreacionSolicitud,
  validarEdicionSolicitud,
  validarIdSolicitud,
  validarActualizacionMaster,
  validarAprobacion,
  validarRechazo
} = require('../middlewares/validacionSolicitudes');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

// ===================
// RUTAS PARA USUARIOS
// ===================

// Crear una nueva solicitud de cambio
// POST /api/solicitudes-cambio/solicitud-nueva
router.post(
  '/solicitud-nueva',
  [validateJWT, ...validarCreacionSolicitud],
  solicitudesCambioController.crearSolicitud
);

// Obtener todas las solicitudes del usuario autenticado
// GET /api/solicitudes-cambio/mis-solicitudes
router.get(
  '/mis-solicitudes',
  validateJWT,
  solicitudesCambioController.obtenerMisSolicitudes
);

// Obtener una solicitud específica del usuario autenticado
// GET /api/solicitudes-cambio/mis-solicitudes/:id
router.get(
  '/mis-solicitudes/:id',
  [validateJWT, ...validarIdSolicitud],
  solicitudesCambioController.obtenerMiSolicitud
);

// Editar solicitud (usuario - solo BORRADOR)
// PUT /api/solicitudes-cambio/:id/editar
router.put(
  '/:id/editar',
  [validateJWT, ...validarEdicionSolicitud],
  solicitudesCambioController.editarSolicitud
);

// Enviar solicitud (BORRADOR → PENDIENTE)
// PUT /api/solicitudes-cambio/:id/enviar
router.put(
  '/:id/enviar',
  [validateJWT, ...validarIdSolicitud],
  solicitudesCambioController.enviarSolicitud
);

// Cancelar solicitud (solo BORRADOR)
// PUT /api/solicitudes-cambio/:id/cancelar
router.put(
  '/:id/cancelar',
  [validateJWT, ...validarIdSolicitud],
  solicitudesCambioController.cancelarSolicitud
);

// Obtener estadísticas del usuario
// GET /api/solicitudes-cambio/mis-estadisticas
router.get(
  '/mis-estadisticas',
  validateJWT,
  solicitudesCambioController.obtenerEstadisticasUsuario
);

// ========================
// RUTAS SIMPLIFICADAS 
// ========================
// Las rutas de comentarios e historial se eliminan ya que 
// esas funcionalidades no están implementadas actualmente

// ========================
// RUTAS PARA ADMIN MASTER
// ========================

// Obtener todas las solicitudes (para admin/master)
// GET /api/solicitudes-cambio/admin/todas
router.get(
  '/admin/todas',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.obtenerTodasLasSolicitudes
);

// Obtener una solicitud específica (para admin/master)
// GET /api/solicitudes-cambio/admin/solicitud/:id
router.get(
  '/admin/solicitud/:id',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarIdSolicitud],
  solicitudesCambioController.obtenerSolicitudParaAdmin
);

// Actualizar solicitud con campos de admin/master
// PUT /api/solicitudes-cambio/admin/:id/actualizar
router.put(
  '/admin/:id/actualizar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarActualizacionMaster],
  solicitudesCambioController.actualizarSolicitudMaster
);

// Poner solicitud en revisión (PENDIENTE → EN_REVISION)
// PUT /api/solicitudes-cambio/admin/:id/poner-revision
router.put(
  '/admin/:id/poner-revision',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarIdSolicitud],
  solicitudesCambioController.ponerEnRevision
);

// Aprobar solicitud (EN_REVISION → APROBADA)
// PUT /api/solicitudes-cambio/admin/:id/aprobar
router.put(
  '/admin/:id/aprobar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarAprobacion],
  solicitudesCambioController.aprobarSolicitud
);

// Rechazar solicitud (EN_REVISION → RECHAZADA)
// PUT /api/solicitudes-cambio/admin/:id/rechazar
router.put(
  '/admin/:id/rechazar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarRechazo],
  solicitudesCambioController.rechazarSolicitud
);

// Obtener estadísticas generales (para admin/master)
// GET /api/solicitudes-cambio/admin/estadisticas
router.get(
  '/admin/estadisticas',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.obtenerEstadisticasAdmin
);

// Obtener desarrolladores disponibles (para admin/master)
// GET /api/solicitudes-cambio/admin/desarrolladores
router.get(
  '/admin/desarrolladores',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.obtenerDesarrolladores
);

// ========================
// NUEVAS RUTAS PARA MÚLTIPLES PRS
// ========================

// Obtener información de todos los PRs de una solicitud
// GET /api/solicitudes-cambio/admin/:id_sol/pr-info
router.get(
  '/admin/:id_sol/pr-info',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.obtenerInformacionPR
);

// Aprobar PR específico
// POST /api/solicitudes-cambio/admin/:id_sol/aprobar-pr
router.post(
  '/admin/:id_sol/aprobar-pr',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.aprobarPRSpecifico
);

// Rechazar PR específico
// POST /api/solicitudes-cambio/admin/:id_sol/rechazar-pr
router.post(
  '/admin/:id_sol/rechazar-pr',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  solicitudesCambioController.rechazarPRSpecifico
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

// Actualizar planes técnicos (desarrolladores)
// PUT /api/solicitudes-cambio/desarrollador/solicitud/:id/planes-tecnicos
router.put(
  '/desarrollador/solicitud/:id/planes-tecnicos',
  validateJWT,
  desarrolladorController.actualizarPlanesTecnicos
);

// Enviar planes técnicos a revisión (desarrolladores)
// POST /api/solicitudes-cambio/:id/enviar-planes-revision
router.post(
  '/:id/enviar-planes-revision',
  validateJWT,
  desarrolladorController.enviarPlanesARevision
);

// Ruta para crear rama para una solicitud
router.post(
  '/:id_solicitud/ramas',
  [
    validateJWT,
    validateRoles('DESARROLLADOR'),
    check('repository_type').isIn(['FRONTEND', 'BACKEND']),
    validateFields
  ],
  solicitudesCambioController.crearRamaParaSolicitud
);

module.exports = router; 