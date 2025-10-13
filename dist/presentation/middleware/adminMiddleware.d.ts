import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
}
/**
 * Middleware para verificar que el usuario sea administrador o master
 * Debe usarse después del middleware de JWT (validateJWT)
 */
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar que el usuario sea MASTER
 * Debe usarse después del middleware de JWT (validateJWT)
 */
export declare const requireMaster: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=adminMiddleware.d.ts.map