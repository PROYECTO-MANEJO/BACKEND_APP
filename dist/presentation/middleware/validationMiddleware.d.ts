import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Middleware para manejar errores de validación
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validaciones para usuarios
 */
export declare const validateUserCreation: ValidationChain[];
export declare const validateUserUpdate: ValidationChain[];
/**
 * Validaciones para autenticación
 */
export declare const validateLogin: ValidationChain[];
export declare const validateChangePassword: ValidationChain[];
/**
 * Validaciones para cursos
 */
export declare const validateCourseCreation: ValidationChain[];
/**
 * Validaciones para eventos
 */
export declare const validateEventCreation: ValidationChain[];
/**
 * Validaciones para paginación
 */
export declare const validatePagination: ValidationChain[];
/**
 * Validaciones para IDs en parámetros
 */
export declare const validateIdParam: ValidationChain[];
//# sourceMappingURL=validationMiddleware.d.ts.map