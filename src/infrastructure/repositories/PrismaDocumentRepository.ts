import { PrismaClient } from "@prisma/client";
import {
  IDocumentRepository,
  DocumentData,
  DocumentInfo,
  UserDocuments,
  DocumentType,
  DocumentFilters,
  DocumentStats,
  VerificationRecord,
  DocumentStatus,
} from "../../domain/repositories/IDocumentRepository";

/**
 * Implementación concreta del repositorio de documentos usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de documentos
 */
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Subir un documento de cédula
   */
  async uploadCedulaDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          enl_ced_pdf: documentData.fileBuffer,
          cedula_filename: documentData.filename,
          cedula_size: documentData.size,
          cedula_aprobada: false, // Reiniciar aprobación
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error uploading cedula document: ${error}`);
    }
  }

  /**
   * Subir un documento de matrícula
   */
  async uploadMatriculaDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          enl_mat_pdf: documentData.fileBuffer,
          matricula_filename: documentData.filename,
          matricula_size: documentData.size,
          matricula_aprobada: false, // Reiniciar aprobación
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error uploading matricula document: ${error}`);
    }
  }

  /**
   * Obtener documento de cédula de un usuario
   */
  async getCedulaDocument(userId: string): Promise<DocumentInfo | null> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          id_usu: true,
          enl_ced_pdf: true,
          cedula_filename: true,
          cedula_size: true,
          cedula_aprobada: true,
        },
      });

      if (!user || !user.enl_ced_pdf) {
        return null;
      }

      return {
        id: `${userId}_cedula`,
        userId: user.id_usu,
        type: "CEDULA",
        filename: user.cedula_filename || "cedula.pdf",
        size: user.cedula_size || 0,
        uploadDate: new Date(), // TODO: Agregar campo de fecha de subida en el schema
        isApproved: user.cedula_aprobada,
        fileBuffer: Buffer.from(user.enl_ced_pdf),
      };
    } catch (error) {
      throw new Error(`Error getting cedula document: ${error}`);
    }
  }

  /**
   * Obtener documento de matrícula de un usuario
   */
  async getMatriculaDocument(userId: string): Promise<DocumentInfo | null> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          id_usu: true,
          enl_mat_pdf: true,
          matricula_filename: true,
          matricula_size: true,
          matricula_aprobada: true,
        },
      });

      if (!user || !user.enl_mat_pdf) {
        return null;
      }

      return {
        id: `${userId}_matricula`,
        userId: user.id_usu,
        type: "MATRICULA",
        filename: user.matricula_filename || "matricula.pdf",
        size: user.matricula_size || 0,
        uploadDate: new Date(), // TODO: Agregar campo de fecha de subida en el schema
        isApproved: user.matricula_aprobada,
        fileBuffer: Buffer.from(user.enl_mat_pdf),
      };
    } catch (error) {
      throw new Error(`Error getting matricula document: ${error}`);
    }
  }

  /**
   * Aprobar documento de cédula
   */
  async approveCedulaDocument(
    userId: string,
    approvedBy: string
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          cedula_aprobada: true,
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error approving cedula document: ${error}`);
    }
  }

  /**
   * Aprobar documento de matrícula
   */
  async approveMatriculaDocument(
    userId: string,
    approvedBy: string
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          matricula_aprobada: true,
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error approving matricula document: ${error}`);
    }
  }

  /**
   * Rechazar documento de cédula
   */
  async rejectCedulaDocument(
    userId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          cedula_aprobada: false,
          // TODO: Agregar campos para motivo de rechazo en el schema
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error rejecting cedula document: ${error}`);
    }
  }

  /**
   * Rechazar documento de matrícula
   */
  async rejectMatriculaDocument(
    userId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          matricula_aprobada: false,
          // TODO: Agregar campos para motivo de rechazo en el schema
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error rejecting matricula document: ${error}`);
    }
  }

  /**
   * Obtener todos los documentos pendientes de verificación
   */
  async findPendingDocuments(): Promise<UserDocuments[]> {
    try {
      const users = await this.prisma.usuario.findMany({
        where: {
          OR: [
            {
              AND: [{ enl_ced_pdf: { not: null } }, { cedula_aprobada: false }],
            },
            {
              AND: [
                { enl_mat_pdf: { not: null } },
                { matricula_aprobada: false },
              ],
            },
          ],
        },
        include: {
          cuentas: {
            select: {
              cor_cue: true,
            },
          },
        },
      });

      return users.map(this.mapUserToUserDocuments);
    } catch (error) {
      throw new Error(`Error finding pending documents: ${error}`);
    }
  }

  /**
   * Obtener documentos por usuario ID
   */
  async findDocumentsByUserId(userId: string): Promise<UserDocuments | null> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usu: userId },
        include: {
          cuentas: {
            select: {
              cor_cue: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      return this.mapUserToUserDocuments(user);
    } catch (error) {
      throw new Error(`Error finding documents by user id: ${error}`);
    }
  }

  /**
   * Verificar si un usuario tiene todos los documentos aprobados
   */
  async hasAllDocumentsApproved(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          cedula_aprobada: true,
          matricula_aprobada: true,
          enl_ced_pdf: true,
          enl_mat_pdf: true,
        },
      });

      if (!user) {
        return false;
      }

      // Verificar que tenga ambos documentos subidos y aprobados
      return (
        user.enl_ced_pdf !== null &&
        user.enl_mat_pdf !== null &&
        user.cedula_aprobada &&
        user.matricula_aprobada
      );
    } catch (error) {
      throw new Error(`Error checking document approval status: ${error}`);
    }
  }

  /**
   * Eliminar documentos de un usuario
   */
  async deleteUserDocuments(userId: string): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          enl_ced_pdf: null,
          enl_mat_pdf: null,
          cedula_filename: null,
          matricula_filename: null,
          cedula_size: null,
          matricula_size: null,
          cedula_aprobada: false,
          matricula_aprobada: false,
          documentos_verificados: false,
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error deleting user documents: ${error}`);
    }
  }

  /**
   * Buscar documentos con filtros
   */
  async findDocumentsWithFilters(
    filters: DocumentFilters
  ): Promise<UserDocuments[]> {
    try {
      const whereClause: any = {};

      // Filtro por estado
      if (filters.status === "PENDING") {
        whereClause.OR = [
          {
            AND: [{ enl_ced_pdf: { not: null } }, { cedula_aprobada: false }],
          },
          {
            AND: [
              { enl_mat_pdf: { not: null } },
              { matricula_aprobada: false },
            ],
          },
        ];
      } else if (filters.status === "APPROVED") {
        whereClause.AND = [
          { cedula_aprobada: true },
          { matricula_aprobada: true },
        ];
      }

      // Filtro por usuario
      if (filters.userId) {
        whereClause.id_usu = filters.userId;
      }

      // Filtro por cédula
      if (filters.userCedula) {
        whereClause.ced_usu = {
          contains: filters.userCedula,
          mode: "insensitive",
        };
      }

      // Búsqueda general
      if (filters.search) {
        whereClause.OR = [
          { ced_usu: { contains: filters.search, mode: "insensitive" } },
          { nom_usu1: { contains: filters.search, mode: "insensitive" } },
          { ape_usu1: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const users = await this.prisma.usuario.findMany({
        where: whereClause,
        include: {
          cuentas: {
            select: {
              cor_cue: true,
            },
          },
        },
        orderBy: {
          nom_usu1: "asc",
        },
      });

      return users.map(this.mapUserToUserDocuments);
    } catch (error) {
      throw new Error(`Error finding documents with filters: ${error}`);
    }
  }

  /**
   * Obtener estadísticas de documentos
   */
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      const [
        totalUsers,
        usersWithDocuments,
        usersWithAllApproved,
        pendingCedula,
        pendingMatricula,
        totalUploaded,
        totalApproved,
      ] = await Promise.all([
        this.prisma.usuario.count(),
        this.prisma.usuario.count({
          where: {
            OR: [
              { enl_ced_pdf: { not: null } },
              { enl_mat_pdf: { not: null } },
            ],
          },
        }),
        this.prisma.usuario.count({
          where: {
            cedula_aprobada: true,
            matricula_aprobada: true,
          },
        }),
        this.prisma.usuario.count({
          where: {
            enl_ced_pdf: { not: null },
            cedula_aprobada: false,
          },
        }),
        this.prisma.usuario.count({
          where: {
            enl_mat_pdf: { not: null },
            matricula_aprobada: false,
          },
        }),
        this.prisma.usuario.count({
          where: {
            OR: [
              { enl_ced_pdf: { not: null } },
              { enl_mat_pdf: { not: null } },
            ],
          },
        }),
        this.prisma.usuario.count({
          where: {
            OR: [{ cedula_aprobada: true }, { matricula_aprobada: true }],
          },
        }),
      ]);

      return {
        totalUsers,
        usersWithDocuments,
        usersWithAllDocumentsApproved: usersWithAllApproved,
        pendingCedulaDocuments: pendingCedula,
        pendingMatriculaDocuments: pendingMatricula,
        totalDocumentsUploaded: totalUploaded * 2, // Estimado
        totalDocumentsApproved: totalApproved,
        totalDocumentsRejected: 0, // TODO: Implementar cuando se agreguen campos de rechazo
      };
    } catch (error) {
      throw new Error(`Error getting document stats: ${error}`);
    }
  }

  /**
   * Marcar documentos como verificados
   */
  async markDocumentsAsVerified(userId: string): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId },
        data: {
          documentos_verificados: true,
          fec_verificacion_docs: new Date(),
        },
      });
      return true;
    } catch (error) {
      throw new Error(`Error marking documents as verified: ${error}`);
    }
  }

  /**
   * Obtener historial de verificación de documentos
   */
  async getVerificationHistory(userId: string): Promise<VerificationRecord[]> {
    try {
      // TODO: Implementar tabla de historial de verificación
      // Por ahora retornar array vacío
      return [];
    } catch (error) {
      throw new Error(`Error getting verification history: ${error}`);
    }
  }

  /**
   * Mapear usuario de Prisma a UserDocuments
   */
  private mapUserToUserDocuments(user: any): UserDocuments {
    const cedulaDocument = user.enl_ced_pdf
      ? {
          id: `${user.id_usu}_cedula`,
          userId: user.id_usu,
          type: "CEDULA" as DocumentType,
          filename: user.cedula_filename || "cedula.pdf",
          size: user.cedula_size || 0,
          uploadDate: new Date(), // TODO: Usar fecha real cuando esté disponible
          isApproved: user.cedula_aprobada,
          fileBuffer: Buffer.from(user.enl_ced_pdf),
        }
      : undefined;

    const matriculaDocument = user.enl_mat_pdf
      ? {
          id: `${user.id_usu}_matricula`,
          userId: user.id_usu,
          type: "MATRICULA" as DocumentType,
          filename: user.matricula_filename || "matricula.pdf",
          size: user.matricula_size || 0,
          uploadDate: new Date(), // TODO: Usar fecha real cuando esté disponible
          isApproved: user.matricula_aprobada,
          fileBuffer: Buffer.from(user.enl_mat_pdf),
        }
      : undefined;

    return {
      userId: user.id_usu,
      userCedula: user.ced_usu,
      userName: `${user.nom_usu1} ${user.ape_usu1}`,
      userEmail: user.cuentas?.[0]?.cor_cue || "",
      cedulaDocument,
      matriculaDocument,
      allDocumentsVerified: user.documentos_verificados,
      verificationDate: user.fec_verificacion_docs,
    };
  }
}
