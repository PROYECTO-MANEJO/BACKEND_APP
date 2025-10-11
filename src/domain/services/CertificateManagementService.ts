/**
 * CertificateManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de certificados del sistema.
 */

import {
  Certificate,
  CertificateData,
  CertificateType,
} from "../entities/Certificate";

export interface ICertificateRepository {
  create(certificate: Certificate): Promise<Certificate>;
  findById(id: string): Promise<Certificate | null>;
  findAll(): Promise<Certificate[]>;
  update(id: string, certificate: Certificate): Promise<Certificate>;
  delete(id: string): Promise<void>;

  // Consultas especializadas
  findByRecipient(recipientId: string): Promise<Certificate[]>;
  findByProgram(
    programId: string,
    programType: "EVENT" | "COURSE"
  ): Promise<Certificate[]>;
  findByType(certificateType: CertificateType): Promise<Certificate[]>;
  findByStatus(status: string): Promise<Certificate[]>;
  findByVerificationCode(code: string): Promise<Certificate | null>;
  findByCertificateCode(code: string): Promise<Certificate | null>;

  // Consultas de validación
  existsByRecipientAndProgram(
    recipientId: string,
    programId: string,
    programType: "EVENT" | "COURSE"
  ): Promise<boolean>;
  countByProgram(
    programId: string,
    programType: "EVENT" | "COURSE"
  ): Promise<number>;

  // Filtros avanzados
  findWithFilters(filters: {
    recipientId?: string;
    programId?: string;
    programType?: "EVENT" | "COURSE";
    certificateType?: CertificateType;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    issuedBy?: string;
  }): Promise<Certificate[]>;
}

export interface IParticipationRepository {
  findEventParticipationById(participationId: string): Promise<any | null>;
  findCourseCompletionById(completionId: string): Promise<any | null>;
  findEventParticipationByUserAndEvent(
    userId: string,
    eventId: string
  ): Promise<any | null>;
  findCourseCompletionByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<any | null>;
}

export interface IPDFGeneratorService {
  generateCertificatePDF(
    certificateData: any,
    templateId?: string
  ): Promise<{
    buffer: Buffer;
    filePath: string;
    fileSize: number;
  }>;
  getAvailableTemplates(): Promise<string[]>;
}

export interface IDigitalSignatureService {
  signDocument(content: Buffer, certificateId: string): Promise<string>;
  verifySignature(content: Buffer, signature: string): Promise<boolean>;
}

export class CertificateManagementService {
  constructor(
    private certificateRepository: ICertificateRepository,
    private participationRepository: IParticipationRepository,
    private pdfGenerator: IPDFGeneratorService,
    private digitalSignature?: IDigitalSignatureService
  ) {}

  // ✅ GENERACIÓN DE CERTIFICADOS POR PARTICIPACIÓN

  /**
   * Generar certificado por participación en evento
   */
  async generateEventParticipationCertificate(
    participationId: string,
    requestedBy: string,
    templateId?: string
  ): Promise<Certificate> {
    // 1. Obtener información de la participación
    const participation =
      await this.participationRepository.findEventParticipationById(
        participationId
      );
    if (!participation) {
      throw new Error("Participación no encontrada");
    }

    // Validar que la participación pertenece al usuario solicitante o que es administrador
    if (participation.inscripcion?.id_usu_ins !== requestedBy) {
      // Aquí se podría agregar validación de rol administrativo
      // Por ahora permitimos la generación
    }

    // Validar que la participación está completa/aprobada
    if (participation.inscripcion?.estado_pago !== "APROBADO") {
      throw new Error(
        "La inscripción debe estar aprobada para generar el certificado"
      );
    }

    // 2. Verificar si ya existe un certificado para esta participación
    const existingCertificate =
      await this.certificateRepository.existsByRecipientAndProgram(
        participation.inscripcion.id_usu_ins,
        participation.inscripcion.id_eve_ins,
        "EVENT"
      );

    if (existingCertificate) {
      throw new Error("Ya existe un certificado para esta participación");
    }

    // 3. Crear entidad de certificado
    const certificate = Certificate.createForEventParticipation(
      participation.inscripcion.id_usu_ins,
      this.formatUserName(participation.inscripcion.usuario),
      participation.inscripcion.usuario.ced_usu,
      participation.inscripcion.id_eve_ins,
      participation.inscripcion.evento.nom_eve,
      participation.inscripcion.fec_ins,
      this.formatOrganizerName(participation.inscripcion.evento.organizador),
      participation.inscripcion.evento.categoria?.nom_cat,
      participation.inscripcion.evento.dur_eve,
      participation.inscripcion.evento.lug_eve
    );

    // 4. Generar certificado
    await this.processCertificateGeneration(certificate, templateId);

    // 5. Guardar en repositorio
    return await this.certificateRepository.create(certificate);
  }

  /**
   * Generar certificado por finalización de curso
   */
  async generateCourseCompletionCertificate(
    completionId: string,
    requestedBy: string,
    templateId?: string
  ): Promise<Certificate> {
    // 1. Obtener información de la finalización
    const completion =
      await this.participationRepository.findCourseCompletionById(completionId);
    if (!completion) {
      throw new Error("Finalización de curso no encontrada");
    }

    // Validar permisos
    if (completion.id_usu_ins_cur !== requestedBy) {
      // Validación de rol administrativo aquí
    }

    // Validar estado
    if (completion.estado_pago_cur !== "APROBADO") {
      throw new Error("La inscripción al curso debe estar aprobada");
    }

    // 2. Verificar certificado existente
    const existingCertificate =
      await this.certificateRepository.existsByRecipientAndProgram(
        completion.id_usu_ins_cur,
        completion.id_cur_ins,
        "COURSE"
      );

    if (existingCertificate) {
      throw new Error(
        "Ya existe un certificado para esta finalización de curso"
      );
    }

    // 3. Crear entidad
    const certificate = Certificate.createForCourseCompletion(
      completion.id_usu_ins_cur,
      this.formatUserName(completion.usuario),
      completion.usuario.ced_usu,
      completion.id_cur_ins,
      completion.curso.nom_cur,
      completion.fec_ins_cur,
      completion.curso.dur_cur
    );

    // 4. Generar
    await this.processCertificateGeneration(certificate, templateId);

    // 5. Guardar
    return await this.certificateRepository.create(certificate);
  }

  // ✅ GESTIÓN DEL CICLO DE VIDA

  /**
   * Procesar generación completa del certificado
   */
  private async processCertificateGeneration(
    certificate: Certificate,
    templateId?: string
  ): Promise<void> {
    try {
      // 1. Generar PDF
      const pdfData = await this.pdfGenerator.generateCertificatePDF(
        certificate.getPDFInfo(),
        templateId
      );

      // 2. Firmar digitalmente si está disponible
      let digitalSignature: string | undefined;
      if (this.digitalSignature) {
        digitalSignature = await this.digitalSignature.signDocument(
          pdfData.buffer,
          certificate.certificateCode
        );
      }

      // 3. Actualizar certificado con información generada
      certificate.generate(templateId, digitalSignature);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`Error al generar certificado: ${errorMessage}`);
    }
  }

  /**
   * Emitir certificado oficialmente
   */
  async issueCertificate(
    certificateId: string,
    issuedBy: string,
    issuerRole: string,
    issuerSignature?: string
  ): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(
      certificateId
    );
    if (!certificate) {
      throw new Error("Certificado no encontrado");
    }

    if (!certificate.canBeIssued()) {
      throw new Error(
        "El certificado no puede ser emitido en su estado actual"
      );
    }

    certificate.issue(issuedBy, issuerRole, issuerSignature);

    return await this.certificateRepository.update(certificateId, certificate);
  }

  /**
   * Revocar certificado
   */
  async revokeCertificate(
    certificateId: string,
    reason: string,
    revokedBy: string
  ): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(
      certificateId
    );
    if (!certificate) {
      throw new Error("Certificado no encontrado");
    }

    if (!certificate.canBeRevoked()) {
      throw new Error("El certificado no puede ser revocado");
    }

    certificate.revoke(`${reason} (Revocado por: ${revokedBy})`);

    return await this.certificateRepository.update(certificateId, certificate);
  }

  /**
   * Crear nueva versión de certificado
   */
  async createCertificateVersion(
    originalId: string,
    changes: Partial<CertificateData>,
    requestedBy: string
  ): Promise<Certificate> {
    const originalCertificate = await this.certificateRepository.findById(
      originalId
    );
    if (!originalCertificate) {
      throw new Error("Certificado original no encontrado");
    }

    const newVersion = originalCertificate.createNewVersion(changes);

    return await this.certificateRepository.create(newVersion);
  }

  // ✅ CONSULTAS Y VALIDACIONES

  /**
   * Verificar certificado por código de verificación
   */
  async verifyCertificateByCode(verificationCode: string): Promise<{
    isValid: boolean;
    certificate?: Certificate;
    status: string;
    message: string;
  }> {
    const certificate = await this.certificateRepository.findByVerificationCode(
      verificationCode
    );

    if (!certificate) {
      return {
        isValid: false,
        status: "NOT_FOUND",
        message: "Certificado no encontrado con el código proporcionado",
      };
    }

    if (certificate.isRevoked()) {
      return {
        isValid: false,
        certificate,
        status: "REVOKED",
        message: "El certificado ha sido revocado",
      };
    }

    if (certificate.hasExpired()) {
      return {
        isValid: false,
        certificate,
        status: "EXPIRED",
        message: "El certificado ha expirado",
      };
    }

    if (!certificate.isIssued()) {
      return {
        isValid: false,
        certificate,
        status: "NOT_ISSUED",
        message: "El certificado no ha sido emitido oficialmente",
      };
    }

    return {
      isValid: true,
      certificate,
      status: "VALID",
      message: "Certificado válido y vigente",
    };
  }

  /**
   * Obtener certificados de un usuario
   */
  async getUserCertificates(
    userId: string,
    filters?: {
      type?: CertificateType;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Certificate[]> {
    return await this.certificateRepository.findWithFilters({
      recipientId: userId,
      ...filters,
    });
  }

  /**
   * Obtener certificados de un programa (evento/curso)
   */
  async getProgramCertificates(
    programId: string,
    programType: "EVENT" | "COURSE",
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Certificate[]> {
    return await this.certificateRepository.findWithFilters({
      programId,
      programType,
      ...filters,
    });
  }

  /**
   * Generar estadísticas de certificados
   */
  async getCertificateStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    programType?: "EVENT" | "COURSE";
  }): Promise<{
    totalCertificates: number;
    issuedCertificates: number;
    revokedCertificates: number;
    expiredCertificates: number;
    byType: Record<CertificateType, number>;
    byMonth: Record<string, number>;
    byProgram: Record<string, number>;
  }> {
    const certificates = await this.certificateRepository.findWithFilters(
      filters || {}
    );

    const stats = {
      totalCertificates: certificates.length,
      issuedCertificates: certificates.filter((c) => c.isIssued()).length,
      revokedCertificates: certificates.filter((c) => c.isRevoked()).length,
      expiredCertificates: certificates.filter((c) => c.hasExpired()).length,
      byType: {} as Record<CertificateType, number>,
      byMonth: {} as Record<string, number>,
      byProgram: {} as Record<string, number>,
    };

    // Agrupar por tipo
    certificates.forEach((cert) => {
      stats.byType[cert.certificateType] =
        (stats.byType[cert.certificateType] || 0) + 1;

      // Por mes
      const month = cert.createdAt.toISOString().substring(0, 7); // YYYY-MM
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;

      // Por programa
      stats.byProgram[cert.programName] =
        (stats.byProgram[cert.programName] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validar si un usuario puede obtener un certificado
   */
  async canUserGetCertificate(
    userId: string,
    programId: string,
    programType: "EVENT" | "COURSE"
  ): Promise<{
    canGet: boolean;
    reason?: string;
    existingCertificate?: Certificate;
  }> {
    // Verificar si ya existe certificado
    const existingCertificate =
      await this.certificateRepository.existsByRecipientAndProgram(
        userId,
        programId,
        programType
      );

    if (existingCertificate) {
      const certificate =
        programType === "EVENT"
          ? await this.certificateRepository.findWithFilters({
              recipientId: userId,
              programId,
              programType: "EVENT",
            })
          : await this.certificateRepository.findWithFilters({
              recipientId: userId,
              programId,
              programType: "COURSE",
            });

      return {
        canGet: false,
        reason: "Ya existe un certificado para este programa",
        existingCertificate: certificate[0],
      };
    }

    // Verificar participación
    let participation;
    if (programType === "EVENT") {
      participation =
        await this.participationRepository.findEventParticipationByUserAndEvent(
          userId,
          programId
        );
    } else {
      participation =
        await this.participationRepository.findCourseCompletionByUserAndCourse(
          userId,
          programId
        );
    }

    if (!participation) {
      return {
        canGet: false,
        reason: "No se encontró participación en el programa",
      };
    }

    // Verificar estado de aprobación
    const isApproved =
      programType === "EVENT"
        ? participation.inscripcion?.estado_pago === "APROBADO"
        : participation.estado_pago_cur === "APROBADO";

    if (!isApproved) {
      return {
        canGet: false,
        reason:
          "La inscripción debe estar aprobada para generar el certificado",
      };
    }

    return { canGet: true };
  }

  // ✅ MÉTODOS AUXILIARES

  private formatUserName(user: any): string {
    const nombres = [user.nom_usu1, user.nom_usu2].filter(Boolean).join(" ");
    const apellidos = [user.ape_usu1, user.ape_usu2].filter(Boolean).join(" ");
    return `${nombres} ${apellidos}`.trim();
  }

  private formatOrganizerName(organizer: any): string | undefined {
    if (!organizer) return undefined;
    const nombres = [organizer.nom_org1, organizer.nom_org2]
      .filter(Boolean)
      .join(" ");
    const apellidos = [organizer.ape_org1, organizer.ape_org2]
      .filter(Boolean)
      .join(" ");
    return `${nombres} ${apellidos}`.trim();
  }

  // ✅ GENERACIÓN MASIVA

  /**
   * Generar certificados masivamente para un evento
   */
  async generateBulkEventCertificates(
    eventId: string,
    templateId?: string,
    requestedBy?: string
  ): Promise<{
    generated: Certificate[];
    errors: { participationId: string; error: string }[];
  }> {
    // Obtener todas las participaciones aprobadas del evento
    const participations =
      await this.participationRepository.findEventParticipationByUserAndEvent(
        "",
        eventId
      );

    const results = {
      generated: [] as Certificate[],
      errors: [] as { participationId: string; error: string }[],
    };

    for (const participation of participations) {
      try {
        // Verificar si no existe certificado
        const exists =
          await this.certificateRepository.existsByRecipientAndProgram(
            participation.inscripcion.id_usu_ins,
            eventId,
            "EVENT"
          );

        if (!exists) {
          const certificate = await this.generateEventParticipationCertificate(
            participation.id_par,
            requestedBy || "SYSTEM",
            templateId
          );
          results.generated.push(certificate);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        results.errors.push({
          participationId: participation.id_par,
          error: errorMessage,
        });
      }
    }

    return results;
  }
}
