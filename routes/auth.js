const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { login, renewToken, adminCreateUser, register } = require('../controllers/auth');
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');

// Ruta para login de usuarios (normales y administradores)
router.post('/login', [
    check('email', 'El correo electrónico es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login);

// Ruta para crear un usuario administrador
router.post('/createAdmin', [
    check('ced_usu', 'La cédula es obligatoria').not().isEmpty(),
    check('nom_usu1', 'El primer nombre es obligatorio').not().isEmpty(),
    check('nom_usu2', 'El segundo nombre es obligatorio').not().isEmpty(),
    check('ape_usu1', 'El primer apellido es obligatorio').not().isEmpty(),
    check('ape_usu2', 'El segundo apellido es obligatorio').not().isEmpty(),
    check('fec_nac_usu', 'La fecha de nacimiento es obligatoria').not().isEmpty(),
    check('num_tel_usu', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('pas_usu', 'La contraseña es obligatoria y debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('id_car_per', 'El ID del cargo es obligatorio').optional(),
    check('cor_cue', 'El correo electrónico es obligatorio').isEmail(),
    validateFields
], adminCreateUser);

// Ruta para crear un usuario normal
router.post('/createUser', [
    check('email', 'El correo electrónico es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria y debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('nombre', 'El primer nombre es obligatorio').not().isEmpty(),
    check('nombre2', 'El segundo nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El primer apellido es obligatorio').not().isEmpty(),
    check('apellido2', 'El segundo apellido es obligatorio').not().isEmpty(),
    check('ced_usu', 'La cédula es obligatoria').not().isEmpty(),
    validateFields
], register);

// Ruta para renovar el token
router.get('/check-token', validateJWT, renewToken);

module.exports = router; 