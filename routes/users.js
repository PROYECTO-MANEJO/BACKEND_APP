const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateJWT, validateAdmin, validateRoles } = require('../middlewares/validateJWT');
const { validateFields } = require('../middlewares/validateFields');
const { upload, handleMulterError } = require('../middlewares/uploadMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getAdminUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadDocuments,
  getDocumentStatus,
  deleteDocuments,
  downloadDocument,
  getUsersWithPendingDocuments,
  downloadUserDocument,
  approveUserDocuments,
  rejectUserDocuments
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
router.get('/', [validateJWT, validateAdmin], getAllUsers);

// Obtener solo usuarios administradores (solo MASTER)
router.get('/admins', [validateJWT, validateRoles('MASTER')], getAdminUsers);

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

// ✅ NUEVA RUTA PARA ELIMINAR DOCUMENTOS
router.delete('/delete-documents/:tipo', validateJWT, deleteDocuments);

// ✅ RUTA PARA QUE EL USUARIO DESCARGUE SUS PROPIOS DOCUMENTOS
router.get('/my-document/:tipo', validateJWT, downloadDocument);

// ✅ NUEVAS RUTAS PARA VERIFICACIÓN DE DOCUMENTOS (solo MASTER)
// Obtener usuarios con documentos pendientes
router.get('/pending-documents', [validateJWT, validateRoles('MASTER')], getUsersWithPendingDocuments);

// Descargar documento específico de un usuario
router.get('/download-document/:userId/:documentType', [validateJWT, validateRoles('MASTER')], downloadUserDocument);

// Aprobar documentos de un usuario
router.put('/approve-documents/:userId', [validateJWT, validateRoles('MASTER')], approveUserDocuments);

// Rechazar documentos de un usuario
router.put('/reject-documents/:userId', [validateJWT, validateRoles('MASTER')], rejectUserDocuments);

// RUTAS PARA ADMINISTRACIÓN DE USUARIOS (solo administradores)
// Crear nuevo usuario
router.post('/', [
  validateJWT,
  validateAdmin,
  check('ced_usu', 'La cédula es obligatoria').not().isEmpty(),
  check('nom_usu1', 'El primer nombre es obligatorio').not().isEmpty(),
  check('ape_usu1', 'El primer apellido es obligatorio').not().isEmpty(),
  check('ema_usu', 'El email debe ser válido').isEmail(),
  check('rol_cue', 'El rol es obligatorio').not().isEmpty(),
  check('pas_usu', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
], createUser);

// Actualizar usuario por cédula (solo MASTER)
router.put('/:cedula', [
  validateJWT,
  validateRoles('MASTER'),
  check('nom_usu1', 'El primer nombre es obligatorio').optional().not().isEmpty(),
  check('ape_usu1', 'El primer apellido es obligatorio').optional().not().isEmpty(),
  check('cor_cue', 'El email debe ser válido').optional().isEmail(),
  check('pas_usu', 'La contraseña debe tener al menos 6 caracteres').optional().isLength({ min: 6 }),
  validateFields
], updateUser);

// Eliminar usuario por cédula (solo MASTER)
router.delete('/:cedula', [validateJWT, validateRoles('MASTER')], deleteUser);

module.exports = router;