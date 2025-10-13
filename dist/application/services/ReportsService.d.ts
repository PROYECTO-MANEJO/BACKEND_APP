/**
 * Reports Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para reportes
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface GenerateReportRequest {
    tipo_reporte: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    formato: string;
    filtros?: Record<string, any>;
}
export interface ReportData {
    titulo: string;
    fecha_generacion: Date;
    datos: any[];
    metadata: {
        total_registros: number;
        filtros_aplicados: Record<string, any>;
    };
}
export declare class ReportsService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Generar reporte
     */
    generateReport(reportRequest: GenerateReportRequest): Promise<ReportData>;
    /**
     * ✅ SRP: Generar reporte de inscripciones
     */
    generateInscriptionsReport(fecha_inicio?: Date, fecha_fin?: Date, filtros?: Record<string, any>): Promise<ReportData>;
    /**
     * ✅ SRP: Generar reporte de certificados
     */
    generateCertificatesReport(fecha_inicio?: Date, fecha_fin?: Date, filtros?: Record<string, any>): Promise<ReportData>;
    /**
     * ✅ SRP: Generar reporte de estadísticas generales
     */
    generateStatisticsReport(): Promise<ReportData>;
    /**
     * ✅ SRP: Exportar reporte a PDF
     */
    exportToPDF(reportData: ReportData): Promise<Buffer>;
    /**
     * ✅ SRP: Exportar reporte a Excel
     */
    exportToExcel(reportData: ReportData): Promise<Buffer>;
}
//# sourceMappingURL=ReportsService.d.ts.map