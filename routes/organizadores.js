const express = require('express');
const router = express.Router();
const {
  crearOrganizador,
  obtenerOrganizadores,
  actualizarOrganizador,
  eliminarOrganizador
} = require('../controllers/organizadorController');

// Crear organizador
router.post('/', crearOrganizador);

// Obtener todos los organizadores
router.get('/', obtenerOrganizadores);

// Actualizar por cédula
router.put('/:cedula', actualizarOrganizador);

// Eliminar por cédula
router.delete('/:cedula', eliminarOrganizador);

module.exports = router;
