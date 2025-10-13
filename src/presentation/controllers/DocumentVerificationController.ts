import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";

export class DocumentVerificationController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/admin/documents/pending
   * Obtener usuarios con documentos pendientes de verificación (solo MASTER)
   */
  public async getPendingDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      // Verificar que el usuario actual es MASTER
      const usuarioActual = await prisma.usuario.findUnique({
        where: { id_usu: req.usuario?.id_usu || req.uid },
        include: { cuentas: true }
      });

      if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'Solo los usuarios MASTER pueden acceder a la verificación de documentos'
        });
        return;
      }

      const usuariosConDocumentos = await prisma.usuario.findMany({
        where: {
          AND: [
            // Debe tener al menos un documento subido
            {
              OR: [
                { enl_ced_pdf: { not: null } },
                { enl_mat_pdf: { not: null } }
              ]
            },
            // Y debe tener al menos un documento pendiente de aprobación
            {
              OR: [
                // Tiene cédula pero no está aprobada
                {
                  AND: [
                    { enl_ced_pdf: { not: null } },
                    { cedula_aprobada: false }
                  ]
                },
                // Tiene matrícula pero no está aprobada
                {
                  AND: [
                    { enl_mat_pdf: { not: null } },
                    { matricula_aprobada: false }
                  ]
                }
              ]
            }
          ]
        },
        include: {
          cuentas: {
            select: {
              cor_cue: true,
              rol_cue: true
            }
          },
          carrera: {
            select: {
              nom_car: true
            }
          }
        },
        orderBy: { fec_nac_usu: 'desc' }
      });

      const documentosPendientes = usuariosConDocumentos.map(usuario => ({
        id_usu: usuario.id_usu,
        ced_usu: usuario.ced_usu,
        nombre_completo: `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim(),
        email: usuario.cuentas[0]?.cor_cue,
        rol: usuario.cuentas[0]?.rol_cue,
        carrera: usuario.carrera?.nom_car,
        documentos_verificados: usuario.documentos_verificados,
        cedula_aprobada: usuario.cedula_aprobada,
        matricula_aprobada: usuario.matricula_aprobada,
        fecha_subida: usuario.fec_nac_usu, // Usando fecha de nacimiento como referencia
        documentos: {
          cedula: !!usuario.enl_ced_pdf,
          matricula: !!usuario.enl_mat_pdf
        }
      }));

      res.json({
        success: true,
        usuarios: documentosPendientes,
        total: documentosPendientes.length
      });

    } catch (error: any) {
      console.error('[getPendingDocuments] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/documents/download/:userId/:documentType
   * Descargar documento específico de un usuario (solo MASTER)
   */
  public async downloadUserDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, documentType } = req.params;
      const prisma = this.container.getPrismaClient();

      // Validar que los parámetros existan
      if (!userId || !documentType) {
        res.status(400).json({
          success: false,
          message: 'Parámetros userId y documentType son requeridos'
        });
        return;
      }

      // Verificar que el usuario actual es MASTER
      const usuarioActual = await prisma.usuario.findUnique({
        where: { id_usu: req.usuario?.id_usu || req.uid },
        include: { cuentas: true }
      });

      if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'Solo los usuarios MASTER pueden descargar documentos'
        });
        return;
      }

      // Validar tipo de documento
      if (!['cedula', 'matricula'].includes(documentType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Debe ser "cedula" o "matricula"'
        });
        return;
      }

      // Buscar usuario y documento
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      let documentBuffer: Buffer | null = null;
      let filename: string = '';

      if (documentType === 'cedula' && usuario.enl_ced_pdf) {
        documentBuffer = Buffer.from(usuario.enl_ced_pdf);
        filename = `cedula_${usuario.ced_usu}.pdf`;
      } else if (documentType === 'matricula' && usuario.enl_mat_pdf) {
        documentBuffer = Buffer.from(usuario.enl_mat_pdf);
        filename = `matricula_${usuario.ced_usu}.pdf`;
      }

      if (!documentBuffer) {
        res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(documentBuffer);

    } catch (error: any) {
      console.error('[downloadUserDocument] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/documents/approve/:userId/:documentType
   * Aprobar documento específico de un usuario (solo MASTER)
   */
  public async approveUserDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, documentType } = req.params;
      const prisma = this.container.getPrismaClient();

      // Validar que los parámetros existan
      if (!userId || !documentType) {
        res.status(400).json({
          success: false,
          message: 'Parámetros userId y documentType son requeridos'
        });
        return;
      }

      // Verificar que el usuario actual es MASTER
      const usuarioActual = await prisma.usuario.findUnique({
        where: { id_usu: req.usuario?.id_usu || req.uid },
        include: { cuentas: true }
      });

      if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'Solo los usuarios MASTER pueden aprobar documentos'
        });
        return;
      }

      // Validar tipo de documento
      if (!['cedula', 'matricula', 'all'].includes(documentType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Debe ser "cedula", "matricula" o "all"'
        });
        return;
      }

      // Buscar usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar que tiene documentos para aprobar
      const tieneCedula = !!usuario.enl_ced_pdf;
      const tieneMatricula = !!usuario.enl_mat_pdf;

      if (!tieneCedula && !tieneMatricula) {
        res.status(400).json({
          success: false,
          message: 'El usuario no tiene documentos para aprobar'
        });
        return;
      }

      // Determinar el nuevo estado
      let updateData: any = {};

      if (documentType === 'all' || (tieneCedula && tieneMatricula)) {
        // Si aprueba todos o el usuario tiene ambos documentos
        updateData = {
          documentos_verificados: true,
          cedula_aprobada: tieneCedula,
          matricula_aprobada: tieneMatricula,
          fec_verificacion_docs: new Date()
        };
      } else if (documentType === 'cedula' && tieneCedula) {
        // Solo aprueba cédula
        updateData = {
          cedula_aprobada: true,
          documentos_verificados: tieneMatricula ? usuario.matricula_aprobada : false,
          fec_verificacion_docs: new Date()
        };
      } else if (documentType === 'matricula' && tieneMatricula) {
        // Solo aprueba matrícula
        updateData = {
          matricula_aprobada: true,
          documentos_verificados: tieneCedula ? usuario.cedula_aprobada : false,
          fec_verificacion_docs: new Date()
        };
      }

      // Actualizar estado de documentos
      await prisma.usuario.update({
        where: { id_usu: userId },
        data: updateData
      });

      res.json({
        success: true,
        message: `Documento${documentType === 'all' ? 's' : ''} aprobado${documentType === 'all' ? 's' : ''} exitosamente`,
        documentos_verificados: updateData.documentos_verificados
      });

    } catch (error: any) {
      console.error('[approveUserDocument] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/documents/reject/:userId
   * Rechazar documentos de un usuario (solo MASTER)
   */
  public async rejectUserDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { motivo } = req.body;
      const prisma = this.container.getPrismaClient();

      // Verificar que el usuario actual es MASTER
      const usuarioActual = await prisma.usuario.findUnique({
        where: { id_usu: req.usuario?.id_usu || req.uid },
        include: { cuentas: true }
      });

      if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
        res.status(403).json({
          success: false,
          message: 'Solo los usuarios MASTER pueden rechazar documentos'
        });
        return;
      }

      // Buscar usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Actualizar estado a rechazado
      await prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          documentos_verificados: false,
          cedula_aprobada: false,
          matricula_aprobada: false,
          fec_verificacion_docs: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Documentos rechazados exitosamente'
      });

    } catch (error: any) {
      console.error('[rejectUserDocuments] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/documents/stats
   * Obtener estadísticas de verificación de documentos
   */
  public async getDocumentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const [
        totalConDocumentos,
        documentosAprobados,
        documentosRecientes
      ] = await Promise.all([
        prisma.usuario.count({
          where: {
            OR: [
              { enl_ced_pdf: { not: null } },
              { enl_mat_pdf: { not: null } }
            ]
          }
        }),
        prisma.usuario.count({
          where: { documentos_verificados: true }
        }),
        prisma.usuario.count({
          where: {
            documentos_verificados: false,
            fec_verificacion_docs: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
            }
          }
        })
      ]);

      res.json({
        success: true,
        stats: {
          total_con_documentos: totalConDocumentos,
          pendientes: totalConDocumentos - documentosAprobados,
          aprobados: documentosAprobados,
          recientes_7_dias: documentosRecientes
        }
      });

    } catch (error: any) {
      console.error('[getDocumentStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
