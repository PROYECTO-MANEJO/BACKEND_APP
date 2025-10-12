import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId: number;
  userRole: string;
  userEmail: string;
}

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
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Token de acceso requerido",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Agregar información del usuario al request
    (req as AuthenticatedRequest).userId = decoded.userId;
    (req as AuthenticatedRequest).userRole = decoded.role;
    (req as AuthenticatedRequest).userEmail = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: "Token expirado",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: "Token inválido",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = (req as AuthenticatedRequest).userRole;

      if (!userRole) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          error: "No tienes permisos para acceder a este recurso",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero adjunta la información si está disponible
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      (req as AuthenticatedRequest).userId = decoded.userId;
      (req as AuthenticatedRequest).userRole = decoded.role;
      (req as AuthenticatedRequest).userEmail = decoded.email;
    }

    next();
  } catch (error) {
    // En caso de error, continúa sin autenticación
    next();
  }
};

/**
 * Middleware para verificar si el usuario puede acceder a sus propios recursos
 * o si es administrador
 */
export const authorizeOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const userRole = (req as AuthenticatedRequest).userRole;
    const requestedUserId = parseInt(req.params.userId || req.params.id!);

    // Los administradores pueden acceder a cualquier recurso
    if (userRole === "administrador" || userRole === "admin") {
      next();
      return;
    }

    // Los usuarios solo pueden acceder a sus propios recursos
    if (userId === requestedUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: "No tienes permisos para acceder a este recurso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};
