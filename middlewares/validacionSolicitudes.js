const { body, param } = require('express-validator');

// Validaciones para crear una nueva solicitud (solo campos del usuario)
const validarCreacionSolicitud = [
  body('titulo_sol')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres')
    .trim(),

  body('descripcion_sol')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres')
    .trim(),

  body('justificacion_sol')
    .notEmpty()
    .withMessage('La justificación es obligatoria')
    .isLength({ min: 10 })
    .withMessage('La justificación debe tener al menos 10 caracteres')
    .trim(),

  body('tipo_cambio_sol')
    .notEmpty()
    .withMessage('El tipo de cambio es obligatorio')
    .isIn([
      'NUEVA_FUNCIONALIDAD', 
      'MEJORA_EXISTENTE', 
      'CORRECCION_ERROR', 
      'CAMBIO_INTERFAZ', 
      'OPTIMIZACION', 
      'ACTUALIZACION_DATOS',
      'CAMBIO_SEGURIDAD',
      'INTEGRACION_EXTERNA',
      'OTRO'
    ])
    .withMessage('Tipo de cambio inválido'),

  body('prioridad_sol')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'URGENTE'])
    .withMessage('Prioridad inválida'),

  body('urgencia_sol')
    .optional()
    .isIn(['BAJA', 'NORMAL', 'ALTA', 'URGENTE', 'CRITICA'])
    .withMessage('Urgencia inválida')
];

// Validaciones para editar una solicitud (usuario - solo campos básicos)
const validarEdicionSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('titulo_sol')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres')
    .trim(),

  body('descripcion_sol')
    .optional()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres')
    .trim(),

  body('justificacion_sol')
    .optional()
    .isLength({ min: 10 })
    .withMessage('La justificación debe tener al menos 10 caracteres')
    .trim(),

  body('tipo_cambio_sol')
    .optional()
    .isIn([
      'NUEVA_FUNCIONALIDAD', 
      'MEJORA_EXISTENTE', 
      'CORRECCION_ERROR', 
      'CAMBIO_INTERFAZ', 
      'OPTIMIZACION', 
      'ACTUALIZACION_DATOS',
      'CAMBIO_SEGURIDAD',
      'INTEGRACION_EXTERNA',
      'OTRO'
    ])
    .withMessage('Tipo de cambio inválido'),

  body('prioridad_sol')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'URGENTE'])
    .withMessage('Prioridad inválida'),

  body('urgencia_sol')
    .optional()
    .isIn(['BAJA', 'NORMAL', 'ALTA', 'URGENTE', 'CRITICA'])
    .withMessage('Urgencia inválida')
];

// Validación para obtener solicitud por ID
const validarIdSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido')
];

// Validación para comentarios
const validarComentario = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('contenido')
    .notEmpty()
    .withMessage('El contenido del comentario es obligatorio')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El comentario debe tener entre 1 y 1000 caracteres')
    .trim()
];

module.exports = {
  validarCreacionSolicitud,
  validarEdicionSolicitud,
  validarIdSolicitud,
  validarComentario
}; 