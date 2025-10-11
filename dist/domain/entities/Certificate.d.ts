/**
 * Certificate Entity - Domain Layer
 *
 * Entidad de dominio que representa un certificado emitido por participación
 * en eventos o cursos. Maneja la lógica de generación, validación y estado.
 */
export type CertificateType = "EVENT_PARTICIPATION" | "COURSE_COMPLETION" | "ACHIEVEMENT" | "ATTENDANCE";
export type CertificateStatus = "DRAFT" | "GENERATED" | "ISSUED" | "REVOKED" | "EXPIRED";
export interface CertificateData {
    id?: string;
    recipientId: string;
    recipientName: string;
    recipientIdentification: string;
    certificateType: CertificateType;
    programId: string;
    programName: string;
    programType: "EVENT" | "COURSE";
    organizerName?: string;
    categoryName?: string;
    participationDate: Date;
    completionDate?: Date;
    issuedDate?: Date;
    expirationDate?: Date;
    duration?: number;
    location?: string;
    description?: string;
    achievements?: string[];
    certificateCode: string;
    templateId?: string;
    digitalSignature?: string;
    verificationCode?: string;
    status: CertificateStatus;
    issuedBy?: string;
    issuerRole?: string;
    issuerSignature?: string;
    version: number;
    previousVersion?: string;
    createdAt: Date;
    updatedAt: Date;
    recipient?: any;
    program?: any;
    participation?: any;
}
export declare class Certificate {
    private data;
    private constructor();
    static createForEventParticipation(recipientId: string, recipientName: string, recipientIdentification: string, eventId: string, eventName: string, participationDate: Date, organizerName?: string, categoryName?: string, duration?: number, location?: string): Certificate;
    static createForCourseCompletion(recipientId: string, recipientName: string, recipientIdentification: string, courseId: string, courseName: string, completionDate: Date, duration?: number, achievements?: string[]): Certificate;
    static fromData(data: CertificateData): Certificate;
    /**
     * Generar el certificado (cambiar estado a GENERATED)
     */
    generate(templateId?: string, digitalSignature?: string): void;
    /**
     * Emitir el certificado (cambiar estado a ISSUED)
     */
    issue(issuedBy: string, issuerRole: string, issuerSignature?: string): void;
    /**
     * Revocar el certificado
     */
    revoke(reason?: string): void;
    /**
     * Crear nueva versión del certificado
     */
    createNewVersion(changes: Partial<CertificateData>): Certificate;
    /**
     * Actualizar información del certificado
     */
    updateInfo(updates: {
        description?: string;
        achievements?: string[];
        location?: string;
        duration?: number;
    }): void;
    /**
     * Validar que los datos del certificado son válidos
     */
    private validateData;
    /**
     * Validar si el certificado puede ser generado
     */
    canBeGenerated(): boolean;
    /**
     * Validar si el certificado puede ser emitido
     */
    canBeIssued(): boolean;
    /**
     * Validar si el certificado puede ser revocado
     */
    canBeRevoked(): boolean;
    /**
     * Verificar si el certificado ha expirado
     */
    hasExpired(): boolean;
    isDraft(): boolean;
    isGenerated(): boolean;
    isIssued(): boolean;
    isRevoked(): boolean;
    isValid(): boolean;
    /**
     * Generar código único de certificado
     */
    private static generateCertificateCode;
    /**
     * Generar código de verificación
     */
    private static generateVerificationCode;
    /**
     * Obtener información para PDF
     */
    getPDFInfo(): {
        recipientName: string;
        recipientIdentification: string;
        programName: string;
        programType: string;
        participationDate: Date;
        completionDate?: Date;
        duration?: number;
        location?: string;
        organizerName?: string;
        categoryName?: string;
        certificateCode: string;
        verificationCode?: string;
        issuedDate?: Date;
        issuedBy?: string;
        achievements?: string[];
    };
    get id(): string | undefined;
    get recipientId(): string;
    get recipientName(): string;
    get programId(): string;
    get programName(): string;
    get certificateType(): CertificateType;
    get status(): CertificateStatus;
    get certificateCode(): string;
    get verificationCode(): string | undefined;
    get participationDate(): Date;
    get issuedDate(): Date | undefined;
    get version(): number;
    get createdAt(): Date;
    get updatedAt(): Date;
    toPlainObject(): CertificateData;
    toJSON(): CertificateData;
}
//# sourceMappingURL=Certificate.d.ts.map