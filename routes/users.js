const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');
const { upload, handleMulterError } = require('../middlewares/uploadMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  uploadDocuments,
  getDocumentStatus,
  downloadDocument,
  verifyDocuments
} = require('../controllers/users');

// Obtener perfil del usuario actual
router.get('/profile', validateJWT, getUserProfile);

// Actualizar perfil del usuario actual
router.put('/profile', [
  validateJWT,
  check('nom_usu1', 'El primer nombre es obligatorio').not().isEmpty(),
  check('nom_usu2', 'El segundo nombre debe ser válido').optional(),
  check('ape_usu1', 'El primer apellido es obligatorio').not().isEmpty(),
  check('ape_usu2', 'El segundo apellido debe ser válido').optional(),
  check('fec_nac_usu', 'La fecha de nacimiento debe ser válida').isDate(),
  check('num_tel_usu', 'El número de teléfono debe ser válido').optional().matches(/^[0-9+\-\s()]+$/),
  check('id_car_per', 'El ID de carrera debe ser válido').optional(),
  validateFields
], updateUserProfile);

// Obtener todos los usuarios (solo para administradores)
router.get('/',  getAllUsers);

// Subir documentos de verificación
router.post('/upload-documents', 
  validateJWT,
  upload.fields([
    { name: 'cedula_pdf', maxCount: 1 },
    { name: 'matricula_pdf', maxCount: 1 }
  ]),
  handleMulterError,
  uploadDocuments
);

// Obtener estado de documentos
router.get('/document-status', validateJWT, getDocumentStatus);

// Descargar documento (solo admins)
router.get('/download/:userId/:tipo', validateJWT, downloadDocument);

// Verificar documentos (solo admins)
router.put('/verify-documents/:userId', validateJWT, verifyDocuments);

module.exports = router;