const { body, param } = require('express-validator');

// Validaciones para crear una nueva solicitud
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
    .isIn(['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_INTERFAZ', 'OPTIMIZACION', 'OTRO'])
    .withMessage('Tipo de cambio inválido'),

  body('prioridad_sol')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
    .withMessage('Prioridad inválida')
];

// Validaciones para responder a una solicitud (administrador)
const validarRespuestaSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('estado_sol')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(['APROBADA', 'RECHAZADA', 'EN_REVISION'])
    .withMessage('Estado inválido'),

  body('comentarios_admin_sol')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios no pueden exceder 1000 caracteres')
    .trim(),

  body('comentarios_internos_sol')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios internos no pueden exceder 1000 caracteres')
    .trim() 
];

// Validaciones para editar una solicitud (administrador)
const validarEdicionSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('estado_sol')
    .optional()
    .isIn(['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_DESARROLLO', 'COMPLETADA'])
    .withMessage('Estado inválido'),

  body('prioridad_sol')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
    .withMessage('Prioridad inválida'),

  body('comentarios_admin_sol')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios no pueden exceder 1000 caracteres')
    .trim(),

  body('comentarios_internos_sol')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios internos no pueden exceder 1000 caracteres')
    .trim()
];

// Validaciones para actualizar estado de solicitud
const validarActualizacionEstado = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('estado_sol')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_DESARROLLO', 'COMPLETADA'])
    .withMessage('Estado inválido')
];

// Validación para obtener solicitud por ID
const validarIdSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido')
];

module.exports = {
  validarCreacionSolicitud,
  validarRespuestaSolicitud,
  validarEdicionSolicitud,
  validarActualizacionEstado,
  validarIdSolicitud
}; 