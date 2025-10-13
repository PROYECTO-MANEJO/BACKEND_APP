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

  /**
   * GET /api/administracion/cursos-eventos
   * Obtener todos los cursos y eventos administrables (que no han terminado)
   * Incluye estadísticas de inscripciones para cada uno
   */
  public async getCoursesAndEventsForManagement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();
      const fechaActual = new Date();
      
      // Obtener eventos que aún no han terminado
      const eventos = await prisma.evento.findMany({
        where: {
          fec_fin_eve: { gte: fechaActual }
        },
        include: {
          categoria: {
            select: {
              nom_cat: true,
              des_cat: true
            }
          },
          organizador: {
            select: {
              nom_org1: true,
              nom_org2: true,
              ape_org1: true,
              ape_org2: true
            }
          },
          _count: {
            select: {
              inscripciones: true
            }
          }
        },
        orderBy: [
          { fec_ini_eve: 'desc' }
        ]
      });

      // Obtener cursos que aún no han terminado
      const cursos = await prisma.curso.findMany({
        where: {
          fec_fin_cur: { gte: fechaActual }
        },
        include: {
          categoria: {
            select: {
              nom_cat: true,
              des_cat: true
            }
          },
          organizador: {
            select: {
              nom_org1: true,
              nom_org2: true,
              ape_org1: true,
              ape_org2: true
            }
          },
          _count: {
            select: {
              inscripcionesCurso: true
            }
          }
        },
        orderBy: [
          { fec_ini_cur: 'desc' }
        ]
      });

      // Obtener estadísticas adicionales para eventos
      const eventosConEstadisticas = await Promise.all(
        eventos.map(async (evento) => {
          const estadisticas = await prisma.inscripcion.groupBy({
            by: ['estado_pago'],
            where: { id_eve_ins: evento.id_eve },
            _count: true
          });

          const stats = {
            total: evento._count.inscripciones,
            aprobadas: 0,
            pendientes: 0,
            rechazadas: 0,
            disponibles: evento.capacidad_max_eve - evento._count.inscripciones
          };

          estadisticas.forEach(stat => {
            switch(stat.estado_pago.toLowerCase()) {
              case 'aprobado':
                stats.aprobadas = stat._count;
                break;
              case 'pendiente':
                stats.pendientes = stat._count;
                break;
              case 'rechazado':
                stats.rechazadas = stat._count;
                break;
            }
          });

          return {
            tipo: 'EVENTO',
            id_eve: evento.id_eve,
            nom_eve: evento.nom_eve,
            des_eve: evento.des_eve,
            fec_ini_eve: evento.fec_ini_eve,
            fec_fin_eve: evento.fec_fin_eve,
            ubi_eve: evento.ubi_eve,
            precio: evento.precio,
            es_gratuito: evento.es_gratuito,
            capacidad_max_eve: evento.capacidad_max_eve,
            categoria_nombre: evento.categoria?.nom_cat || 'Sin categoría',
            organizador_nombre: `${evento.organizador?.nom_org1 || ''} ${evento.organizador?.ape_org1 || ''}`.trim() || 'Sin organizador',
            estadisticas: stats
          };
        })
      );

      // Obtener estadísticas adicionales para cursos
      const cursosConEstadisticas = await Promise.all(
        cursos.map(async (curso) => {
          const estadisticas = await prisma.inscripcionCurso.groupBy({
            by: ['estado_pago_cur'],
            where: { id_cur_ins: curso.id_cur },
            _count: true
          });

          const stats = {
            total: curso._count.inscripcionesCurso,
            aprobadas: 0,
            pendientes: 0,
            rechazadas: 0,
            disponibles: curso.capacidad_max_cur - curso._count.inscripcionesCurso
          };

          estadisticas.forEach(stat => {
            switch(stat.estado_pago_cur.toLowerCase()) {
              case 'aprobado':
                stats.aprobadas = stat._count;
                break;
              case 'pendiente':
                stats.pendientes = stat._count;
                break;
              case 'rechazado':
                stats.rechazadas = stat._count;
                break;
            }
          });

          return {
            tipo: 'CURSO',
            id_cur: curso.id_cur,
            nom_cur: curso.nom_cur,
            des_cur: curso.des_cur,
            fec_ini_cur: curso.fec_ini_cur,
            fec_fin_cur: curso.fec_fin_cur,
            // Los cursos no tienen ubicación física en el modelo
            ubi_cur: 'Virtual/Por definir',
            precio: curso.precio,
            es_gratuito: curso.es_gratuito,
            capacidad_max_cur: curso.capacidad_max_cur,
            categoria_nombre: curso.categoria?.nom_cat || 'Sin categoría',
            organizador_nombre: `${curso.organizador?.nom_org1 || ''} ${curso.organizador?.ape_org1 || ''}`.trim() || 'Sin organizador',
            estadisticas: stats
          };
        })
      );

      // Combinar todos los items
      const allItems = [...eventosConEstadisticas, ...cursosConEstadisticas];

      // Calcular estadísticas generales
      const totalItems = allItems.length;
      const totalEventos = eventosConEstadisticas.length;
      const totalCursos = cursosConEstadisticas.length;

      res.json({
        success: true,
        data: {
          items: allItems,
          total: totalItems,
          eventos: totalEventos,
          cursos: totalCursos
        }
      });

    } catch (error: any) {
      console.error('[getCoursesAndEventsForManagement] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/administracion/evento/:idEvento
   * Obtener detalles completos de un evento con inscripciones
   */
  public async getEventDetailsForAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { idEvento } = req.params;
      const prisma = this.container.getPrismaClient();

      if (!idEvento) {
        res.status(400).json({
          success: false,
          message: 'ID del evento es obligatorio'
        });
        return;
      }

      // Obtener evento con detalles completos
      const evento = await prisma.evento.findUnique({
        where: { id_eve: idEvento },
        include: {
          categoria: true,
          organizador: true,
          eventosPorCarrera: {
            include: {
              carrera: {
                select: {
                  id_car: true,
                  nom_car: true,
                  des_car: true
                }
              }
            }
          }
        }
      });

      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
        return;
      }

      // Obtener todas las inscripciones con detalles de usuarios
      const inscripciones = await prisma.inscripcion.findMany({
        where: { id_eve_ins: idEvento },
        include: {
          usuario: {
            include: {
              carrera: {
                select: {
                  nom_car: true
                }
              },
              cuentas: {
                select: {
                  cor_cue: true,
                  rol_cue: true
                }
              }
            }
          },
          adminAprobador: {
            select: {
              nom_usu1: true,
              ape_usu1: true,
              cuentas: {
                select: {
                  cor_cue: true
                }
              }
            }
          }
        },
        orderBy: [
          { estado_pago: 'asc' }, // Pendientes primero
          { fec_ins: 'desc' }
        ]
      });

      // Formatear inscripciones con información adicional
      const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
        id_inscripcion: inscripcion.id_ins,
        fecha_inscripcion: inscripcion.fec_ins,
        estado_pago: inscripcion.estado_pago,
        valor: inscripcion.val_ins,
        metodo_pago: inscripcion.met_pag_ins,
        fecha_aprobacion: inscripcion.fec_aprobacion,
        tiene_comprobante: !!inscripcion.comprobante_pago_pdf,
        carta_motivacion: inscripcion.carta_motivacion,
        comprobante_info: inscripcion.comprobante_pago_pdf ? {
          filename: inscripcion.comprobante_filename,
          size: inscripcion.comprobante_size,
          fecha_subida: inscripcion.fec_subida_comprobante
        } : null,
        usuario: {
          id: inscripcion.usuario.id_usu,
          cedula: inscripcion.usuario.ced_usu,
          nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim(),
          email: inscripcion.usuario.cuentas[0]?.cor_cue || 'No disponible',
          telefono: inscripcion.usuario.num_tel_usu,
          carrera: inscripcion.usuario.carrera?.nom_car || 'No especificada',
          rol: inscripcion.usuario.cuentas[0]?.rol_cue || 'USUARIO'
        },
        admin_aprobador: inscripcion.adminAprobador ? {
          nombre: `${inscripcion.adminAprobador.nom_usu1} ${inscripcion.adminAprobador.ape_usu1}`,
          email: inscripcion.adminAprobador.cuentas[0]?.cor_cue
        } : null
      }));

      // Calcular estadísticas
      const estadisticas = {
        total_inscripciones: inscripciones.length,
        pendientes: inscripciones.filter(i => i.estado_pago === 'PENDIENTE').length,
        aprobadas: inscripciones.filter(i => i.estado_pago === 'APROBADO').length,
        rechazadas: inscripciones.filter(i => i.estado_pago === 'RECHAZADO').length,
        disponibles: evento.capacidad_max_eve - inscripciones.filter(i => i.estado_pago === 'APROBADO').length
      };

      // Formatear respuesta del evento
      const eventoFormateado = {
        id_eve: evento.id_eve,
        nom_eve: evento.nom_eve,
        des_eve: evento.des_eve,
        fec_ini_eve: evento.fec_ini_eve,
        fec_fin_eve: evento.fec_fin_eve,
        hor_ini_eve: evento.hor_ini_eve,
        hor_fin_eve: evento.hor_fin_eve,
        ubi_eve: evento.ubi_eve,
        capacidad_max_eve: evento.capacidad_max_eve,
        precio: evento.precio,
        es_gratuito: evento.es_gratuito,
        requiere_carta_motivacion: evento.requiere_carta_motivacion,
        tipo_audiencia_eve: evento.tipo_audiencia_eve,
        categoria: {
          nom_cat: evento.categoria?.nom_cat || 'Sin categoría',
          des_cat: evento.categoria?.des_cat || ''
        },
        organizador: {
          nombre_completo: `${evento.organizador?.nom_org1 || ''} ${evento.organizador?.nom_org2 || ''} ${evento.organizador?.ape_org1 || ''} ${evento.organizador?.ape_org2 || ''}`.trim(),
          cedula: evento.organizador?.ced_org || '',
          titulo_academico: evento.organizador?.tit_aca_org || ''
        },
        carreras_asociadas: evento.eventosPorCarrera.map(epc => ({
          id_car: epc.carrera.id_car,
          nom_car: epc.carrera.nom_car,
          des_car: epc.carrera.des_car
        }))
      };

      res.json({
        success: true,
        data: {
          evento: eventoFormateado,
          inscripciones: inscripcionesFormateadas,
          estadisticas
        }
      });

    } catch (error: any) {
      console.error('[getEventDetailsForAdmin] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/administracion/curso/:idCurso
   * Obtener detalles completos de un curso con inscripciones
   */
  public async getCourseDetailsForAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { idCurso } = req.params;
      const prisma = this.container.getPrismaClient();

      if (!idCurso) {
        res.status(400).json({
          success: false,
          message: 'ID del curso es obligatorio'
        });
        return;
      }

      // Obtener curso con detalles completos
      const curso = await prisma.curso.findUnique({
        where: { id_cur: idCurso },
        include: {
          categoria: true,
          organizador: true,
          cursosPorCarrera: {
            include: {
              carrera: {
                select: {
                  id_car: true,
                  nom_car: true,
                  des_car: true
                }
              }
            }
          }
        }
      });

      if (!curso) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Obtener todas las inscripciones con detalles de usuarios
      const inscripciones = await prisma.inscripcionCurso.findMany({
        where: { id_cur_ins: idCurso },
        include: {
          usuario: {
            include: {
              carrera: {
                select: {
                  nom_car: true
                }
              },
              cuentas: {
                select: {
                  cor_cue: true,
                  rol_cue: true
                }
              }
            }
          },
          adminAprobador: {
            select: {
              nom_usu1: true,
              ape_usu1: true,
              cuentas: {
                select: {
                  cor_cue: true
                }
              }
            }
          }
        },
        orderBy: [
          { estado_pago_cur: 'asc' }, // Pendientes primero
          { fec_ins_cur: 'desc' }
        ]
      });

      // Formatear inscripciones con información adicional
      const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
        id_inscripcion: inscripcion.id_ins_cur,
        fecha_inscripcion: inscripcion.fec_ins_cur,
        estado_pago: inscripcion.estado_pago_cur,
        valor: inscripcion.val_ins_cur,
        metodo_pago: inscripcion.met_pag_ins_cur,
        fecha_aprobacion: inscripcion.fec_aprobacion_cur,
        tiene_comprobante: !!inscripcion.comprobante_pago_pdf,
        carta_motivacion: inscripcion.carta_motivacion,
        comprobante_info: inscripcion.comprobante_pago_pdf ? {
          filename: inscripcion.comprobante_filename,
          size: inscripcion.comprobante_size,
          fecha_subida: inscripcion.fec_subida_comprobante
        } : null,
        usuario: {
          id: inscripcion.usuario.id_usu,
          cedula: inscripcion.usuario.ced_usu,
          nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim(),
          email: inscripcion.usuario.cuentas[0]?.cor_cue || 'No disponible',
          telefono: inscripcion.usuario.num_tel_usu,
          carrera: inscripcion.usuario.carrera?.nom_car || 'No especificada',
          rol: inscripcion.usuario.cuentas[0]?.rol_cue || 'USUARIO'
        },
        admin_aprobador: inscripcion.adminAprobador ? {
          nombre: `${inscripcion.adminAprobador.nom_usu1} ${inscripcion.adminAprobador.ape_usu1}`,
          email: inscripcion.adminAprobador.cuentas[0]?.cor_cue
        } : null
      }));

      // Calcular estadísticas
      const estadisticas = {
        total_inscripciones: inscripciones.length,
        pendientes: inscripciones.filter(i => i.estado_pago_cur === 'PENDIENTE').length,
        aprobadas: inscripciones.filter(i => i.estado_pago_cur === 'APROBADO').length,
        rechazadas: inscripciones.filter(i => i.estado_pago_cur === 'RECHAZADO').length,
        disponibles: curso.capacidad_max_cur - inscripciones.filter(i => i.estado_pago_cur === 'APROBADO').length
      };

      // Formatear respuesta del curso
      const cursoFormateado = {
        id_cur: curso.id_cur,
        nom_cur: curso.nom_cur,
        des_cur: curso.des_cur,
        dur_cur: curso.dur_cur,
        fec_ini_cur: curso.fec_ini_cur,
        fec_fin_cur: curso.fec_fin_cur,
        capacidad_max_cur: curso.capacidad_max_cur,
        precio: curso.precio,
        es_gratuito: curso.es_gratuito,
        requiere_carta_motivacion: curso.requiere_carta_motivacion,
        tipo_audiencia_cur: curso.tipo_audiencia_cur,
        porcentaje_asistencia_aprobacion: curso.porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion: curso.nota_minima_aprobacion,
        categoria: {
          nom_cat: curso.categoria?.nom_cat || 'Sin categoría',
          des_cat: curso.categoria?.des_cat || ''
        },
        organizador: {
          nombre_completo: `${curso.organizador?.nom_org1 || ''} ${curso.organizador?.nom_org2 || ''} ${curso.organizador?.ape_org1 || ''} ${curso.organizador?.ape_org2 || ''}`.trim(),
          cedula: curso.organizador?.ced_org || '',
          titulo_academico: curso.organizador?.tit_aca_org || ''
        },
        carreras_asociadas: curso.cursosPorCarrera.map(cpc => ({
          id_car: cpc.carrera.id_car,
          nom_car: cpc.carrera.nom_car,
          des_car: cpc.carrera.des_car
        }))
      };

      res.json({
        success: true,
        data: {
          curso: cursoFormateado,
          inscripciones: inscripcionesFormateadas,
          estadisticas
        }
      });

    } catch (error: any) {
      console.error('[getCourseDetailsForAdmin] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
