import { PrismaClient } from "@prisma/client";
import { IDocumentRepository, DocumentData, DocumentInfo, UserDocuments, DocumentFilters, DocumentStats, VerificationRecord } from "../../domain/repositories/IDocumentRepository";
/**
 * Implementación concreta del repositorio de documentos usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de documentos
 */
export declare class PrismaDocumentRepository implements IDocumentRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Subir un documento de cédula
     */
    uploadCedulaDocument(userId: string, documentData: DocumentData): Promise<boolean>;
    /**
     * Subir un documento de matrícula
     */
    uploadMatriculaDocument(userId: string, documentData: DocumentData): Promise<boolean>;
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
    approveMatriculaDocument(userId: string, approvedBy: string): Promise<boolean>;
    /**
     * Rechazar documento de cédula
     */
    rejectCedulaDocument(userId: string, rejectedBy: string, reason?: string): Promise<boolean>;
    /**
     * Rechazar documento de matrícula
     */
    rejectMatriculaDocument(userId: string, rejectedBy: string, reason?: string): Promise<boolean>;
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
    /**
     * Mapear usuario de Prisma a UserDocuments
     */
    private mapUserToUserDocuments;
}
//# sourceMappingURL=PrismaDocumentRepository.d.ts.map