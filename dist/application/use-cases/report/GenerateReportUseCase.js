"use strict";
/**
 * GenerateReportUseCase - Application Layer
 *
 * Caso de uso para generar reportes del sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportUseCase = void 0;
class GenerateReportUseCase {
    constructor(reportManagementService) {
        this.reportManagementService = reportManagementService;
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
            const report = await this.reportManagementService.generateReport(request.type, request.format, request.requestedBy, request.filters || {}, request.isPublic || false, request.description);
            // Generar token de descarga
            const downloadToken = await this.reportManagementService.generateDownloadToken(report.id);
            return {
                success: true,
                report,
                downloadToken,
                message: "Reporte generado exitosamente",
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            return {
                success: false,
                message: `Error generando reporte: ${errorMessage}`,
            };
        }
    }
    validateRequest(request) {
        const errors = [];
        if (!request.requestedBy?.trim()) {
            errors.push("El solicitante es requerido");
        }
        const validTypes = [
            "USERS",
            "EVENTS",
            "COURSES",
            "CERTIFICATES",
            "PARTICIPATIONS",
            "SYSTEM",
        ];
        if (!validTypes.includes(request.type)) {
            errors.push("Tipo de reporte inválido");
        }
        const validFormats = ["PDF", "EXCEL", "CSV", "JSON"];
        if (!validFormats.includes(request.format)) {
            errors.push("Formato de reporte inválido");
        }
        // Validar rango de fechas si se proporcionan
        if (request.filters?.startDate && request.filters?.endDate) {
            if (request.filters.startDate > request.filters.endDate) {
                errors.push("Fecha de inicio no puede ser posterior a fecha de fin");
            }
        }
        return errors;
    }
}
exports.GenerateReportUseCase = GenerateReportUseCase;
//# sourceMappingURL=GenerateReportUseCase.js.map