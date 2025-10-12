import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
}

export class ChangeRequestController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * POST /api/change-requests
   * Crear una nueva solicitud de cambio
   */
  public async createChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        titulo_sol,
        descripcion_sol,
        justificacion_sol,
        tipo_cambio_sol,
        prioridad_sol = 'MEDIA',
        urgencia_sol = 'NORMAL'
      } = req.body;

      const usuario_id = req.usuario?.id_usu;
      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Validaciones básicas
      if (!titulo_sol || !descripcion_sol || !justificacion_sol || !tipo_cambio_sol) {
        res.status(400).json({
          success: false,
          message: 'Título, descripción, justificación y tipo de cambio son requeridos'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Crear la solicitud
      const nuevaSolicitud = await prisma.solicitudCambio.create({
        data: {
          titulo_sol,
          descripcion_sol,
          justificacion_sol,
          tipo_cambio_sol,
          prioridad_sol: prioridad_sol as any,
          urgencia_sol: urgencia_sol as any,
          id_usuario_sol: usuario_id,
          estado_sol: 'BORRADOR'
        },
        include: {
          usuario: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true,
              ced_usu: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud de cambio creada exitosamente',
        solicitud: {
          id_sol: nuevaSolicitud.id_sol,
          titulo_sol: nuevaSolicitud.titulo_sol,
          descripcion_sol: nuevaSolicitud.descripcion_sol,
          estado_sol: nuevaSolicitud.estado_sol,
          prioridad_sol: nuevaSolicitud.prioridad_sol,
          fec_creacion_sol: nuevaSolicitud.fec_creacion_sol,
          usuario: nuevaSolicitud.usuario
        }
      });
    } catch (error: any) {
      console.error('[createChangeRequest] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/change-requests/my-requests
   * Obtener solicitudes del usuario autenticado
   */
  public async getMyChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.usuario?.id_usu;
      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const solicitudes = await prisma.solicitudCambio.findMany({
        where: { id_usuario_sol: usuario_id },
        include: {
          usuario: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true,
              ced_usu: true
            }
          },
          adminResponsable: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true
            }
          },
          desarrolladorAsignado: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true
            }
          }
        },
        orderBy: { fec_creacion_sol: 'desc' }
      });

      res.json({
        success: true,
        solicitudes: solicitudes.map(sol => ({
          id_sol: sol.id_sol,
          titulo_sol: sol.titulo_sol,
          descripcion_sol: sol.descripcion_sol,
          estado_sol: sol.estado_sol,
          prioridad_sol: sol.prioridad_sol,
          urgencia_sol: sol.urgencia_sol,
          tipo_cambio_sol: sol.tipo_cambio_sol,
          fec_creacion_sol: sol.fec_creacion_sol,
          fec_ultima_actualizacion: sol.fec_ultima_actualizacion,
          usuario: sol.usuario,
          adminResponsable: sol.adminResponsable,
          desarrolladorAsignado: sol.desarrolladorAsignado
        })),
        total: solicitudes.length
      });
    } catch (error: any) {
      console.error('[getMyChangeRequests] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/change-requests/:id
   * Obtener solicitud por ID
   */
  public async getChangeRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id_usu;
      const usuario_rol = req.usuario?.rol;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const solicitud = await prisma.solicitudCambio.findUnique({
        where: { id_sol: id },
        include: {
          usuario: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true,
              ced_usu: true
            }
          },
          adminResponsable: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true
            }
          },
          desarrolladorAsignado: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      if (!solicitud) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Verificar permisos: solo el creador, admin o desarrollador asignado pueden ver
      const esCreador = solicitud.id_usuario_sol === usuario_id;
      const esAdmin = usuario_rol === 'ADMINISTRADOR' || usuario_rol === 'MASTER';
      const esDesarrolladorAsignado = solicitud.id_desarrollador_asignado === usuario_id;

      if (!esCreador && !esAdmin && !esDesarrolladorAsignado) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta solicitud'
        });
        return;
      }

      res.json({
        success: true,
        solicitud: {
          id_sol: solicitud.id_sol,
          titulo_sol: solicitud.titulo_sol,
          descripcion_sol: solicitud.descripcion_sol,
          justificacion_sol: solicitud.justificacion_sol,
          estado_sol: solicitud.estado_sol,
          prioridad_sol: solicitud.prioridad_sol,
          urgencia_sol: solicitud.urgencia_sol,
          tipo_cambio_sol: solicitud.tipo_cambio_sol,
          fec_creacion_sol: solicitud.fec_creacion_sol,
          fec_ultima_actualizacion: solicitud.fec_ultima_actualizacion,
          comentarios_admin_sol: solicitud.comentarios_admin_sol,
          usuario: solicitud.usuario,
          adminResponsable: solicitud.adminResponsable,
          desarrolladorAsignado: solicitud.desarrolladorAsignado
        }
      });
    } catch (error: any) {
      console.error('[getChangeRequestById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/change-requests (Admin only)
   * Obtener todas las solicitudes (solo administradores)
   */
  public async getAllChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_rol = req.usuario?.rol;

      if (usuario_rol !== 'ADMINISTRADOR' && usuario_rol !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para esta acción'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const { estado, prioridad, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (estado) where.estado_sol = estado;
      if (prioridad) where.prioridad_sol = prioridad;

      const [solicitudes, total] = await Promise.all([
        prisma.solicitudCambio.findMany({
          where,
          include: {
            usuario: {
              select: {
                id_usu: true,
                nom_usu1: true,
                ape_usu1: true,
                ced_usu: true
              }
            },
            adminResponsable: {
              select: {
                id_usu: true,
                nom_usu1: true,
                ape_usu1: true
              }
            },
            desarrolladorAsignado: {
              select: {
                id_usu: true,
                nom_usu1: true,
                ape_usu1: true
              }
            }
          },
          orderBy: { fec_creacion_sol: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.solicitudCambio.count({ where })
      ]);

      res.json({
        success: true,
        solicitudes: solicitudes.map(sol => ({
          id_sol: sol.id_sol,
          titulo_sol: sol.titulo_sol,
          descripcion_sol: sol.descripcion_sol,
          estado_sol: sol.estado_sol,
          prioridad_sol: sol.prioridad_sol,
          urgencia_sol: sol.urgencia_sol,
          tipo_cambio_sol: sol.tipo_cambio_sol,
          fec_creacion_sol: sol.fec_creacion_sol,
          fec_ultima_actualizacion: sol.fec_ultima_actualizacion,
          usuario: sol.usuario,
          adminResponsable: sol.adminResponsable,
          desarrolladorAsignado: sol.desarrolladorAsignado
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('[getAllChangeRequests] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/change-requests/:id/status (Admin only)
   * Actualizar estado de solicitud
   */
  public async updateChangeRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado_sol, obs_admin_sol } = req.body;
      const usuario_id = req.usuario?.id_usu;
      const usuario_rol = req.usuario?.rol;

      if (usuario_rol !== 'ADMINISTRADOR' && usuario_rol !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para esta acción'
        });
        return;
      }

      if (!estado_sol) {
        res.status(400).json({
          success: false,
          message: 'Estado es requerido'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const solicitud = await prisma.solicitudCambio.findUnique({
        where: { id_sol: id }
      });

      if (!solicitud) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      const solicitudActualizada = await prisma.solicitudCambio.update({
        where: { id_sol: id },
        data: {
          estado_sol: estado_sol as any,
          comentarios_admin_sol: obs_admin_sol || solicitud.comentarios_admin_sol,
          id_admin_resp_sol: usuario_id,
          fec_ultima_actualizacion: new Date()
        },
        include: {
          usuario: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true,
              ced_usu: true
            }
          },
          adminResponsable: {
            select: {
              id_usu: true,
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        solicitud: {
          id_sol: solicitudActualizada.id_sol,
          titulo_sol: solicitudActualizada.titulo_sol,
          estado_sol: solicitudActualizada.estado_sol,
          comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol,
          fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
          usuario: solicitudActualizada.usuario,
          adminResponsable: solicitudActualizada.adminResponsable
        }
      });
    } catch (error: any) {
      console.error('[updateChangeRequestStatus] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
