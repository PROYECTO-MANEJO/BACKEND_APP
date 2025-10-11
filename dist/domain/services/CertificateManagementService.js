"use strict";
/**
 * CertificateManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de certificados del sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateManagementService = void 0;
const Certificate_1 = require("../entities/Certificate");
class CertificateManagementService {
    constructor(certificateRepository, participationRepository, pdfGenerator, digitalSignature) {
        this.certificateRepository = certificateRepository;
        this.participationRepository = participationRepository;
        this.pdfGenerator = pdfGenerator;
        this.digitalSignature = digitalSignature;
    }
    // ✅ GENERACIÓN DE CERTIFICADOS POR PARTICIPACIÓN
    /**
     * Generar certificado por participación en evento
     */
    async generateEventParticipationCertificate(participationId, requestedBy, templateId) {
        // 1. Obtener información de la participación
        const participation = await this.participationRepository.findEventParticipationById(participationId);
        if (!participation) {
            throw new Error("Participación no encontrada");
        }
        // Validar que la participación pertenece al usuario solicitante o que es administrador
        if (participation.inscripcion?.id_usu_ins !== requestedBy) {
            // Aquí se podría agregar validación de rol administrativo
            // Por ahora permitimos la generación
        }
        // Validar que la participación está completa/aprobada
        if (participation.inscripcion?.estado_pago !== "APROBADO") {
            throw new Error("La inscripción debe estar aprobada para generar el certificado");
        }
        // 2. Verificar si ya existe un certificado para esta participación
        const existingCertificate = await this.certificateRepository.existsByRecipientAndProgram(participation.inscripcion.id_usu_ins, participation.inscripcion.id_eve_ins, "EVENT");
        if (existingCertificate) {
            throw new Error("Ya existe un certificado para esta participación");
        }
        // 3. Crear entidad de certificado
        const certificate = Certificate_1.Certificate.createForEventParticipation(participation.inscripcion.id_usu_ins, this.formatUserName(participation.inscripcion.usuario), participation.inscripcion.usuario.ced_usu, participation.inscripcion.id_eve_ins, participation.inscripcion.evento.nom_eve, participation.inscripcion.fec_ins, this.formatOrganizerName(participation.inscripcion.evento.organizador), participation.inscripcion.evento.categoria?.nom_cat, participation.inscripcion.evento.dur_eve, participation.inscripcion.evento.lug_eve);
        // 4. Generar certificado
        await this.processCertificateGeneration(certificate, templateId);
        // 5. Guardar en repositorio
        return await this.certificateRepository.create(certificate);
    }
    /**
     * Generar certificado por finalización de curso
     */
    async generateCourseCompletionCertificate(completionId, requestedBy, templateId) {
        // 1. Obtener información de la finalización
        const completion = await this.participationRepository.findCourseCompletionById(completionId);
        if (!completion) {
            throw new Error("Finalización de curso no encontrada");
        }
        // Validar permisos
        if (completion.id_usu_ins_cur !== requestedBy) {
            // Validación de rol administrativo aquí
        }
        // Validar estado
        if (completion.estado_pago_cur !== "APROBADO") {
            throw new Error("La inscripción al curso debe estar aprobada");
        }
        // 2. Verificar certificado existente
        const existingCertificate = await this.certificateRepository.existsByRecipientAndProgram(completion.id_usu_ins_cur, completion.id_cur_ins, "COURSE");
        if (existingCertificate) {
            throw new Error("Ya existe un certificado para esta finalización de curso");
        }
        // 3. Crear entidad
        const certificate = Certificate_1.Certificate.createForCourseCompletion(completion.id_usu_ins_cur, this.formatUserName(completion.usuario), completion.usuario.ced_usu, completion.id_cur_ins, completion.curso.nom_cur, completion.fec_ins_cur, completion.curso.dur_cur);
        // 4. Generar
        await this.processCertificateGeneration(certificate, templateId);
        // 5. Guardar
        return await this.certificateRepository.create(certificate);
    }
    // ✅ GESTIÓN DEL CICLO DE VIDA
    /**
     * Procesar generación completa del certificado
     */
    async processCertificateGeneration(certificate, templateId) {
        try {
            // 1. Generar PDF
            const pdfData = await this.pdfGenerator.generateCertificatePDF(certificate.getPDFInfo(), templateId);
            // 2. Firmar digitalmente si está disponible
            let digitalSignature;
            if (this.digitalSignature) {
                digitalSignature = await this.digitalSignature.signDocument(pdfData.buffer, certificate.certificateCode);
            }
            // 3. Actualizar certificado con información generada
            certificate.generate(templateId, digitalSignature);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            throw new Error(`Error al generar certificado: ${errorMessage}`);
        }
    }
    /**
     * Emitir certificado oficialmente
     */
    async issueCertificate(certificateId, issuedBy, issuerRole, issuerSignature) {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new Error("Certificado no encontrado");
        }
        if (!certificate.canBeIssued()) {
            throw new Error("El certificado no puede ser emitido en su estado actual");
        }
        certificate.issue(issuedBy, issuerRole, issuerSignature);
        return await this.certificateRepository.update(certificateId, certificate);
    }
    /**
     * Revocar certificado
     */
    async revokeCertificate(certificateId, reason, revokedBy) {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new Error("Certificado no encontrado");
        }
        if (!certificate.canBeRevoked()) {
            throw new Error("El certificado no puede ser revocado");
        }
        certificate.revoke(`${reason} (Revocado por: ${revokedBy})`);
        return await this.certificateRepository.update(certificateId, certificate);
    }
    /**
     * Crear nueva versión de certificado
     */
    async createCertificateVersion(originalId, changes, requestedBy) {
        const originalCertificate = await this.certificateRepository.findById(originalId);
        if (!originalCertificate) {
            throw new Error("Certificado original no encontrado");
        }
        const newVersion = originalCertificate.createNewVersion(changes);
        return await this.certificateRepository.create(newVersion);
    }
    // ✅ CONSULTAS Y VALIDACIONES
    /**
     * Verificar certificado por código de verificación
     */
    async verifyCertificateByCode(verificationCode) {
        const certificate = await this.certificateRepository.findByVerificationCode(verificationCode);
        if (!certificate) {
            return {
                isValid: false,
                status: "NOT_FOUND",
                message: "Certificado no encontrado con el código proporcionado",
            };
        }
        if (certificate.isRevoked()) {
            return {
                isValid: false,
                certificate,
                status: "REVOKED",
                message: "El certificado ha sido revocado",
            };
        }
        if (certificate.hasExpired()) {
            return {
                isValid: false,
                certificate,
                status: "EXPIRED",
                message: "El certificado ha expirado",
            };
        }
        if (!certificate.isIssued()) {
            return {
                isValid: false,
                certificate,
                status: "NOT_ISSUED",
                message: "El certificado no ha sido emitido oficialmente",
            };
        }
        return {
            isValid: true,
            certificate,
            status: "VALID",
            message: "Certificado válido y vigente",
        };
    }
    /**
     * Obtener certificados de un usuario
     */
    async getUserCertificates(userId, filters) {
        return await this.certificateRepository.findWithFilters({
            recipientId: userId,
            ...filters,
        });
    }
    /**
     * Obtener certificados de un programa (evento/curso)
     */
    async getProgramCertificates(programId, programType, filters) {
        return await this.certificateRepository.findWithFilters({
            programId,
            programType,
            ...filters,
        });
    }
    /**
     * Generar estadísticas de certificados
     */
    async getCertificateStatistics(filters) {
        const certificates = await this.certificateRepository.findWithFilters(filters || {});
        const stats = {
            totalCertificates: certificates.length,
            issuedCertificates: certificates.filter((c) => c.isIssued()).length,
            revokedCertificates: certificates.filter((c) => c.isRevoked()).length,
            expiredCertificates: certificates.filter((c) => c.hasExpired()).length,
            byType: {},
            byMonth: {},
            byProgram: {},
        };
        // Agrupar por tipo
        certificates.forEach((cert) => {
            stats.byType[cert.certificateType] =
                (stats.byType[cert.certificateType] || 0) + 1;
            // Por mes
            const month = cert.createdAt.toISOString().substring(0, 7); // YYYY-MM
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
            // Por programa
            stats.byProgram[cert.programName] =
                (stats.byProgram[cert.programName] || 0) + 1;
        });
        return stats;
    }
    /**
     * Validar si un usuario puede obtener un certificado
     */
    async canUserGetCertificate(userId, programId, programType) {
        // Verificar si ya existe certificado
        const existingCertificate = await this.certificateRepository.existsByRecipientAndProgram(userId, programId, programType);
        if (existingCertificate) {
            const certificate = programType === "EVENT"
                ? await this.certificateRepository.findWithFilters({
                    recipientId: userId,
                    programId,
                    programType: "EVENT",
                })
                : await this.certificateRepository.findWithFilters({
                    recipientId: userId,
                    programId,
                    programType: "COURSE",
                });
            return {
                canGet: false,
                reason: "Ya existe un certificado para este programa",
                existingCertificate: certificate[0],
            };
        }
        // Verificar participación
        let participation;
        if (programType === "EVENT") {
            participation =
                await this.participationRepository.findEventParticipationByUserAndEvent(userId, programId);
        }
        else {
            participation =
                await this.participationRepository.findCourseCompletionByUserAndCourse(userId, programId);
        }
        if (!participation) {
            return {
                canGet: false,
                reason: "No se encontró participación en el programa",
            };
        }
        // Verificar estado de aprobación
        const isApproved = programType === "EVENT"
            ? participation.inscripcion?.estado_pago === "APROBADO"
            : participation.estado_pago_cur === "APROBADO";
        if (!isApproved) {
            return {
                canGet: false,
                reason: "La inscripción debe estar aprobada para generar el certificado",
            };
        }
        return { canGet: true };
    }
    // ✅ MÉTODOS AUXILIARES
    formatUserName(user) {
        const nombres = [user.nom_usu1, user.nom_usu2].filter(Boolean).join(" ");
        const apellidos = [user.ape_usu1, user.ape_usu2].filter(Boolean).join(" ");
        return `${nombres} ${apellidos}`.trim();
    }
    formatOrganizerName(organizer) {
        if (!organizer)
            return undefined;
        const nombres = [organizer.nom_org1, organizer.nom_org2]
            .filter(Boolean)
            .join(" ");
        const apellidos = [organizer.ape_org1, organizer.ape_org2]
            .filter(Boolean)
            .join(" ");
        return `${nombres} ${apellidos}`.trim();
    }
    // ✅ GENERACIÓN MASIVA
    /**
     * Generar certificados masivamente para un evento
     */
    async generateBulkEventCertificates(eventId, templateId, requestedBy) {
        // Obtener todas las participaciones aprobadas del evento
        const participations = await this.participationRepository.findEventParticipationByUserAndEvent("", eventId);
        const results = {
            generated: [],
            errors: [],
        };
        for (const participation of participations) {
            try {
                // Verificar si no existe certificado
                const exists = await this.certificateRepository.existsByRecipientAndProgram(participation.inscripcion.id_usu_ins, eventId, "EVENT");
                if (!exists) {
                    const certificate = await this.generateEventParticipationCertificate(participation.id_par, requestedBy || "SYSTEM", templateId);
                    results.generated.push(certificate);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Error desconocido";
                results.errors.push({
                    participationId: participation.id_par,
                    error: errorMessage,
                });
            }
        }
        return results;
    }
}
exports.CertificateManagementService = CertificateManagementService;
//# sourceMappingURL=CertificateManagementService.js.map