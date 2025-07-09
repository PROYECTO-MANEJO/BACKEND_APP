const { validationResult } = require('express-validator');

// Middleware para validar errores de express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validar que el usuario sea MASTER para reportes de solicitudes
const validateMasterRole = (req, res, next) => {
  // Esta validación se hace en el middleware validateRoles, pero agregamos una capa extra
  const userRole = req.usuario?.cuentas?.[0]?.rol_cue;
  
  if (userRole !== 'MASTER') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Los reportes de solicitudes son exclusivos para usuarios MASTER.'
    });
  }
  
  next();
};

// Validar filtros opcionales para reportes
const validateReportFilters = (req, res, next) => {
  const { 
    fecha_inicio, 
    fecha_fin, 
    estado, 
    prioridad, 
    tipo_cambio, 
    desarrollador_id 
  } = req.query;

  // Validar fechas si se proporcionan
  if (fecha_inicio && !Date.parse(fecha_inicio)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'
    });
  }

  if (fecha_fin && !Date.parse(fecha_fin)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de fecha_fin inválido. Use YYYY-MM-DD'
    });
  }

  // Validar que fecha_inicio no sea mayor que fecha_fin
  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin'
    });
  }

  // Validar valores de enum si se proporcionan
  const estadosValidos = [
    'BORRADOR', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 
    'CANCELADA', 'EN_DESARROLLO', 'EN_TESTING', 'COMPLETADA', 'FALLIDA'
  ];
  
  const prioridadesValidas = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'URGENTE'];
  
  const tiposValidos = [
    'NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 
    'CAMBIO_INTERFAZ', 'OPTIMIZACION', 'ACTUALIZACION_DATOS', 
    'CAMBIO_SEGURIDAD', 'MIGRACION_DATOS', 'INTEGRACION_EXTERNA', 'OTRO'
  ];

  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      success: false,
      message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`
    });
  }

  if (prioridad && !prioridadesValidas.includes(prioridad)) {
    return res.status(400).json({
      success: false,
      message: `Prioridad inválida. Valores permitidos: ${prioridadesValidas.join(', ')}`
    });
  }

  if (tipo_cambio && !tiposValidos.includes(tipo_cambio)) {
    return res.status(400).json({
      success: false,
      message: `Tipo de cambio inválido. Valores permitidos: ${tiposValidos.join(', ')}`
    });
  }

  // Validar que desarrollador_id sea un UUID válido si se proporciona
  if (desarrollador_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(desarrollador_id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID del desarrollador debe ser un UUID válido'
    });
  }

  next();
};

// Middleware para logging de reportes (auditoría)
const logReportAccess = (req, res, next) => {
  const user = req.usuario; // Cambiar de req.user a req.usuario
  const reportType = req.route.path;
  const timestamp = new Date().toISOString();
  
  if (user) {
    console.log(`[REPORTE AUDIT] ${timestamp} - Usuario: ${user.nom_usu1 || 'N/A'} ${user.ape_usu1 || 'N/A'} (${user.id_usu || 'N/A'}) accedió a reporte: ${reportType}`);
  } else {
    console.log(`[REPORTE AUDIT] ${timestamp} - Usuario no identificado accedió a reporte: ${reportType}`);
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateMasterRole,
  validateReportFilters,
  logReportAccess
}; 