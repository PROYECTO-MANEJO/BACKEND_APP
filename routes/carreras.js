const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');
const { getAllCarreras, getCarreraById, createCarrera, updateCarrera, deleteCarrera } = require('../controllers/carreras');

// Obtener todas las carreras
router.get('/',  getAllCarreras);

// Obtener una carrera por ID
router.get('/:id', getCarreraById);

// Crear una nueva carrera
router.post('/', [
  validateJWT,
  check('nom_car', 'El nombre de la carrera es obligatorio').not().isEmpty(),
  check('nom_car', 'El nombre de la carrera debe tener entre 3 y 100 caracteres').isLength({ min: 3, max: 100 }),
  check('des_car', 'La descripción debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
  check('nom_fac_per', 'El nombre de la facultad debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
  validateFields
], createCarrera);

// Actualizar una carrera
router.put('/:id', [
  validateJWT,
  check('nom_car', 'El nombre de la carrera es obligatorio').not().isEmpty(),
  check('nom_car', 'El nombre de la carrera debe tener entre 3 y 100 caracteres').isLength({ min: 3, max: 100 }),
  check('des_car', 'La descripción debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
  check('nom_fac_per', 'El nombre de la facultad debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
  validateFields
], updateCarrera);

// Eliminar una carrera
router.delete('/:id', validateJWT, deleteCarrera);

module.exports = router;

