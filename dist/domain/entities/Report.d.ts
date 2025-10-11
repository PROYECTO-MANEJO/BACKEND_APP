/**
 * Report Entity - Domain Layer
 *
 * Entidad de dominio que representa un reporte del sistema.
 * Maneja diferentes tipos de reportes con filtros y generación.
 */
export type ReportType = "FINANCIAL" | "INSCRIPTIONS" | "EVENTS_SUMMARY" | "COURSES_SUMMARY" | "USER_ACTIVITY" | "CERTIFICATES_ISSUED" | "CUSTOM";
export type ReportFormat = "PDF" | "EXCEL" | "CSV" | "JSON";
export type ReportStatus = "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED" | "EXPIRED";
export interface ReportFilters {
    startDate?: Date;
    endDate?: Date;
    year?: number;
    month?: number;
    quarter?: number;
    eventIds?: string[];
    courseIds?: string[];
    userIds?: string[];
    careerIds?: number[];
    categoryIds?: number[];
    paymentStatus?: string[];
    eventStatus?: string[];
    courseStatus?: string[];
    includeRevenue?: boolean;
    includeStatistics?: boolean;
    includeCertificates?: boolean;
    groupBy?: string[];
    customFilters?: Record<string, any>;
}
export interface ReportData {
    id?: string;
    title: string;
    description?: string;
    reportType: ReportType;
    format: ReportFormat;
    status: ReportStatus;
    filters: ReportFilters;
    requestedBy: string;
    requestedAt: Date;
    generatedAt?: Date;
    completedAt?: Date;
    dataQuery?: string;
    resultCount?: number;
    fileSize?: number;
    filePath?: string;
    downloadUrl?: string;
    template?: string;
    includeCharts?: boolean;
    includeHeaders?: boolean;
    includeFooters?: boolean;
    customization?: Record<string, any>;
    summary?: {
        totalRecords: number;
        totalRevenue?: number;
        averages?: Record<string, number>;
        counts?: Record<string, number>;
    };
    isPublic: boolean;
    expiresAt?: Date;
    accessTokens?: string[];
    downloadCount: number;
    maxDownloads?: number;
    createdAt: Date;
    updatedAt: Date;
    requester?: any;
}
export declare class Report {
    private data;
    private constructor();
    static createFinancialReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createInscriptionsReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createEventsReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createCoursesReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createUserActivityReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createCertificatesReport(requestedBy: string, format?: ReportFormat, filters?: ReportFilters): Report;
    static createCustomReport(title: string, description: string, requestedBy: string, format: ReportFormat, filters: ReportFilters): Report;
    static fromData(data: ReportData): Report;
    /**
     * Iniciar la generación del reporte
     */
    startGeneration(): void;
    /**
     * Marcar el reporte como completado
     */
    markAsCompleted(filePath: string, fileSize: number, resultCount: number, summary?: ReportData["summary"], downloadUrl?: string): void;
    /**
     * Marcar el reporte como fallido
     */
    markAsFailed(errorMessage?: string): void;
    /**
     * Actualizar filtros del reporte (solo si está en DRAFT)
     */
    updateFilters(newFilters: ReportFilters): void;
    /**
     * Configurar personalización del reporte
     */
    setCustomization(customization: {
        template?: string;
        includeCharts?: boolean;
        includeHeaders?: boolean;
        includeFooters?: boolean;
        customSettings?: Record<string, any>;
    }): void;
    /**
     * Registrar descarga del reporte
     */
    recordDownload(): void;
    /**
     * Configurar límites de acceso
     */
    setAccessLimits(maxDownloads?: number, expiresAt?: Date, isPublic?: boolean): void;
    /**
     * Generar token de acceso temporal
     */
    generateAccessToken(): string;
    /**
     * Validar token de acceso
     */
    validateAccessToken(token: string): boolean;
    private validateData;
    /**
     * Verificar si el reporte puede ser generado
     */
    canBeGenerated(): boolean;
    /**
     * Verificar si el reporte puede ser descargado
     */
    canBeDownloaded(): boolean;
    /**
     * Verificar si el reporte ha expirado
     */
    hasExpired(): boolean;
    /**
     * Verificar si se puede regenerar
     */
    canBeRegenerated(): boolean;
    isDraft(): boolean;
    isGenerating(): boolean;
    isCompleted(): boolean;
    isFailed(): boolean;
    isExpired(): boolean;
    /**
     * Generar token aleatorio
     */
    private generateRandomToken;
    /**
     * Obtener configuración de filtros SQL-friendly
     */
    getSQLFilters(): Record<string, any>;
    /**
     * Obtener resumen para mostrar
     */
    getDisplaySummary(): {
        title: string;
        type: string;
        format: string;
        status: string;
        requestedAt: Date;
        completedAt?: Date;
        downloadCount: number;
        fileSize?: string;
        resultCount?: number;
    };
    /**
     * Formatear tamaño de archivo
     */
    private formatFileSize;
    get id(): string | undefined;
    get title(): string;
    get reportType(): ReportType;
    get format(): ReportFormat;
    get status(): ReportStatus;
    get requestedBy(): string;
    get requestedAt(): Date;
    get completedAt(): Date | undefined;
    get filters(): ReportFilters;
    get downloadUrl(): string | undefined;
    get downloadCount(): number;
    get resultCount(): number | undefined;
    get summary(): ReportData["summary"];
    get description(): string | undefined;
    get isPublic(): boolean;
    get filePath(): string | undefined;
    get fileSize(): number | undefined;
    toPlainObject(): ReportData;
    toJSON(): ReportData;
}
//# sourceMappingURL=Report.d.ts.map