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
            const certificate = await this.certificateManagementService.verifyCertificate(request.verificationCode);
            if (!certificate) {
                return {
                    success: true,
                    isValid: false,
                    message: "Certificado no encontrado o código inválido",
                };
            }
            // Verificar si el certificado está revocado
            if (certificate.status === "REVOKED") {
                return {
                    success: true,
                    isValid: false,
                    certificate,
                    message: "Certificado revocado",
                    verificationDetails: {
                        issuedDate: certificate.issuedAt,
                        recipientName: certificate.recipientName,
                        eventOrCourseName: certificate.eventOrCourseName,
                        organizationName: certificate.organizationName,
                        isRevoked: true,
                    },
                };
            }
            return {
                success: true,
                isValid: true,
                certificate,
                message: "Certificado válido",
                verificationDetails: {
                    issuedDate: certificate.issuedAt,
                    recipientName: certificate.recipientName,
                    eventOrCourseName: certificate.eventOrCourseName,
                    organizationName: certificate.organizationName,
                    isRevoked: false,
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