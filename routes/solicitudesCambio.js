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
  obtenerSolicitudAdmin
} = require('../controllers/solicitudesCambio');

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

module.exports = router; 