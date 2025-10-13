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

export class ReportsValidator {
  /**
   * ✅ SRP: Solo validación de parámetros de reporte
   */
  public static validate(data: ReportValidationData): void {
    if (!data.tipo_reporte || data.tipo_reporte.trim().length === 0) {
      throw new Error("El tipo de reporte es requerido");
    }

    const tiposValidos = [
      "INSCRIPCIONES",
      "CERTIFICADOS",
      "CURSOS",
      "EVENTOS",
      "USUARIOS",
    ];
    if (!tiposValidos.includes(data.tipo_reporte)) {
      throw new Error(
        `Tipo de reporte inválido. Debe ser uno de: ${tiposValidos.join(", ")}`
      );
    }

    if (!data.formato || !["PDF", "EXCEL", "CSV"].includes(data.formato)) {
      throw new Error("El formato debe ser PDF, EXCEL o CSV");
    }

    if (data.fecha_inicio && data.fecha_fin) {
      if (data.fecha_inicio > data.fecha_fin) {
        throw new Error(
          "La fecha de inicio no puede ser mayor a la fecha de fin"
        );
      }

      const diffDays =
        (data.fecha_fin.getTime() - data.fecha_inicio.getTime()) /
        (1000 * 60 * 60 * 24);
      if (diffDays > 365) {
        throw new Error("El rango de fechas no puede ser mayor a 365 días");
      }
    }
  }

  /**
   * ✅ SRP: Solo validación de filtros específicos
   */
  public static validateFilters(
    tipoReporte: string,
    filtros: Record<string, any>
  ): void {
    switch (tipoReporte) {
      case "INSCRIPCIONES":
        this.validateInscriptionFilters(filtros);
        break;
      case "CERTIFICADOS":
        this.validateCertificateFilters(filtros);
        break;
      case "CURSOS":
        this.validateCourseFilters(filtros);
        break;
      case "EVENTOS":
        this.validateEventFilters(filtros);
        break;
      case "USUARIOS":
        this.validateUserFilters(filtros);
        break;
    }
  }

  private static validateInscriptionFilters(
    filtros: Record<string, any>
  ): void {
    if (
      filtros.estado &&
      !["PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"].includes(
        filtros.estado
      )
    ) {
      throw new Error("Estado de inscripción inválido");
    }
  }

  private static validateCertificateFilters(
    filtros: Record<string, any>
  ): void {
    if (
      filtros.tipo &&
      !["PARTICIPACION", "APROBACION", "ASISTENCIA"].includes(filtros.tipo)
    ) {
      throw new Error("Tipo de certificado inválido");
    }
  }

  private static validateCourseFilters(filtros: Record<string, any>): void {
    if (
      filtros.modalidad &&
      !["PRESENCIAL", "VIRTUAL", "MIXTA"].includes(filtros.modalidad)
    ) {
      throw new Error("Modalidad de curso inválida");
    }
  }

  private static validateEventFilters(filtros: Record<string, any>): void {
    if (
      filtros.tipo_audiencia &&
      !["ESTUDIANTES", "PROFESIONALES", "GENERAL"].includes(
        filtros.tipo_audiencia
      )
    ) {
      throw new Error("Tipo de audiencia inválido");
    }
  }

  private static validateUserFilters(filtros: Record<string, any>): void {
    if (
      filtros.rol &&
      !["ESTUDIANTE", "ORGANIZADOR", "ADMIN", "DESARROLLADOR"].includes(
        filtros.rol
      )
    ) {
      throw new Error("Rol de usuario inválido");
    }
  }
}
