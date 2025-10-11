/**
 * CertificateManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de certificados del sistema.
 */
import { Certificate, CertificateData, CertificateType } from "../entities/Certificate";
export interface ICertificateRepository {
    create(certificate: Certificate): Promise<Certificate>;
    findById(id: string): Promise<Certificate | null>;
    findAll(): Promise<Certificate[]>;
    update(id: string, certificate: Certificate): Promise<Certificate>;
    delete(id: string): Promise<void>;
    findByRecipient(recipientId: string): Promise<Certificate[]>;
    findByProgram(programId: string, programType: "EVENT" | "COURSE"): Promise<Certificate[]>;
    findByType(certificateType: CertificateType): Promise<Certificate[]>;
    findByStatus(status: string): Promise<Certificate[]>;
    findByVerificationCode(code: string): Promise<Certificate | null>;
    findByCertificateCode(code: string): Promise<Certificate | null>;
    existsByRecipientAndProgram(recipientId: string, programId: string, programType: "EVENT" | "COURSE"): Promise<boolean>;
    countByProgram(programId: string, programType: "EVENT" | "COURSE"): Promise<number>;
    findWithFilters(filters: {
        recipientId?: string;
        programId?: string;
        programType?: "EVENT" | "COURSE";
        certificateType?: CertificateType;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        issuedBy?: string;
    }): Promise<Certificate[]>;
}
export interface IParticipationRepository {
    findEventParticipationById(participationId: string): Promise<any | null>;
    findCourseCompletionById(completionId: string): Promise<any | null>;
    findEventParticipationByUserAndEvent(userId: string, eventId: string): Promise<any | null>;
    findCourseCompletionByUserAndCourse(userId: string, courseId: string): Promise<any | null>;
}
export interface IPDFGeneratorService {
    generateCertificatePDF(certificateData: any, templateId?: string): Promise<{
        buffer: Buffer;
        filePath: string;
        fileSize: number;
    }>;
    getAvailableTemplates(): Promise<string[]>;
}
export interface IDigitalSignatureService {
    signDocument(content: Buffer, certificateId: string): Promise<string>;
    verifySignature(content: Buffer, signature: string): Promise<boolean>;
}
export declare class CertificateManagementService {
    private certificateRepository;
    private participationRepository;
    private pdfGenerator;
    private digitalSignature?;
    constructor(certificateRepository: ICertificateRepository, participationRepository: IParticipationRepository, pdfGenerator: IPDFGeneratorService, digitalSignature?: IDigitalSignatureService | undefined);
    /**
     * Generar certificado por participación en evento
     */
    generateEventParticipationCertificate(participationId: string, requestedBy: string, templateId?: string): Promise<Certificate>;
    /**
     * Generar certificado por finalización de curso
     */
    generateCourseCompletionCertificate(completionId: string, requestedBy: string, templateId?: string): Promise<Certificate>;
    /**
     * Procesar generación completa del certificado
     */
    private processCertificateGeneration;
    /**
     * Emitir certificado oficialmente
     */
    issueCertificate(certificateId: string, issuedBy: string, issuerRole: string, issuerSignature?: string): Promise<Certificate>;
    /**
     * Revocar certificado
     */
    revokeCertificate(certificateId: string, reason: string, revokedBy: string): Promise<Certificate>;
    /**
     * Crear nueva versión de certificado
     */
    createCertificateVersion(originalId: string, changes: Partial<CertificateData>, requestedBy: string): Promise<Certificate>;
    /**
     * Verificar certificado por código de verificación
     */
    verifyCertificateByCode(verificationCode: string): Promise<{
        isValid: boolean;
        certificate?: Certificate;
        status: string;
        message: string;
    }>;
    /**
     * Obtener certificados de un usuario
     */
    getUserCertificates(userId: string, filters?: {
        type?: CertificateType;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Certificate[]>;
    /**
     * Obtener certificados de un programa (evento/curso)
     */
    getProgramCertificates(programId: string, programType: "EVENT" | "COURSE", filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Certificate[]>;
    /**
     * Generar estadísticas de certificados
     */
    getCertificateStatistics(filters?: {
        startDate?: Date;
        endDate?: Date;
        programType?: "EVENT" | "COURSE";
    }): Promise<{
        totalCertificates: number;
        issuedCertificates: number;
        revokedCertificates: number;
        expiredCertificates: number;
        byType: Record<CertificateType, number>;
        byMonth: Record<string, number>;
        byProgram: Record<string, number>;
    }>;
    /**
     * Validar si un usuario puede obtener un certificado
     */
    canUserGetCertificate(userId: string, programId: string, programType: "EVENT" | "COURSE"): Promise<{
        canGet: boolean;
        reason?: string;
        existingCertificate?: Certificate;
    }>;
    private formatUserName;
    private formatOrganizerName;
    /**
     * Generar certificados masivamente para un evento
     */
    generateBulkEventCertificates(eventId: string, templateId?: string, requestedBy?: string): Promise<{
        generated: Certificate[];
        errors: {
            participationId: string;
            error: string;
        }[];
    }>;
}
//# sourceMappingURL=CertificateManagementService.d.ts.map