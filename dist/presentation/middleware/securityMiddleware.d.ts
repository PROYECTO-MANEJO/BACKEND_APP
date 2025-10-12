import { Request, Response, NextFunction } from "express";
/**
 * Middleware de logging para requests
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de manejo global de errores
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware simple de CORS
 */
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware básico de seguridad (simplificado sin helmet)
 */
export declare const basicSecurityHeaders: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter para autenticación (más estricto)
 */
export declare const authRateLimit: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter general para API
 */
export declare const apiRateLimit: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter específico para ciertos endpoints sensibles
 */
export declare const strictRateLimit: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación de Content-Type para endpoints que requieren JSON
 */
export declare const requireJsonContentType: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de sanitización de inputs básica
 */
export declare const sanitizeInputs: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware anti-CSRF básico
 */
export declare const antiCSRF: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para manejar rutas no encontradas (404)
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de health check
 */
export declare const healthCheck: (req: Request, res: Response) => void;
/**
 * Alias para errorHandler para mantener compatibilidad
 */
export declare const globalErrorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Configuración completa de middlewares de seguridad
 */
export declare const setupSecurityMiddlewares: () => ((req: Request, res: Response, next: NextFunction) => void)[];
//# sourceMappingURL=securityMiddleware.d.ts.map