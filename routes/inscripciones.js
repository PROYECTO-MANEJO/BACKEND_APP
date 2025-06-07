const express = require('express');
const router = express.Router();
const {
  inscribirUsuarioEvento,
  obtenerInscripcionesEvento,
  eliminarInscripcionEvento,
  actualizarInscripcionEvento,
  inscribirUsuarioCurso,
  obtenerInscripcionesCurso,
  eliminarInscripcionCurso,
  actualizarInscripcionCurso,
  inscribirEstudianteCarrera,
  obtenerInscripcionCarrera,
  actualizarInscripcionCarrera,
  eliminarInscripcionCarrera
} = require('../controllers/inscripcionesController');

//
// EVENTOS
//

// Crear inscripción a evento
router.post('/evento', inscribirUsuarioEvento);

// Obtener todas las inscripciones a eventos
router.get('/evento', obtenerInscripcionesEvento);

// Actualizar inscripción a evento (por ID de inscripción o ID de usuario + evento, según prefieras)
router.put('/evento/:id', actualizarInscripcionEvento);

// Eliminar inscripción a evento
router.delete('/evento/:id', eliminarInscripcionEvento);

//
// CURSOS
//

// Crear inscripción a curso
router.post('/curso', inscribirUsuarioCurso);

// Obtener todas las inscripciones a cursos
router.get('/curso', obtenerInscripcionesCurso);

// Actualizar inscripción a curso
router.put('/curso/:id', actualizarInscripcionCurso);

// Eliminar inscripción a curso
router.delete('/curso/:id', eliminarInscripcionCurso);

//
// CARRERA
//

// Asignar carrera al estudiante (inscripción a carrera)
router.post('/carrera', inscribirEstudianteCarrera);

// Obtener carrera actual de un estudiante
router.get('/carrera/:idUsuario', obtenerInscripcionCarrera);
router.get('/carrera', obtenerInscripcionCarrera);

// Actualizar carrera del estudiante
router.put('/carrera/:id', actualizarInscripcionCarrera);

// Eliminar carrera asignada al estudiante
router.delete('/carrera/:id', eliminarInscripcionCarrera);


module.exports = router;
