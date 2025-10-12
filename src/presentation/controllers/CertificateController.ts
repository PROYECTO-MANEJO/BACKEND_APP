import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

/**
 * Controlador para gestión de certificados
 * Maneja todas las operaciones relacionadas con certificados
 */
export class CertificateController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/certificates/my-certificates
   * Obtener certificados del usuario autenticado
   */
  public async getUserCertificates(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = (req as any).uid; // From JWT middleware
      const prisma = this.container.getPrismaClient();

      // Obtener certificados de eventos
      const certificadosEventos = await prisma.participacion.findMany({
        where: {
          inscripcion: {
            id_usu_ins: userId
          },
          aprobado: true,
          certificado_pdf: {
            not: null
          }
        },
        include: {
          inscripcion: {
            include: {
              evento: {
                select: {
                  id_eve: true,
                  nom_eve: true,
                  fec_ini_eve: true,
                  fec_fin_eve: true,
                  categoria: {
                    select: {
                      nom_cat: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Obtener certificados de cursos
      const certificadosCursos = await prisma.participacionCurso.findMany({
        where: {
          inscripcionCurso: {
            id_usu_ins_cur: userId
          },
          aprobado: true,
          certificado_pdf: {
            not: null
          }
        },
        include: {
          inscripcionCurso: {
            include: {
              curso: {
                select: {
                  id_cur: true,
                  nom_cur: true,
                  fec_ini_cur: true,
                  fec_fin_cur: true,
                  categoria: {
                    select: {
                      nom_cat: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Formatear certificados de eventos
      const eventosFormateados = certificadosEventos.map(cert => ({
        id: cert.id_par,
        tipo: 'evento' as const,
        nombre: cert.inscripcion.evento.nom_eve,
        categoria: cert.inscripcion.evento.categoria.nom_cat,
        fecha_inicio: cert.inscripcion.evento.fec_ini_eve,
        fecha_fin: cert.inscripcion.evento.fec_fin_eve,
        fecha_certificado: cert.fec_cer_par,
        filename: cert.certificado_filename,
        size: cert.certificado_size,
        asistencia: cert.asi_par,
        nota: null, // Los eventos no tienen nota, solo asistencia
        aprobado: cert.aprobado
      }));

      // Formatear certificados de cursos
      const cursosFormateados = certificadosCursos.map(cert => ({
        id: cert.id_par_cur,
        tipo: 'curso' as const,
        nombre: cert.inscripcionCurso.curso.nom_cur,
        categoria: cert.inscripcionCurso.curso.categoria.nom_cat,
        fecha_inicio: cert.inscripcionCurso.curso.fec_ini_cur,
        fecha_fin: cert.inscripcionCurso.curso.fec_fin_cur,
        fecha_certificado: cert.fec_cer_par_cur,
        filename: cert.certificado_filename,
        size: cert.certificado_size,
        asistencia: cert.asistencia_porcentaje,
        nota: cert.nota_final,
        aprobado: cert.aprobado
      }));

      // Combinar y ordenar por fecha de certificado
      const todosCertificados = [...eventosFormateados, ...cursosFormateados]
        .sort((a, b) => new Date(b.fecha_certificado || 0).getTime() - new Date(a.fecha_certificado || 0).getTime());

      return {
        success: true,
        certificados: todosCertificados,
        total: todosCertificados.length,
        eventos: eventosFormateados.length,
        cursos: cursosFormateados.length
      };
    });
  }

  /**
   * GET /api/certificates/download/:tipo/:idParticipacion
   * Descargar certificado en PDF
   */
  public async downloadCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { tipo, idParticipacion } = req.params;
      const userId = (req as any).uid; // From JWT middleware
      const prisma = this.container.getPrismaClient();

      let participacion = null;

      if (tipo === 'evento') {
        participacion = await prisma.participacion.findFirst({
          where: {
            id_par: idParticipacion,
            inscripcion: {
              id_usu_ins: userId
            }
          },
          include: {
            inscripcion: {
              include: {
                evento: true,
                usuario: true
              }
            }
          }
        });
      } else if (tipo === 'curso') {
        participacion = await prisma.participacionCurso.findFirst({
          where: {
            id_par_cur: idParticipacion,
            inscripcionCurso: {
              id_usu_ins_cur: userId
            }
          },
          include: {
            inscripcionCurso: {
              include: {
                curso: true,
                usuario: true
              }
            }
          }
        });
      }

      if (!participacion) {
        res.status(404).json({
          success: false,
          message: 'Participación no encontrada'
        });
        return;
      }

      // Verificar que el certificado existe
      const certificadoPdf = tipo === 'evento' ? participacion.certificado_pdf : participacion.certificado_pdf;
      const filename = tipo === 'evento' ? participacion.certificado_filename : participacion.certificado_filename;

      if (!certificadoPdf) {
        res.status(404).json({
          success: false,
          message: 'Certificado no encontrado. Debe generar el certificado primero.'
        });
        return;
      }

      // Configurar headers para descarga de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', certificadoPdf.length);

      // Enviar el PDF
      res.send(certificadoPdf);

    } catch (error: any) {
      console.error('❌ Error al descargar certificado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}