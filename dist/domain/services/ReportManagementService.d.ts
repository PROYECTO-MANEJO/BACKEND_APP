/**
 * ReportManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de reportes del sistema.
 */
import { Report, ReportType, ReportFormat, ReportFilters } from "../entities/Report";
export interface IReportRepository {
    create(report: Report): Promise<Report>;
    findById(id: string): Promise<Report | null>;
    findAll(): Promise<Report[]>;
    update(id: string, report: Report): Promise<Report>;
    delete(id: string): Promise<void>;
    findByRequester(requesterId: string): Promise<Report[]>;
    findByType(reportType: ReportType): Promise<Report[]>;
    findByStatus(status: string): Promise<Report[]>;
    findExpired(): Promise<Report[]>;
    findWithFilters(filters: {
        requesterId?: string;
        reportType?: ReportType;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Report[]>;
}
export interface IDataQueryService {
    getFinancialData(filters: ReportFilters): Promise<{
        eventRevenue: Array<{
            eventName: string;
            revenue: number;
            enrollments: number;
        }>;
        courseRevenue: Array<{
            courseName: string;
            revenue: number;
            enrollments: number;
        }>;
        totalRevenue: number;
        monthlyRevenue: Array<{
            month: string;
            revenue: number;
        }>;
        paymentMethods: Array<{
            method: string;
            count: number;
            total: number;
        }>;
    }>;
    getInscriptionData(filters: ReportFilters): Promise<{
        eventInscriptions: Array<{
            eventId: string;
            eventName: string;
            total: number;
            approved: number;
            pending: number;
            rejected: number;
        }>;
        courseInscriptions: Array<{
            courseId: string;
            courseName: string;
            total: number;
            approved: number;
            pending: number;
            rejected: number;
        }>;
        inscriptionTrends: Array<{
            period: string;
            events: number;
            courses: number;
        }>;
        statusDistribution: Array<{
            status: string;
            count: number;
            percentage: number;
        }>;
    }>;
    getEventsData(filters: ReportFilters): Promise<{
        events: Array<{
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            inscriptions: number;
            revenue: number;
            status: string;
        }>;
        eventsByCategory: Array<{
            category: string;
            count: number;
            totalInscriptions: number;
        }>;
        eventsByMonth: Array<{
            month: string;
            count: number;
            inscriptions: number;
        }>;
        averageInscriptionsPerEvent: number;
    }>;
    getCoursesData(filters: ReportFilters): Promise<{
        courses: Array<{
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            inscriptions: number;
            revenue: number;
            status: string;
        }>;
        coursesByCareer: Array<{
            career: string;
            count: number;
            totalInscriptions: number;
        }>;
        coursesByMonth: Array<{
            month: string;
            count: number;
            inscriptions: number;
        }>;
        averageInscriptionsPerCourse: number;
    }>;
    getUserActivityData(filters: ReportFilters): Promise<{
        activeUsers: number;
        usersByCareer: Array<{
            career: string;
            count: number;
        }>;
        userActivity: Array<{
            month: string;
            registrations: number;
            eventInscriptions: number;
            courseInscriptions: number;
        }>;
        topActiveUsers: Array<{
            userId: string;
            userName: string;
            eventParticipations: number;
            courseCompletions: number;
        }>;
    }>;
    getCertificatesData(filters: ReportFilters): Promise<{
        totalCertificates: number;
        certificatesByType: Array<{
            type: string;
            count: number;
        }>;
        certificatesByMonth: Array<{
            month: string;
            count: number;
        }>;
        certificatesByProgram: Array<{
            programName: string;
            certificateCount: number;
            programType: string;
        }>;
    }>;
    executeCustomQuery(query: string, parameters?: any[]): Promise<any[]>;
}
export interface IReportGeneratorService {
    generatePDFReport(reportData: any, template?: string): Promise<{
        buffer: Buffer;
        filePath: string;
        fileSize: number;
    }>;
    generateExcelReport(reportData: any): Promise<{
        buffer: Buffer;
        filePath: string;
        fileSize: number;
    }>;
    generateCSVReport(reportData: any): Promise<{
        buffer: Buffer;
        filePath: string;
        fileSize: number;
    }>;
    generateJSONReport(reportData: any): Promise<{
        buffer: Buffer;
        filePath: string;
        fileSize: number;
    }>;
}
export interface IFileStorageService {
    saveFile(buffer: Buffer, fileName: string, folder: string): Promise<{
        filePath: string;
        downloadUrl: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
    getFileUrl(filePath: string): Promise<string>;
}
export declare class ReportManagementService {
    private reportRepository;
    private dataQueryService;
    private reportGenerator;
    private fileStorage;
    constructor(reportRepository: IReportRepository, dataQueryService: IDataQueryService, reportGenerator: IReportGeneratorService, fileStorage: IFileStorageService);
    /**
     * Crear reporte financiero
     */
    createFinancialReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte de inscripciones
     */
    createInscriptionsReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte de eventos
     */
    createEventsReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte de cursos
     */
    createCoursesReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte de actividad de usuarios
     */
    createUserActivityReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte de certificados
     */
    createCertificatesReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Promise<Report>;
    /**
     * Crear reporte personalizado
     */
    createCustomReport(title: string, description: string, requestedBy: string, format: ReportFormat, filters: ReportFilters): Promise<Report>;
    /**
     * Generar reporte completo (obtener datos + generar archivo)
     */
    generateReport(reportId: string): Promise<Report>;
    /**
     * Obtener datos del reporte según su tipo
     */
    private getReportData;
    /**
     * Generar archivo del reporte en el formato solicitado
     */
    private generateReportFile;
    /**
     * Calcular resumen del reporte
     */
    private calculateReportSummary;
    /**
     * Generar nombre de archivo único
     */
    private generateFileName;
    /**
     * Descargar reporte
     */
    downloadReport(reportId: string, userId: string): Promise<{
        downloadUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    /**
     * Regenerar reporte existente
     */
    regenerateReport(reportId: string, requestedBy: string): Promise<Report>;
    /**
     * Eliminar reportes expirados
     */
    cleanupExpiredReports(): Promise<number>;
    /**
     * Obtener reportes de un usuario
     */
    getUserReports(userId: string, filters?: {
        reportType?: ReportType;
        status?: string;
        limit?: number;
    }): Promise<Report[]>;
    /**
     * Obtener estadísticas de reportes
     */
    getReportStatistics(): Promise<{
        totalReports: number;
        completedReports: number;
        failedReports: number;
        byType: Record<ReportType, number>;
        byFormat: Record<ReportFormat, number>;
        byMonth: Record<string, number>;
        averageGenerationTime: number;
    }>;
}
//# sourceMappingURL=ReportManagementService.d.ts.map