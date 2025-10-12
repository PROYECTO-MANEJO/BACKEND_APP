import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
  };
  uid?: string;
}

/**
 * Middleware para verificar que el usuario sea administrador o master
 * Debe usarse después del middleware de JWT (validateJWT)
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const usuario_id = req.usuario?.id_usu || req.uid;

    if (!usuario_id) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar rol del usuario en la base de datos
    const prisma = (req as any).prisma || require('../../infrastructure/database/prismaClient').default;
    
    prisma.usuario.findUnique({
      where: { id_usu: usuario_id },
      include: {
        cuentas: {
          select: { rol_cue: true }
        }
      }
    }).then((usuario: any) => {
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const roles = usuario.cuentas.map((cuenta: any) => cuenta.rol_cue);
      const esAdmin = roles.includes('ADMINISTRADOR') || roles.includes('MASTER');

      if (!esAdmin) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
        return;
      }

      // Agregar información del rol al request para uso posterior
      (req as any).userRole = roles.includes('MASTER') ? 'MASTER' : 'ADMINISTRADOR';
      next();
    }).catch((error: any) => {
      console.error('[requireAdmin] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    });

  } catch (error) {
    console.error('[requireAdmin] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea MASTER
 * Debe usarse después del middleware de JWT (validateJWT)
 */
export const requireMaster = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const usuario_id = req.usuario?.id_usu || req.uid;

    if (!usuario_id) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar rol del usuario en la base de datos
    const prisma = (req as any).prisma || require('../../infrastructure/database/prismaClient').default;
    
    prisma.usuario.findUnique({
      where: { id_usu: usuario_id },
      include: {
        cuentas: {
          select: { rol_cue: true }
        }
      }
    }).then((usuario: any) => {
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const roles = usuario.cuentas.map((cuenta: any) => cuenta.rol_cue);
      const esMaster = roles.includes('MASTER');

      if (!esMaster) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de MASTER.'
        });
        return;
      }

      // Agregar información del rol al request
      (req as any).userRole = 'MASTER';
      next();
    }).catch((error: any) => {
      console.error('[requireMaster] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    });

  } catch (error) {
    console.error('[requireMaster] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
