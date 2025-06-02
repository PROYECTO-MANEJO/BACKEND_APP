// routes/cursos.js
const express = require('express');
const router = express.Router();

const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso
} = require('../controllers/cursoController');

// Crear curso
router.post('/', crearCurso);

// Obtener todos los cursos
router.get('/', obtenerCursos);

// Obtener un curso por ID
router.get('/:id', obtenerCursoPorId);

// Actualizar curso
router.put('/:id', actualizarCurso);

// Eliminar curso
router.delete('/:id', eliminarCurso);

module.exports = router;
