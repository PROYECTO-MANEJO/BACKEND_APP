/**
 * Constantes de la aplicación organizadas por contexto
 * SRP: Cada sección tiene una responsabilidad específica
 */
/**
 * Constantes HTTP
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
/**
 * Mensajes de respuesta estándar
 */
export declare const RESPONSE_MESSAGES: {
    readonly SUCCESS: "Operation completed successfully";
    readonly CREATED: "Resource created successfully";
    readonly UPDATED: "Resource updated successfully";
    readonly DELETED: "Resource deleted successfully";
    readonly BAD_REQUEST: "Invalid request data";
    readonly UNAUTHORIZED: "Authentication required";
    readonly FORBIDDEN: "Insufficient permissions";
    readonly NOT_FOUND: "Resource not found";
    readonly CONFLICT: "Resource already exists";
    readonly VALIDATION_ERROR: "Validation failed";
    readonly INTERNAL_ERROR: "Internal server error";
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly TOKEN_EXPIRED: "Token has expired";
    readonly TOKEN_INVALID: "Invalid token provided";
    readonly ACCOUNT_NOT_VERIFIED: "Account not verified";
    readonly USER_NOT_FOUND: "User not found";
    readonly EMAIL_ALREADY_EXISTS: "Email already exists";
    readonly USER_CREATED: "User created successfully";
    readonly RECOVERY_EMAIL_SENT: "Password recovery email sent";
    readonly PASSWORD_RESET: "Password reset successfully";
    readonly INVALID_RECOVERY_TOKEN: "Invalid recovery token";
};
/**
 * Configuraciones de validación
 */
export declare const VALIDATION_RULES: {
    readonly EMAIL: {
        readonly MIN_LENGTH: 5;
        readonly MAX_LENGTH: 100;
        readonly REGEX: RegExp;
    };
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 100;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBER: true;
        readonly REQUIRE_SPECIAL_CHAR: false;
    };
    readonly NAME: {
        readonly MIN_LENGTH: 2;
        readonly MAX_LENGTH: 50;
    };
    readonly CEDULA: {
        readonly LENGTH: 10;
        readonly REGEX: RegExp;
    };
};
/**
 * Configuraciones de JWT
 */
export declare const JWT_CONFIG: {
    readonly DEFAULT_EXPIRATION: "24h";
    readonly REFRESH_EXPIRATION: "7d";
    readonly RECOVERY_EXPIRATION: "1h";
    readonly VERIFICATION_EXPIRATION: "24h";
    readonly ISSUER: "uta-academic-system";
    readonly ALGORITHM: "HS256";
};
/**
 * Configuraciones de paginación
 */
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
    readonly MIN_LIMIT: 1;
};
/**
 * Roles del sistema
 */
export declare const USER_ROLES: {
    readonly ADMIN: "ADMIN";
    readonly DEVELOPER: "DEVELOPER";
    readonly ORGANIZER: "ORGANIZER";
    readonly STUDENT: "STUDENT";
    readonly TEACHER: "TEACHER";
};
/**
 * Estados de entidades
 */
export declare const ENTITY_STATUS: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly PENDING: "PENDING";
    readonly DELETED: "DELETED";
};
/**
 * Tipos de eventos
 */
export declare const EVENT_TYPES: {
    readonly CONFERENCE: "CONFERENCE";
    readonly WORKSHOP: "WORKSHOP";
    readonly SEMINAR: "SEMINAR";
    readonly COURSE: "COURSE";
    readonly COMPETITION: "COMPETITION";
};
/**
 * Estados de inscripción
 */
export declare const ENROLLMENT_STATUS: {
    readonly REGISTERED: "REGISTERED";
    readonly CONFIRMED: "CONFIRMED";
    readonly ATTENDED: "ATTENDED";
    readonly CANCELLED: "CANCELLED";
    readonly NO_SHOW: "NO_SHOW";
};
/**
 * Headers HTTP personalizados
 */
export declare const CUSTOM_HEADERS: {
    readonly AUTH_TOKEN: "x-token";
    readonly API_VERSION: "x-api-version";
    readonly REQUEST_ID: "x-request-id";
};
//# sourceMappingURL=AppConstants.d.ts.map