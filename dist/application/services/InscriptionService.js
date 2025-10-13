"use strict";
/**
 * Inscription Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para inscripciones
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscriptionService = void 0;
const InscriptionValidator_1 = require("../../domain/validators/InscriptionValidator");
class InscriptionService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nueva inscripción
     */
    async createInscription(inscriptionRequest) {
        const fechaInscripcion = new Date();
        // ✅ SRP: Delegar validación al InscriptionValidator
        InscriptionValidator_1.InscriptionValidator.validate({
            ced_est: inscriptionRequest.ced_est,
            id_cur: inscriptionRequest.id_cur,
            id_eve: inscriptionRequest.id_eve,
            fecha_inscripcion: fechaInscripcion,
            estado: "PENDIENTE",
            documento_identidad: inscriptionRequest.documento_identidad,
            documento_comprobante: inscriptionRequest.documento_comprobante,
            carta_motivacion: inscriptionRequest.carta_motivacion,
        });
        // ✅ SRP: Validar documentos requeridos (simulado)
        const requiresDocuments = true; // Simulado
        const requiresMotivationLetter = false; // Simulado
        InscriptionValidator_1.InscriptionValidator.validateRequiredDocuments(inscriptionRequest, requiresDocuments, requiresMotivationLetter);
        // ✅ SRP: Validar cupos disponibles (simulado)
        const currentInscriptions = 5; // Simulado
        const maxCapacity = 20; // Simulado
        InscriptionValidator_1.InscriptionValidator.validateCapacity(currentInscriptions, maxCapacity);
        // ✅ SRP: Validar período de inscripción (simulado)
        const startDate = new Date("2024-01-01"); // Simulado
        const endDate = new Date("2024-12-31"); // Simulado
        InscriptionValidator_1.InscriptionValidator.validateInscriptionPeriod(startDate, endDate);
        // ✅ SRP: Lógica de creación de inscripción
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("InscriptionService.createInscription - Archivo de demostración SRP");
        return {
            message: "Inscription creation logic would go here",
            data: inscriptionRequest,
        };
    }
    /**
     * ✅ SRP: Obtener inscripciones por estudiante
     */
    async getInscriptionsByStudent(cedula) {
        // ✅ SRP: Lógica de obtención por estudiante
        console.log("InscriptionService.getInscriptionsByStudent - Archivo de demostración SRP", cedula);
        return [
            { message: "Student inscriptions fetching logic would go here", cedula },
        ];
    }
    /**
     * ✅ SRP: Obtener inscripciones por curso
     */
    async getInscriptionsByCourse(courseId) {
        // ✅ SRP: Lógica de obtención por curso
        console.log("InscriptionService.getInscriptionsByCourse - Archivo de demostración SRP", courseId);
        return [
            { message: "Course inscriptions fetching logic would go here", courseId },
        ];
    }
    /**
     * ✅ SRP: Aprobar inscripción
     */
    async approveInscription(id, observaciones) {
        // ✅ SRP: Lógica de aprobación
        console.log("InscriptionService.approveInscription - Archivo de demostración SRP", id, observaciones);
        return {
            message: "Inscription approval logic would go here",
            id,
            observaciones,
        };
    }
    /**
     * ✅ SRP: Rechazar inscripción
     */
    async rejectInscription(id, observaciones) {
        // ✅ SRP: Lógica de rechazo
        console.log("InscriptionService.rejectInscription - Archivo de demostración SRP", id, observaciones);
        return {
            message: "Inscription rejection logic would go here",
            id,
            observaciones,
        };
    }
    /**
     * ✅ SRP: Cancelar inscripción
     */
    async cancelInscription(id) {
        // ✅ SRP: Lógica de cancelación
        console.log("InscriptionService.cancelInscription - Archivo de demostración SRP", id);
    }
}
exports.InscriptionService = InscriptionService;
//# sourceMappingURL=InscriptionService.js.map