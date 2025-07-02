const express = require('express');
const router = express.Router();
const {
  inscribirUsuarioCurso,
  obtenerMisInscripcionesCurso,
  aprobarInscripcionCurso,
  descargarComprobantePagoCurso,
  obtenerTodasInscripcionesCursos
} = require('../controllers/inscripcionesCursosController');

const { validateJWT } = require('../middlewares/validateJWT');
const { uploadComprobante } = require('../middlewares/uploadMiddleware');

// Inscribir usuario a curso (con archivo PDF)
router.post('/', validateJWT, uploadComprobante, inscribirUsuarioCurso);

// Ver mis inscripciones a cursos
router.get('/curso/mis-inscripciones', validateJWT, obtenerMisInscripcionesCurso);

// Obtener todas las inscripciones (solo admin)
router.get('/admin/cursos', validateJWT, obtenerTodasInscripcionesCursos);

// Aprobar o rechazar inscripción a curso (admin)
router.put('/curso/aprobar/:id', validateJWT, aprobarInscripcionCurso);

// Descargar comprobante de pago (solo admin)
router.get('/curso/comprobante/:inscripcionId', validateJWT, descargarComprobantePagoCurso);

module.exports = router;
