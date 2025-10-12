/**
 * Certificate Repository Implementation - Infrastructure Layer
 *
 * Implementación para certificados tanto de eventos como de cursos
 * Maneja operaciones básicas según el esquema Prisma real
 */

import { PrismaClient } from "@prisma/client";

export interface CertificateData {
  id?: string;
  certificatePdf?: Buffer;
  certificateFilename?: string;
  certificateSize?: number;
  issuedDate?: Date;
  evaluationDate?: Date;
  approved: boolean;
  attendancePercentage?: number;
  finalGrade?: number;
  enrollmentId: string;
  type: "event" | "course";
}

export class PrismaCertificateRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== CERTIFICADOS DE EVENTOS (PARTICIPACIÓN) =====

  async createEventCertificate(
    certificateData: CertificateData
  ): Promise<CertificateData> {
    if (certificateData.type !== "event") {
      throw new Error("Invalid certificate type for event certificate");
    }

    const participacion = await this.prisma.participacion.create({
      data: {
        asi_par: certificateData.attendancePercentage || 0,
        aprobado: certificateData.approved,
        certificado_pdf: certificateData.certificatePdf || null,
        certificado_filename: certificateData.certificateFilename || null,
        certificado_size: certificateData.certificateSize || null,
        fec_cer_par: certificateData.issuedDate || null,
        fec_evaluacion: certificateData.evaluationDate || null,
        id_ins_per: certificateData.enrollmentId,
      },
      include: {
        inscripcion: {
          include: {
            usuario: true,
            evento: true,
          },
        },
      },
    });

    return this.mapToCertificateData(participacion, "event");
  }

  // ===== CERTIFICADOS DE CURSOS (PARTICIPACIÓN) =====

  async createCourseCertificate(
    certificateData: CertificateData
  ): Promise<CertificateData> {
    if (certificateData.type !== "course") {
      throw new Error("Invalid certificate type for course certificate");
    }

    const participacion = await this.prisma.participacionCurso.create({
      data: {
        nota_final: certificateData.finalGrade || 0,
        asistencia_porcentaje: certificateData.attendancePercentage || 0,
        aprobado: certificateData.approved,
        fecha_evaluacion: certificateData.evaluationDate || null,
        certificado_pdf: certificateData.certificatePdf || null,
        certificado_filename: certificateData.certificateFilename || null,
        certificado_size: certificateData.certificateSize || null,
        fec_cer_par_cur: certificateData.issuedDate || null,
        id_ins_cur_per: certificateData.enrollmentId,
      },
      include: {
        inscripcionCurso: {
          include: {
            usuario: true,
            curso: true,
          },
        },
      },
    });

    return this.mapToCertificateData(participacion, "course");
  }

  // ===== BÚSQUEDAS =====

  async findEventCertificateById(id: string): Promise<CertificateData | null> {
    const participacion = await this.prisma.participacion.findUnique({
      where: { id_par: id },
      include: {
        inscripcion: {
          include: {
            usuario: true,
            evento: true,
          },
        },
      },
    });

    if (!participacion) return null;
    return this.mapToCertificateData(participacion, "event");
  }

  async findCourseCertificateById(id: string): Promise<CertificateData | null> {
    const participacion = await this.prisma.participacionCurso.findUnique({
      where: { id_par_cur: id },
      include: {
        inscripcionCurso: {
          include: {
            usuario: true,
            curso: true,
          },
        },
      },
    });

    if (!participacion) return null;
    return this.mapToCertificateData(participacion, "course");
  }

  private mapToCertificateData(
    participacion: any,
    type: "event" | "course"
  ): CertificateData {
    if (type === "event") {
      return {
        id: participacion.id_par,
        certificatePdf: participacion.certificado_pdf || undefined,
        certificateFilename: participacion.certificado_filename || undefined,
        certificateSize: participacion.certificado_size || undefined,
        issuedDate: participacion.fec_cer_par || undefined,
        evaluationDate: participacion.fec_evaluacion || undefined,
        approved: participacion.aprobado,
        attendancePercentage: participacion.asi_par,
        enrollmentId: participacion.id_ins_per,
        type: "event",
      };
    } else {
      return {
        id: participacion.id_par_cur,
        certificatePdf: participacion.certificado_pdf || undefined,
        certificateFilename: participacion.certificado_filename || undefined,
        certificateSize: participacion.certificado_size || undefined,
        issuedDate: participacion.fec_cer_par_cur || undefined,
        evaluationDate: participacion.fecha_evaluacion || undefined,
        approved: participacion.aprobado,
        attendancePercentage: participacion.asistencia_porcentaje
          ? parseFloat(participacion.asistencia_porcentaje.toString())
          : undefined,
        finalGrade: participacion.nota_final
          ? parseFloat(participacion.nota_final.toString())
          : undefined,
        enrollmentId: participacion.id_ins_cur_per,
        type: "course",
      };
    }
  }
}
