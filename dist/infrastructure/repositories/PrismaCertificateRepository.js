"use strict";
/**
 * PrismaCertificateRepository - Infrastructure Layer
 *
 * Implementación simplificada del repositorio de certificados.
 * Nota: Esta es una implementación de ejemplo para demostrar la estructura.
 * En producción requiere el esquema de Prisma apropiado.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCertificateRepository = void 0;
class PrismaCertificateRepository {
    constructor() {
        this.certificates = new Map();
    }
    async save(certificate) {
        // Implementación de ejemplo con almacenamiento en memoria
        // En producción esto sería una operación de Prisma
        const id = certificate.id || this.generateId();
        this.certificates.set(id, certificate);
        return certificate;
    }
    async findById(id) {
        return this.certificates.get(id) || null;
    }
    async findByVerificationCode(verificationCode) {
        for (const certificate of this.certificates.values()) {
            if (certificate.verificationCode === verificationCode) {
                return certificate;
            }
        }
        return null;
    }
    async findByParticipationId(participationId) {
        // Implementación simplificada - en producción buscaría por participationId en BD
        return Array.from(this.certificates.values());
    }
    async findByCompletionId(completionId) {
        // Implementación simplificada - en producción buscaría por completionId en BD
        return Array.from(this.certificates.values());
    }
    async findByRecipientId(recipientId) {
        return Array.from(this.certificates.values()).filter((cert) => cert.recipientId === recipientId);
    }
    async findByStatus(status) {
        return Array.from(this.certificates.values()).filter((cert) => cert.status === status);
    }
    async findByType(type) {
        // Implementación simplificada - mapearía certificateType a EVENT/COURSE
        return Array.from(this.certificates.values());
    }
    async findByDateRange(startDate, endDate) {
        return Array.from(this.certificates.values()).filter((cert) => {
            const certDate = cert.participationDate;
            return certDate >= startDate && certDate <= endDate;
        });
    }
    async findWithFilters(filters) {
        let results = Array.from(this.certificates.values());
        if (filters.recipientId) {
            results = results.filter((cert) => cert.recipientId === filters.recipientId);
        }
        if (filters.status) {
            results = results.filter((cert) => cert.status === filters.status);
        }
        if (filters.startDate && filters.endDate) {
            results = results.filter((cert) => {
                const certDate = cert.participationDate;
                return certDate >= filters.startDate && certDate <= filters.endDate;
            });
        }
        return results;
    }
    async countByStatus(status) {
        return Array.from(this.certificates.values()).filter((cert) => cert.status === status).length;
    }
    async countByType(type) {
        // Implementación simplificada
        return this.certificates.size;
    }
    async getStatistics() {
        const total = this.certificates.size;
        const byStatus = {};
        const byType = {};
        // Contar por estado
        for (const cert of this.certificates.values()) {
            byStatus[cert.status] = (byStatus[cert.status] || 0) + 1;
            byType[cert.certificateType] = (byType[cert.certificateType] || 0) + 1;
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const issuedThisMonth = Array.from(this.certificates.values()).filter((cert) => cert.issuedDate && cert.issuedDate >= startOfMonth).length;
        const issuedThisYear = Array.from(this.certificates.values()).filter((cert) => cert.issuedDate && cert.issuedDate >= startOfYear).length;
        return { total, byStatus, byType, issuedThisMonth, issuedThisYear };
    }
    async update(certificate) {
        return await this.save(certificate);
    }
    async deleteById(id) {
        return this.certificates.delete(id);
    }
    async existsByVerificationCode(verificationCode) {
        for (const certificate of this.certificates.values()) {
            if (certificate.verificationCode === verificationCode) {
                return true;
            }
        }
        return false;
    }
    async findExpiringInDateRange(startDate, endDate) {
        // Implementación simplificada - en producción buscaría por expirationDate
        return Array.from(this.certificates.values());
    }
    async findPendingGeneration() {
        return Array.from(this.certificates.values()).filter((cert) => cert.status === "DRAFT");
    }
    async findPotentialDuplicates(recipientId, eventOrCourseId, type) {
        return Array.from(this.certificates.values()).filter((cert) => cert.recipientId === recipientId && cert.programId === eventOrCourseId);
    }
    generateId() {
        return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.PrismaCertificateRepository = PrismaCertificateRepository;
//# sourceMappingURL=PrismaCertificateRepository.js.map