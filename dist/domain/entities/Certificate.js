"use strict";
/**
 * Certificate Entity - Domain Layer
 *
 * Entidad de dominio que representa un certificado emitido por participación
 * en eventos o cursos. Maneja la lógica de generación, validación y estado.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
class Certificate {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    // ✅ FACTORY METHODS
    static createForEventParticipation(recipientId, recipientName, recipientIdentification, eventId, eventName, participationDate, organizerName, categoryName, duration, location) {
        const certificateCode = this.generateCertificateCode("EVENT", eventId, recipientId);
        const certificateData = {
            recipientId,
            recipientName,
            recipientIdentification,
            certificateType: "EVENT_PARTICIPATION",
            programId: eventId,
            programName: eventName,
            programType: "EVENT",
            organizerName,
            categoryName,
            participationDate,
            duration,
            location,
            certificateCode,
            verificationCode: this.generateVerificationCode(),
            status: "DRAFT",
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return new Certificate(certificateData);
    }
    static createForCourseCompletion(recipientId, recipientName, recipientIdentification, courseId, courseName, completionDate, duration, achievements) {
        const certificateCode = this.generateCertificateCode("COURSE", courseId, recipientId);
        const certificateData = {
            recipientId,
            recipientName,
            recipientIdentification,
            certificateType: "COURSE_COMPLETION",
            programId: courseId,
            programName: courseName,
            programType: "COURSE",
            participationDate: completionDate,
            completionDate,
            duration,
            achievements,
            certificateCode,
            verificationCode: this.generateVerificationCode(),
            status: "DRAFT",
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return new Certificate(certificateData);
    }
    static fromData(data) {
        return new Certificate(data);
    }
    // ✅ BUSINESS LOGIC METHODS
    /**
     * Generar el certificado (cambiar estado a GENERATED)
     */
    generate(templateId, digitalSignature) {
        if (this.data.status !== "DRAFT") {
            throw new Error("Solo se pueden generar certificados en estado DRAFT");
        }
        this.data.status = "GENERATED";
        this.data.templateId = templateId;
        this.data.digitalSignature = digitalSignature;
        this.data.updatedAt = new Date();
    }
    /**
     * Emitir el certificado (cambiar estado a ISSUED)
     */
    issue(issuedBy, issuerRole, issuerSignature) {
        if (this.data.status !== "GENERATED") {
            throw new Error("Solo se pueden emitir certificados generados");
        }
        this.data.status = "ISSUED";
        this.data.issuedDate = new Date();
        this.data.issuedBy = issuedBy;
        this.data.issuerRole = issuerRole;
        this.data.issuerSignature = issuerSignature;
        this.data.updatedAt = new Date();
        // Establecer fecha de expiración (opcional, por defecto 5 años)
        if (!this.data.expirationDate) {
            const expiration = new Date();
            expiration.setFullYear(expiration.getFullYear() + 5);
            this.data.expirationDate = expiration;
        }
    }
    /**
     * Revocar el certificado
     */
    revoke(reason) {
        if (!this.isIssued()) {
            throw new Error("Solo se pueden revocar certificados emitidos");
        }
        this.data.status = "REVOKED";
        this.data.description = reason ? `REVOCADO: ${reason}` : "REVOCADO";
        this.data.updatedAt = new Date();
    }
    /**
     * Crear nueva versión del certificado
     */
    createNewVersion(changes) {
        const newData = {
            ...this.data,
            ...changes,
            id: undefined, // Nuevo ID
            version: this.data.version + 1,
            previousVersion: this.data.id,
            status: "DRAFT",
            createdAt: new Date(),
            updatedAt: new Date(),
            issuedDate: undefined,
            issuedBy: undefined,
        };
        return new Certificate(newData);
    }
    /**
     * Actualizar información del certificado
     */
    updateInfo(updates) {
        if (this.isIssued()) {
            throw new Error("No se puede modificar un certificado ya emitido");
        }
        if (updates.description !== undefined) {
            this.data.description = updates.description;
        }
        if (updates.achievements !== undefined) {
            this.data.achievements = updates.achievements;
        }
        if (updates.location !== undefined) {
            this.data.location = updates.location;
        }
        if (updates.duration !== undefined) {
            this.data.duration = updates.duration;
        }
        this.data.updatedAt = new Date();
    }
    // ✅ VALIDATION METHODS
    /**
     * Validar que los datos del certificado son válidos
     */
    validateData() {
        if (!this.data.recipientId?.trim()) {
            throw new Error("El ID del destinatario es obligatorio");
        }
        if (!this.data.recipientName?.trim()) {
            throw new Error("El nombre del destinatario es obligatorio");
        }
        if (!this.data.recipientIdentification?.trim()) {
            throw new Error("La identificación del destinatario es obligatoria");
        }
        if (!this.data.programId?.trim()) {
            throw new Error("El ID del programa es obligatorio");
        }
        if (!this.data.programName?.trim()) {
            throw new Error("El nombre del programa es obligatorio");
        }
        if (!this.data.certificateCode?.trim()) {
            throw new Error("El código del certificado es obligatorio");
        }
        if (!this.data.participationDate) {
            throw new Error("La fecha de participación es obligatoria");
        }
        if (this.data.participationDate > new Date()) {
            throw new Error("La fecha de participación no puede ser futura");
        }
        if (this.data.completionDate &&
            this.data.completionDate < this.data.participationDate) {
            throw new Error("La fecha de finalización no puede ser anterior a la participación");
        }
        if (this.data.duration !== undefined && this.data.duration <= 0) {
            throw new Error("La duración debe ser mayor a 0");
        }
        if (this.data.version <= 0) {
            throw new Error("La versión debe ser mayor a 0");
        }
    }
    /**
     * Validar si el certificado puede ser generado
     */
    canBeGenerated() {
        return (this.data.status === "DRAFT" &&
            !!this.data.recipientId &&
            !!this.data.programId &&
            !!this.data.participationDate);
    }
    /**
     * Validar si el certificado puede ser emitido
     */
    canBeIssued() {
        return this.data.status === "GENERATED";
    }
    /**
     * Validar si el certificado puede ser revocado
     */
    canBeRevoked() {
        return this.data.status === "ISSUED";
    }
    /**
     * Verificar si el certificado ha expirado
     */
    hasExpired() {
        return this.data.expirationDate
            ? new Date() > this.data.expirationDate
            : false;
    }
    // ✅ STATUS METHODS
    isDraft() {
        return this.data.status === "DRAFT";
    }
    isGenerated() {
        return this.data.status === "GENERATED";
    }
    isIssued() {
        return this.data.status === "ISSUED";
    }
    isRevoked() {
        return this.data.status === "REVOKED";
    }
    isValid() {
        return this.isIssued() && !this.hasExpired() && !this.isRevoked();
    }
    // ✅ UTILITY METHODS
    /**
     * Generar código único de certificado
     */
    static generateCertificateCode(type, programId, recipientId) {
        const timestamp = Date.now().toString(36);
        const programHash = programId.substring(0, 4).toUpperCase();
        const recipientHash = recipientId.substring(0, 4).toUpperCase();
        const typePrefix = type.charAt(0);
        return `${typePrefix}${programHash}${recipientHash}${timestamp}`.replace(/[^A-Z0-9]/g, "");
    }
    /**
     * Generar código de verificación
     */
    static generateVerificationCode() {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Obtener información para PDF
     */
    getPDFInfo() {
        return {
            recipientName: this.data.recipientName,
            recipientIdentification: this.data.recipientIdentification,
            programName: this.data.programName,
            programType: this.data.programType,
            participationDate: this.data.participationDate,
            completionDate: this.data.completionDate,
            duration: this.data.duration,
            location: this.data.location,
            organizerName: this.data.organizerName,
            categoryName: this.data.categoryName,
            certificateCode: this.data.certificateCode,
            verificationCode: this.data.verificationCode,
            issuedDate: this.data.issuedDate,
            issuedBy: this.data.issuedBy,
            achievements: this.data.achievements,
        };
    }
    // ✅ GETTERS
    get id() {
        return this.data.id;
    }
    get recipientId() {
        return this.data.recipientId;
    }
    get recipientName() {
        return this.data.recipientName;
    }
    get programId() {
        return this.data.programId;
    }
    get programName() {
        return this.data.programName;
    }
    get certificateType() {
        return this.data.certificateType;
    }
    get status() {
        return this.data.status;
    }
    get certificateCode() {
        return this.data.certificateCode;
    }
    get verificationCode() {
        return this.data.verificationCode;
    }
    get participationDate() {
        return this.data.participationDate;
    }
    get issuedDate() {
        return this.data.issuedDate;
    }
    get version() {
        return this.data.version;
    }
    get createdAt() {
        return this.data.createdAt;
    }
    get updatedAt() {
        return this.data.updatedAt;
    }
    // ✅ SERIALIZATION
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.Certificate = Certificate;
//# sourceMappingURL=Certificate.js.map