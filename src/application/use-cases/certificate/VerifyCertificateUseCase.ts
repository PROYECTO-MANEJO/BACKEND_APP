/**
 * VerifyCertificateUseCase - Application Layer
 *
 * Caso de uso para verificar la validez de un certificado.
 */

import { CertificateManagementService } from "../../../domain/services/CertificateManagementService";
import { Certificate } from "../../../domain/entities/Certificate";

export interface VerifyCertificateRequest {
  verificationCode: string;
}

export interface VerifyCertificateResponse {
  success: boolean;
  isValid: boolean;
  certificate?: Certificate;
  message: string;
  verificationDetails?: {
    issuedDate: Date;
    recipientName: string;
    eventOrCourseName: string;
    organizationName: string;
    isRevoked: boolean;
  };
}

export class VerifyCertificateUseCase {
  constructor(
    private certificateManagementService: CertificateManagementService
  ) {}

  async execute(
    request: VerifyCertificateRequest
  ): Promise<VerifyCertificateResponse> {
    try {
      // Validar entrada
      if (!request.verificationCode?.trim()) {
        return {
          success: false,
          isValid: false,
          message: "Código de verificación es requerido",
        };
      }

      const verificationResult =
        await this.certificateManagementService.verifyCertificateByCode(
          request.verificationCode
        );

      if (!verificationResult.isValid) {
        return {
          success: true,
          isValid: false,
          message: verificationResult.message,
        };
      }

      const certificate = verificationResult.certificate!;
      const pdfInfo = certificate.getPDFInfo();

      return {
        success: true,
        isValid: true,
        certificate,
        message: verificationResult.message,
        verificationDetails: {
          issuedDate: certificate.issuedDate || new Date(),
          recipientName: certificate.recipientName,
          eventOrCourseName: certificate.programName,
          organizationName: pdfInfo.organizerName || "No especificado",
          isRevoked: certificate.isRevoked(),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      return {
        success: false,
        isValid: false,
        message: `Error verificando certificado: ${errorMessage}`,
      };
    }
  }
}
