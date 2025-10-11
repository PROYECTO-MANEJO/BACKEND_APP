/**
 * Report Entity - Domain Layer
 *
 * Entidad de dominio que representa un reporte del sistema.
 * Maneja diferentes tipos de reportes con filtros y generación.
 */

export type ReportType =
  | "FINANCIAL"
  | "INSCRIPTIONS"
  | "EVENTS_SUMMARY"
  | "COURSES_SUMMARY"
  | "USER_ACTIVITY"
  | "CERTIFICATES_ISSUED"
  | "CUSTOM";

export type ReportFormat = "PDF" | "EXCEL" | "CSV" | "JSON";

export type ReportStatus =
  | "DRAFT"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface ReportFilters {
  // Filtros temporales
  startDate?: Date;
  endDate?: Date;
  year?: number;
  month?: number;
  quarter?: number;

  // Filtros por entidades
  eventIds?: string[];
  courseIds?: string[];
  userIds?: string[];
  careerIds?: number[];
  categoryIds?: number[];

  // Filtros de estado
  paymentStatus?: string[];
  eventStatus?: string[];
  courseStatus?: string[];

  // Filtros específicos por tipo de reporte
  includeRevenue?: boolean;
  includeStatistics?: boolean;
  includeCertificates?: boolean;
  groupBy?: string[];

  // Filtros personalizados
  customFilters?: Record<string, any>;
}

export interface ReportData {
  id?: string;
  title: string;
  description?: string;
  reportType: ReportType;
  format: ReportFormat;
  status: ReportStatus;

  // Filtros aplicados
  filters: ReportFilters;

  // Metadatos de generación
  requestedBy: string;
  requestedAt: Date;
  generatedAt?: Date;
  completedAt?: Date;

  // Resultados y contenido
  dataQuery?: string; // Query SQL/ORM usada
  resultCount?: number;
  fileSize?: number;
  filePath?: string;
  downloadUrl?: string;

  // Configuración de formato
  template?: string;
  includeCharts?: boolean;
  includeHeaders?: boolean;
  includeFooters?: boolean;
  customization?: Record<string, any>;

  // Metadatos del contenido
  summary?: {
    totalRecords: number;
    totalRevenue?: number;
    averages?: Record<string, number>;
    counts?: Record<string, number>;
  };

  // Control de acceso y vencimiento
  isPublic: boolean;
  expiresAt?: Date;
  accessTokens?: string[];
  downloadCount: number;
  maxDownloads?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relaciones (para mapeo desde BD)
  requester?: any;
}

export class Report {
  private constructor(private data: ReportData) {
    this.validateData();
  }

  // ✅ FACTORY METHODS

  static createFinancialReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte Financiero",
      description: "Reporte de ingresos por eventos y cursos",
      reportType: "FINANCIAL",
      format,
      status: "DRAFT",
      filters: {
        includeRevenue: true,
        includeStatistics: true,
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createInscriptionsReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte de Inscripciones",
      description: "Reporte de inscripciones a eventos y cursos",
      reportType: "INSCRIPTIONS",
      format,
      status: "DRAFT",
      filters: {
        includeStatistics: true,
        groupBy: ["paymentStatus", "month"],
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createEventsReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte de Eventos",
      description: "Resumen de eventos realizados y programados",
      reportType: "EVENTS_SUMMARY",
      format,
      status: "DRAFT",
      filters: {
        includeStatistics: true,
        includeCertificates: true,
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createCoursesReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte de Cursos",
      description: "Resumen de cursos ofrecidos y completados",
      reportType: "COURSES_SUMMARY",
      format,
      status: "DRAFT",
      filters: {
        includeStatistics: true,
        includeCertificates: true,
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createUserActivityReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte de Actividad de Usuarios",
      description: "Actividad y participación de usuarios en el sistema",
      reportType: "USER_ACTIVITY",
      format,
      status: "DRAFT",
      filters: {
        includeStatistics: true,
        groupBy: ["month", "career"],
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createCertificatesReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Report {
    const reportData: ReportData = {
      title: "Reporte de Certificados",
      description: "Certificados emitidos y estadísticas de emisión",
      reportType: "CERTIFICATES_ISSUED",
      format,
      status: "DRAFT",
      filters: {
        includeStatistics: true,
        groupBy: ["month", "type"],
        ...filters,
      },
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static createCustomReport(
    title: string,
    description: string,
    requestedBy: string,
    format: ReportFormat,
    filters: ReportFilters
  ): Report {
    const reportData: ReportData = {
      title,
      description,
      reportType: "CUSTOM",
      format,
      status: "DRAFT",
      filters,
      requestedBy,
      requestedAt: new Date(),
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Report(reportData);
  }

  static fromData(data: ReportData): Report {
    return new Report(data);
  }

  // ✅ BUSINESS LOGIC METHODS

  /**
   * Iniciar la generación del reporte
   */
  startGeneration(): void {
    if (this.data.status !== "DRAFT") {
      throw new Error("Solo se pueden generar reportes en estado DRAFT");
    }

    this.data.status = "GENERATING";
    this.data.generatedAt = new Date();
    this.data.updatedAt = new Date();
  }

  /**
   * Marcar el reporte como completado
   */
  markAsCompleted(
    filePath: string,
    fileSize: number,
    resultCount: number,
    summary?: ReportData["summary"],
    downloadUrl?: string
  ): void {
    if (this.data.status !== "GENERATING") {
      throw new Error(
        "Solo se pueden completar reportes que están siendo generados"
      );
    }

    this.data.status = "COMPLETED";
    this.data.completedAt = new Date();
    this.data.filePath = filePath;
    this.data.fileSize = fileSize;
    this.data.resultCount = resultCount;
    this.data.downloadUrl = downloadUrl;
    this.data.summary = summary;
    this.data.updatedAt = new Date();

    // Establecer expiración por defecto (30 días)
    if (!this.data.expiresAt) {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 30);
      this.data.expiresAt = expiration;
    }
  }

  /**
   * Marcar el reporte como fallido
   */
  markAsFailed(errorMessage?: string): void {
    if (this.data.status !== "GENERATING") {
      throw new Error(
        "Solo se pueden marcar como fallidos reportes que están siendo generados"
      );
    }

    this.data.status = "FAILED";
    this.data.description = errorMessage
      ? `${this.data.description || ""}\nError: ${errorMessage}`
      : this.data.description;
    this.data.updatedAt = new Date();
  }

  /**
   * Actualizar filtros del reporte (solo si está en DRAFT)
   */
  updateFilters(newFilters: ReportFilters): void {
    if (this.data.status !== "DRAFT") {
      throw new Error("Solo se pueden actualizar filtros de reportes en DRAFT");
    }

    this.data.filters = { ...this.data.filters, ...newFilters };
    this.data.updatedAt = new Date();
  }

  /**
   * Configurar personalización del reporte
   */
  setCustomization(customization: {
    template?: string;
    includeCharts?: boolean;
    includeHeaders?: boolean;
    includeFooters?: boolean;
    customSettings?: Record<string, any>;
  }): void {
    if (this.data.status !== "DRAFT") {
      throw new Error("Solo se puede personalizar reportes en DRAFT");
    }

    this.data.template = customization.template;
    this.data.includeCharts = customization.includeCharts;
    this.data.includeHeaders = customization.includeHeaders;
    this.data.includeFooters = customization.includeFooters;
    this.data.customization = {
      ...this.data.customization,
      ...customization.customSettings,
    };
    this.data.updatedAt = new Date();
  }

  /**
   * Registrar descarga del reporte
   */
  recordDownload(): void {
    if (this.data.status !== "COMPLETED") {
      throw new Error("Solo se pueden descargar reportes completados");
    }

    if (this.hasExpired()) {
      throw new Error(
        "El reporte ha expirado y no está disponible para descarga"
      );
    }

    if (
      this.data.maxDownloads &&
      this.data.downloadCount >= this.data.maxDownloads
    ) {
      throw new Error("Se ha alcanzado el límite máximo de descargas");
    }

    this.data.downloadCount++;
    this.data.updatedAt = new Date();
  }

  /**
   * Configurar límites de acceso
   */
  setAccessLimits(
    maxDownloads?: number,
    expiresAt?: Date,
    isPublic?: boolean
  ): void {
    this.data.maxDownloads = maxDownloads;
    this.data.expiresAt = expiresAt;
    if (isPublic !== undefined) {
      this.data.isPublic = isPublic;
    }
    this.data.updatedAt = new Date();
  }

  /**
   * Generar token de acceso temporal
   */
  generateAccessToken(): string {
    const token = this.generateRandomToken();
    if (!this.data.accessTokens) {
      this.data.accessTokens = [];
    }
    this.data.accessTokens.push(token);
    this.data.updatedAt = new Date();
    return token;
  }

  /**
   * Validar token de acceso
   */
  validateAccessToken(token: string): boolean {
    return this.data.accessTokens?.includes(token) || false;
  }

  // ✅ VALIDATION METHODS

  private validateData(): void {
    if (!this.data.title?.trim()) {
      throw new Error("El título del reporte es obligatorio");
    }

    if (!this.data.requestedBy?.trim()) {
      throw new Error("El solicitante del reporte es obligatorio");
    }

    if (
      !Object.values([
        "FINANCIAL",
        "INSCRIPTIONS",
        "EVENTS_SUMMARY",
        "COURSES_SUMMARY",
        "USER_ACTIVITY",
        "CERTIFICATES_ISSUED",
        "CUSTOM",
      ]).includes(this.data.reportType)
    ) {
      throw new Error("Tipo de reporte inválido");
    }

    if (
      !Object.values(["PDF", "EXCEL", "CSV", "JSON"]).includes(this.data.format)
    ) {
      throw new Error("Formato de reporte inválido");
    }

    if (this.data.downloadCount < 0) {
      throw new Error("El contador de descargas no puede ser negativo");
    }

    if (this.data.maxDownloads !== undefined && this.data.maxDownloads <= 0) {
      throw new Error("El límite máximo de descargas debe ser mayor a 0");
    }
  }

  /**
   * Verificar si el reporte puede ser generado
   */
  canBeGenerated(): boolean {
    return this.data.status === "DRAFT" && !!this.data.requestedBy;
  }

  /**
   * Verificar si el reporte puede ser descargado
   */
  canBeDownloaded(): boolean {
    return (
      this.data.status === "COMPLETED" &&
      !this.hasExpired() &&
      (this.data.maxDownloads === undefined ||
        this.data.downloadCount < this.data.maxDownloads)
    );
  }

  /**
   * Verificar si el reporte ha expirado
   */
  hasExpired(): boolean {
    return this.data.expiresAt ? new Date() > this.data.expiresAt : false;
  }

  /**
   * Verificar si se puede regenerar
   */
  canBeRegenerated(): boolean {
    return this.data.status === "COMPLETED" || this.data.status === "FAILED";
  }

  // ✅ STATUS METHODS

  isDraft(): boolean {
    return this.data.status === "DRAFT";
  }

  isGenerating(): boolean {
    return this.data.status === "GENERATING";
  }

  isCompleted(): boolean {
    return this.data.status === "COMPLETED";
  }

  isFailed(): boolean {
    return this.data.status === "FAILED";
  }

  isExpired(): boolean {
    return this.hasExpired();
  }

  // ✅ UTILITY METHODS

  /**
   * Generar token aleatorio
   */
  private generateRandomToken(): string {
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Obtener configuración de filtros SQL-friendly
   */
  getSQLFilters(): Record<string, any> {
    const sqlFilters: Record<string, any> = {};

    if (this.data.filters.startDate) {
      sqlFilters.startDate = this.data.filters.startDate;
    }
    if (this.data.filters.endDate) {
      sqlFilters.endDate = this.data.filters.endDate;
    }
    if (this.data.filters.eventIds?.length) {
      sqlFilters.eventIds = this.data.filters.eventIds;
    }
    if (this.data.filters.courseIds?.length) {
      sqlFilters.courseIds = this.data.filters.courseIds;
    }
    if (this.data.filters.userIds?.length) {
      sqlFilters.userIds = this.data.filters.userIds;
    }
    if (this.data.filters.paymentStatus?.length) {
      sqlFilters.paymentStatus = this.data.filters.paymentStatus;
    }

    return sqlFilters;
  }

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
  } {
    return {
      title: this.data.title,
      type: this.data.reportType,
      format: this.data.format,
      status: this.data.status,
      requestedAt: this.data.requestedAt,
      completedAt: this.data.completedAt,
      downloadCount: this.data.downloadCount,
      fileSize: this.data.fileSize
        ? this.formatFileSize(this.data.fileSize)
        : undefined,
      resultCount: this.data.resultCount,
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // ✅ GETTERS
  get id(): string | undefined {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get reportType(): ReportType {
    return this.data.reportType;
  }

  get format(): ReportFormat {
    return this.data.format;
  }

  get status(): ReportStatus {
    return this.data.status;
  }

  get requestedBy(): string {
    return this.data.requestedBy;
  }

  get requestedAt(): Date {
    return this.data.requestedAt;
  }

  get completedAt(): Date | undefined {
    return this.data.completedAt;
  }

  get filters(): ReportFilters {
    return { ...this.data.filters };
  }

  get downloadUrl(): string | undefined {
    return this.data.downloadUrl;
  }

  get downloadCount(): number {
    return this.data.downloadCount;
  }

  get resultCount(): number | undefined {
    return this.data.resultCount;
  }

  get summary(): ReportData["summary"] {
    return this.data.summary;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get isPublic(): boolean {
    return this.data.isPublic;
  }

  get filePath(): string | undefined {
    return this.data.filePath;
  }

  get fileSize(): number | undefined {
    return this.data.fileSize;
  }

  // ✅ SERIALIZATION
  toPlainObject(): ReportData {
    return { ...this.data };
  }

  toJSON(): ReportData {
    return this.toPlainObject();
  }
}
