"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdParam = exports.validatePagination = exports.validateEventCreation = exports.validateCourseCreation = exports.validateChangePassword = exports.validateLogin = exports.validateUserUpdate = exports.validateUserCreation = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: 'Errores de validación',
            details: errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }))
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
/**
 * Validaciones para usuarios
 */
exports.validateUserCreation = [
    (0, express_validator_1.body)('cedula')
        .isLength({ min: 10, max: 10 })
        .withMessage('La cédula debe tener exactamente 10 dígitos')
        .matches(/^\d+$/)
        .withMessage('La cédula solo debe contener números'),
    (0, express_validator_1.body)('nombres')
        .isLength({ min: 2, max: 50 })
        .withMessage('Los nombres deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los nombres solo pueden contener letras y espacios'),
    (0, express_validator_1.body)('apellidos')
        .isLength({ min: 2, max: 50 })
        .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
    (0, express_validator_1.body)('telefono')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener exactamente 10 dígitos'),
    (0, express_validator_1.body)('rol')
        .optional()
        .isIn(['estudiante', 'organizador', 'administrador'])
        .withMessage('El rol debe ser: estudiante, organizador o administrador')
];
exports.validateUserUpdate = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
    (0, express_validator_1.body)('nombres')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Los nombres deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los nombres solo pueden contener letras y espacios'),
    (0, express_validator_1.body)('apellidos')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('telefono')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener exactamente 10 dígitos'),
    (0, express_validator_1.body)('rol')
        .optional()
        .isIn(['estudiante', 'organizador', 'administrador'])
        .withMessage('El rol debe ser: estudiante, organizador o administrador')
];
/**
 * Validaciones para autenticación
 */
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 1 })
        .withMessage('La contraseña es requerida')
];
exports.validateChangePassword = [
    (0, express_validator_1.body)('currentPassword')
        .isLength({ min: 1 })
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];
/**
 * Validaciones para cursos
 */
exports.validateCourseCreation = [
    (0, express_validator_1.body)('nombre')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre del curso debe tener entre 3 y 100 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    (0, express_validator_1.body)('fechaInicio')
        .isISO8601()
        .withMessage('Fecha de inicio inválida')
        .custom((value) => {
        const startDate = new Date(value);
        const today = new Date();
        if (startDate < today) {
            throw new Error('La fecha de inicio no puede ser anterior a hoy');
        }
        return true;
    }),
    (0, express_validator_1.body)('fechaFin')
        .isISO8601()
        .withMessage('Fecha de fin inválida')
        .custom((value, { req }) => {
        const endDate = new Date(value);
        const startDate = new Date(req.body.fechaInicio);
        if (endDate <= startDate) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        return true;
    }),
    (0, express_validator_1.body)('precio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    (0, express_validator_1.body)('capacidadMaxima')
        .isInt({ min: 1, max: 1000 })
        .withMessage('La capacidad máxima debe ser entre 1 y 1000'),
    (0, express_validator_1.body)('modalidad')
        .isIn(['presencial', 'virtual', 'hibrida'])
        .withMessage('La modalidad debe ser: presencial, virtual o hibrida'),
    (0, express_validator_1.body)('carreraIds')
        .optional()
        .isArray()
        .withMessage('carreraIds debe ser un array')
        .custom((value) => {
        if (value && !value.every((id) => Number.isInteger(id) && id > 0)) {
            throw new Error('Todos los IDs de carrera deben ser números enteros positivos');
        }
        return true;
    })
];
/**
 * Validaciones para eventos
 */
exports.validateEventCreation = [
    (0, express_validator_1.body)('nombre')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre del evento debe tener entre 3 y 100 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    (0, express_validator_1.body)('fechaInicio')
        .isISO8601()
        .withMessage('Fecha de inicio inválida'),
    (0, express_validator_1.body)('fechaFin')
        .isISO8601()
        .withMessage('Fecha de fin inválida')
        .custom((value, { req }) => {
        const endDate = new Date(value);
        const startDate = new Date(req.body.fechaInicio);
        if (endDate <= startDate) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        return true;
    }),
    (0, express_validator_1.body)('area')
        .isLength({ min: 2, max: 50 })
        .withMessage('El área debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('audiencia')
        .isLength({ min: 2, max: 50 })
        .withMessage('La audiencia debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('capacidadMaxima')
        .isInt({ min: 1, max: 10000 })
        .withMessage('La capacidad máxima debe ser entre 1 y 10,000'),
    (0, express_validator_1.body)('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    (0, express_validator_1.body)('modalidad')
        .optional()
        .isIn(['presencial', 'virtual', 'hibrida'])
        .withMessage('La modalidad debe ser: presencial, virtual o hibrida')
];
/**
 * Validaciones para paginación
 */
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    (0, express_validator_1.query)('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El tamaño de página debe ser entre 1 y 100')
];
/**
 * Validaciones para IDs en parámetros
 */
exports.validateIdParam = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID inválido')
];
//# sourceMappingURL=validationMiddleware.js.map