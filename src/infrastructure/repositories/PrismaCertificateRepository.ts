/**
 * PrismaCertificateRepository - Infrastructure Layer
 *
 * Implementación simplificada del repositorio de certificados.
 * Nota: Esta es una implementación de ejemplo para demostrar la estructura.
 * En producción requiere el esquema de Prisma apropiado.
 */

import { Certificate } from "../../domain/entities/Certificate";
import { CertificateRepository } from "../../domain/repositories/CertificateRepository";

export class PrismaCertificateRepository implements CertificateRepository {
  private certificates: Map<string, Certificate> = new Map();

  async save(certificate: Certificate): Promise<Certificate> {
    // Implementación de ejemplo con almacenamiento en memoria
    // En producción esto sería una operación de Prisma
    const id = certificate.id || this.generateId();
    this.certificates.set(id, certificate);
    return certificate;
  }

  async findById(id: string): Promise<Certificate | null> {
    return this.certificates.get(id) || null;
  }

  async findByVerificationCode(
    verificationCode: string
  ): Promise<Certificate | null> {
    for (const certificate of this.certificates.values()) {
      if (certificate.verificationCode === verificationCode) {
        return certificate;
      }
    }
    return null;
  }

  async findByParticipationId(participationId: string): Promise<Certificate[]> {
    // Implementación simplificada - en producción buscaría por participationId en BD
    return Array.from(this.certificates.values());
  }

  async findByCompletionId(completionId: string): Promise<Certificate[]> {
    // Implementación simplificada - en producción buscaría por completionId en BD
    return Array.from(this.certificates.values());
  }

  async findByRecipientId(recipientId: string): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      (cert) => cert.recipientId === recipientId
    );
  }

  async findByStatus(
    status: "DRAFT" | "ISSUED" | "REVOKED"
  ): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      (cert) => cert.status === status
    );
  }

  async findByType(type: "EVENT" | "COURSE"): Promise<Certificate[]> {
    // Implementación simplificada - mapearía certificateType a EVENT/COURSE
    return Array.from(this.certificates.values());
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter((cert) => {
      const certDate = cert.participationDate;
      return certDate >= startDate && certDate <= endDate;
    });
  }

  async findWithFilters(filters: {
    recipientId?: string;
    type?: "EVENT" | "COURSE";
    status?: "DRAFT" | "ISSUED" | "REVOKED";
    eventOrCourseId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Certificate[]> {
    let results = Array.from(this.certificates.values());

    if (filters.recipientId) {
      results = results.filter(
        (cert) => cert.recipientId === filters.recipientId
      );
    }

    if (filters.status) {
      results = results.filter((cert) => cert.status === filters.status);
    }

    if (filters.startDate && filters.endDate) {
      results = results.filter((cert) => {
        const certDate = cert.participationDate;
        return certDate >= filters.startDate! && certDate <= filters.endDate!;
      });
    }

    return results;
  }

  async countByStatus(status: "DRAFT" | "ISSUED" | "REVOKED"): Promise<number> {
    return Array.from(this.certificates.values()).filter(
      (cert) => cert.status === status
    ).length;
  }

  async countByType(type: "EVENT" | "COURSE"): Promise<number> {
    // Implementación simplificada
    return this.certificates.size;
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: { [status: string]: number };
    byType: { [type: string]: number };
    issuedThisMonth: number;
    issuedThisYear: number;
  }> {
    const total = this.certificates.size;
    const byStatus: { [status: string]: number } = {};
    const byType: { [type: string]: number } = {};

    // Contar por estado
    for (const cert of this.certificates.values()) {
      byStatus[cert.status] = (byStatus[cert.status] || 0) + 1;
      byType[cert.certificateType] = (byType[cert.certificateType] || 0) + 1;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const issuedThisMonth = Array.from(this.certificates.values()).filter(
      (cert) => cert.issuedDate && cert.issuedDate >= startOfMonth
    ).length;

    const issuedThisYear = Array.from(this.certificates.values()).filter(
      (cert) => cert.issuedDate && cert.issuedDate >= startOfYear
    ).length;

    return { total, byStatus, byType, issuedThisMonth, issuedThisYear };
  }

  async update(certificate: Certificate): Promise<Certificate> {
    return await this.save(certificate);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.certificates.delete(id);
  }

  async existsByVerificationCode(verificationCode: string): Promise<boolean> {
    for (const certificate of this.certificates.values()) {
      if (certificate.verificationCode === verificationCode) {
        return true;
      }
    }
    return false;
  }

  async findExpiringInDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Certificate[]> {
    // Implementación simplificada - en producción buscaría por expirationDate
    return Array.from(this.certificates.values());
  }

  async findPendingGeneration(): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      (cert) => cert.status === "DRAFT"
    );
  }

  async findPotentialDuplicates(
    recipientId: string,
    eventOrCourseId: string,
    type: "EVENT" | "COURSE"
  ): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      (cert) =>
        cert.recipientId === recipientId && cert.programId === eventOrCourseId
    );
  }

  private generateId(): string {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
