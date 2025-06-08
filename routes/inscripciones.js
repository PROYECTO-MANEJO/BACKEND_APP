const express = require('express');
const router = express.Router();

const {
  inscribirUsuarioEvento,
  obtenerMisInscripcionesEvento,
  aprobarInscripcionEvento
} = require('../controllers/inscripcionesController');

const { validateJWT } = require('../middlewares/validateJWT');

// ======================= EVENTOS ============================

// Inscribir a un evento
router.post('/eventos', validateJWT, inscribirUsuarioEvento);

// Obtener mis inscripciones
router.get('/evento/mis-inscripciones', validateJWT, obtenerMisInscripcionesEvento);

// Aprobar o rechazar inscripción (solo admin)
router.put('/evento/aprobar-inscripcion/:id', validateJWT, aprobarInscripcionEvento);

module.exports = router;
