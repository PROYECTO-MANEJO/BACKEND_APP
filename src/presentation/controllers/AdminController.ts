import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/DIContainer';

interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
  };
  uid?: string;
  userRole?: string;
}

export class AdminController {
  constructor(private container: DIContainer) {}

  /**
   * GET /api/admin/dashboard
   * Obtener estadísticas del dashboard administrativo
   */
  public async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      // Obtener estadísticas generales
      const [
        totalUsuarios,
        totalCursos,
        totalEventos,
        totalInscripciones,
        inscripcionesPendientes,
        solicitudesPendientes
      ] = await Promise.all([
        // Total de usuarios
        prisma.usuario.count(),
        
        // Total de cursos
        prisma.curso.count(),
        
        // Total de eventos
        prisma.evento.count(),
        
        // Total de inscripciones (eventos + cursos)
        Promise.all([
          prisma.inscripcion.count(),
          prisma.inscripcionCurso.count()
        ]).then(([eventos, cursos]) => eventos + cursos),
        
        // Inscripciones pendientes de aprobación
        Promise.all([
          prisma.inscripcion.count({
            where: { estado_pago: 'PENDIENTE' }
          }),
          prisma.inscripcionCurso.count({
            where: { estado_pago_cur: 'PENDIENTE' }
          })
        ]).then(([eventos, cursos]) => eventos + cursos),
        
        // Solicitudes pendientes
        prisma.solicitudCambio.count({
          where: { estado_sol: 'PENDIENTE' }
        })
      ]);

      // Estadísticas por rol
      const usuariosPorRol = await prisma.cuenta.groupBy({
        by: ['rol_cue'],
        _count: {
          rol_cue: true
        }
      });

      // Eventos y cursos por estado
      const [eventosPorEstado, cursosPorEstado] = await Promise.all([
        prisma.evento.groupBy({
          by: ['estado'],
          _count: {
            estado: true
          }
        }),
        prisma.curso.groupBy({
          by: ['estado'],
          _count: {
            estado: true
          }
        })
      ]);

      // Inscripciones recientes (últimos 7 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 7);

      const [inscripcionesRecientesEventos, inscripcionesRecientesCursos] = await Promise.all([
        prisma.inscripcion.count({
          where: {
            fec_ins: {
              gte: fechaLimite
            }
          }
        }),
        prisma.inscripcionCurso.count({
          where: {
            fec_ins_cur: {
              gte: fechaLimite
            }
          }
        })
      ]);

      const inscripcionesRecientes = inscripcionesRecientesEventos + inscripcionesRecientesCursos;

      // Formatear respuesta
      const stats = {
        resumen: {
          totalUsuarios,
          totalCursos,
          totalEventos,
          totalInscripciones,
          inscripcionesPendientes,
          solicitudesPendientes,
          inscripcionesRecientes
        },
        usuariosPorRol: usuariosPorRol.reduce((acc, item) => {
          acc[item.rol_cue] = item._count.rol_cue;
          return acc;
        }, {} as Record<string, number>),
        eventosPorEstado: eventosPorEstado.reduce((acc, item) => {
          acc[item.estado] = item._count.estado;
          return acc;
        }, {} as Record<string, number>),
        cursosPorEstado: cursosPorEstado.reduce((acc, item) => {
          acc[item.estado] = item._count.estado;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('[getDashboardStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/recent-activity
   * Obtener actividad reciente para el dashboard
   */
  public async getRecentActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();
      const limit = parseInt(req.query.limit as string) || 10;

      // Inscripciones recientes
      const [inscripcionesEventos, inscripcionesCursos] = await Promise.all([
        prisma.inscripcion.findMany({
          take: limit,
          orderBy: { fec_ins: 'desc' },
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            },
            evento: {
              select: {
                nom_eve: true
              }
            }
          }
        }),
        prisma.inscripcionCurso.findMany({
          take: limit,
          orderBy: { fec_ins_cur: 'desc' },
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            },
            curso: {
              select: {
                nom_cur: true
              }
            }
          }
        })
      ]);

      // Solicitudes recientes
      const solicitudesRecientes = await prisma.solicitudCambio.findMany({
        take: limit,
        orderBy: { fec_creacion_sol: 'desc' },
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      // Formatear actividades
      const actividades = [
        ...inscripcionesEventos.map(ins => ({
          tipo: 'inscripcion_evento',
          fecha: ins.fec_ins,
          usuario: `${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`,
          descripcion: `Se inscribió en el evento "${ins.evento.nom_eve}"`,
          estado: ins.estado_pago
        })),
        ...inscripcionesCursos.map(ins => ({
          tipo: 'inscripcion_curso',
          fecha: ins.fec_ins_cur,
          usuario: `${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`,
          descripcion: `Se inscribió en el curso "${ins.curso.nom_cur}"`,
          estado: ins.estado_pago_cur
        })),
        ...solicitudesRecientes.map(sol => ({
          tipo: 'solicitud_cambio',
          fecha: sol.fec_creacion_sol,
          usuario: `${sol.usuario.nom_usu1} ${sol.usuario.ape_usu1}`,
          descripcion: `Creó una solicitud de cambio: "${sol.titulo_sol}"`,
          estado: sol.estado_sol
        }))
      ];

      // Ordenar por fecha descendente y tomar los más recientes
      actividades.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      const actividadesRecientes = actividades.slice(0, limit);

      res.json({
        success: true,
        data: actividadesRecientes
      });

    } catch (error: any) {
      console.error('[getRecentActivity] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/pending-approvals
   * Obtener elementos pendientes de aprobación
   */
  public async getPendingApprovals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      // Inscripciones pendientes de aprobación
      const [inscripcionesEventosPendientes, inscripcionesCursosPendientes] = await Promise.all([
        prisma.inscripcion.findMany({
          where: { estado_pago: 'PENDIENTE' },
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true,
                ced_usu: true
              }
            },
            evento: {
              select: {
                nom_eve: true
              }
            }
          },
          orderBy: { fec_ins: 'desc' }
        }),
        prisma.inscripcionCurso.findMany({
          where: { estado_pago_cur: 'PENDIENTE' },
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true,
                ced_usu: true
              }
            },
            curso: {
              select: {
                nom_cur: true
              }
            }
          },
          orderBy: { fec_ins_cur: 'desc' }
        })
      ]);

      // Solicitudes pendientes
      const solicitudesPendientes = await prisma.solicitudCambio.findMany({
        where: { estado_sol: 'PENDIENTE' },
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true,
              ced_usu: true
            }
          }
        },
        orderBy: { fec_creacion_sol: 'desc' }
      });

      const pendientes = {
        inscripciones: {
          eventos: inscripcionesEventosPendientes.map(ins => ({
            id: ins.id_ins,
            tipo: 'evento',
            usuario: {
              nombre: `${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`,
              cedula: ins.usuario.ced_usu
            },
            item: ins.evento.nom_eve,
            fecha: ins.fec_ins,
            metodo_pago: ins.met_pag_ins,
            tiene_comprobante: !!ins.comprobante_pago_pdf
          })),
          cursos: inscripcionesCursosPendientes.map(ins => ({
            id: ins.id_ins_cur,
            tipo: 'curso',
            usuario: {
              nombre: `${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`,
              cedula: ins.usuario.ced_usu
            },
            item: ins.curso.nom_cur,
            fecha: ins.fec_ins_cur,
            metodo_pago: ins.met_pag_ins_cur,
            tiene_comprobante: !!ins.comprobante_pago_pdf
          }))
        },
        solicitudes: solicitudesPendientes.map(sol => ({
          id: sol.id_sol,
          usuario: {
            nombre: `${sol.usuario.nom_usu1} ${sol.usuario.ape_usu1}`,
            cedula: sol.usuario.ced_usu
          },
          titulo: sol.titulo_sol,
          tipo: sol.tipo_cambio_sol,
          fecha: sol.fec_creacion_sol
        }))
      };

      res.json({
        success: true,
        data: pendientes
      });

    } catch (error: any) {
      console.error('[getPendingApprovals] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
