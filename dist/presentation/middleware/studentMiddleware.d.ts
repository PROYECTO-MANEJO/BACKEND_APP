import { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
        id_car_per?: string;
        documentos_verificados?: boolean;
    };
    uid?: string;
}
/**
 * Middleware para verificar que el usuario tiene rol ESTUDIANTE
 */
export declare const requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar que el estudiante tiene documentos verificados
 */
export declare const requireVerifiedDocuments: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar que el estudiante tiene carrera asignada
 */
export declare const requireCareerAssignment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware combinado para verificar perfil completo de estudiante
 * (rol + carrera + documentos verificados)
 */
export declare const requireCompleteStudentProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=studentMiddleware.d.ts.map