const { body, param, query } = require('express-validator');

// ========================================
// VALIDACIONES PARA CREAR SOLICITUD
// ========================================

const validarCrearSolicitud = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres')
    .trim(),

  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres')
    .trim(),

  body('justificacion_negocio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La justificación de negocio no puede exceder 2000 caracteres')
    .trim(),

  body('tipo_cambio')
    .notEmpty()
    .withMessage('El tipo de cambio es obligatorio')
    .isIn(['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_UI_UX', 'OPTIMIZACION_PERFORMANCE', 'ACTUALIZACION_SEGURIDAD', 'INTEGRACION_EXTERNA', 'CAMBIO_CONFIGURACION', 'OTRO'])
    .withMessage('Tipo de cambio no válido'),

  body('modulo_afectado')
    .notEmpty()
    .withMessage('El módulo afectado es obligatorio')
    .isIn(['AUTENTICACION', 'USUARIOS', 'CURSOS', 'EVENTOS', 'INSCRIPCIONES', 'CERTIFICADOS', 'REPORTES', 'ADMINISTRACION', 'BASE_DATOS', 'INFRAESTRUCTURA', 'OTRO'])
    .withMessage('Módulo afectado no válido'),

  body('prioridad_solicitante')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
    .withMessage('Prioridad no válida'),

  body('urgencia')
    .optional()
    .isIn(['PUEDE_ESPERAR', 'NORMAL', 'ALTA', 'URGENTE', 'CRITICA'])
    .withMessage('Urgencia no válida'),

  body('impacto_estimado')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Impacto estimado no válido'),

  body('fecha_limite_deseada')
    .optional()
    .isISO8601()
    .withMessage('Fecha límite debe ser una fecha válida')
    .custom((value) => {
      if (value) {
        const fecha = new Date(value);
        const ahora = new Date();
        if (fecha <= ahora) {
          throw new Error('La fecha límite debe ser posterior a la fecha actual');
        }
      }
      return true;
    })
];

// ========================================
// VALIDACIONES PARA EDITAR SOLICITUD
// ========================================

const validarEditarSolicitud = [
  param('id')
    .notEmpty()
    .withMessage('ID de solicitud requerido')
    .isUUID()
    .withMessage('ID de solicitud debe ser un UUID válido'),

  body('titulo')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres')
    .trim(),

  body('descripcion')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres')
    .trim(),

  body('justificacion_negocio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La justificación de negocio no puede exceder 2000 caracteres')
    .trim(),

  body('tipo_cambio')
    .optional()
    .isIn(['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_UI_UX', 'OPTIMIZACION_PERFORMANCE', 'ACTUALIZACION_SEGURIDAD', 'INTEGRACION_EXTERNA', 'CAMBIO_CONFIGURACION', 'OTRO'])
    .withMessage('Tipo de cambio no válido'),

  body('modulo_afectado')
    .optional()
    .isIn(['AUTENTICACION', 'USUARIOS', 'CURSOS', 'EVENTOS', 'INSCRIPCIONES', 'CERTIFICADOS', 'REPORTES', 'ADMINISTRACION', 'BASE_DATOS', 'INFRAESTRUCTURA', 'OTRO'])
    .withMessage('Módulo afectado no válido'),

  body('prioridad_solicitante')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
    .withMessage('Prioridad no válida'),

  body('urgencia')
    .optional()
    .isIn(['PUEDE_ESPERAR', 'NORMAL', 'ALTA', 'URGENTE', 'CRITICA'])
    .withMessage('Urgencia no válida'),

  body('impacto_estimado')
    .optional()
    .isIn(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
    .withMessage('Impacto estimado no válido'),

  body('fecha_limite_deseada')
    .optional()
    .custom((value) => {
      if (value === null || value === '') {
        return true; // Permitir null o string vacío para limpiar la fecha
      }
      
      if (value) {
        // Validar que sea una fecha válida
        const fecha = new Date(value);
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha límite debe ser una fecha válida');
        }
        
        const ahora = new Date();
        if (fecha <= ahora) {
          throw new Error('La fecha límite debe ser posterior a la fecha actual');
        }
      }
      return true;
    })
];

// ========================================
// VALIDACIONES DE PARÁMETROS
// ========================================

const validarIdSolicitud = [
  param('id')
    .notEmpty()
    .withMessage('ID de solicitud requerido')
    .isUUID()
    .withMessage('ID de solicitud debe ser un UUID válido')
];

// ========================================
// VALIDACIONES DE QUERY PARAMETERS
// ========================================

const validarQuerySolicitudes = [
  query('estado')
    .optional()
    .isIn(['BORRADOR', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'CANCELADA', 'EN_DESARROLLO', 'EN_TESTING', 'COMPLETADA'])
    .withMessage('Estado no válido'),

  query('tipo_cambio')
    .optional()
    .isIn(['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_UI_UX', 'OPTIMIZACION_PERFORMANCE', 'ACTUALIZACION_SEGURIDAD', 'INTEGRACION_EXTERNA', 'CAMBIO_CONFIGURACION', 'OTRO'])
    .withMessage('Tipo de cambio no válido'),

  query('modulo_afectado')
    .optional()
    .isIn(['AUTENTICACION', 'USUARIOS', 'CURSOS', 'EVENTOS', 'INSCRIPCIONES', 'CERTIFICADOS', 'REPORTES', 'ADMINISTRACION', 'BASE_DATOS', 'INFRAESTRUCTURA', 'OTRO'])
    .withMessage('Módulo afectado no válido'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe ser un número entero entre 1 y 50')
];

// ========================================
// VALIDACIONES PARA COMENTARIOS
// ========================================

const validarAgregarComentario = [
  param('id')
    .notEmpty()
    .withMessage('ID de solicitud requerido')
    .isUUID()
    .withMessage('ID de solicitud debe ser un UUID válido'),

  body('contenido')
    .notEmpty()
    .withMessage('El contenido del comentario es obligatorio')
    .isLength({ min: 1, max: 2000 })
    .withMessage('El comentario debe tener entre 1 y 2000 caracteres')
    .trim()
];

// ========================================
// VALIDACIONES PARA CANCELAR
// ========================================

const validarCancelarSolicitud = [
  param('id')
    .notEmpty()
    .withMessage('ID de solicitud requerido')
    .isUUID()
    .withMessage('ID de solicitud debe ser un UUID válido'),

  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres')
    .trim()
];

// ========================================
// VALIDACIONES ADICIONALES
// ========================================

// Middleware personalizado para verificar que al menos un campo sea enviado en edición
const validarAlMenosUnCampoEdicion = (req, res, next) => {
  const camposPermitidos = [
    'titulo', 'descripcion', 'justificacion_negocio', 
    'tipo_cambio', 'modulo_afectado', 'prioridad_solicitante', 
    'urgencia', 'impacto_estimado', 'fecha_limite_deseada'
  ];

  const camposEnviados = camposPermitidos.filter(campo => 
    req.body.hasOwnProperty(campo)
  );

  if (camposEnviados.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debe enviar al menos un campo para editar',
      camposPermitidos
    });
  }

  next();
};

// Sanitizar entrada para evitar XSS básico
const sanitizarEntrada = (req, res, next) => {
  const camposTexto = ['titulo', 'descripcion', 'justificacion_negocio', 'contenido', 'motivo'];
  
  camposTexto.forEach(campo => {
    if (req.body[campo] && typeof req.body[campo] === 'string') {
      // Eliminar etiquetas HTML básicas
      req.body[campo] = req.body[campo]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
  });

  next();
};

module.exports = {
  validarCrearSolicitud,
  validarEditarSolicitud,
  validarIdSolicitud,
  validarQuerySolicitudes,
  validarAgregarComentario,
  validarCancelarSolicitud,
  validarAlMenosUnCampoEdicion,
  sanitizarEntrada
}; 