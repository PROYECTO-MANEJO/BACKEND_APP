"use strict";
/**
 * Constantes de la aplicación organizadas por contexto
 * SRP: Cada sección tiene una responsabilidad específica
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_HEADERS = exports.ENROLLMENT_STATUS = exports.EVENT_TYPES = exports.ENTITY_STATUS = exports.USER_ROLES = exports.PAGINATION = exports.JWT_CONFIG = exports.VALIDATION_RULES = exports.RESPONSE_MESSAGES = exports.HTTP_STATUS = void 0;
/**
 * Constantes HTTP
 */
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};
/**
 * Mensajes de respuesta estándar
 */
exports.RESPONSE_MESSAGES = {
    // Success messages
    SUCCESS: "Operation completed successfully",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    // Error messages
    BAD_REQUEST: "Invalid request data",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Insufficient permissions",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    // Auth specific
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID: "Invalid token provided",
    ACCOUNT_NOT_VERIFIED: "Account not verified",
    // User specific
    USER_NOT_FOUND: "User not found",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    USER_CREATED: "User created successfully",
    // Password recovery
    RECOVERY_EMAIL_SENT: "Password recovery email sent",
    PASSWORD_RESET: "Password reset successfully",
    INVALID_RECOVERY_TOKEN: "Invalid recovery token",
};
/**
 * Configuraciones de validación
 */
exports.VALIDATION_RULES = {
    EMAIL: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 100,
        REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 100,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL_CHAR: false,
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
    },
    CEDULA: {
        LENGTH: 10,
        REGEX: /^\d{10}$/,
    },
};
/**
 * Configuraciones de JWT
 */
exports.JWT_CONFIG = {
    DEFAULT_EXPIRATION: "24h",
    REFRESH_EXPIRATION: "7d",
    RECOVERY_EXPIRATION: "1h",
    VERIFICATION_EXPIRATION: "24h",
    ISSUER: "uta-academic-system",
    ALGORITHM: "HS256",
};
/**
 * Configuraciones de paginación
 */
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
/**
 * Roles del sistema
 */
exports.USER_ROLES = {
    ADMIN: "ADMIN",
    DEVELOPER: "DEVELOPER",
    ORGANIZER: "ORGANIZER",
    STUDENT: "STUDENT",
    TEACHER: "TEACHER",
};
/**
 * Estados de entidades
 */
exports.ENTITY_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    PENDING: "PENDING",
    DELETED: "DELETED",
};
/**
 * Tipos de eventos
 */
exports.EVENT_TYPES = {
    CONFERENCE: "CONFERENCE",
    WORKSHOP: "WORKSHOP",
    SEMINAR: "SEMINAR",
    COURSE: "COURSE",
    COMPETITION: "COMPETITION",
};
/**
 * Estados de inscripción
 */
exports.ENROLLMENT_STATUS = {
    REGISTERED: "REGISTERED",
    CONFIRMED: "CONFIRMED",
    ATTENDED: "ATTENDED",
    CANCELLED: "CANCELLED",
    NO_SHOW: "NO_SHOW",
};
/**
 * Headers HTTP personalizados
 */
exports.CUSTOM_HEADERS = {
    AUTH_TOKEN: "x-token",
    API_VERSION: "x-api-version",
    REQUEST_ID: "x-request-id",
};
//# sourceMappingURL=AppConstants.js.map