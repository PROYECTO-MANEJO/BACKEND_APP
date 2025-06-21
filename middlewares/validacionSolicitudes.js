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
    .isIn([
      'NUEVA_FUNCIONALIDAD', 
      'MEJORA_EXISTENTE', 
      'CORRECCION_ERROR', 
      'CAMBIO_INTERFAZ', 
      'OPTIMIZACION', 
      'ACTUALIZACION_DATOS',
      'CAMBIO_SEGURIDAD',
      'MIGRACION_DATOS',
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
    .withMessage('Urgencia inválida'),

  // Campos opcionales del usuario
  body('impacto_negocio_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El impacto de negocio no puede exceder 2000 caracteres')
    .trim(),

  body('usuarios_afectados_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los usuarios afectados no pueden exceder 2000 caracteres')
    .trim(),

  body('recursos_necesarios_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los recursos necesarios no pueden exceder 2000 caracteres')
    .trim(),

  body('beneficios_esperados_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los beneficios esperados no pueden exceder 2000 caracteres')
    .trim(),

  body('fecha_limite_deseada')
    .optional()
    .isISO8601()
    .withMessage('Fecha límite deseada inválida')
];

// Validaciones para responder a una solicitud (administrador)
const validarRespuestaSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  body('estado_sol')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn([
      'APROBADA', 
      'RECHAZADA', 
      'EN_REVISION',
      'PENDIENTE_APROBACION_TECNICA',
      'PENDIENTE_APROBACION_NEGOCIO',
      'CANCELADA',
      'ESPERANDO_INFORMACION'
    ])
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
    .isIn([
      'PENDIENTE', 
      'EN_REVISION', 
      'PENDIENTE_APROBACION_TECNICA',
      'PENDIENTE_APROBACION_NEGOCIO',
      'APROBADA', 
      'RECHAZADA', 
      'CANCELADA',
      'EN_DESARROLLO', 
      'EN_TESTING',
      'EN_DESPLIEGUE',
      'COMPLETADA',
      'FALLIDA',
      'CERRADA',
      'EN_PAUSA',
      'ESPERANDO_INFORMACION'
    ])
    .withMessage('Estado inválido'),

  body('prioridad_sol')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'URGENTE'])
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
    .isIn([
      'PENDIENTE', 
      'EN_REVISION', 
      'PENDIENTE_APROBACION_TECNICA',
      'PENDIENTE_APROBACION_NEGOCIO',
      'APROBADA', 
      'RECHAZADA', 
      'CANCELADA',
      'EN_DESARROLLO', 
      'EN_TESTING',
      'EN_DESPLIEGUE',
      'COMPLETADA',
      'FALLIDA',
      'CERRADA',
      'EN_PAUSA',
      'ESPERANDO_INFORMACION'
    ])
    .withMessage('Estado inválido')
];

// Validación para obtener solicitud por ID
const validarIdSolicitud = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido')
];

// Validaciones para gestión técnica de solicitudes (administrador)
const validarGestionTecnica = [
  param('id')
    .isUUID()
    .withMessage('ID de solicitud inválido'),

  // Análisis de riesgo y categorización
  body('riesgo_cambio_sol')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Riesgo de cambio inválido'),

  body('categoria_cambio_sol')
    .optional()
    .isIn(['NORMAL', 'EXPEDITO', 'EMERGENCIA', 'ESTANDAR'])
    .withMessage('Categoría de cambio inválida'),

  body('comentarios_tecnicos_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los comentarios técnicos no pueden exceder 2000 caracteres')
    .trim(),

  // Análisis de impacto
  body('impacto_negocio_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El impacto de negocio no puede exceder 2000 caracteres')
    .trim(),

  body('impacto_tecnico_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El impacto técnico no puede exceder 2000 caracteres')
    .trim(),

  body('tiempo_inactividad_estimado_sol')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El tiempo de inactividad no puede exceder 100 caracteres')
    .trim(),

  // Planes de implementación
  body('plan_implementacion_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El plan de implementación no puede exceder 2000 caracteres')
    .trim(),

  body('plan_rollout_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El plan de rollout no puede exceder 2000 caracteres')
    .trim(),

  body('plan_backout_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El plan de backout no puede exceder 2000 caracteres')
    .trim(),

  body('plan_rollback_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El plan de rollback no puede exceder 2000 caracteres')
    .trim(),

  body('plan_testing_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El plan de testing no puede exceder 2000 caracteres')
    .trim(),

  body('observaciones_implementacion_sol')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Las observaciones no pueden exceder 2000 caracteres')
    .trim(),

  // Planificación temporal
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
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de inicio planificada inválida (formato HH:MM)'),

  body('hora_planificada_fin_sol')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de fin planificada inválida (formato HH:MM)'),

  body('fecha_real_inicio_sol')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio real inválida'),

  body('fecha_real_fin_sol')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin real inválida'),

  body('hora_real_inicio_sol')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de inicio real inválida (formato HH:MM)'),

  body('hora_real_fin_sol')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de fin real inválida (formato HH:MM)'),

  body('tiempo_estimado_horas_sol')
    .optional()
    .isInt({ min: 0, max: 8760 })
    .withMessage('Tiempo estimado debe ser un número entre 0 y 8760 horas'),

  body('tiempo_real_horas_sol')
    .optional()
    .isInt({ min: 0, max: 8760 })
    .withMessage('Tiempo real debe ser un número entre 0 y 8760 horas'),

  // Asignaciones
  body('id_implementador')
    .optional()
    .isUUID()
    .withMessage('ID de implementador inválido'),

  // Resultados y métricas
  body('exito_implementacion')
    .optional()
    .isBoolean()
    .withMessage('Éxito de implementación debe ser verdadero o falso'),

  body('problemas_encontrados')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los problemas encontrados no pueden exceder 2000 caracteres')
    .trim(),

  body('satisfaccion_usuario')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfacción del usuario debe ser un número entre 1 y 5')
];

module.exports = {
  validarCreacionSolicitud,
  validarRespuestaSolicitud,
  validarEdicionSolicitud,
  validarActualizacionEstado,
  validarIdSolicitud,
  validarGestionTecnica
}; 