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
export const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userRole = req.usuario?.rol;
  if (!userRole || userRole !== 'ESTUDIANTE') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Estudiante.'
    });
    return;
  }
  next();
};

/**
 * Middleware para verificar que el estudiante tiene documentos verificados
 */
export const requireVerifiedDocuments = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const documentosVerificados = req.usuario?.documentos_verificados;
  if (!documentosVerificados) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere tener documentos verificados (cédula y matrícula).'
    });
    return;
  }
  next();
};

/**
 * Middleware para verificar que el estudiante tiene carrera asignada
 */
export const requireCareerAssignment = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const carreraId = req.usuario?.id_car_per;
  if (!carreraId) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere tener una carrera asignada.'
    });
    return;
  }
  next();
};

/**
 * Middleware combinado para verificar perfil completo de estudiante
 * (rol + carrera + documentos verificados)
 */
export const requireCompleteStudentProfile = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userRole = req.usuario?.rol;
  const carreraId = req.usuario?.id_car_per;
  const documentosVerificados = req.usuario?.documentos_verificados;

  if (!userRole || userRole !== 'ESTUDIANTE') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Estudiante.'
    });
    return;
  }

  if (!carreraId) {
    res.status(403).json({
      success: false,
      message: 'Perfil incompleto. Se requiere tener una carrera asignada.'
    });
    return;
  }

  if (!documentosVerificados) {
    res.status(403).json({
      success: false,
      message: 'Documentos pendientes. Se requiere tener cédula y matrícula verificadas.'
    });
    return;
  }

  next();
};
