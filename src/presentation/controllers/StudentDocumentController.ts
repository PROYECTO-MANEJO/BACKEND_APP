import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/studentMiddleware";
import multer from "multer";

export class StudentDocumentController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * POST /api/student/documents/upload
   * Subir documentos de estudiante (cédula y/o matrícula)
   */
  public async uploadStudentDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No se han proporcionado archivos'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();
      const updateData: any = {};

      // Procesar cédula si se subió
      if (files.cedula && files.cedula[0]) {
        const cedulaFile = files.cedula[0];
        
        // Validar tipo de archivo
        if (cedulaFile.mimetype !== 'application/pdf') {
          res.status(400).json({
            success: false,
            message: 'La cédula debe ser un archivo PDF'
          });
          return;
        }

        // Validar tamaño (máximo 5MB)
        if (cedulaFile.size > 5 * 1024 * 1024) {
          res.status(400).json({
            success: false,
            message: 'El archivo de cédula es demasiado grande (máximo 5MB)'
          });
          return;
        }

        updateData.enl_ced_pdf = cedulaFile.buffer;
        updateData.cedula_filename = cedulaFile.originalname;
        updateData.cedula_size = cedulaFile.size;
        updateData.cedula_aprobada = false; // Reset aprobación al subir nuevo archivo
      }

      // Procesar matrícula si se subió
      if (files.matricula && files.matricula[0]) {
        const matriculaFile = files.matricula[0];
        
        // Validar tipo de archivo
        if (matriculaFile.mimetype !== 'application/pdf') {
          res.status(400).json({
            success: false,
            message: 'La matrícula debe ser un archivo PDF'
          });
          return;
        }

        // Validar tamaño (máximo 5MB)
        if (matriculaFile.size > 5 * 1024 * 1024) {
          res.status(400).json({
            success: false,
            message: 'El archivo de matrícula es demasiado grande (máximo 5MB)'
          });
          return;
        }

        updateData.enl_mat_pdf = matriculaFile.buffer;
        updateData.matricula_filename = matriculaFile.originalname;
        updateData.matricula_size = matriculaFile.size;
        updateData.matricula_aprobada = false; // Reset aprobación al subir nuevo archivo
      }

      // Actualizar documentos verificados basado en los documentos disponibles
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: { 
          enl_ced_pdf: true, 
          enl_mat_pdf: true,
          cedula_aprobada: true,
          matricula_aprobada: true
        }
      });

      if (usuario) {
        const tieneCedula = updateData.enl_ced_pdf || usuario.enl_ced_pdf;
        const tieneMatricula = updateData.enl_mat_pdf || usuario.enl_mat_pdf;
        
        // Para estudiantes, ambos documentos son obligatorios
        updateData.documentos_verificados = false; // Siempre false hasta que admin apruebe
      }

      // Actualizar usuario
      await prisma.usuario.update({
        where: { id_usu: userId },
        data: updateData
      });

      res.json({
        success: true,
        message: 'Documentos subidos exitosamente. Pendientes de verificación por el administrador.',
        data: {
          cedula_subida: !!updateData.enl_ced_pdf || !!usuario?.enl_ced_pdf,
          matricula_subida: !!updateData.enl_mat_pdf || !!usuario?.enl_mat_pdf,
          estado: 'PENDIENTE_VERIFICACION'
        }
      });

    } catch (error: any) {
      console.error('[uploadStudentDocuments] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/student/documents/status
   * Obtener estado de verificación de documentos del estudiante
   */
  public async getDocumentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          enl_ced_pdf: true,
          enl_mat_pdf: true,
          cedula_filename: true,
          matricula_filename: true,
          cedula_size: true,
          matricula_size: true,
          cedula_aprobada: true,
          matricula_aprobada: true,
          documentos_verificados: true,
          fec_verificacion_docs: true
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Determinar estado general
      let estadoGeneral = 'INCOMPLETO';
      if (usuario.documentos_verificados) {
        estadoGeneral = 'VERIFICADO';
      } else if (usuario.enl_ced_pdf && usuario.enl_mat_pdf) {
        estadoGeneral = 'PENDIENTE_VERIFICACION';
      } else if (usuario.enl_ced_pdf || usuario.enl_mat_pdf) {
        estadoGeneral = 'PARCIALMENTE_SUBIDO';
      }

      res.json({
        success: true,
        data: {
          estado_general: estadoGeneral,
          cedula: {
            subida: !!usuario.enl_ced_pdf,
            aprobada: usuario.cedula_aprobada,
            filename: usuario.cedula_filename,
            size: usuario.cedula_size
          },
          matricula: {
            subida: !!usuario.enl_mat_pdf,
            aprobada: usuario.matricula_aprobada,
            filename: usuario.matricula_filename,
            size: usuario.matricula_size
          },
          verificacion: {
            completa: usuario.documentos_verificados,
            fecha_verificacion: usuario.fec_verificacion_docs
          },
          requisitos: {
            cedula_requerida: true,
            matricula_requerida: true, // Para estudiantes ambos son obligatorios
            documentos_completos: !!usuario.enl_ced_pdf && !!usuario.enl_mat_pdf,
            puede_inscribirse: usuario.documentos_verificados
          }
        }
      });

    } catch (error: any) {
      console.error('[getDocumentStatus] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/student/documents/download/:type
   * Descargar documento específico (cedula o matricula)
   */
  public async downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      const { type } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!type || !['cedula', 'matricula'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Use: cedula o matricula'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          enl_ced_pdf: true,
          enl_mat_pdf: true,
          cedula_filename: true,
          matricula_filename: true
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      let documentData: Uint8Array | null = null;
      let filename: string | null = null;

      if (type === 'cedula') {
        documentData = usuario.enl_ced_pdf;
        filename = usuario.cedula_filename || 'cedula.pdf';
      } else if (type === 'matricula') {
        documentData = usuario.enl_mat_pdf;
        filename = usuario.matricula_filename || 'matricula.pdf';
      }

      if (!documentData) {
        res.status(404).json({
          success: false,
          message: `Documento de ${type} no encontrado`
        });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Convertir Uint8Array a Buffer si es necesario
      const buffer = documentData instanceof Uint8Array 
        ? Buffer.from(documentData) 
        : documentData;
      
      res.send(buffer);

    } catch (error: any) {
      console.error('[downloadDocument] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/student/documents/update/:type
   * Actualizar documento específico (cedula o matricula)
   */
  public async updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      const { type } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!type || !['cedula', 'matricula'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Use: cedula o matricula'
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No se ha proporcionado archivo'
        });
        return;
      }

      // Validar tipo de archivo
      if (file.mimetype !== 'application/pdf') {
        res.status(400).json({
          success: false,
          message: 'El archivo debe ser un PDF'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande (máximo 5MB)'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();
      const updateData: any = {};

      if (type === 'cedula') {
        updateData.enl_ced_pdf = file.buffer;
        updateData.cedula_filename = file.originalname;
        updateData.cedula_size = file.size;
        updateData.cedula_aprobada = false; // Reset aprobación
      } else if (type === 'matricula') {
        updateData.enl_mat_pdf = file.buffer;
        updateData.matricula_filename = file.originalname;
        updateData.matricula_size = file.size;
        updateData.matricula_aprobada = false; // Reset aprobación
      }

      // Reset verificación general al actualizar cualquier documento
      updateData.documentos_verificados = false;
      updateData.fec_verificacion_docs = null;

      await prisma.usuario.update({
        where: { id_usu: userId },
        data: updateData
      });

      res.json({
        success: true,
        message: `Documento de ${type} actualizado exitosamente. Pendiente de verificación.`,
        data: {
          tipo: type,
          filename: file.originalname,
          size: file.size,
          estado: 'PENDIENTE_VERIFICACION'
        }
      });

    } catch (error: any) {
      console.error('[updateDocument] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/student/documents/history
   * Obtener historial de verificaciones de documentos
   */
  public async getVerificationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Obtener información actual del usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          cedula_filename: true,
          matricula_filename: true,
          cedula_aprobada: true,
          matricula_aprobada: true,
          documentos_verificados: true,
          fec_verificacion_docs: true,
          enl_ced_pdf: true,
          enl_mat_pdf: true
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Crear historial basado en el estado actual
      const historial = [];

      // Entrada para cédula
      if (usuario.enl_ced_pdf) {
        historial.push({
          documento: 'cedula',
          filename: usuario.cedula_filename,
          estado: usuario.cedula_aprobada ? 'APROBADO' : 'PENDIENTE',
          fecha_subida: null, // No tenemos esta fecha en el esquema actual
          fecha_verificacion: usuario.cedula_aprobada ? usuario.fec_verificacion_docs : null
        });
      }

      // Entrada para matrícula
      if (usuario.enl_mat_pdf) {
        historial.push({
          documento: 'matricula',
          filename: usuario.matricula_filename,
          estado: usuario.matricula_aprobada ? 'APROBADO' : 'PENDIENTE',
          fecha_subida: null, // No tenemos esta fecha en el esquema actual
          fecha_verificacion: usuario.matricula_aprobada ? usuario.fec_verificacion_docs : null
        });
      }

      // Estado general
      let estadoGeneral = 'INCOMPLETO';
      if (usuario.documentos_verificados) {
        estadoGeneral = 'VERIFICADO_COMPLETO';
      } else if (usuario.cedula_aprobada && usuario.matricula_aprobada) {
        estadoGeneral = 'DOCUMENTOS_APROBADOS';
      } else if (usuario.enl_ced_pdf && usuario.enl_mat_pdf) {
        estadoGeneral = 'PENDIENTE_VERIFICACION';
      }

      res.json({
        success: true,
        data: {
          estado_general: estadoGeneral,
          fecha_ultima_verificacion: usuario.fec_verificacion_docs,
          historial: historial,
          resumen: {
            documentos_subidos: historial.length,
            documentos_aprobados: historial.filter(h => h.estado === 'APROBADO').length,
            documentos_pendientes: historial.filter(h => h.estado === 'PENDIENTE').length,
            verificacion_completa: usuario.documentos_verificados
          }
        }
      });

    } catch (error: any) {
      console.error('[getVerificationHistory] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/student/documents/requirements
   * Obtener requisitos específicos para estudiantes
   */
  public async getDocumentRequirements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id_usu || req.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Obtener información del usuario y su carrera
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        include: {
          carrera: {
            select: {
              nom_car: true,
              des_car: true
            }
          }
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          rol: 'ESTUDIANTE',
          carrera: usuario.carrera ? {
            nombre: usuario.carrera.nom_car,
            descripcion: usuario.carrera.des_car
          } : null,
          requisitos: {
            cedula: {
              requerida: true,
              descripcion: 'Cédula de identidad ecuatoriana vigente',
              formato: 'PDF',
              tamaño_maximo: '5MB'
            },
            matricula: {
              requerida: true,
              descripcion: 'Certificado de matrícula universitaria vigente',
              formato: 'PDF',
              tamaño_maximo: '5MB'
            }
          },
          proceso_verificacion: {
            pasos: [
              'Subir documentos requeridos (cédula y matrícula)',
              'Esperar verificación por parte del administrador',
              'Recibir confirmación de documentos aprobados',
              'Acceso completo a inscripciones y servicios estudiantiles'
            ],
            tiempo_estimado: '1-3 días hábiles',
            contacto_soporte: 'admin@fisei.uta.edu.ec'
          }
        }
      });

    } catch (error: any) {
      console.error('[getDocumentRequirements] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
