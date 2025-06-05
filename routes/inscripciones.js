const express = require('express');
const router = express.Router();
const { inscribirUsuario } = require('../controllers/inscripcionesController');  // Importar el controlador de inscripción

// Ruta para inscribir al usuario o estudiante
router.post('/inscribir', inscribirUsuario);  
module.exports = router;
