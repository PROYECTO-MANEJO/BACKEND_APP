const express = require('express');
const router = express.Router();
const { 
  obtenerContenido, 
  actualizarContenido, 
  subirImagen, 
  obtenerImagen,
  uploadMiddleware,
  getEventosCursosCarrera,
  getEventosCursosDisponibles,
  getEventosCursosPublicos
} = require('../controllers/paginaPrincipalController');
const { validateJWT } = require('../middlewares/validateJWT');

// Middleware para verificar rol MASTER
const verificarRolMaster = (req, res, next) => {
  console.log('🔍 Verificando rol MASTER...');
  console.log('👤 Usuario:', req.usuario ? req.usuario.nom_usu1 : 'No disponible');
  console.log('👤 UserRole:', req.userRole);
  console.log('👤 Cuentas:', req.usuario?.cuentas);
  
  // Verificar rol desde userRole o desde cuentas
  const rolUsuario = req.userRole || req.usuario?.cuentas?.[0]?.rol_cue;
  
  if (rolUsuario !== 'MASTER') {
    console.log('❌ Acceso denegado. Rol actual:', rolUsuario);
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo usuarios MASTER pueden editar la página principal.'
    });
  }
  
  console.log('✅ Acceso autorizado para usuario MASTER');
  next();
};

// ===== RUTAS PÚBLICAS =====
// Obtener contenido de la página principal (público)
router.get('/contenido', obtenerContenido);

// Obtener imagen específica (público)
router.get('/imagen/:tipoImagen', obtenerImagen);

// Ruta pública (sin autenticación) para usuarios no logueados
router.get('/eventos-cursos-publicos', getEventosCursosPublicos);

// ===== RUTAS PROTEGIDAS (SOLO MASTER) =====
// Actualizar contenido de la página principal
router.put('/contenido', validateJWT, verificarRolMaster, actualizarContenido);

// Subir imagen
router.post('/imagen/:tipoImagen', validateJWT, verificarRolMaster, uploadMiddleware, subirImagen);

// Rutas autenticadas
router.get('/eventos-cursos-carrera', validateJWT, getEventosCursosCarrera);
router.get('/eventos-cursos-disponibles', validateJWT, getEventosCursosDisponibles);

module.exports = router; 