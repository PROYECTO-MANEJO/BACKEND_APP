/**
 * Interfaz del repositorio para la gestión de documentos
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface IDocumentRepository {
  /**
   * Subir un documento de cédula
   */
  uploadCedulaDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<boolean>;

  /**
   * Subir un documento de matrícula
   */
  uploadMatriculaDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<boolean>;

  /**
   * Obtener documento de cédula de un usuario
   */
  getCedulaDocument(userId: string): Promise<DocumentInfo | null>;

  /**
   * Obtener documento de matrícula de un usuario
   */
  getMatriculaDocument(userId: string): Promise<DocumentInfo | null>;

  /**
   * Aprobar documento de cédula
   */
  approveCedulaDocument(userId: string, approvedBy: string): Promise<boolean>;

  /**
   * Aprobar documento de matrícula
   */
  approveMatriculaDocument(
    userId: string,
    approvedBy: string
  ): Promise<boolean>;

  /**
   * Rechazar documento de cédula
   */
  rejectCedulaDocument(
    userId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<boolean>;

  /**
   * Rechazar documento de matrícula
   */
  rejectMatriculaDocument(
    userId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<boolean>;

  /**
   * Obtener todos los documentos pendientes de verificación
   */
  findPendingDocuments(): Promise<UserDocuments[]>;

  /**
   * Obtener documentos por usuario ID
   */
  findDocumentsByUserId(userId: string): Promise<UserDocuments | null>;

  /**
   * Verificar si un usuario tiene todos los documentos aprobados
   */
  hasAllDocumentsApproved(userId: string): Promise<boolean>;

  /**
   * Eliminar documentos de un usuario
   */
  deleteUserDocuments(userId: string): Promise<boolean>;

  /**
   * Buscar documentos con filtros
   */
  findDocumentsWithFilters(filters: DocumentFilters): Promise<UserDocuments[]>;

  /**
   * Obtener estadísticas de documentos
   */
  getDocumentStats(): Promise<DocumentStats>;

  /**
   * Marcar documentos como verificados
   */
  markDocumentsAsVerified(userId: string): Promise<boolean>;

  /**
   * Obtener historial de verificación de documentos
   */
  getVerificationHistory(userId: string): Promise<VerificationRecord[]>;
}

/**
 * Datos del documento a subir
 */
export interface DocumentData {
  fileBuffer: Buffer;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Información del documento almacenado
 */
export interface DocumentInfo {
  id: string;
  userId: string;
  type: DocumentType;
  filename: string;
  size: number;
  uploadDate: Date;
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: Date;
  rejectedBy?: string;
  rejectedDate?: Date;
  rejectionReason?: string;
  fileBuffer: Buffer;
}

/**
 * Documentos de un usuario
 */
export interface UserDocuments {
  userId: string;
  userCedula: string;
  userName: string;
  userEmail: string;
  cedulaDocument?: DocumentInfo;
  matriculaDocument?: DocumentInfo;
  allDocumentsVerified: boolean;
  verificationDate?: Date;
}

/**
 * Tipos de documento
 */
export type DocumentType = "CEDULA" | "MATRICULA";

/**
 * Estados de documento
 */
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Filtros para búsqueda de documentos
 */
export interface DocumentFilters {
  status?: DocumentStatus;
  documentType?: DocumentType;
  userId?: string;
  userCedula?: string;
  uploadedFrom?: Date;
  uploadedTo?: Date;
  approvedBy?: string;
  rejectedBy?: string;
  search?: string;
}

/**
 * Estadísticas de documentos
 */
export interface DocumentStats {
  totalUsers: number;
  usersWithDocuments: number;
  usersWithAllDocumentsApproved: number;
  pendingCedulaDocuments: number;
  pendingMatriculaDocuments: number;
  totalDocumentsUploaded: number;
  totalDocumentsApproved: number;
  totalDocumentsRejected: number;
}

/**
 * Registro de verificación
 */
export interface VerificationRecord {
  id: string;
  userId: string;
  documentType: DocumentType;
  action: "APPROVED" | "REJECTED" | "UPLOADED";
  performedBy?: string;
  performedAt: Date;
  reason?: string;
  details?: string;
}
