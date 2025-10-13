import { Request, Response, NextFunction } from "express";
export declare const validateJWT: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para validar roles específicos
 * Debe usarse después de validateJWT
 */
export declare const validateRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=jwtMiddleware.d.ts.map