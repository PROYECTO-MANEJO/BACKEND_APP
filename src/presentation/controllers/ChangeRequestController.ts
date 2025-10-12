import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;  // ID del usuario desde JWT middleware
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

      const usuario_id = req.usuario?.id_usu || req.uid;
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
        data: {
          id_sol: nuevaSolicitud.id_sol,
          titulo_sol: nuevaSolicitud.titulo_sol,
          descripcion_sol: nuevaSolicitud.descripcion_sol,
          justificacion_sol: nuevaSolicitud.justificacion_sol,
          tipo_cambio_sol: nuevaSolicitud.tipo_cambio_sol,
          prioridad_sol: nuevaSolicitud.prioridad_sol,
          urgencia_sol: nuevaSolicitud.urgencia_sol,
          estado_sol: nuevaSolicitud.estado_sol,
          fec_creacion_sol: nuevaSolicitud.fec_creacion_sol,
          usuarioSolicitante: nuevaSolicitud.usuario
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
      const usuario_id = req.usuario?.id_usu || req.uid;
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
        data: {
          solicitudes: solicitudes.map(sol => ({
            id_sol: sol.id_sol,
            titulo_sol: sol.titulo_sol,
            descripcion_sol: sol.descripcion_sol,
            justificacion_sol: sol.justificacion_sol,
            tipo_cambio_sol: sol.tipo_cambio_sol,
            prioridad_sol: sol.prioridad_sol,
            urgencia_sol: sol.urgencia_sol,
            estado_sol: sol.estado_sol,
            fec_creacion_sol: sol.fec_creacion_sol,
            fec_ultima_actualizacion: sol.fec_ultima_actualizacion,
            comentarios_admin_sol: sol.comentarios_admin_sol,
            usuarioSolicitante: sol.usuario,
            adminResponsable: sol.adminResponsable,
            desarrolladorAsignado: sol.desarrolladorAsignado,
            // Indicar si puede editar (solo en BORRADOR)
            puede_editar: sol.estado_sol === 'BORRADOR',
            puede_cancelar: sol.estado_sol === 'BORRADOR',
            puede_enviar: sol.estado_sol === 'BORRADOR'
          })),
          total: solicitudes.length
        }
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
      const usuario_id = req.usuario?.id_usu || req.uid;
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
      const usuario_id = req.usuario?.id_usu || req.uid;
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

  /**
   * PUT /api/solicitudes-cambio/:id/editar
   * Actualizar solicitud (solo BORRADOR)
   */
  public async updateChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id_usu || req.uid;
      const {
        titulo_sol,
        descripcion_sol,
        justificacion_sol,
        tipo_cambio_sol,
        prioridad_sol,
        urgencia_sol
      } = req.body;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar que la solicitud existe y es del usuario
      const solicitudExistente = await prisma.solicitudCambio.findFirst({
        where: {
          id_sol: id,
          id_usuario_sol: usuario_id
        }
      });

      if (!solicitudExistente) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Solo se puede editar si está en BORRADOR
      if (solicitudExistente.estado_sol !== 'BORRADOR') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden editar solicitudes en estado BORRADOR'
        });
        return;
      }

      // Actualizar la solicitud
      const solicitudActualizada = await prisma.solicitudCambio.update({
        where: { id_sol: id },
        data: {
          titulo_sol,
          descripcion_sol,
          justificacion_sol,
          tipo_cambio_sol,
          prioridad_sol: prioridad_sol as any,
          urgencia_sol: urgencia_sol as any,
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
          }
        }
      });

      res.json({
        success: true,
        message: 'Solicitud actualizada exitosamente',
        data: {
          id_sol: solicitudActualizada.id_sol,
          titulo_sol: solicitudActualizada.titulo_sol,
          descripcion_sol: solicitudActualizada.descripcion_sol,
          justificacion_sol: solicitudActualizada.justificacion_sol,
          tipo_cambio_sol: solicitudActualizada.tipo_cambio_sol,
          prioridad_sol: solicitudActualizada.prioridad_sol,
          urgencia_sol: solicitudActualizada.urgencia_sol,
          estado_sol: solicitudActualizada.estado_sol,
          fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
          usuarioSolicitante: solicitudActualizada.usuario
        }
      });
    } catch (error: any) {
      console.error('[updateChangeRequest] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/solicitudes-cambio/:id/enviar
   * Enviar solicitud (BORRADOR → PENDIENTE)
   */
  public async submitChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id_usu || req.uid;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar que la solicitud existe y es del usuario
      const solicitudExistente = await prisma.solicitudCambio.findFirst({
        where: {
          id_sol: id,
          id_usuario_sol: usuario_id
        }
      });

      if (!solicitudExistente) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Solo se puede enviar si está en BORRADOR
      if (solicitudExistente.estado_sol !== 'BORRADOR') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden enviar solicitudes en estado BORRADOR'
        });
        return;
      }

      // Cambiar estado a PENDIENTE
      const solicitudActualizada = await prisma.solicitudCambio.update({
        where: { id_sol: id },
        data: {
          estado_sol: 'PENDIENTE',
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
          }
        }
      });

      res.json({
        success: true,
        message: 'Solicitud enviada exitosamente',
        data: {
          id_sol: solicitudActualizada.id_sol,
          estado_sol: solicitudActualizada.estado_sol,
          fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
          usuarioSolicitante: solicitudActualizada.usuario
        }
      });
    } catch (error: any) {
      console.error('[submitChangeRequest] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/solicitudes-cambio/:id/cancelar
   * Cancelar solicitud (solo BORRADOR)
   */
  public async cancelChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id_usu || req.uid;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar que la solicitud existe y es del usuario
      const solicitudExistente = await prisma.solicitudCambio.findFirst({
        where: {
          id_sol: id,
          id_usuario_sol: usuario_id
        }
      });

      if (!solicitudExistente) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Solo se puede cancelar si está en BORRADOR
      if (solicitudExistente.estado_sol !== 'BORRADOR') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden cancelar solicitudes en estado BORRADOR'
        });
        return;
      }

      // Cambiar estado a CANCELADA
      const solicitudActualizada = await prisma.solicitudCambio.update({
        where: { id_sol: id },
        data: {
          estado_sol: 'CANCELADA',
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
          }
        }
      });

      res.json({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: {
          id_sol: solicitudActualizada.id_sol,
          estado_sol: solicitudActualizada.estado_sol,
          fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
          usuarioSolicitante: solicitudActualizada.usuario
        }
      });
    } catch (error: any) {
      console.error('[cancelChangeRequest] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/solicitudes-cambio/mis-estadisticas
   * Obtener estadísticas del usuario
   */
  public async getMyStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.usuario?.id_usu || req.uid;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Obtener estadísticas por estado
      const estadisticas = await prisma.solicitudCambio.groupBy({
        by: ['estado_sol'],
        where: {
          id_usuario_sol: usuario_id
        },
        _count: {
          estado_sol: true
        }
      });

      // Formatear estadísticas
      const estadisticasFormateadas = {
        total: 0,
        borrador: 0,
        pendiente: 0,
        en_revision: 0,
        aprobada: 0,
        rechazada: 0,
        cancelada: 0,
        en_desarrollo: 0,
        completada: 0
      };

      estadisticas.forEach(stat => {
        const count = stat._count.estado_sol;
        estadisticasFormateadas.total += count;
        
        switch (stat.estado_sol) {
          case 'BORRADOR':
            estadisticasFormateadas.borrador = count;
            break;
          case 'PENDIENTE':
            estadisticasFormateadas.pendiente = count;
            break;
          case 'EN_REVISION':
            estadisticasFormateadas.en_revision = count;
            break;
          case 'APROBADA':
            estadisticasFormateadas.aprobada = count;
            break;
          case 'RECHAZADA':
            estadisticasFormateadas.rechazada = count;
            break;
          case 'CANCELADA':
            estadisticasFormateadas.cancelada = count;
            break;
          case 'EN_DESARROLLO':
            estadisticasFormateadas.en_desarrollo = count;
            break;
          case 'COMPLETADA':
            estadisticasFormateadas.completada = count;
            break;
        }
      });

      res.json({
        success: true,
        data: estadisticasFormateadas
      });
    } catch (error: any) {
      console.error('[getMyStatistics] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
