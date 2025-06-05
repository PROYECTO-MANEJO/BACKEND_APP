const express = require('express');
const router = express.Router();
const { asociarEventoCarrera } = require('../controllers/eventosPorCarreraController');

// Ruta para asociar un evento a una carrera
router.post('/asociar', asociarEventoCarrera);

module.exports = router;
