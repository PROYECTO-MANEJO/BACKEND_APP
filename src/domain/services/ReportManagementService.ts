/**
 * ReportManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de reportes del sistema.
 */

import {
  Report,
  ReportData,
  ReportType,
  ReportFormat,
  ReportFilters,
} from "../entities/Report";

export interface IReportRepository {
  create(report: Report): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findAll(): Promise<Report[]>;
  update(id: string, report: Report): Promise<Report>;
  delete(id: string): Promise<void>;

  // Consultas especializadas
  findByRequester(requesterId: string): Promise<Report[]>;
  findByType(reportType: ReportType): Promise<Report[]>;
  findByStatus(status: string): Promise<Report[]>;
  findExpired(): Promise<Report[]>;

  // Filtros avanzados
  findWithFilters(filters: {
    requesterId?: string;
    reportType?: ReportType;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Report[]>;
}

export interface IDataQueryService {
  // Consultas financieras
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
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    paymentMethods: Array<{ method: string; count: number; total: number }>;
  }>;

  // Consultas de inscripciones
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

  // Consultas de eventos
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

  // Consultas de cursos
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

  // Consultas de actividad de usuarios
  getUserActivityData(filters: ReportFilters): Promise<{
    activeUsers: number;
    usersByCareer: Array<{ career: string; count: number }>;
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

  // Consultas de certificados
  getCertificatesData(filters: ReportFilters): Promise<{
    totalCertificates: number;
    certificatesByType: Array<{ type: string; count: number }>;
    certificatesByMonth: Array<{ month: string; count: number }>;
    certificatesByProgram: Array<{
      programName: string;
      certificateCount: number;
      programType: string;
    }>;
  }>;

  // Consulta personalizada
  executeCustomQuery(query: string, parameters?: any[]): Promise<any[]>;
}

export interface IReportGeneratorService {
  generatePDFReport(
    reportData: any,
    template?: string
  ): Promise<{
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
  saveFile(
    buffer: Buffer,
    fileName: string,
    folder: string
  ): Promise<{
    filePath: string;
    downloadUrl: string;
  }>;

  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): Promise<string>;
}

export class ReportManagementService {
  constructor(
    private reportRepository: IReportRepository,
    private dataQueryService: IDataQueryService,
    private reportGenerator: IReportGeneratorService,
    private fileStorage: IFileStorageService
  ) {}

  // ✅ CREACIÓN DE REPORTES

  /**
   * Crear reporte financiero
   */
  async createFinancialReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createFinancialReport(requestedBy, format, filters);
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte de inscripciones
   */
  async createInscriptionsReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createInscriptionsReport(
      requestedBy,
      format,
      filters
    );
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte de eventos
   */
  async createEventsReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createEventsReport(requestedBy, format, filters);
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte de cursos
   */
  async createCoursesReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createCoursesReport(requestedBy, format, filters);
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte de actividad de usuarios
   */
  async createUserActivityReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createUserActivityReport(
      requestedBy,
      format,
      filters
    );
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte de certificados
   */
  async createCertificatesReport(
    requestedBy: string,
    format: ReportFormat = "PDF",
    filters: ReportFilters = {}
  ): Promise<Report> {
    const report = Report.createCertificatesReport(
      requestedBy,
      format,
      filters
    );
    return await this.reportRepository.create(report);
  }

  /**
   * Crear reporte personalizado
   */
  async createCustomReport(
    title: string,
    description: string,
    requestedBy: string,
    format: ReportFormat,
    filters: ReportFilters
  ): Promise<Report> {
    const report = Report.createCustomReport(
      title,
      description,
      requestedBy,
      format,
      filters
    );
    return await this.reportRepository.create(report);
  }

  // ✅ GENERACIÓN DE REPORTES

  /**
   * Generar reporte completo (obtener datos + generar archivo)
   */
  async generateReport(reportId: string): Promise<Report> {
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
      const storageResult = await this.fileStorage.saveFile(
        fileResult.buffer,
        this.generateFileName(report),
        "reports"
      );

      // Calcular resumen
      const summary = this.calculateReportSummary(
        reportData,
        report.reportType
      );

      // Marcar como completado
      report.markAsCompleted(
        storageResult.filePath,
        fileResult.fileSize,
        summary.totalRecords,
        summary,
        storageResult.downloadUrl
      );

      return await this.reportRepository.update(reportId, report);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      report.markAsFailed(errorMessage);
      await this.reportRepository.update(reportId, report);
      throw error;
    }
  }

  /**
   * Obtener datos del reporte según su tipo
   */
  private async getReportData(report: Report): Promise<any> {
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
          return await this.dataQueryService.executeCustomQuery(
            filters.customFilters.query,
            filters.customFilters.parameters
          );
        }
        throw new Error(
          "Reporte personalizado requiere una consulta específica"
        );

      default:
        throw new Error(`Tipo de reporte no soportado: ${report.reportType}`);
    }
  }

  /**
   * Generar archivo del reporte en el formato solicitado
   */
  private async generateReportFile(
    report: Report,
    data: any
  ): Promise<{
    buffer: Buffer;
    filePath: string;
    fileSize: number;
  }> {
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
  private calculateReportSummary(data: any, reportType: ReportType): any {
    const summary: any = {
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
            eventInscriptions:
              data.eventInscriptions?.reduce(
                (acc: number, item: any) => acc + item.total,
                0
              ) || 0,
            courseInscriptions:
              data.courseInscriptions?.reduce(
                (acc: number, item: any) => acc + item.total,
                0
              ) || 0,
          };
          break;

        case "EVENTS_SUMMARY":
          summary.totalRecords = data.events?.length || 0;
          summary.averages = {
            inscriptionsPerEvent: data.averageInscriptionsPerEvent || 0,
          };
          summary.counts = {
            totalEvents: data.events?.length || 0,
            totalInscriptions:
              data.events?.reduce(
                (acc: number, event: any) => acc + event.inscriptions,
                0
              ) || 0,
          };
          break;

        case "COURSES_SUMMARY":
          summary.totalRecords = data.courses?.length || 0;
          summary.averages = {
            inscriptionsPerCourse: data.averageInscriptionsPerCourse || 0,
          };
          summary.counts = {
            totalCourses: data.courses?.length || 0,
            totalInscriptions:
              data.courses?.reduce(
                (acc: number, course: any) => acc + course.inscriptions,
                0
              ) || 0,
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
    } catch (error) {
      console.error("Error calculando resumen del reporte:", error);
      summary.totalRecords = 0;
    }

    return summary;
  }

  /**
   * Generar nombre de archivo único
   */
  private generateFileName(report: Report): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = report.format.toLowerCase();
    return `${report.reportType}_${timestamp}.${extension}`;
  }

  // ✅ GESTIÓN DE REPORTES EXISTENTES

  /**
   * Descargar reporte
   */
  async downloadReport(
    reportId: string,
    userId: string
  ): Promise<{
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  }> {
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
    const downloadUrl =
      report.downloadUrl ||
      (await this.fileStorage.getFileUrl(report.filePath!));

    return {
      downloadUrl,
      fileName: this.generateFileName(report),
      fileSize: report.fileSize || 0,
    };
  }

  /**
   * Regenerar reporte existente
   */
  async regenerateReport(
    reportId: string,
    requestedBy: string
  ): Promise<Report> {
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

    const newReport = Report.fromData(newReportData);
    const savedReport = await this.reportRepository.create(newReport);

    // Generar automáticamente
    return await this.generateReport(savedReport.id!);
  }

  /**
   * Eliminar reportes expirados
   */
  async cleanupExpiredReports(): Promise<number> {
    const expiredReports = await this.reportRepository.findExpired();
    let deletedCount = 0;

    for (const report of expiredReports) {
      try {
        // Eliminar archivo físico
        if (report.filePath) {
          await this.fileStorage.deleteFile(report.filePath);
        }

        // Eliminar registro
        await this.reportRepository.delete(report.id!);
        deletedCount++;
      } catch (error) {
        console.error(`Error eliminando reporte ${report.id}:`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Obtener reportes de un usuario
   */
  async getUserReports(
    userId: string,
    filters?: {
      reportType?: ReportType;
      status?: string;
      limit?: number;
    }
  ): Promise<Report[]> {
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

    return userReports.sort(
      (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()
    );
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getReportStatistics(): Promise<{
    totalReports: number;
    completedReports: number;
    failedReports: number;
    byType: Record<ReportType, number>;
    byFormat: Record<ReportFormat, number>;
    byMonth: Record<string, number>;
    averageGenerationTime: number;
  }> {
    const allReports = await this.reportRepository.findAll();

    const stats = {
      totalReports: allReports.length,
      completedReports: allReports.filter((r) => r.isCompleted()).length,
      failedReports: allReports.filter((r) => r.isFailed()).length,
      byType: {} as Record<ReportType, number>,
      byFormat: {} as Record<ReportFormat, number>,
      byMonth: {} as Record<string, number>,
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
    const completedWithTime = allReports.filter(
      (r) => r.completedAt && r.requestedAt
    );
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce((sum, report) => {
        const diffMs =
          report.completedAt!.getTime() - report.requestedAt.getTime();
        return sum + Math.ceil(diffMs / 1000); // en segundos
      }, 0);
      stats.averageGenerationTime = Math.round(
        totalTime / completedWithTime.length
      );
    }

    return stats;
  }
}
