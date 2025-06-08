const express = require('express');
const router = express.Router();
const {
  inscribirUsuarioEvento,
  obtenerMisInscripcionesEvento,
  aprobarInscripcionEvento,
  inscribirUsuarioCurso,
  obtenerMisInscripcionesCurso,
  aprobarInscripcionCurso
} = require('../controllers/inscripcionesCursosController');

const { validateJWT } = require('../middlewares/validateJWT');

// Inscribirse a un curso
router.post('/curso', validateJWT, inscribirUsuarioCurso);

// Ver mis inscripciones a cursos
router.get('/curso/mis-inscripciones', validateJWT, obtenerMisInscripcionesCurso);

// Aprobar o rechazar inscripción a curso (admin)
router.put('/curso/aprobar/:id', validateJWT, aprobarInscripcionCurso);

module.exports = router;
