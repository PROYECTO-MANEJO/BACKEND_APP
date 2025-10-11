"use strict";
/**
 * ReportManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de reportes del sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportManagementService = void 0;
const Report_1 = require("../entities/Report");
class ReportManagementService {
    constructor(reportRepository, dataQueryService, reportGenerator, fileStorage) {
        this.reportRepository = reportRepository;
        this.dataQueryService = dataQueryService;
        this.reportGenerator = reportGenerator;
        this.fileStorage = fileStorage;
    }
    // ✅ CREACIÓN DE REPORTES
    /**
     * Crear reporte financiero
     */
    async createFinancialReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createFinancialReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte de inscripciones
     */
    async createInscriptionsReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createInscriptionsReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte de eventos
     */
    async createEventsReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createEventsReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte de cursos
     */
    async createCoursesReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createCoursesReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte de actividad de usuarios
     */
    async createUserActivityReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createUserActivityReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte de certificados
     */
    async createCertificatesReport(requestedBy, format = "PDF", filters = {}) {
        const report = Report_1.Report.createCertificatesReport(requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    /**
     * Crear reporte personalizado
     */
    async createCustomReport(title, description, requestedBy, format, filters) {
        const report = Report_1.Report.createCustomReport(title, description, requestedBy, format, filters);
        return await this.reportRepository.create(report);
    }
    // ✅ GENERACIÓN DE REPORTES
    /**
     * Generar reporte completo (obtener datos + generar archivo)
     */
    async generateReport(reportId) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new Error("Reporte no encontrado");
        }
        if (!report.canBeGenerated()) {
            throw new Error("El reporte no puede ser generado en su estado actual");
        }
        try {
            // Iniciar generación
            report.startGeneration();
            await this.reportRepository.update(reportId, report);
            // Obtener datos según el tipo de reporte
            const reportData = await this.getReportData(report);
            // Generar archivo en el formato solicitado
            const fileResult = await this.generateReportFile(report, reportData);
            // Guardar archivo
            const storageResult = await this.fileStorage.saveFile(fileResult.buffer, this.generateFileName(report), "reports");
            // Calcular resumen
            const summary = this.calculateReportSummary(reportData, report.reportType);
            // Marcar como completado
            report.markAsCompleted(storageResult.filePath, fileResult.fileSize, summary.totalRecords, summary, storageResult.downloadUrl);
            return await this.reportRepository.update(reportId, report);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            report.markAsFailed(errorMessage);
            await this.reportRepository.update(reportId, report);
            throw error;
        }
    }
    /**
     * Obtener datos del reporte según su tipo
     */
    async getReportData(report) {
        const filters = report.filters;
        switch (report.reportType) {
            case "FINANCIAL":
                return await this.dataQueryService.getFinancialData(filters);
            case "INSCRIPTIONS":
                return await this.dataQueryService.getInscriptionData(filters);
            case "EVENTS_SUMMARY":
                return await this.dataQueryService.getEventsData(filters);
            case "COURSES_SUMMARY":
                return await this.dataQueryService.getCoursesData(filters);
            case "USER_ACTIVITY":
                return await this.dataQueryService.getUserActivityData(filters);
            case "CERTIFICATES_ISSUED":
                return await this.dataQueryService.getCertificatesData(filters);
            case "CUSTOM":
                // Para reportes personalizados, se podría usar una query específica
                if (filters.customFilters?.query) {
                    return await this.dataQueryService.executeCustomQuery(filters.customFilters.query, filters.customFilters.parameters);
                }
                throw new Error("Reporte personalizado requiere una consulta específica");
            default:
                throw new Error(`Tipo de reporte no soportado: ${report.reportType}`);
        }
    }
    /**
     * Generar archivo del reporte en el formato solicitado
     */
    async generateReportFile(report, data) {
        const reportContent = {
            title: report.title,
            description: report.description,
            generatedAt: new Date(),
            requestedBy: report.requestedBy,
            filters: report.filters,
            data: data,
        };
        switch (report.format) {
            case "PDF":
                return await this.reportGenerator.generatePDFReport(reportContent);
            case "EXCEL":
                return await this.reportGenerator.generateExcelReport(reportContent);
            case "CSV":
                return await this.reportGenerator.generateCSVReport(reportContent);
            case "JSON":
                return await this.reportGenerator.generateJSONReport(reportContent);
            default:
                throw new Error(`Formato no soportado: ${report.format}`);
        }
    }
    /**
     * Calcular resumen del reporte
     */
    calculateReportSummary(data, reportType) {
        const summary = {
            totalRecords: 0,
            counts: {},
            averages: {},
        };
        try {
            switch (reportType) {
                case "FINANCIAL":
                    summary.totalRecords =
                        (data.eventRevenue?.length || 0) +
                            (data.courseRevenue?.length || 0);
                    summary.totalRevenue = data.totalRevenue || 0;
                    summary.counts = {
                        events: data.eventRevenue?.length || 0,
                        courses: data.courseRevenue?.length || 0,
                    };
                    break;
                case "INSCRIPTIONS":
                    summary.totalRecords =
                        (data.eventInscriptions?.length || 0) +
                            (data.courseInscriptions?.length || 0);
                    summary.counts = {
                        eventInscriptions: data.eventInscriptions?.reduce((acc, item) => acc + item.total, 0) || 0,
                        courseInscriptions: data.courseInscriptions?.reduce((acc, item) => acc + item.total, 0) || 0,
                    };
                    break;
                case "EVENTS_SUMMARY":
                    summary.totalRecords = data.events?.length || 0;
                    summary.averages = {
                        inscriptionsPerEvent: data.averageInscriptionsPerEvent || 0,
                    };
                    summary.counts = {
                        totalEvents: data.events?.length || 0,
                        totalInscriptions: data.events?.reduce((acc, event) => acc + event.inscriptions, 0) || 0,
                    };
                    break;
                case "COURSES_SUMMARY":
                    summary.totalRecords = data.courses?.length || 0;
                    summary.averages = {
                        inscriptionsPerCourse: data.averageInscriptionsPerCourse || 0,
                    };
                    summary.counts = {
                        totalCourses: data.courses?.length || 0,
                        totalInscriptions: data.courses?.reduce((acc, course) => acc + course.inscriptions, 0) || 0,
                    };
                    break;
                case "USER_ACTIVITY":
                    summary.totalRecords = data.activeUsers || 0;
                    summary.counts = {
                        activeUsers: data.activeUsers || 0,
                        careerCount: data.usersByCareer?.length || 0,
                    };
                    break;
                case "CERTIFICATES_ISSUED":
                    summary.totalRecords = data.totalCertificates || 0;
                    summary.counts = {
                        totalCertificates: data.totalCertificates || 0,
                        programsWithCertificates: data.certificatesByProgram?.length || 0,
                    };
                    break;
                default:
                    summary.totalRecords = Array.isArray(data) ? data.length : 1;
            }
        }
        catch (error) {
            console.error("Error calculando resumen del reporte:", error);
            summary.totalRecords = 0;
        }
        return summary;
    }
    /**
     * Generar nombre de archivo único
     */
    generateFileName(report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const extension = report.format.toLowerCase();
        return `${report.reportType}_${timestamp}.${extension}`;
    }
    // ✅ GESTIÓN DE REPORTES EXISTENTES
    /**
     * Descargar reporte
     */
    async downloadReport(reportId, userId) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new Error("Reporte no encontrado");
        }
        // Verificar permisos de descarga
        if (report.requestedBy !== userId && !report.isPublic) {
            throw new Error("No tienes permisos para descargar este reporte");
        }
        if (!report.canBeDownloaded()) {
            throw new Error("El reporte no está disponible para descarga");
        }
        // Registrar descarga
        report.recordDownload();
        await this.reportRepository.update(reportId, report);
        // Obtener URL actualizada
        const downloadUrl = report.downloadUrl ||
            (await this.fileStorage.getFileUrl(report.filePath));
        return {
            downloadUrl,
            fileName: this.generateFileName(report),
            fileSize: report.fileSize || 0,
        };
    }
    /**
     * Regenerar reporte existente
     */
    async regenerateReport(reportId, requestedBy) {
        const existingReport = await this.reportRepository.findById(reportId);
        if (!existingReport) {
            throw new Error("Reporte no encontrado");
        }
        // Verificar permisos
        if (existingReport.requestedBy !== requestedBy) {
            throw new Error("Solo el creador del reporte puede regenerarlo");
        }
        if (!existingReport.canBeRegenerated()) {
            throw new Error("El reporte no puede ser regenerado");
        }
        // Crear nuevo reporte basado en el existente
        const newReportData = existingReport.toPlainObject();
        delete newReportData.id;
        newReportData.status = "DRAFT";
        newReportData.requestedAt = new Date();
        newReportData.createdAt = new Date();
        newReportData.updatedAt = new Date();
        newReportData.generatedAt = undefined;
        newReportData.completedAt = undefined;
        newReportData.filePath = undefined;
        newReportData.downloadUrl = undefined;
        newReportData.downloadCount = 0;
        const newReport = Report_1.Report.fromData(newReportData);
        const savedReport = await this.reportRepository.create(newReport);
        // Generar automáticamente
        return await this.generateReport(savedReport.id);
    }
    /**
     * Eliminar reportes expirados
     */
    async cleanupExpiredReports() {
        const expiredReports = await this.reportRepository.findExpired();
        let deletedCount = 0;
        for (const report of expiredReports) {
            try {
                // Eliminar archivo físico
                if (report.filePath) {
                    await this.fileStorage.deleteFile(report.filePath);
                }
                // Eliminar registro
                await this.reportRepository.delete(report.id);
                deletedCount++;
            }
            catch (error) {
                console.error(`Error eliminando reporte ${report.id}:`, error);
            }
        }
        return deletedCount;
    }
    /**
     * Obtener reportes de un usuario
     */
    async getUserReports(userId, filters) {
        const userReports = await this.reportRepository.findWithFilters({
            requesterId: userId,
            reportType: filters?.reportType,
            status: filters?.status,
        });
        // Aplicar límite si se especifica
        if (filters?.limit) {
            return userReports
                .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
                .slice(0, filters.limit);
        }
        return userReports.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }
    /**
     * Obtener estadísticas de reportes
     */
    async getReportStatistics() {
        const allReports = await this.reportRepository.findAll();
        const stats = {
            totalReports: allReports.length,
            completedReports: allReports.filter((r) => r.isCompleted()).length,
            failedReports: allReports.filter((r) => r.isFailed()).length,
            byType: {},
            byFormat: {},
            byMonth: {},
            averageGenerationTime: 0,
        };
        // Agrupar por tipo y formato
        allReports.forEach((report) => {
            // Por tipo
            stats.byType[report.reportType] =
                (stats.byType[report.reportType] || 0) + 1;
            // Por formato
            stats.byFormat[report.format] = (stats.byFormat[report.format] || 0) + 1;
            // Por mes
            const month = report.requestedAt.toISOString().substring(0, 7);
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        });
        // Calcular tiempo promedio de generación
        const completedWithTime = allReports.filter((r) => r.completedAt && r.requestedAt);
        if (completedWithTime.length > 0) {
            const totalTime = completedWithTime.reduce((sum, report) => {
                const diffMs = report.completedAt.getTime() - report.requestedAt.getTime();
                return sum + Math.ceil(diffMs / 1000); // en segundos
            }, 0);
            stats.averageGenerationTime = Math.round(totalTime / completedWithTime.length);
        }
        return stats;
    }
}
exports.ReportManagementService = ReportManagementService;
//# sourceMappingURL=ReportManagementService.js.map