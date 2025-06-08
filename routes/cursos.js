// routes/cursos.js
const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middlewares/validateJWT');

const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso,
  obtenerCursosDisponibles,
  obtenerMisCursos
} = require('../controllers/cursoController');

// Crear curso
router.post('/', crearCurso);

// Obtener todos los cursos
router.get('/', obtenerCursos);

// Obtener cursos disponibles para inscribirse (requiere autenticación)
router.get('/disponibles', validateJWT, obtenerCursosDisponibles);

// Obtener mis cursos (donde estoy inscrito) (requiere autenticación)
router.get('/mis-cursos', validateJWT, obtenerMisCursos);

// Obtener un curso por ID
router.get('/:id', obtenerCursoPorId);

// Actualizar curso
router.put('/:id', actualizarCurso);

// Eliminar curso
router.delete('/:id', eliminarCurso);

module.exports = router;
