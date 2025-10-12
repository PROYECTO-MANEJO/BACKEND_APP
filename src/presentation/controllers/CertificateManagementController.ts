import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
import PDFDocument from "pdfkit";

export class CertificateManagementController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/admin/certificates/events/:eventId/participants
   * Obtener participantes aprobados de un evento para generar certificados
   */
  public async getEventApprovedParticipants(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { search = '' } = req.query;
      const prisma = this.container.getPrismaClient();

      // Construir filtros
      const where: any = {
        inscripcion: {
          id_eve_ins: eventId,
          estado_pago: 'APROBADO'
        },
        aprobado: true
      };

      if (search) {
        where.inscripcion = {
          ...where.inscripcion,
          usuario: {
            OR: [
              { nom_usu1: { contains: search as string, mode: 'insensitive' } },
              { ape_usu1: { contains: search as string, mode: 'insensitive' } },
              { ced_usu: { contains: search as string } }
            ]
          }
        };
      }

      const participaciones = await prisma.participacion.findMany({
        where,
        include: {
          inscripcion: {
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
              }
            }
          }
        },
        orderBy: [
          { inscripcion: { usuario: { ape_usu1: 'asc' } } },
          { inscripcion: { usuario: { nom_usu1: 'asc' } } }
        ]
      });

      const participantesFormateados = participaciones.map(part => ({
        id_par: part.id_par,
        asistencia: part.asi_par,
        aprobado: part.aprobado,
        fecha_evaluacion: part.fec_evaluacion,
        tiene_certificado: !!part.certificado_pdf,
        fecha_certificado: part.fec_cer_par,
        usuario: {
          id_usu: part.inscripcion.usuario.id_usu,
          cedula: part.inscripcion.usuario.ced_usu,
          nombre_completo: `${part.inscripcion.usuario.nom_usu1} ${part.inscripcion.usuario.nom_usu2 || ''} ${part.inscripcion.usuario.ape_usu1} ${part.inscripcion.usuario.ape_usu2 || ''}`.trim(),
          email: part.inscripcion.usuario.cuentas[0]?.cor_cue
        },
        evento: part.inscripcion.evento
      }));

      res.json({
        success: true,
        participantes: participantesFormateados,
        total: participantesFormateados.length
      });

    } catch (error: any) {
      console.error('[getEventApprovedParticipants] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/certificates/courses/:courseId/participants
   * Obtener participantes aprobados de un curso para generar certificados
   */
  public async getCourseApprovedParticipants(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { search = '' } = req.query;
      const prisma = this.container.getPrismaClient();

      // Construir filtros
      const where: any = {
        inscripcionCurso: {
          id_cur_ins: courseId,
          estado_pago_cur: 'APROBADO'
        },
        aprobado: true
      };

      if (search) {
        where.inscripcionCurso = {
          ...where.inscripcionCurso,
          usuario: {
            OR: [
              { nom_usu1: { contains: search as string, mode: 'insensitive' } },
              { ape_usu1: { contains: search as string, mode: 'insensitive' } },
              { ced_usu: { contains: search as string } }
            ]
          }
        };
      }

      const participaciones = await prisma.participacionCurso.findMany({
        where,
        include: {
          inscripcionCurso: {
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
                  fec_fin_cur: true
                }
              }
            }
          }
        },
        orderBy: [
          { inscripcionCurso: { usuario: { ape_usu1: 'asc' } } },
          { inscripcionCurso: { usuario: { nom_usu1: 'asc' } } }
        ]
      });

      const participantesFormateados = participaciones.map(part => ({
        id_par_cur: part.id_par_cur,
        nota_final: Number(part.nota_final),
        asistencia: Number(part.asistencia_porcentaje),
        aprobado: part.aprobado,
        fecha_evaluacion: part.fecha_evaluacion,
        tiene_certificado: !!part.certificado_pdf,
        fecha_certificado: part.fec_cer_par_cur,
        usuario: {
          id_usu: part.inscripcionCurso.usuario.id_usu,
          cedula: part.inscripcionCurso.usuario.ced_usu,
          nombre_completo: `${part.inscripcionCurso.usuario.nom_usu1} ${part.inscripcionCurso.usuario.nom_usu2 || ''} ${part.inscripcionCurso.usuario.ape_usu1} ${part.inscripcionCurso.usuario.ape_usu2 || ''}`.trim(),
          email: part.inscripcionCurso.usuario.cuentas[0]?.cor_cue
        },
        curso: part.inscripcionCurso.curso
      }));

      res.json({
        success: true,
        participantes: participantesFormateados,
        total: participantesFormateados.length
      });

    } catch (error: any) {
      console.error('[getCourseApprovedParticipants] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/certificates/events/generate-massive
   * Generar certificados masivamente para un evento
   */
  public async generateMassiveEventCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId, participantIds } = req.body;
      const prisma = this.container.getPrismaClient();

      if (!eventId || !participantIds || !Array.isArray(participantIds)) {
        res.status(400).json({
          success: false,
          message: 'ID del evento y lista de participantes son obligatorios'
        });
        return;
      }

      // Obtener datos del evento
      const evento = await prisma.evento.findUnique({
        where: { id_eve: eventId },
        include: {
          categoria: true,
          organizador: true
        }
      });

      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
        return;
      }

      // Obtener participaciones aprobadas
      const participaciones = await prisma.participacion.findMany({
        where: {
          id_par: { in: participantIds },
          aprobado: true,
          inscripcion: {
            id_eve_ins: eventId
          }
        },
        include: {
          inscripcion: {
            include: {
              usuario: true
            }
          }
        }
      });

      const resultados = [];
      let exitosos = 0;
      let fallidos = 0;

      // Generar certificados uno por uno
      for (const participacion of participaciones) {
        try {
          // Verificar si ya tiene certificado
          if (participacion.certificado_pdf) {
            resultados.push({
              participante: `${participacion.inscripcion.usuario.nom_usu1} ${participacion.inscripcion.usuario.ape_usu1}`,
              estado: 'ya_existe',
              mensaje: 'Ya tiene certificado generado'
            });
            continue;
          }

          // Generar PDF del certificado
          const certificadoBuffer = await this.generateEventCertificatePDF(evento, participacion);
          const nombreArchivo = `certificado_evento_${evento.id_eve}_${participacion.id_par}_${Date.now()}.pdf`;

          // Guardar certificado en la base de datos
          await prisma.participacion.update({
            where: { id_par: participacion.id_par },
            data: {
              certificado_pdf: certificadoBuffer,
              certificado_filename: nombreArchivo,
              certificado_size: certificadoBuffer.length,
              fec_cer_par: new Date()
            }
          });

          resultados.push({
            participante: `${participacion.inscripcion.usuario.nom_usu1} ${participacion.inscripcion.usuario.ape_usu1}`,
            estado: 'generado',
            mensaje: 'Certificado generado exitosamente'
          });
          exitosos++;

        } catch (error: any) {
          console.error(`Error generando certificado para participación ${participacion.id_par}:`, error);
          resultados.push({
            participante: `${participacion.inscripcion.usuario.nom_usu1} ${participacion.inscripcion.usuario.ape_usu1}`,
            estado: 'error',
            mensaje: 'Error al generar certificado'
          });
          fallidos++;
        }
      }

      res.json({
        success: true,
        message: `Proceso completado: ${exitosos} certificados generados, ${fallidos} errores`,
        stats: {
          total_procesados: participaciones.length,
          exitosos,
          fallidos,
          ya_existentes: resultados.filter(r => r.estado === 'ya_existe').length
        },
        resultados
      });

    } catch (error: any) {
      console.error('[generateMassiveEventCertificates] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/certificates/courses/generate-massive
   * Generar certificados masivamente para un curso
   */
  public async generateMassiveCourseCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, participantIds } = req.body;
      const prisma = this.container.getPrismaClient();

      if (!courseId || !participantIds || !Array.isArray(participantIds)) {
        res.status(400).json({
          success: false,
          message: 'ID del curso y lista de participantes son obligatorios'
        });
        return;
      }

      // Obtener datos del curso
      const curso = await prisma.curso.findUnique({
        where: { id_cur: courseId },
        include: {
          categoria: true,
          organizador: true
        }
      });

      if (!curso) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Obtener participaciones aprobadas
      const participaciones = await prisma.participacionCurso.findMany({
        where: {
          id_par_cur: { in: participantIds },
          aprobado: true,
          inscripcionCurso: {
            id_cur_ins: courseId
          }
        },
        include: {
          inscripcionCurso: {
            include: {
              usuario: true
            }
          }
        }
      });

      const resultados = [];
      let exitosos = 0;
      let fallidos = 0;

      // Generar certificados uno por uno
      for (const participacion of participaciones) {
        try {
          // Verificar si ya tiene certificado
          if (participacion.certificado_pdf) {
            resultados.push({
              participante: `${participacion.inscripcionCurso.usuario.nom_usu1} ${participacion.inscripcionCurso.usuario.ape_usu1}`,
              estado: 'ya_existe',
              mensaje: 'Ya tiene certificado generado'
            });
            continue;
          }

          // Generar PDF del certificado
          const certificadoBuffer = await this.generateCourseCertificatePDF(curso, participacion);
          const nombreArchivo = `certificado_curso_${curso.id_cur}_${participacion.id_par_cur}_${Date.now()}.pdf`;

          // Guardar certificado en la base de datos
          await prisma.participacionCurso.update({
            where: { id_par_cur: participacion.id_par_cur },
            data: {
              certificado_pdf: certificadoBuffer,
              certificado_filename: nombreArchivo,
              certificado_size: certificadoBuffer.length,
              fec_cer_par_cur: new Date()
            }
          });

          resultados.push({
            participante: `${participacion.inscripcionCurso.usuario.nom_usu1} ${participacion.inscripcionCurso.usuario.ape_usu1}`,
            estado: 'generado',
            mensaje: 'Certificado generado exitosamente'
          });
          exitosos++;

        } catch (error: any) {
          console.error(`Error generando certificado para participación ${participacion.id_par_cur}:`, error);
          resultados.push({
            participante: `${participacion.inscripcionCurso.usuario.nom_usu1} ${participacion.inscripcionCurso.usuario.ape_usu1}`,
            estado: 'error',
            mensaje: 'Error al generar certificado'
          });
          fallidos++;
        }
      }

      res.json({
        success: true,
        message: `Proceso completado: ${exitosos} certificados generados, ${fallidos} errores`,
        stats: {
          total_procesados: participaciones.length,
          exitosos,
          fallidos,
          ya_existentes: resultados.filter(r => r.estado === 'ya_existe').length
        },
        resultados
      });

    } catch (error: any) {
      console.error('[generateMassiveCourseCertificates] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/certificates/regenerate/:type/:participationId
   * Regenerar certificado individual (admin)
   */
  public async regenerateCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, participationId } = req.params;
      const prisma = this.container.getPrismaClient();

      // Validar que los parámetros existan
      if (!type || !participationId) {
        res.status(400).json({
          success: false,
          message: 'Parámetros type y participationId son obligatorios'
        });
        return;
      }

      if (!['evento', 'curso'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo debe ser "evento" o "curso"'
        });
        return;
      }

      if (type === 'evento') {
        // Regenerar certificado de evento
        const participacion = await prisma.participacion.findUnique({
          where: { id_par: participationId },
          include: {
            inscripcion: {
              include: {
                evento: {
                  include: {
                    categoria: true,
                    organizador: true
                  }
                },
                usuario: true
              }
            }
          }
        });

        if (!participacion || !participacion.aprobado) {
          res.status(400).json({
            success: false,
            message: 'No se puede regenerar certificado para participación no aprobada'
          });
          return;
        }

        // Generar nuevo certificado
        const certificadoBuffer = await this.generateEventCertificatePDF(participacion.inscripcion.evento, participacion);
        const nombreArchivo = `certificado_evento_${participacion.inscripcion.id_eve_ins}_${participacion.inscripcion.id_ins}_${Date.now()}.pdf`;

        await prisma.participacion.update({
          where: { id_par: participationId },
          data: {
            certificado_pdf: certificadoBuffer,
            certificado_filename: nombreArchivo,
            certificado_size: certificadoBuffer.length,
            fec_cer_par: new Date()
          }
        });

        res.json({
          success: true,
          message: `Certificado de evento regenerado para ${participacion.inscripcion.usuario.nom_usu1} ${participacion.inscripcion.usuario.ape_usu1}`,
          filename: nombreArchivo
        });

      } else {
        // Regenerar certificado de curso
        const participacion = await prisma.participacionCurso.findUnique({
          where: { id_par_cur: participationId },
          include: {
            inscripcionCurso: {
              include: {
                curso: {
                  include: {
                    categoria: true,
                    organizador: true
                  }
                },
                usuario: true
              }
            }
          }
        });

        if (!participacion || !participacion.aprobado) {
          res.status(400).json({
            success: false,
            message: 'No se puede regenerar certificado para participación no aprobada'
          });
          return;
        }

        // Generar nuevo certificado
        const certificadoBuffer = await this.generateCourseCertificatePDF(participacion.inscripcionCurso.curso, participacion);
        const nombreArchivo = `certificado_curso_${participacion.inscripcionCurso.id_cur_ins}_${participacion.inscripcionCurso.id_ins_cur}_${Date.now()}.pdf`;

        await prisma.participacionCurso.update({
          where: { id_par_cur: participationId },
          data: {
            certificado_pdf: certificadoBuffer,
            certificado_filename: nombreArchivo,
            certificado_size: certificadoBuffer.length,
            fec_cer_par_cur: new Date()
          }
        });

        res.json({
          success: true,
          message: `Certificado de curso regenerado para ${participacion.inscripcionCurso.usuario.nom_usu1} ${participacion.inscripcionCurso.usuario.ape_usu1}`,
          filename: nombreArchivo
        });
      }

    } catch (error: any) {
      console.error('[regenerateCertificate] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/certificates/stats
   * Obtener estadísticas de certificados
   */
  public async getCertificateStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const [
        eventCertificateStats,
        courseCertificateStats
      ] = await Promise.all([
        // Estadísticas de certificados de eventos
        Promise.all([
          prisma.participacion.count({ where: { aprobado: true } }),
          prisma.participacion.count({ 
            where: { 
              aprobado: true, 
              certificado_pdf: { not: null } 
            } 
          }),
          prisma.participacion.count({
            where: {
              aprobado: true,
              certificado_pdf: { not: null },
              fec_cer_par: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
              }
            }
          })
        ]),
        // Estadísticas de certificados de cursos
        Promise.all([
          prisma.participacionCurso.count({ where: { aprobado: true } }),
          prisma.participacionCurso.count({ 
            where: { 
              aprobado: true, 
              certificado_pdf: { not: null } 
            } 
          }),
          prisma.participacionCurso.count({
            where: {
              aprobado: true,
              certificado_pdf: { not: null },
              fec_cer_par_cur: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
              }
            }
          })
        ])
      ]);

      const [totalEventApproved, eventCertificatesGenerated, recentEventCertificates] = eventCertificateStats;
      const [totalCourseApproved, courseCertificatesGenerated, recentCourseCertificates] = courseCertificateStats;

      const eventPendingCertificates = totalEventApproved - eventCertificatesGenerated;
      const coursePendingCertificates = totalCourseApproved - courseCertificatesGenerated;

      res.json({
        success: true,
        stats: {
          eventos: {
            total_aprobados: totalEventApproved,
            certificados_generados: eventCertificatesGenerated,
            pendientes_certificado: eventPendingCertificates,
            porcentaje_completado: totalEventApproved > 0 
              ? Math.round((eventCertificatesGenerated / totalEventApproved) * 10000) / 100
              : 0,
            generados_ultimos_30_dias: recentEventCertificates
          },
          cursos: {
            total_aprobados: totalCourseApproved,
            certificados_generados: courseCertificatesGenerated,
            pendientes_certificado: coursePendingCertificates,
            porcentaje_completado: totalCourseApproved > 0 
              ? Math.round((courseCertificatesGenerated / totalCourseApproved) * 10000) / 100
              : 0,
            generados_ultimos_30_dias: recentCourseCertificates
          },
          totales: {
            total_aprobados: totalEventApproved + totalCourseApproved,
            total_certificados: eventCertificatesGenerated + courseCertificatesGenerated,
            total_pendientes: eventPendingCertificates + coursePendingCertificates,
            total_recientes: recentEventCertificates + recentCourseCertificates
          }
        }
      });

    } catch (error: any) {
      console.error('[getCertificateStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar PDF de certificado de evento
   */
  private async generateEventCertificatePDF(evento: any, participacion: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        const usuario = participacion.inscripcion.usuario;
        const nombreCompleto = `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim();

        // Configurar fuentes y colores
        const colorPrimario = '#1a365d';
        const colorSecundario = '#2d3748';

        // Título principal
        doc.fontSize(28)
           .fillColor(colorPrimario)
           .text('CERTIFICADO DE PARTICIPACIÓN', 0, 100, { align: 'center' });

        // Línea decorativa
        doc.moveTo(150, 150)
           .lineTo(650, 150)
           .strokeColor(colorPrimario)
           .lineWidth(3)
           .stroke();

        // Texto principal
        doc.fontSize(16)
           .fillColor(colorSecundario)
           .text('Se certifica que', 0, 200, { align: 'center' });

        // Nombre del participante
        doc.fontSize(24)
           .fillColor(colorPrimario)
           .text(nombreCompleto, 0, 240, { align: 'center' });

        // Texto del evento
        doc.fontSize(16)
           .fillColor(colorSecundario)
           .text('participó exitosamente en el evento', 0, 290, { align: 'center' });

        // Nombre del evento
        doc.fontSize(20)
           .fillColor(colorPrimario)
           .text(`"${evento.nom_eve}"`, 0, 330, { align: 'center' });

        // Fechas
        const fechaInicio = new Date(evento.fec_ini_eve).toLocaleDateString('es-ES');
        const fechaFin = evento.fec_fin_eve ? new Date(evento.fec_fin_eve).toLocaleDateString('es-ES') : fechaInicio;
        
        doc.fontSize(14)
           .fillColor(colorSecundario)
           .text(`Realizado del ${fechaInicio} al ${fechaFin}`, 0, 380, { align: 'center' });

        // Asistencia
        doc.fontSize(12)
           .text(`Asistencia: ${participacion.asi_par}%`, 0, 410, { align: 'center' });

        // Organizador
        if (evento.organizador) {
          const nombreOrganizador = `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`;
          doc.fontSize(12)
             .text(`Organizador: ${nombreOrganizador}`, 0, 450, { align: 'center' });
        }

        // Fecha de emisión
        doc.fontSize(10)
           .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 0, 500, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generar PDF de certificado de curso
   */
  private async generateCourseCertificatePDF(curso: any, participacion: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        const usuario = participacion.inscripcionCurso.usuario;
        const nombreCompleto = `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim();

        // Configurar fuentes y colores
        const colorPrimario = '#1a365d';
        const colorSecundario = '#2d3748';

        // Título principal
        doc.fontSize(28)
           .fillColor(colorPrimario)
           .text('CERTIFICADO DE APROBACIÓN', 0, 100, { align: 'center' });

        // Línea decorativa
        doc.moveTo(150, 150)
           .lineTo(650, 150)
           .strokeColor(colorPrimario)
           .lineWidth(3)
           .stroke();

        // Texto principal
        doc.fontSize(16)
           .fillColor(colorSecundario)
           .text('Se certifica que', 0, 200, { align: 'center' });

        // Nombre del participante
        doc.fontSize(24)
           .fillColor(colorPrimario)
           .text(nombreCompleto, 0, 240, { align: 'center' });

        // Texto del curso
        doc.fontSize(16)
           .fillColor(colorSecundario)
           .text('aprobó satisfactoriamente el curso', 0, 290, { align: 'center' });

        // Nombre del curso
        doc.fontSize(20)
           .fillColor(colorPrimario)
           .text(`"${curso.nom_cur}"`, 0, 330, { align: 'center' });

        // Fechas
        const fechaInicio = new Date(curso.fec_ini_cur).toLocaleDateString('es-ES');
        const fechaFin = new Date(curso.fec_fin_cur).toLocaleDateString('es-ES');
        
        doc.fontSize(14)
           .fillColor(colorSecundario)
           .text(`Realizado del ${fechaInicio} al ${fechaFin}`, 0, 370, { align: 'center' });

        // Calificaciones
        doc.fontSize(12)
           .text(`Nota Final: ${Number(participacion.nota_final).toFixed(1)}/100`, 0, 400, { align: 'center' })
           .text(`Asistencia: ${Number(participacion.asistencia_porcentaje).toFixed(1)}%`, 0, 420, { align: 'center' });

        // Organizador
        if (curso.organizador) {
          const nombreOrganizador = `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`;
          doc.fontSize(12)
             .text(`Organizador: ${nombreOrganizador}`, 0, 460, { align: 'center' });
        }

        // Fecha de emisión
        doc.fontSize(10)
           .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 0, 500, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}
