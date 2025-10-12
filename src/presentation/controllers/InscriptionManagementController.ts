import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";

export class InscriptionManagementController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/admin/inscriptions/events/pending
   * Obtener inscripciones de eventos pendientes de aprobación
   */
  public async getPendingEventInscriptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const prisma = this.container.getPrismaClient();
      const skip = (Number(page) - 1) * Number(limit);

      // Construir filtros
      const where: any = {
        estado_pago: 'PENDIENTE'
      };

      if (search) {
        where.OR = [
          {
            usuario: {
              OR: [
                { nom_usu1: { contains: search as string, mode: 'insensitive' } },
                { ape_usu1: { contains: search as string, mode: 'insensitive' } },
                { ced_usu: { contains: search as string } }
              ]
            }
          },
          {
            evento: {
              nom_eve: { contains: search as string, mode: 'insensitive' }
            }
          }
        ];
      }

      const [inscripciones, total] = await Promise.all([
        prisma.inscripcion.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            usuario: {
              select: {
                id_usu: true,
                ced_usu: true,
                nom_usu1: true,
                nom_usu2: true,
                ape_usu1: true,
                ape_usu2: true,
                cuentas: {
                  select: {
                    cor_cue: true
                  }
                }
              }
            },
            evento: {
              select: {
                id_eve: true,
                nom_eve: true,
                fec_ini_eve: true,
                precio: true,
                es_gratuito: true
              }
            }
          },
          orderBy: { fec_ins: 'desc' }
        }),
        prisma.inscripcion.count({ where })
      ]);

      const inscripcionesFormateadas = inscripciones.map(ins => ({
        id_ins: ins.id_ins,
        fecha_inscripcion: ins.fec_ins,
        valor: ins.val_ins,
        metodo_pago: ins.met_pag_ins,
        estado_pago: ins.estado_pago,
        tiene_comprobante: !!ins.comprobante_pago_pdf,
        usuario: {
          id_usu: ins.usuario.id_usu,
          cedula: ins.usuario.ced_usu,
          nombre_completo: `${ins.usuario.nom_usu1} ${ins.usuario.nom_usu2 || ''} ${ins.usuario.ape_usu1} ${ins.usuario.ape_usu2 || ''}`.trim(),
          email: ins.usuario.cuentas[0]?.cor_cue
        },
        evento: {
          id_eve: ins.evento.id_eve,
          nombre: ins.evento.nom_eve,
          fecha_inicio: ins.evento.fec_ini_eve,
          precio: ins.evento.precio,
          es_gratuito: ins.evento.es_gratuito
        }
      }));

      res.json({
        success: true,
        inscripciones: inscripcionesFormateadas,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('[getPendingEventInscriptions] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/inscriptions/courses/pending
   * Obtener inscripciones de cursos pendientes de aprobación
   */
  public async getPendingCourseInscriptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const prisma = this.container.getPrismaClient();
      const skip = (Number(page) - 1) * Number(limit);

      // Construir filtros
      const where: any = {
        estado_pago_cur: 'PENDIENTE'
      };

      if (search) {
        where.OR = [
          {
            usuario: {
              OR: [
                { nom_usu1: { contains: search as string, mode: 'insensitive' } },
                { ape_usu1: { contains: search as string, mode: 'insensitive' } },
                { ced_usu: { contains: search as string } }
              ]
            }
          },
          {
            curso: {
              nom_cur: { contains: search as string, mode: 'insensitive' }
            }
          }
        ];
      }

      const [inscripciones, total] = await Promise.all([
        prisma.inscripcionCurso.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            usuario: {
              select: {
                id_usu: true,
                ced_usu: true,
                nom_usu1: true,
                nom_usu2: true,
                ape_usu1: true,
                ape_usu2: true,
                cuentas: {
                  select: {
                    cor_cue: true
                  }
                }
              }
            },
            curso: {
              select: {
                id_cur: true,
                nom_cur: true,
                fec_ini_cur: true,
                precio: true,
                es_gratuito: true
              }
            }
          },
          orderBy: { fec_ins_cur: 'desc' }
        }),
        prisma.inscripcionCurso.count({ where })
      ]);

      const inscripcionesFormateadas = inscripciones.map(ins => ({
        id_ins_cur: ins.id_ins_cur,
        fecha_inscripcion: ins.fec_ins_cur,
        valor: ins.val_ins_cur,
        metodo_pago: ins.met_pag_ins_cur,
        estado_pago: ins.estado_pago_cur,
        tiene_comprobante: !!ins.comprobante_pago_pdf,
        usuario: {
          id_usu: ins.usuario.id_usu,
          cedula: ins.usuario.ced_usu,
          nombre_completo: `${ins.usuario.nom_usu1} ${ins.usuario.nom_usu2 || ''} ${ins.usuario.ape_usu1} ${ins.usuario.ape_usu2 || ''}`.trim(),
          email: ins.usuario.cuentas[0]?.cor_cue
        },
        curso: {
          id_cur: ins.curso.id_cur,
          nombre: ins.curso.nom_cur,
          fecha_inicio: ins.curso.fec_ini_cur,
          precio: ins.curso.precio,
          es_gratuito: ins.curso.es_gratuito
        }
      }));

      res.json({
        success: true,
        inscripciones: inscripcionesFormateadas,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('[getPendingCourseInscriptions] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/inscriptions/events/:id/approve
   * Aprobar inscripción de evento
   */
  public async approveEventInscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();
      const adminId = req.usuario?.id_usu || req.uid;

      // Verificar que la inscripción existe
      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_ins: id },
        include: {
          evento: {
            select: {
              nom_eve: true,
              capacidad_max_eve: true,
              es_gratuito: true
            }
          },
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar que esté pendiente
      if (inscripcion.estado_pago !== 'PENDIENTE') {
        res.status(400).json({
          success: false,
          message: `La inscripción ya está ${inscripcion.estado_pago.toLowerCase()}`
        });
        return;
      }

      // Verificar capacidad disponible
      const inscripcionesAprobadas = await prisma.inscripcion.count({
        where: {
          id_eve_ins: inscripcion.id_eve_ins,
          estado_pago: 'APROBADO'
        }
      });

      if (inscripcionesAprobadas >= inscripcion.evento.capacidad_max_eve) {
        res.status(400).json({
          success: false,
          message: 'El evento ha alcanzado su capacidad máxima'
        });
        return;
      }

      // Aprobar inscripción
      const inscripcionAprobada = await prisma.inscripcion.update({
        where: { id_ins: id },
        data: {
          estado_pago: 'APROBADO',
          id_admin_aprobador: adminId,
          fec_aprobacion: new Date()
        }
      });

      res.json({
        success: true,
        message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} aprobada exitosamente`,
        data: inscripcionAprobada
      });

    } catch (error: any) {
      console.error('[approveEventInscription] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/inscriptions/courses/:id/approve
   * Aprobar inscripción de curso
   */
  public async approveCourseInscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();
      const adminId = req.usuario?.id_usu || req.uid;

      // Verificar que la inscripción existe
      const inscripcion = await prisma.inscripcionCurso.findUnique({
        where: { id_ins_cur: id },
        include: {
          curso: {
            select: {
              nom_cur: true,
              capacidad_max_cur: true,
              es_gratuito: true
            }
          },
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar que no sea un curso gratuito
      if (inscripcion.curso.es_gratuito) {
        res.status(400).json({
          success: false,
          message: 'Los cursos gratuitos se aprueban automáticamente'
        });
        return;
      }

      // Verificar que esté pendiente
      if (inscripcion.estado_pago_cur !== 'PENDIENTE') {
        res.status(400).json({
          success: false,
          message: `La inscripción ya está ${inscripcion.estado_pago_cur.toLowerCase()}`
        });
        return;
      }

      // Verificar capacidad disponible
      const inscripcionesAprobadas = await prisma.inscripcionCurso.count({
        where: {
          id_cur_ins: inscripcion.id_cur_ins,
          estado_pago_cur: 'APROBADO'
        }
      });

      if (inscripcionesAprobadas >= inscripcion.curso.capacidad_max_cur) {
        res.status(400).json({
          success: false,
          message: 'El curso ha alcanzado su capacidad máxima'
        });
        return;
      }

      // Aprobar inscripción
      const inscripcionAprobada = await prisma.inscripcionCurso.update({
        where: { id_ins_cur: id },
        data: {
          estado_pago_cur: 'APROBADO',
          id_admin_aprobador_cur: adminId,
          fec_aprobacion_cur: new Date()
        }
      });

      res.json({
        success: true,
        message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} aprobada exitosamente`,
        data: inscripcionAprobada
      });

    } catch (error: any) {
      console.error('[approveCourseInscription] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/inscriptions/events/:id/reject
   * Rechazar inscripción de evento
   */
  public async rejectEventInscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const prisma = this.container.getPrismaClient();
      const adminId = req.usuario?.id_usu || req.uid;

      // Verificar que la inscripción existe
      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_ins: id },
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar que esté pendiente
      if (inscripcion.estado_pago !== 'PENDIENTE') {
        res.status(400).json({
          success: false,
          message: `La inscripción ya está ${inscripcion.estado_pago.toLowerCase()}`
        });
        return;
      }

      // Rechazar inscripción
      const inscripcionRechazada = await prisma.inscripcion.update({
        where: { id_ins: id },
        data: {
          estado_pago: 'RECHAZADO',
          id_admin_aprobador: adminId,
          fec_aprobacion: new Date()
        }
      });

      res.json({
        success: true,
        message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} rechazada`,
        motivo_rechazo: motivo || 'No especificado',
        data: inscripcionRechazada
      });

    } catch (error: any) {
      console.error('[rejectEventInscription] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/inscriptions/courses/:id/reject
   * Rechazar inscripción de curso
   */
  public async rejectCourseInscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const prisma = this.container.getPrismaClient();
      const adminId = req.usuario?.id_usu || req.uid;

      // Verificar que la inscripción existe
      const inscripcion = await prisma.inscripcionCurso.findUnique({
        where: { id_ins_cur: id },
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar que esté pendiente
      if (inscripcion.estado_pago_cur !== 'PENDIENTE') {
        res.status(400).json({
          success: false,
          message: `La inscripción ya está ${inscripcion.estado_pago_cur.toLowerCase()}`
        });
        return;
      }

      // Rechazar inscripción
      const inscripcionRechazada = await prisma.inscripcionCurso.update({
        where: { id_ins_cur: id },
        data: {
          estado_pago_cur: 'RECHAZADO',
          id_admin_aprobador_cur: adminId,
          fec_aprobacion_cur: new Date()
        }
      });

      res.json({
        success: true,
        message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} rechazada`,
        motivo_rechazo: motivo || 'No especificado',
        data: inscripcionRechazada
      });

    } catch (error: any) {
      console.error('[rejectCourseInscription] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/inscriptions/events/:id/receipt
   * Descargar comprobante de pago de evento
   */
  public async downloadEventReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_ins: id },
        include: {
          usuario: {
            select: {
              ced_usu: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      if (!inscripcion.comprobante_pago_pdf) {
        res.status(404).json({
          success: false,
          message: 'No hay comprobante de pago disponible'
        });
        return;
      }

      const filename = inscripcion.comprobante_filename || `comprobante_evento_${inscripcion.usuario.ced_usu}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(inscripcion.comprobante_pago_pdf));

    } catch (error: any) {
      console.error('[downloadEventReceipt] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/inscriptions/courses/:id/receipt
   * Descargar comprobante de pago de curso
   */
  public async downloadCourseReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      const inscripcion = await prisma.inscripcionCurso.findUnique({
        where: { id_ins_cur: id },
        include: {
          usuario: {
            select: {
              ced_usu: true
            }
          }
        }
      });

      if (!inscripcion) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      if (!inscripcion.comprobante_pago_pdf) {
        res.status(404).json({
          success: false,
          message: 'No hay comprobante de pago disponible'
        });
        return;
      }

      const filename = inscripcion.comprobante_filename || `comprobante_curso_${inscripcion.usuario.ced_usu}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(inscripcion.comprobante_pago_pdf));

    } catch (error: any) {
      console.error('[downloadCourseReceipt] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/inscriptions/stats
   * Obtener estadísticas de inscripciones
   */
  public async getInscriptionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const [
        eventStats,
        courseStats,
        recentInscriptions
      ] = await Promise.all([
        // Estadísticas de eventos
        Promise.all([
          prisma.inscripcion.count({ where: { estado_pago: 'PENDIENTE' } }),
          prisma.inscripcion.count({ where: { estado_pago: 'APROBADO' } }),
          prisma.inscripcion.count({ where: { estado_pago: 'RECHAZADO' } }),
          prisma.inscripcion.count()
        ]),
        // Estadísticas de cursos
        Promise.all([
          prisma.inscripcionCurso.count({ where: { estado_pago_cur: 'PENDIENTE' } }),
          prisma.inscripcionCurso.count({ where: { estado_pago_cur: 'APROBADO' } }),
          prisma.inscripcionCurso.count({ where: { estado_pago_cur: 'RECHAZADO' } }),
          prisma.inscripcionCurso.count()
        ]),
        // Inscripciones recientes (últimos 7 días)
        Promise.all([
          prisma.inscripcion.count({
            where: {
              fec_ins: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }),
          prisma.inscripcionCurso.count({
            where: {
              fec_ins_cur: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ])
      ]);

      const [eventsPendientes, eventsAprobados, eventsRechazados, eventsTotal] = eventStats;
      const [coursesPendientes, coursesAprobados, coursesRechazados, coursesTotal] = courseStats;
      const [eventsRecientes, coursesRecientes] = recentInscriptions;

      res.json({
        success: true,
        stats: {
          eventos: {
            total: eventsTotal,
            pendientes: eventsPendientes,
            aprobados: eventsAprobados,
            rechazados: eventsRechazados,
            recientes_7_dias: eventsRecientes
          },
          cursos: {
            total: coursesTotal,
            pendientes: coursesPendientes,
            aprobados: coursesAprobados,
            rechazados: coursesRechazados,
            recientes_7_dias: coursesRecientes
          },
          totales: {
            pendientes: eventsPendientes + coursesPendientes,
            aprobados: eventsAprobados + coursesAprobados,
            rechazados: eventsRechazados + coursesRechazados,
            total: eventsTotal + coursesTotal
          }
        }
      });

    } catch (error: any) {
      console.error('[getInscriptionStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
