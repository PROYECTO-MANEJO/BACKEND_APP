/**
 * Reports Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de reportes
 * Separado de ReportsService para cumplir Single Responsibility Principle
 */
export interface ReportValidationData {
    tipo_reporte?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    formato?: string;
    filtros?: Record<string, any>;
}
export declare class ReportsValidator {
    /**
     * ✅ SRP: Solo validación de parámetros de reporte
     */
    static validate(data: ReportValidationData): void;
    /**
     * ✅ SRP: Solo validación de filtros específicos
     */
    static validateFilters(tipoReporte: string, filtros: Record<string, any>): void;
    private static validateInscriptionFilters;
    private static validateCertificateFilters;
    private static validateCourseFilters;
    private static validateEventFilters;
    private static validateUserFilters;
}
//# sourceMappingURL=ReportsValidator.d.ts.map