/**
 * Certificate Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de certificados
 * Separado de CertificateService para cumplir Single Responsibility Principle
 */

export interface CertificateValidationData {
  ced_est?: string;
  id_cur?: string;
  id_eve?: string;
  tipo_certificado?: string;
  fecha_emision?: Date;
  nota_final?: number;
  porcentaje_asistencia?: number;
}

export class CertificateValidator {
  /**
   * ✅ SRP: Solo validación de datos de certificado
   */
  public static validate(data: CertificateValidationData): void {
    if (!data.ced_est || data.ced_est.trim().length === 0) {
      throw new Error("La cédula del estudiante es requerida");
    }

    if (
      !data.tipo_certificado ||
      !["PARTICIPACION", "APROBACION", "ASISTENCIA"].includes(
        data.tipo_certificado
      )
    ) {
      throw new Error(
        "El tipo de certificado debe ser PARTICIPACION, APROBACION o ASISTENCIA"
      );
    }

    // Validar que se especifique curso o evento, no ambos
    if (!data.id_cur && !data.id_eve) {
      throw new Error("Se debe especificar un curso o un evento");
    }

    if (data.id_cur && data.id_eve) {
      throw new Error("No se puede especificar tanto curso como evento");
    }

    if (!data.fecha_emision) {
      throw new Error("La fecha de emisión es requerida");
    }

    if (data.fecha_emision > new Date()) {
      throw new Error("La fecha de emisión no puede ser futura");
    }

    // Validaciones específicas para certificado de aprobación
    if (data.tipo_certificado === "APROBACION") {
      if (!data.nota_final || data.nota_final < 0 || data.nota_final > 100) {
        throw new Error("La nota final debe estar entre 0 y 100");
      }

      if (
        !data.porcentaje_asistencia ||
        data.porcentaje_asistencia < 0 ||
        data.porcentaje_asistencia > 100
      ) {
        throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
      }
    }
  }

  /**
   * ✅ SRP: Solo validación de actualización
   */
  public static validateUpdate(data: Partial<CertificateValidationData>): void {
    if (
      data.nota_final !== undefined &&
      (data.nota_final < 0 || data.nota_final > 100)
    ) {
      throw new Error("La nota final debe estar entre 0 y 100");
    }

    if (
      data.porcentaje_asistencia !== undefined &&
      (data.porcentaje_asistencia < 0 || data.porcentaje_asistencia > 100)
    ) {
      throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
    }

    if (data.fecha_emision && data.fecha_emision > new Date()) {
      throw new Error("La fecha de emisión no puede ser futura");
    }
  }

  /**
   * ✅ SRP: Solo validación de requisitos de aprobación
   */
  public static validateApprovalRequirements(
    nota: number,
    asistencia: number,
    notaMinima: number,
    asistenciaMinima: number
  ): void {
    if (nota < notaMinima) {
      throw new Error(
        `La nota ${nota} no cumple con el mínimo requerido de ${notaMinima}`
      );
    }

    if (asistencia < asistenciaMinima) {
      throw new Error(
        `La asistencia ${asistencia}% no cumple con el mínimo requerido de ${asistenciaMinima}%`
      );
    }
  }
}
