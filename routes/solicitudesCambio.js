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
  obtenerEstadisticas
} = require('../controllers/solicitudesCambio');

// Importar middlewares
const { validateJWT, validateAdmin, validateRoles } = require('../middlewares/validateJWT');
const {
  validarCreacionSolicitud,
  validarRespuestaSolicitud,
  validarEdicionSolicitud,
  validarActualizacionEstado,
  validarIdSolicitud
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

// Obtener una solicitud específica por ID (para administradores)
// GET /api/solicitudes-cambio/admin/:id
router.get(
  '/admin/:id',
  [validateJWT, validateAdmin, ...validarIdSolicitud],
  async (req, res) => {
    try {
      const { id } = req.params;

      const solicitud = await require('@prisma/client').PrismaClient().solicitudCambio.findUnique({
        where: { id_sol: id },
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true
            }
          },
          adminResponsable: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true
            }
          }
        }
      });

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      res.json({
        success: true,
        data: solicitud
      });

    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

module.exports = router; 