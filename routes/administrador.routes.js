const express = require('express');
const router = express.Router();
const adminController = require('../controllers/administrador.js');


router.post('/registro', adminController.registrarAdministrador);
router.post('/login', adminController.loginAdministrador);

module.exports = router;
