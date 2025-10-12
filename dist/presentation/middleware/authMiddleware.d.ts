import { Request, Response, NextFunction } from 'express';
export interface JWTPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
/**
 * Middleware de autenticación JWT
 * Verifica el token JWT y adjunta la información del usuario al request
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 */
export declare const authorize: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero adjunta la información si está disponible
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar si el usuario puede acceder a sus propios recursos
 * o si es administrador
 */
export declare const authorizeOwnerOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map