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

// Validaciones para actualización de campos de master/admin
const validarActualizacionMaster = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('impacto_negocio_sol')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Impacto de negocio inválido'),

  body('impacto_tecnico_sol')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Impacto técnico inválido'),

  body('riesgo_cambio_sol')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Riesgo de cambio inválido'),

  body('categoria_cambio_sol')
    .optional()
    .isIn(['NORMAL', 'EXPEDITO', 'EMERGENCIA', 'ESTANDAR'])
    .withMessage('Categoría de cambio inválida'),

  body('comentarios_admin_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los comentarios no pueden exceder 2000 caracteres')
    .trim(),

  body('fecha_planificada_inicio_sol')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio planificada inválida'),

  body('fecha_planificada_fin_sol')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin planificada inválida'),

  body('hora_planificada_inicio_sol')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de inicio inválida. Formato: HH:MM'),

  body('hora_planificada_fin_sol')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de fin inválida. Formato: HH:MM'),

  body('tiempo_estimado_horas_sol')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tiempo estimado debe ser un número entero positivo'),

  body('id_desarrollador_asignado')
    .optional()
    .isUUID()
    .withMessage('ID de desarrollador inválido')
];

// Validaciones para aprobar solicitud
const validarAprobacion = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('comentarios_admin_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los comentarios no pueden exceder 2000 caracteres')
    .trim()
];

// Validaciones para rechazar solicitud
const validarRechazo = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('comentarios_admin_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los comentarios no pueden exceder 2000 caracteres')
    .trim(),

  body('motivo_rechazo')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El motivo de rechazo debe tener entre 10 y 1000 caracteres')
    .trim()
];

module.exports = {
  validarCreacionSolicitud,
  validarEdicionSolicitud,
  validarIdSolicitud,
  validarComentario,
  validarActualizacionMaster,
  validarAprobacion,
  validarRechazo
}; 