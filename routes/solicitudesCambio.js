const { Router } = require('express');

// Importar controladores
const {
  crearSolicitud,
  obtenerMisSolicitudes,
  obtenerMiSolicitud,
  editarSolicitud,
  enviarSolicitud,
  cancelarSolicitud,
  obtenerEstadisticasUsuario,
  // Funciones de Admin Master
  obtenerTodasLasSolicitudes,
  obtenerSolicitudParaAdmin,
  actualizarSolicitudMaster,
  ponerEnRevision,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerEstadisticasAdmin,
  obtenerDesarrolladores
} = require('../controllers/solicitudesCambioController');

// Importar controlador de desarrolladores
const desarrolladorController = require('../controllers/desarrolladorController');

// Importar middlewares
const { validateJWT, validateAdmin, validateRoles } = require('../middlewares/validateJWT');
const {
  validarCreacionSolicitud,
  validarEdicionSolicitud,
  validarIdSolicitud,
  validarActualizacionMaster,
  validarAprobacion,
  validarRechazo
} = require('../middlewares/validacionSolicitudes');

const router = Router();

// ===================
// RUTAS PARA USUARIOS
// ===================

// Crear una nueva solicitud de cambio
// POST /api/solicitudes-cambio/solicitud-nueva
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
  obtenerMisSolicitudes
);

// Obtener una solicitud específica del usuario autenticado
// GET /api/solicitudes-cambio/mis-solicitudes/:id
router.get(
  '/mis-solicitudes/:id',
  [validateJWT, ...validarIdSolicitud],
  obtenerMiSolicitud
);

// Editar solicitud (usuario - solo BORRADOR)
// PUT /api/solicitudes-cambio/:id/editar
router.put(
  '/:id/editar',
  [validateJWT, ...validarEdicionSolicitud],
  editarSolicitud
);

// Enviar solicitud (BORRADOR → PENDIENTE)
// PUT /api/solicitudes-cambio/:id/enviar
router.put(
  '/:id/enviar',
  [validateJWT, ...validarIdSolicitud],
  enviarSolicitud
);

// Cancelar solicitud (solo BORRADOR)
// PUT /api/solicitudes-cambio/:id/cancelar
router.put(
  '/:id/cancelar',
  [validateJWT, ...validarIdSolicitud],
  cancelarSolicitud
);

// Obtener estadísticas del usuario
// GET /api/solicitudes-cambio/mis-estadisticas
router.get(
  '/mis-estadisticas',
  validateJWT,
  obtenerEstadisticasUsuario
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
  obtenerTodasLasSolicitudes
);

// Obtener una solicitud específica (para admin/master)
// GET /api/solicitudes-cambio/admin/solicitud/:id
router.get(
  '/admin/solicitud/:id',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarIdSolicitud],
  obtenerSolicitudParaAdmin
);

// Actualizar solicitud con campos de admin/master
// PUT /api/solicitudes-cambio/admin/:id/actualizar
router.put(
  '/admin/:id/actualizar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarActualizacionMaster],
  actualizarSolicitudMaster
);

// Poner solicitud en revisión (PENDIENTE → EN_REVISION)
// PUT /api/solicitudes-cambio/admin/:id/poner-revision
router.put(
  '/admin/:id/poner-revision',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarIdSolicitud],
  ponerEnRevision
);

// Aprobar solicitud (EN_REVISION → APROBADA)
// PUT /api/solicitudes-cambio/admin/:id/aprobar
router.put(
  '/admin/:id/aprobar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarAprobacion],
  aprobarSolicitud
);

// Rechazar solicitud (EN_REVISION → RECHAZADA)
// PUT /api/solicitudes-cambio/admin/:id/rechazar
router.put(
  '/admin/:id/rechazar',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER'), ...validarRechazo],
  rechazarSolicitud
);

// Obtener estadísticas generales (para admin/master)
// GET /api/solicitudes-cambio/admin/estadisticas
router.get(
  '/admin/estadisticas',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  obtenerEstadisticasAdmin
);

// Obtener desarrolladores disponibles (para admin/master)
// GET /api/solicitudes-cambio/admin/desarrolladores
router.get(
  '/admin/desarrolladores',
  [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')],
  obtenerDesarrolladores
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

module.exports = router; 