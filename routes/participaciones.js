const express = require('express');
const { 
  obtenerParticipacionesCurso,
  actualizarParticipacionCurso,
  obtenerParticipacionesEvento,
  actualizarParticipacionEvento
} = require('../controllers/participacionController');

const { validateJWT } = require('../middlewares/validateJWT');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(validateJWT);

// =====================================================
// RUTAS PARA PARTICIPACIONES DE CURSOS
// =====================================================

// GET /participaciones/cursos/:idCurso - Obtener participaciones de un curso
router.get('/cursos/:idCurso', obtenerParticipacionesCurso);

// PUT /participaciones/cursos/:idCurso/inscripcion/:idInscripcion - Actualizar participación de curso
router.put('/cursos/:idCurso/inscripcion/:idInscripcion', actualizarParticipacionCurso);

// =====================================================
// RUTAS PARA PARTICIPACIONES DE EVENTOS
// =====================================================

// GET /participaciones/eventos/:idEvento - Obtener participaciones de un evento
router.get('/eventos/:idEvento', obtenerParticipacionesEvento);

// PUT /participaciones/eventos/:idEvento/inscripcion/:idInscripcion - Actualizar participación de evento
router.put('/eventos/:idEvento/inscripcion/:idInscripcion', actualizarParticipacionEvento);

module.exports = router;
