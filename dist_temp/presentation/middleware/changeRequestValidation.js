"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestType = exports.validateGithubCredentials = exports.validateDeveloperId = exports.validateSearchFilters = exports.validatePagination = exports.validateGetById = exports.validateAssignDeveloper = exports.validateUpdateStatus = exports.validateCreateChangeRequest = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validaciones para crear una solicitud de cambio
 */
exports.validateCreateChangeRequest = [
    (0, express_validator_1.body)("titulo_sol")
        .notEmpty()
        .withMessage("El título es requerido")
        .isLength({ min: 3, max: 200 })
        .withMessage("El título debe tener entre 3 y 200 caracteres"),
    (0, express_validator_1.body)("descripcion_sol")
        .notEmpty()
        .withMessage("La descripción es requerida")
        .isLength({ min: 10, max: 2000 })
        .withMessage("La descripción debe tener entre 10 y 2000 caracteres"),
    (0, express_validator_1.body)("justificacion_sol")
        .notEmpty()
        .withMessage("La justificación es requerida")
        .isLength({ min: 10, max: 1000 })
        .withMessage("La justificación debe tener entre 10 y 1000 caracteres"),
    (0, express_validator_1.body)("tipo_cambio_sol")
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
    (0, express_validator_1.body)("prioridad_sol")
        .optional()
        .isIn(["BAJA", "MEDIA", "ALTA", "CRITICA"])
        .withMessage("Prioridad inválida"),
    (0, express_validator_1.body)("urgencia_sol")
        .optional()
        .isIn(["NORMAL", "URGENTE", "INMEDIATA"])
        .withMessage("Urgencia inválida"),
];
/**
 * Validaciones para actualizar el estado de una solicitud
 */
exports.validateUpdateStatus = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("ID de solicitud requerido")
        .isUUID()
        .withMessage("ID de solicitud inválido"),
    (0, express_validator_1.body)("nuevo_estado")
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
    (0, express_validator_1.body)("comentarios")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Los comentarios no pueden exceder 1000 caracteres"),
];
/**
 * Validaciones para asignar desarrollador
 */
exports.validateAssignDeveloper = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("ID de solicitud requerido")
        .isUUID()
        .withMessage("ID de solicitud inválido"),
    (0, express_validator_1.body)("id_desarrollador")
        .notEmpty()
        .withMessage("ID de desarrollador requerido")
        .isString()
        .withMessage("ID de desarrollador inválido"),
];
/**
 * Validaciones para obtener solicitud por ID
 */
exports.validateGetById = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("ID de solicitud requerido")
        .isUUID()
        .withMessage("ID de solicitud inválido"),
];
/**
 * Validaciones para paginación
 */
exports.validatePagination = [
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La página debe ser un número entero mayor a 0")
        .toInt(),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("El límite debe ser un número entre 1 y 50")
        .toInt(),
];
/**
 * Validaciones para filtros de búsqueda
 */
exports.validateSearchFilters = [
    (0, express_validator_1.query)("estado")
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
    (0, express_validator_1.query)("tipo")
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
    (0, express_validator_1.query)("prioridad")
        .optional()
        .isIn(["BAJA", "MEDIA", "ALTA", "CRITICA"])
        .withMessage("Prioridad de filtro inválida"),
    (0, express_validator_1.query)("urgencia")
        .optional()
        .isIn(["NORMAL", "URGENTE", "INMEDIATA"])
        .withMessage("Urgencia de filtro inválida"),
];
/**
 * Validaciones para desarrolladores
 */
exports.validateDeveloperId = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("ID de desarrollador requerido")
        .isString()
        .withMessage("ID de desarrollador inválido"),
];
/**
 * Validaciones para credenciales de GitHub
 */
exports.validateGithubCredentials = [
    (0, express_validator_1.body)("githubToken")
        .notEmpty()
        .withMessage("Token de GitHub requerido")
        .isLength({ min: 10 })
        .withMessage("Token de GitHub inválido"),
    (0, express_validator_1.body)("githubUsername")
        .notEmpty()
        .withMessage("Username de GitHub requerido")
        .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
        .withMessage("Username de GitHub inválido"),
];
/**
 * Validaciones para tipo de solicitud en recomendaciones
 */
exports.validateRequestType = [
    (0, express_validator_1.param)("requestType")
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
    (0, express_validator_1.query)("skills")
        .optional()
        .isString()
        .withMessage("Las habilidades deben ser una cadena separada por comas"),
];
