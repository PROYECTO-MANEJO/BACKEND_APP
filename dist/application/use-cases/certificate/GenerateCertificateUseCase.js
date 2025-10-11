"use strict";
/**
 * GenerateCertificateUseCase - Application Layer
 *
 * Caso de uso para generar certificados de participación/finalización.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCertificateUseCase = void 0;
class GenerateCertificateUseCase {
    constructor(certificateManagementService) {
        this.certificateManagementService = certificateManagementService;
    }
    async execute(request) {
        try {
            // Validar entrada
            const validationErrors = this.validateRequest(request);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: validationErrors,
                };
            }
            let certificate;
            if (request.participationType === "event") {
                if (!request.participationId) {
                    return {
                        success: false,
                        message: "ID de participación es requerido para certificados de eventos",
                    };
                }
                certificate =
                    await this.certificateManagementService.generateEventParticipationCertificate(request.participationId, request.requestedBy, request.templateId);
            }
            else {
                if (!request.completionId) {
                    return {
                        success: false,
                        message: "ID de finalización es requerido para certificados de cursos",
                    };
                }
                certificate =
                    await this.certificateManagementService.generateCourseCompletionCertificate(request.completionId, request.requestedBy, request.templateId);
            }
            return {
                success: true,
                certificate,
                message: "Certificado generado exitosamente",
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            return {
                success: false,
                message: `Error generando certificado: ${errorMessage}`,
            };
        }
    }
    validateRequest(request) {
        const errors = [];
        if (!request.requestedBy?.trim()) {
            errors.push("El solicitante es requerido");
        }
        if (!["event", "course"].includes(request.participationType)) {
            errors.push("Tipo de participación inválido");
        }
        if (request.participationType === "event" &&
            !request.participationId?.trim()) {
            errors.push("ID de participación en evento es requerido");
        }
        if (request.participationType === "course" &&
            !request.completionId?.trim()) {
            errors.push("ID de finalización de curso es requerido");
        }
        return errors;
    }
}
exports.GenerateCertificateUseCase = GenerateCertificateUseCase;
//# sourceMappingURL=GenerateCertificateUseCase.js.map