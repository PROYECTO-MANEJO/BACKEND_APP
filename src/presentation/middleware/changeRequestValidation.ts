import { body, param, query } from "express-validator";

/**
 * Validaciones para crear una solicitud de cambio
 */
export const validateCreateChangeRequest = [
  body("titulo_sol")
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ min: 3, max: 200 })
    .withMessage("El título debe tener entre 3 y 200 caracteres"),

  body("descripcion_sol")
    .notEmpty()
    .withMessage("La descripción es requerida")
    .isLength({ min: 10, max: 2000 })
    .withMessage("La descripción debe tener entre 10 y 2000 caracteres"),

  body("justificacion_sol")
    .notEmpty()
    .withMessage("La justificación es requerida")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La justificación debe tener entre 10 y 1000 caracteres"),

  body("tipo_cambio_sol")
    .notEmpty()
    .withMessage("El tipo de cambio es requerido")
    .isIn([
      "FUNCIONALIDAD",
      "CORRECCION",
      "MEJORA",
      "CONFIGURACION",
      "SEGURIDAD",
      "RENDIMIENTO",
      "DOCUMENTACION",
    ])
    .withMessage("Tipo de cambio inválido"),

  body("prioridad_sol")
    .optional()
    .isIn(["BAJA", "MEDIA", "ALTA", "CRITICA"])
    .withMessage("Prioridad inválida"),

  body("urgencia_sol")
    .optional()
    .isIn(["NORMAL", "URGENTE", "INMEDIATA"])
    .withMessage("Urgencia inválida"),
];

/**
 * Validaciones para actualizar el estado de una solicitud
 */
export const validateUpdateStatus = [
  param("id")
    .notEmpty()
    .withMessage("ID de solicitud requerido")
    .isUUID()
    .withMessage("ID de solicitud inválido"),

  body("nuevo_estado")
    .notEmpty()
    .withMessage("El nuevo estado es requerido")
    .isIn([
      "BORRADOR",
      "PENDIENTE",
      "EN_REVISION",
      "APROBADA",
      "RECHAZADA",
      "ESPERANDO_INFORMACION",
      "EN_DESARROLLO",
      "EN_TESTING",
      "EN_PAUSA",
      "COMPLETADA",
      "CERRADA",
      "CANCELADA",
    ])
    .withMessage("Estado inválido"),

  body("comentarios")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Los comentarios no pueden exceder 1000 caracteres"),
];

/**
 * Validaciones para asignar desarrollador
 */
export const validateAssignDeveloper = [
  param("id")
    .notEmpty()
    .withMessage("ID de solicitud requerido")
    .isUUID()
    .withMessage("ID de solicitud inválido"),

  body("id_desarrollador")
    .notEmpty()
    .withMessage("ID de desarrollador requerido")
    .isString()
    .withMessage("ID de desarrollador inválido"),
];

/**
 * Validaciones para obtener solicitud por ID
 */
export const validateGetById = [
  param("id")
    .notEmpty()
    .withMessage("ID de solicitud requerido")
    .isUUID()
    .withMessage("ID de solicitud inválido"),
];

/**
 * Validaciones para paginación
 */
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero mayor a 0")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("El límite debe ser un número entre 1 y 50")
    .toInt(),
];

/**
 * Validaciones para filtros de búsqueda
 */
export const validateSearchFilters = [
  query("estado")
    .optional()
    .isIn([
      "BORRADOR",
      "PENDIENTE",
      "EN_REVISION",
      "APROBADA",
      "RECHAZADA",
      "ESPERANDO_INFORMACION",
      "EN_DESARROLLO",
      "EN_TESTING",
      "EN_PAUSA",
      "COMPLETADA",
      "CERRADA",
      "CANCELADA",
    ])
    .withMessage("Estado de filtro inválido"),

  query("tipo")
    .optional()
    .isIn([
      "FUNCIONALIDAD",
      "CORRECCION",
      "MEJORA",
      "CONFIGURACION",
      "SEGURIDAD",
      "RENDIMIENTO",
      "DOCUMENTACION",
    ])
    .withMessage("Tipo de cambio de filtro inválido"),

  query("prioridad")
    .optional()
    .isIn(["BAJA", "MEDIA", "ALTA", "CRITICA"])
    .withMessage("Prioridad de filtro inválida"),

  query("urgencia")
    .optional()
    .isIn(["NORMAL", "URGENTE", "INMEDIATA"])
    .withMessage("Urgencia de filtro inválida"),
];

/**
 * Validaciones para desarrolladores
 */
export const validateDeveloperId = [
  param("id")
    .notEmpty()
    .withMessage("ID de desarrollador requerido")
    .isString()
    .withMessage("ID de desarrollador inválido"),
];

/**
 * Validaciones para credenciales de GitHub
 */
export const validateGithubCredentials = [
  body("githubToken")
    .notEmpty()
    .withMessage("Token de GitHub requerido")
    .isLength({ min: 10 })
    .withMessage("Token de GitHub inválido"),

  body("githubUsername")
    .notEmpty()
    .withMessage("Username de GitHub requerido")
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage("Username de GitHub inválido"),
];

/**
 * Validaciones para tipo de solicitud en recomendaciones
 */
export const validateRequestType = [
  param("requestType")
    .notEmpty()
    .withMessage("Tipo de solicitud requerido")
    .isIn([
      "FUNCIONALIDAD",
      "CORRECCION",
      "MEJORA",
      "CONFIGURACION",
      "SEGURIDAD",
      "RENDIMIENTO",
      "DOCUMENTACION",
    ])
    .withMessage("Tipo de solicitud inválido"),

  query("skills")
    .optional()
    .isString()
    .withMessage("Las habilidades deben ser una cadena separada por comas"),
];
