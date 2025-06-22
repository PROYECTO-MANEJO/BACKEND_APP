const express = require('express');
const router = express.Router();
const desarrolladorController = require('../controllers/desarrolladorController');
const { validateJWT } = require('../middlewares/validateJWT');

// Middleware para verificar que el usuario es desarrollador
const verificarRolDesarrollador = (req, res, next) => {
  if (req.user.rol !== 'DESARROLLADOR') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requiere rol de DESARROLLADOR'
    });
  }
  next();
};

// Obtener solicitudes asignadas a un desarrollador específico
router.get('/solicitudes/:desarrolladorId', 
  validateJWT, 
  desarrolladorController.getSolicitudesAsignadas
);

// Obtener una solicitud específica para desarrollador
router.get('/solicitud/:id', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.getSolicitudEspecifica
);

// Actualizar estado de una solicitud
router.patch('/solicitud/:id/estado', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.actualizarEstadoSolicitud
);

// Agregar comentario de desarrollo
router.post('/solicitud/:id/comentario', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.agregarComentarioDesarrollo
);

// Obtener estadísticas del desarrollador
router.get('/estadisticas/:desarrolladorId', 
  validateJWT, 
  desarrolladorController.getEstadisticasDesarrollador
);

// Actualizar planes técnicos (rollout y backout)
router.put('/solicitud/:id/planes-tecnicos', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.actualizarPlanesTecnicos
);

module.exports = router; 