/**
 * CertificateRepository - Domain Repository Interface
 *
 * Interfaz para el repositorio de certificados.
 */

import { Certificate } from "../entities/Certificate";

export interface CertificateRepository {
  /**
   * Guarda un certificado en el repositorio
   */
  save(certificate: Certificate): Promise<Certificate>;

  /**
   * Busca un certificado por ID
   */
  findById(id: string): Promise<Certificate | null>;

  /**
   * Busca un certificado por código de verificación
   */
  findByVerificationCode(verificationCode: string): Promise<Certificate | null>;

  /**
   * Busca certificados por ID de participación en evento
   */
  findByParticipationId(participationId: string): Promise<Certificate[]>;

  /**
   * Busca certificados por ID de finalización de curso
   */
  findByCompletionId(completionId: string): Promise<Certificate[]>;

  /**
   * Busca todos los certificados de un usuario
   */
  findByRecipientId(recipientId: string): Promise<Certificate[]>;

  /**
   * Busca certificados por estado
   */
  findByStatus(status: "DRAFT" | "ISSUED" | "REVOKED"): Promise<Certificate[]>;

  /**
   * Busca certificados por tipo
   */
  findByType(type: "EVENT" | "COURSE"): Promise<Certificate[]>;

  /**
   * Busca certificados por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Certificate[]>;

  /**
   * Busca certificados con filtros múltiples
   */
  findWithFilters(filters: {
    recipientId?: string;
    type?: "EVENT" | "COURSE";
    status?: "DRAFT" | "ISSUED" | "REVOKED";
    eventOrCourseId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Certificate[]>;

  /**
   * Cuenta certificados por estado
   */
  countByStatus(status: "DRAFT" | "ISSUED" | "REVOKED"): Promise<number>;

  /**
   * Cuenta certificados por tipo
   */
  countByType(type: "EVENT" | "COURSE"): Promise<number>;

  /**
   * Obtiene estadísticas de certificados
   */
  getStatistics(): Promise<{
    total: number;
    byStatus: { [status: string]: number };
    byType: { [type: string]: number };
    issuedThisMonth: number;
    issuedThisYear: number;
  }>;

  /**
   * Actualiza un certificado existente
   */
  update(certificate: Certificate): Promise<Certificate>;

  /**
   * Elimina un certificado por ID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Verifica si existe un certificado con el código de verificación
   */
  existsByVerificationCode(verificationCode: string): Promise<boolean>;

  /**
   * Busca certificados que expiran en un rango de fechas (para notificaciones)
   */
  findExpiringInDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Certificate[]>;

  /**
   * Obtiene certificados para generar en lote
   */
  findPendingGeneration(): Promise<Certificate[]>;

  /**
   * Busca duplicados potenciales
   */
  findPotentialDuplicates(
    recipientId: string,
    eventOrCourseId: string,
    type: "EVENT" | "COURSE"
  ): Promise<Certificate[]>;
}
