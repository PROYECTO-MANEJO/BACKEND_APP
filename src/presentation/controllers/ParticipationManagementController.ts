import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";

export class ParticipationManagementController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/admin/participations/events/:eventId/inscriptions
   * Obtener inscripciones de un evento para registrar participación
   */
  public async getEventInscriptionsForParticipation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { search = '' } = req.query;
      const prisma = this.container.getPrismaClient();

      // Construir filtros
      const where: any = {
        id_eve_ins: eventId,
        estado_pago: 'APROBADO' // Solo usuarios con pago aprobado
      };

      if (search) {
        where.usuario = {
          OR: [
            { nom_usu1: { contains: search as string, mode: 'insensitive' } },
            { ape_usu1: { contains: search as string, mode: 'insensitive' } },
            { ced_usu: { contains: search as string } }
          ]
        };
      }

      const inscripciones = await prisma.inscripcion.findMany({
        where,
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
              nom_eve: true,
              fec_ini_eve: true,
              fec_fin_eve: true
            }
          },
          participaciones: {
            select: {
              id_par: true,
              asi_par: true,
              aprobado: true,
              fec_evaluacion: true
            }
          }
        },
        orderBy: [
          { usuario: { ape_usu1: 'asc' } },
          { usuario: { nom_usu1: 'asc' } }
        ]
      });

      const inscripcionesFormateadas = inscripciones.map(ins => ({
        id_ins: ins.id_ins,
        fecha_inscripcion: ins.fec_ins,
        usuario: {
          id_usu: ins.usuario.id_usu,
          cedula: ins.usuario.ced_usu,
          nombre_completo: `${ins.usuario.nom_usu1} ${ins.usuario.nom_usu2 || ''} ${ins.usuario.ape_usu1} ${ins.usuario.ape_usu2 || ''}`.trim(),
          email: ins.usuario.cuentas[0]?.cor_cue
        },
        evento: ins.evento,
        participacion: ins.participaciones[0] || null,
        tiene_participacion: ins.participaciones.length > 0
      }));

      res.json({
        success: true,
        inscripciones: inscripcionesFormateadas,
        total: inscripcionesFormateadas.length
      });

    } catch (error: any) {
      console.error('[getEventInscriptionsForParticipation] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/participations/courses/:courseId/inscriptions
   * Obtener inscripciones de un curso para registrar participación
   */
  public async getCourseInscriptionsForParticipation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { search = '' } = req.query;
      const prisma = this.container.getPrismaClient();

      // Construir filtros
      const where: any = {
        id_cur_ins: courseId,
        estado_pago_cur: 'APROBADO' // Solo usuarios con pago aprobado
      };

      if (search) {
        where.usuario = {
          OR: [
            { nom_usu1: { contains: search as string, mode: 'insensitive' } },
            { ape_usu1: { contains: search as string, mode: 'insensitive' } },
            { ced_usu: { contains: search as string } }
          ]
        };
      }

      const inscripciones = await prisma.inscripcionCurso.findMany({
        where,
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
              nom_cur: true,
              fec_ini_cur: true,
              fec_fin_cur: true,
              nota_minima_aprobacion: true,
              porcentaje_asistencia_aprobacion: true
            }
          },
          participacionesCurso: {
            select: {
              id_par_cur: true,
              nota_final: true,
              asistencia_porcentaje: true,
              aprobado: true,
              fecha_evaluacion: true
            }
          }
        },
        orderBy: [
          { usuario: { ape_usu1: 'asc' } },
          { usuario: { nom_usu1: 'asc' } }
        ]
      });

      const inscripcionesFormateadas = inscripciones.map(ins => ({
        id_ins_cur: ins.id_ins_cur,
        fecha_inscripcion: ins.fec_ins_cur,
        usuario: {
          id_usu: ins.usuario.id_usu,
          cedula: ins.usuario.ced_usu,
          nombre_completo: `${ins.usuario.nom_usu1} ${ins.usuario.nom_usu2 || ''} ${ins.usuario.ape_usu1} ${ins.usuario.ape_usu2 || ''}`.trim(),
          email: ins.usuario.cuentas[0]?.cor_cue
        },
        curso: ins.curso,
        participacion: ins.participacionesCurso[0] || null,
        tiene_participacion: ins.participacionesCurso.length > 0
      }));

      res.json({
        success: true,
        inscripciones: inscripcionesFormateadas,
        total: inscripcionesFormateadas.length
      });

    } catch (error: any) {
      console.error('[getCourseInscriptionsForParticipation] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/participations/events/:eventId/register
   * Registrar participación en evento (solo asistencia)
   */
  public async registerEventParticipation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { inscripcion_id, asistencia_porcentaje } = req.body;
      const prisma = this.container.getPrismaClient();

      // Validar datos requeridos
      if (!inscripcion_id || asistencia_porcentaje === undefined) {
        res.status(400).json({
          success: false,
          message: 'ID de inscripción y porcentaje de asistencia son obligatorios'
        });
        return;
      }

      // Validar porcentaje de asistencia
      const asistencia = parseInt(asistencia_porcentaje);
      if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
        res.status(400).json({
          success: false,
          message: 'El porcentaje de asistencia debe ser un número entre 0 y 100'
        });
        return;
      }

      // Verificar que la inscripción existe y pertenece al evento
      const inscripcion = await prisma.inscripcion.findFirst({
        where: {
          id_ins: inscripcion_id,
          id_eve_ins: eventId
        },
        include: {
          evento: {
            select: {
              nom_eve: true,
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

      // Verificar que el usuario está aprobado (si no es gratuito)
      if (!inscripcion.evento.es_gratuito && inscripcion.estado_pago !== 'APROBADO') {
        res.status(400).json({
          success: false,
          message: 'Solo se puede registrar asistencia de usuarios con pago aprobado'
        });
        return;
      }

      // Calcular aprobación (80% mínimo de asistencia para eventos)
      const aprobado = asistencia >= 80;

      // Verificar si ya existe participación
      const existeParticipacion = await prisma.participacion.findFirst({
        where: { id_ins_per: inscripcion_id }
      });

      let participacion;
      if (existeParticipacion) {
        // Actualizar participación existente
        participacion = await prisma.participacion.update({
          where: { id_par: existeParticipacion.id_par },
          data: {
            asi_par: asistencia,
            aprobado: aprobado,
            fec_evaluacion: new Date()
          }
        });
      } else {
        // Crear nueva participación
        participacion = await prisma.participacion.create({
          data: {
            id_ins_per: inscripcion_id,
            asi_par: asistencia,
            aprobado: aprobado,
            fec_evaluacion: new Date()
          }
        });
      }

      res.json({
        success: true,
        message: `Participación de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} registrada exitosamente`,
        data: {
          participacion,
          aprobado,
          asistencia_porcentaje: asistencia,
          evento: inscripcion.evento.nom_eve
        }
      });

    } catch (error: any) {
      console.error('[registerEventParticipation] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/participations/courses/:courseId/register
   * Registrar participación en curso (asistencia y calificación)
   */
  public async registerCourseParticipation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { inscripcion_id, nota_final, asistencia_porcentaje } = req.body;
      const prisma = this.container.getPrismaClient();

      // Validar datos requeridos
      if (!inscripcion_id || nota_final === undefined || asistencia_porcentaje === undefined) {
        res.status(400).json({
          success: false,
          message: 'ID de inscripción, nota final y porcentaje de asistencia son obligatorios'
        });
        return;
      }

      // Validar nota final
      const nota = parseFloat(nota_final);
      if (isNaN(nota) || nota < 0 || nota > 100) {
        res.status(400).json({
          success: false,
          message: 'La nota final debe ser un número entre 0 y 100'
        });
        return;
      }

      // Validar porcentaje de asistencia
      const asistencia = parseFloat(asistencia_porcentaje);
      if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
        res.status(400).json({
          success: false,
          message: 'El porcentaje de asistencia debe ser un número entre 0 y 100'
        });
        return;
      }

      // Verificar que la inscripción existe y pertenece al curso
      const inscripcion = await prisma.inscripcionCurso.findFirst({
        where: {
          id_ins_cur: inscripcion_id,
          id_cur_ins: courseId
        },
        include: {
          curso: {
            select: {
              nom_cur: true,
              es_gratuito: true,
              nota_minima_aprobacion: true,
              porcentaje_asistencia_aprobacion: true
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

      // Verificar que el usuario está aprobado (si no es gratuito)
      if (!inscripcion.curso.es_gratuito && inscripcion.estado_pago_cur !== 'APROBADO') {
        res.status(400).json({
          success: false,
          message: 'Solo se puede registrar calificación de usuarios con pago aprobado'
        });
        return;
      }

      // Calcular aprobación usando los criterios específicos del curso
      const notaMinima = Number(inscripcion.curso.nota_minima_aprobacion) || 70.0;
      const asistenciaMinima = Number(inscripcion.curso.porcentaje_asistencia_aprobacion) || 75.0;
      
      const aprobado = nota >= notaMinima && asistencia >= asistenciaMinima;

      // Verificar si ya existe participación
      const existeParticipacion = await prisma.participacionCurso.findFirst({
        where: { id_ins_cur_per: inscripcion_id }
      });

      if (existeParticipacion) {
        res.status(400).json({
          success: false,
          message: 'La calificación y asistencia de este usuario ya han sido registradas y no se pueden modificar'
        });
        return;
      }

      // Crear nueva participación
      const participacion = await prisma.participacionCurso.create({
        data: {
          id_ins_cur_per: inscripcion_id,
          nota_final: nota,
          asistencia_porcentaje: asistencia,
          aprobado: aprobado,
          fecha_evaluacion: new Date()
        }
      });

      res.json({
        success: true,
        message: `Calificación de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} registrada exitosamente`,
        data: {
          participacion,
          aprobado,
          nota_final: nota,
          asistencia_porcentaje: asistencia,
          nota_minima_requerida: notaMinima,
          asistencia_minima_requerida: asistenciaMinima,
          curso: inscripcion.curso.nom_cur
        }
      });

    } catch (error: any) {
      console.error('[registerCourseParticipation] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/participations/events/:participationId
   * Actualizar participación de evento
   */
  public async updateEventParticipation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { participationId } = req.params;
      const { asistencia_porcentaje } = req.body;
      const prisma = this.container.getPrismaClient();

      // Validar porcentaje de asistencia
      const asistencia = parseInt(asistencia_porcentaje);
      if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
        res.status(400).json({
          success: false,
          message: 'El porcentaje de asistencia debe ser un número entre 0 y 100'
        });
        return;
      }

      // Verificar que la participación existe
      const participacionExistente = await prisma.participacion.findUnique({
        where: { id_par: participationId },
        include: {
          inscripcion: {
            include: {
              usuario: {
                select: {
                  nom_usu1: true,
                  ape_usu1: true
                }
              }
            }
          }
        }
      });

      if (!participacionExistente) {
        res.status(404).json({
          success: false,
          message: 'Participación no encontrada'
        });
        return;
      }

      // Calcular nueva aprobación
      const aprobado = asistencia >= 80;

      // Actualizar participación
      const participacionActualizada = await prisma.participacion.update({
        where: { id_par: participationId },
        data: {
          asi_par: asistencia,
          aprobado: aprobado,
          fec_evaluacion: new Date()
        }
      });

      res.json({
        success: true,
        message: `Participación de ${participacionExistente.inscripcion.usuario.nom_usu1} ${participacionExistente.inscripcion.usuario.ape_usu1} actualizada exitosamente`,
        data: participacionActualizada
      });

    } catch (error: any) {
      console.error('[updateEventParticipation] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/participations/events/:eventId/stats
   * Obtener estadísticas de participación de un evento
   */
  public async getEventParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const prisma = this.container.getPrismaClient();

      const [
        totalInscritos,
        totalParticipaciones,
        aprobados,
        promedioAsistencia,
        evento
      ] = await Promise.all([
        prisma.inscripcion.count({
          where: {
            id_eve_ins: eventId,
            estado_pago: 'APROBADO'
          }
        }),
        prisma.participacion.count({
          where: {
            inscripcion: {
              id_eve_ins: eventId
            }
          }
        }),
        prisma.participacion.count({
          where: {
            inscripcion: {
              id_eve_ins: eventId
            },
            aprobado: true
          }
        }),
        prisma.participacion.aggregate({
          where: {
            inscripcion: {
              id_eve_ins: eventId
            }
          },
          _avg: {
            asi_par: true
          }
        }),
        prisma.evento.findUnique({
          where: { id_eve: eventId },
          select: {
            nom_eve: true,
            fec_ini_eve: true,
            fec_fin_eve: true
          }
        })
      ]);

      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
        return;
      }

      const porcentajeParticipacion = totalInscritos > 0 ? (totalParticipaciones / totalInscritos) * 100 : 0;
      const porcentajeAprobacion = totalParticipaciones > 0 ? (aprobados / totalParticipaciones) * 100 : 0;

      res.json({
        success: true,
        evento: evento,
        stats: {
          total_inscritos: totalInscritos,
          total_participaciones: totalParticipaciones,
          pendientes_evaluacion: totalInscritos - totalParticipaciones,
          aprobados: aprobados,
          reprobados: totalParticipaciones - aprobados,
          porcentaje_participacion: Math.round(porcentajeParticipacion * 100) / 100,
          porcentaje_aprobacion: Math.round(porcentajeAprobacion * 100) / 100,
          promedio_asistencia: Math.round((promedioAsistencia._avg.asi_par || 0) * 100) / 100
        }
      });

    } catch (error: any) {
      console.error('[getEventParticipationStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/participations/courses/:courseId/stats
   * Obtener estadísticas de participación de un curso
   */
  public async getCourseParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const prisma = this.container.getPrismaClient();

      const [
        totalInscritos,
        totalParticipaciones,
        aprobados,
        promedios,
        curso
      ] = await Promise.all([
        prisma.inscripcionCurso.count({
          where: {
            id_cur_ins: courseId,
            estado_pago_cur: 'APROBADO'
          }
        }),
        prisma.participacionCurso.count({
          where: {
            inscripcionCurso: {
              id_cur_ins: courseId
            }
          }
        }),
        prisma.participacionCurso.count({
          where: {
            inscripcionCurso: {
              id_cur_ins: courseId
            },
            aprobado: true
          }
        }),
        prisma.participacionCurso.aggregate({
          where: {
            inscripcionCurso: {
              id_cur_ins: courseId
            }
          },
          _avg: {
            nota_final: true,
            asistencia_porcentaje: true
          }
        }),
        prisma.curso.findUnique({
          where: { id_cur: courseId },
          select: {
            nom_cur: true,
            fec_ini_cur: true,
            fec_fin_cur: true,
            nota_minima_aprobacion: true,
            porcentaje_asistencia_aprobacion: true
          }
        })
      ]);

      if (!curso) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      const porcentajeParticipacion = totalInscritos > 0 ? (totalParticipaciones / totalInscritos) * 100 : 0;
      const porcentajeAprobacion = totalParticipaciones > 0 ? (aprobados / totalParticipaciones) * 100 : 0;

      res.json({
        success: true,
        curso: curso,
        stats: {
          total_inscritos: totalInscritos,
          total_participaciones: totalParticipaciones,
          pendientes_evaluacion: totalInscritos - totalParticipaciones,
          aprobados: aprobados,
          reprobados: totalParticipaciones - aprobados,
          porcentaje_participacion: Math.round(porcentajeParticipacion * 100) / 100,
          porcentaje_aprobacion: Math.round(porcentajeAprobacion * 100) / 100,
          promedio_nota: Math.round((Number(promedios._avg.nota_final) || 0) * 100) / 100,
          promedio_asistencia: Math.round((Number(promedios._avg.asistencia_porcentaje) || 0) * 100) / 100,
          criterios: {
            nota_minima: Number(curso.nota_minima_aprobacion) || 70,
            asistencia_minima: Number(curso.porcentaje_asistencia_aprobacion) || 75
          }
        }
      });

    } catch (error: any) {
      console.error('[getCourseParticipationStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/participations/general-stats
   * Obtener estadísticas generales de participaciones
   */
  public async getGeneralParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const [
        eventStats,
        courseStats
      ] = await Promise.all([
        // Estadísticas de eventos
        Promise.all([
          prisma.participacion.count(),
          prisma.participacion.count({ where: { aprobado: true } }),
          prisma.participacion.aggregate({
            _avg: { asi_par: true }
          })
        ]),
        // Estadísticas de cursos
        Promise.all([
          prisma.participacionCurso.count(),
          prisma.participacionCurso.count({ where: { aprobado: true } }),
          prisma.participacionCurso.aggregate({
            _avg: { 
              nota_final: true,
              asistencia_porcentaje: true
            }
          })
        ])
      ]);

      const [totalEventParticipations, approvedEventParticipations, avgEventAttendance] = eventStats;
      const [totalCourseParticipations, approvedCourseParticipations, avgCourseStats] = courseStats;

      res.json({
        success: true,
        stats: {
          eventos: {
            total_participaciones: totalEventParticipations,
            aprobados: approvedEventParticipations,
            reprobados: totalEventParticipations - approvedEventParticipations,
            porcentaje_aprobacion: totalEventParticipations > 0 
              ? Math.round((approvedEventParticipations / totalEventParticipations) * 10000) / 100
              : 0,
            promedio_asistencia: Math.round((avgEventAttendance._avg.asi_par || 0) * 100) / 100
          },
          cursos: {
            total_participaciones: totalCourseParticipations,
            aprobados: approvedCourseParticipations,
            reprobados: totalCourseParticipations - approvedCourseParticipations,
            porcentaje_aprobacion: totalCourseParticipations > 0 
              ? Math.round((approvedCourseParticipations / totalCourseParticipations) * 10000) / 100
              : 0,
            promedio_nota: Math.round((Number(avgCourseStats._avg.nota_final) || 0) * 100) / 100,
            promedio_asistencia: Math.round((Number(avgCourseStats._avg.asistencia_porcentaje) || 0) * 100) / 100
          },
          totales: {
            total_participaciones: totalEventParticipations + totalCourseParticipations,
            total_aprobados: approvedEventParticipations + approvedCourseParticipations,
            total_reprobados: (totalEventParticipations - approvedEventParticipations) + (totalCourseParticipations - approvedCourseParticipations)
          }
        }
      });

    } catch (error: any) {
      console.error('[getGeneralParticipationStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
