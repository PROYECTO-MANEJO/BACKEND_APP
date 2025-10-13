"use strict";
/**
 * Certificate Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para certificados
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const CertificateValidator_1 = require("../../domain/validators/CertificateValidator");
class CertificateService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nuevo certificado
     */
    async createCertificate(certificateRequest) {
        // ✅ SRP: Delegar validación al CertificateValidator
        CertificateValidator_1.CertificateValidator.validate({
            ced_est: certificateRequest.ced_est,
            id_cur: certificateRequest.id_cur,
            id_eve: certificateRequest.id_eve,
            tipo_certificado: certificateRequest.tipo_certificado,
            fecha_emision: certificateRequest.fecha_emision,
            nota_final: certificateRequest.nota_final,
            porcentaje_asistencia: certificateRequest.porcentaje_asistencia,
        });
        // ✅ SRP: Validar requisitos de aprobación si es necesario
        if (certificateRequest.tipo_certificado === "APROBACION") {
            const notaMinima = 70; // Simulado
            const asistenciaMinima = 80; // Simulado
            CertificateValidator_1.CertificateValidator.validateApprovalRequirements(certificateRequest.nota_final, certificateRequest.porcentaje_asistencia, notaMinima, asistenciaMinima);
        }
        // ✅ SRP: Lógica de creación de certificado
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("CertificateService.createCertificate - Archivo de demostración SRP");
        return {
            message: "Certificate creation logic would go here",
            data: certificateRequest,
        };
    }
    /**
     * ✅ SRP: Obtener certificados por estudiante
     */
    async getCertificatesByStudent(cedula) {
        // ✅ SRP: Lógica de obtención por estudiante
        console.log("CertificateService.getCertificatesByStudent - Archivo de demostración SRP", cedula);
        return [
            { message: "Student certificates fetching logic would go here", cedula },
        ];
    }
    /**
     * ✅ SRP: Obtener certificados por curso
     */
    async getCertificatesByCourse(courseId) {
        // ✅ SRP: Lógica de obtención por curso
        console.log("CertificateService.getCertificatesByCourse - Archivo de demostración SRP", courseId);
        return [
            { message: "Course certificates fetching logic would go here", courseId },
        ];
    }
    /**
     * ✅ SRP: Obtener certificados por evento
     */
    async getCertificatesByEvent(eventId) {
        // ✅ SRP: Lógica de obtención por evento
        console.log("CertificateService.getCertificatesByEvent - Archivo de demostración SRP", eventId);
        return [
            { message: "Event certificates fetching logic would go here", eventId },
        ];
    }
    /**
     * ✅ SRP: Actualizar certificado
     */
    async updateCertificate(id, updateRequest) {
        // ✅ SRP: Delegar validación al CertificateValidator
        CertificateValidator_1.CertificateValidator.validateUpdate(updateRequest);
        // ✅ SRP: Lógica de actualización
        console.log("CertificateService.updateCertificate - Archivo de demostración SRP", id, updateRequest);
        return {
            message: "Certificate update logic would go here",
            id,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Generar PDF del certificado
     */
    async generateCertificatePDF(id) {
        // ✅ SRP: Lógica de generación de PDF
        console.log("CertificateService.generateCertificatePDF - Archivo de demostración SRP", id);
        return Buffer.from("PDF content would go here");
    }
}
exports.CertificateService = CertificateService;
//# sourceMappingURL=CertificateService.js.map