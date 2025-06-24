const express = require('express');
const router = express.Router();
const desarrolladorController = require('../controllers/desarrolladorController');
const { validateJWT } = require('../middlewares/validateJWT');

// Middleware para verificar que el usuario es desarrollador
const verificarRolDesarrollador = (req, res, next) => {
  // Verificar que exista un usuario en la request (validado por validateJWT)
  if (!req.usuario) {
    return res.status(500).json({
      success: false,
      message: 'Se quiere verificar el rol sin validar el token primero'
    });
  }

  try {
    // El usuario ya viene con las cuentas incluidas desde validateJWT
    const cuentas = req.usuario.cuentas;

    // Verificar si tiene cuenta y si su rol es DESARROLLADOR
    if (!cuentas || cuentas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'El usuario no tiene cuenta asociada'
      });
    }

    const cuenta = cuentas[0]; // Tomar la primera cuenta
    if (cuenta.rol_cue !== 'DESARROLLADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Se requiere rol de DESARROLLADOR'
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el rol de desarrollador'
    });
  }
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
router.post('/solicitud/:id/estado', 
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

// Enviar planes a revisión del MASTER
router.post('/solicitud/:id/enviar-planes', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.enviarPlanesARevision
);

// Iniciar desarrollo (LISTO_PARA_IMPLEMENTAR → EN_DESARROLLO)
router.post('/solicitud/:id/iniciar-desarrollo', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.iniciarDesarrollo
);

// Pasar a testing (EN_DESARROLLO → EN_TESTING)
router.post('/solicitud/:id/pasar-testing', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.pasarATesting
);

// Pasar a despliegue (EN_TESTING → EN_DESPLIEGUE)
router.post('/solicitud/:id/pasar-despliegue', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.pasarADespliegue
);

// Completar solicitud (EN_DESPLIEGUE → COMPLETADA/FALLIDA)
router.post('/solicitud/:id/completar', 
  validateJWT, 
  verificarRolDesarrollador, 
  desarrolladorController.completarSolicitud
);

module.exports = router; 