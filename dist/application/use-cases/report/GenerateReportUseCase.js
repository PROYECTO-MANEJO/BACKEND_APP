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
            // Crear reporte según el tipo específico
            let report;
            switch (request.type) {
                case "FINANCIAL":
                    report = await this.reportManagementService.createFinancialReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "INSCRIPTIONS":
                    report = await this.reportManagementService.createInscriptionsReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "EVENTS_SUMMARY":
                    report = await this.reportManagementService.createEventsReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "COURSES_SUMMARY":
                    report = await this.reportManagementService.createCoursesReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "USER_ACTIVITY":
                    report = await this.reportManagementService.createUserActivityReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "CERTIFICATES_ISSUED":
                    report = await this.reportManagementService.createCertificatesReport(request.requestedBy, request.format, request.filters || {});
                    break;
                case "CUSTOM":
                    report = await this.reportManagementService.createCustomReport("Reporte Personalizado", request.description || "Reporte personalizado generado por usuario", request.requestedBy, request.format, request.filters || {});
                    break;
                default:
                    throw new Error(`Tipo de reporte no soportado: ${request.type}`);
            }
            // Generar el reporte (procesamiento)
            const generatedReport = await this.reportManagementService.generateReport(report.id);
            return {
                success: true,
                report: generatedReport,
                downloadToken: generatedReport.id, // Usando el ID del reporte como token temporal
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
            "FINANCIAL",
            "INSCRIPTIONS",
            "EVENTS_SUMMARY",
            "COURSES_SUMMARY",
            "USER_ACTIVITY",
            "CERTIFICATES_ISSUED",
            "CUSTOM",
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