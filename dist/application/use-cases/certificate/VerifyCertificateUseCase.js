"use strict";
/**
 * VerifyCertificateUseCase - Application Layer
 *
 * Caso de uso para verificar la validez de un certificado.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCertificateUseCase = void 0;
class VerifyCertificateUseCase {
    constructor(certificateManagementService) {
        this.certificateManagementService = certificateManagementService;
    }
    async execute(request) {
        try {
            // Validar entrada
            if (!request.verificationCode?.trim()) {
                return {
                    success: false,
                    isValid: false,
                    message: "Código de verificación es requerido",
                };
            }
            const verificationResult = await this.certificateManagementService.verifyCertificateByCode(request.verificationCode);
            if (!verificationResult.isValid) {
                return {
                    success: true,
                    isValid: false,
                    message: verificationResult.message,
                };
            }
            const certificate = verificationResult.certificate;
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            return {
                success: false,
                isValid: false,
                message: `Error verificando certificado: ${errorMessage}`,
            };
        }
    }
}
exports.VerifyCertificateUseCase = VerifyCertificateUseCase;
//# sourceMappingURL=VerifyCertificateUseCase.js.map