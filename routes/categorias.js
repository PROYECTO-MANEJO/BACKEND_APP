const express = require('express');
const router = express.Router();
const {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoriaEventoController');

router.post('/', crearCategoria);
router.get('/', obtenerCategorias);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;
