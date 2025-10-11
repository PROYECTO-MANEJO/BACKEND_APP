/**
 * ReportRepository - Domain Repository Interface
 *
 * Interfaz para el repositorio de reportes.
 */

import {
  Report,
  ReportType,
  ReportFormat,
  ReportStatus,
} from "../entities/Report";

export interface ReportRepository {
  /**
   * Guarda un reporte en el repositorio
   */
  save(report: Report): Promise<Report>;

  /**
   * Busca un reporte por ID
   */
  findById(id: string): Promise<Report | null>;

  /**
   * Busca reportes por tipo
   */
  findByType(type: ReportType): Promise<Report[]>;

  /**
   * Busca reportes por formato
   */
  findByFormat(format: ReportFormat): Promise<Report[]>;

  /**
   * Busca reportes por estado
   */
  findByStatus(status: ReportStatus): Promise<Report[]>;

  /**
   * Busca reportes por usuario generador
   */
  findByGeneratedBy(userId: string): Promise<Report[]>;

  /**
   * Busca reportes públicos
   */
  findPublicReports(): Promise<Report[]>;

  /**
   * Busca reportes por rango de fechas de generación
   */
  findByGenerationDateRange(startDate: Date, endDate: Date): Promise<Report[]>;

  /**
   * Busca reportes con filtros múltiples
   */
  findWithFilters(filters: {
    type?: ReportType;
    format?: ReportFormat;
    status?: ReportStatus;
    generatedBy?: string;
    isPublic?: boolean;
    startDate?: Date;
    endDate?: Date;
    fileSize?: { min?: number; max?: number };
  }): Promise<Report[]>;

  /**
   * Cuenta reportes por tipo
   */
  countByType(type: ReportType): Promise<number>;

  /**
   * Cuenta reportes por estado
   */
  countByStatus(status: ReportStatus): Promise<number>;

  /**
   * Obtiene estadísticas de reportes
   */
  getStatistics(): Promise<{
    total: number;
    byType: { [type: string]: number };
    byFormat: { [format: string]: number };
    byStatus: { [status: string]: number };
    generatedThisMonth: number;
    generatedThisYear: number;
    totalFileSize: number;
    averageFileSize: number;
  }>;

  /**
   * Actualiza un reporte existente
   */
  update(report: Report): Promise<Report>;

  /**
   * Elimina un reporte por ID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Busca reportes que expiran en un rango de fechas
   */
  findExpiringInDateRange(startDate: Date, endDate: Date): Promise<Report[]>;

  /**
   * Busca reportes fallidos para reintento
   */
  findFailedReports(): Promise<Report[]>;

  /**
   * Busca reportes por tamaño de archivo (para limpieza)
   */
  findLargeReports(minSizeInMB: number): Promise<Report[]>;

  /**
   * Busca reportes antiguos para archivado/eliminación
   */
  findOldReports(olderThanDays: number): Promise<Report[]>;

  /**
   * Incrementa contador de descargas
   */
  incrementDownloadCount(reportId: string): Promise<void>;

  /**
   * Registra acceso al reporte
   */
  logAccess(
    reportId: string,
    userId: string,
    accessType: "VIEW" | "DOWNLOAD"
  ): Promise<void>;

  /**
   * Obtiene historial de accesos del reporte
   */
  getAccessHistory(reportId: string): Promise<
    Array<{
      userId: string;
      accessType: "VIEW" | "DOWNLOAD";
      accessedAt: Date;
    }>
  >;

  /**
   * Busca reportes similares (mismo tipo y filtros)
   */
  findSimilarReports(
    type: ReportType,
    filters: Record<string, any>,
    excludeId?: string
  ): Promise<Report[]>;

  /**
   * Verifica si el usuario puede acceder al reporte
   */
  canUserAccess(reportId: string, userId: string): Promise<boolean>;

  /**
   * Obtiene reportes más descargados
   */
  getMostDownloaded(limit: number): Promise<Report[]>;
}
