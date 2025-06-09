const express = require('express');
const router = express.Router();

const {
  inscribirUsuarioEvento,
  obtenerMisInscripcionesEvento,
  aprobarInscripcionEvento,
  descargarComprobantePagoEvento,
  obtenerTodasInscripcionesEventos
} = require('../controllers/inscripcionesController');

const { validateJWT } = require('../middlewares/validateJWT');
const { upload, handleMulterError } = require('../middlewares/uploadMiddleware');

// ======================= EVENTOS ============================

// Inscribir a un evento (con posible comprobante de pago PDF)
router.post('/eventos', 
  validateJWT,
  upload.single('comprobante_pago'),
  handleMulterError,
  inscribirUsuarioEvento
);

// Obtener mis inscripciones
router.get('/evento/mis-inscripciones', validateJWT, obtenerMisInscripcionesEvento);

// Obtener todas las inscripciones (solo admin)
router.get('/admin/eventos', validateJWT, obtenerTodasInscripcionesEventos);

// Aprobar o rechazar inscripción (solo admin)
router.put('/evento/aprobar-inscripcion/:id', validateJWT, aprobarInscripcionEvento);

// Descargar comprobante de pago (solo admin)
router.get('/evento/comprobante/:inscripcionId', validateJWT, descargarComprobantePagoEvento);

module.exports = router;
