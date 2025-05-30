const express = require('express');
const router = express.Router();

const { validateJWT, validateAdmin, validateRoles } = require('../middlewares/validateJWT');

// Ruta protegida para cualquier usuario autenticado
router.get('/user-info', validateJWT, (req, res) => {
    res.json({
        success: true,
        message: 'Información del usuario obtenida correctamente',
        user: req.usuario
    });
});

// Ruta protegida solo para administradores
router.get('/admin-info', [validateJWT, validateAdmin], (req, res) => {
    res.json({
        success: true,
        message: 'Información de administrador obtenida correctamente',
        user: req.usuario
    });
});

// Ruta protegida para roles específicos (por ejemplo, MASTER o ADMINISTRADOR)
router.get('/special-access', [
    validateJWT, 
    validateRoles('ADMINISTRADOR', 'MASTER')
], (req, res) => {
    res.json({
        success: true,
        message: 'Acceso especial concedido',
        user: req.usuario
    });
});

module.exports = router; 