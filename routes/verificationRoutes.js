// routes/verificationRoutes.js
const express = require('express');
const { verifyEmail } = require('../controllers/verificationController'); // Asegúrate de importar la función
const router = express.Router();

// Ruta para verificar el correo del usuario
router.get('/verificar-cuenta', verifyEmail);

module.exports = router;
