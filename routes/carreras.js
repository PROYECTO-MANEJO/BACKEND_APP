const express = require('express');
const router = express.Router();
const { crearCarrera } = require('../controllers/carreraController');

// Ruta para crear una nueva carrera
router.post('/crear', crearCarrera);

module.exports = router;
