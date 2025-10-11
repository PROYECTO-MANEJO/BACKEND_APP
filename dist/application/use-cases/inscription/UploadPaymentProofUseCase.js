"use strict";
/**
 * UploadPaymentProofUseCase - Application Layer
 *
 * Caso de uso para subir o actualizar el comprobante de pago de una inscripción.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadPaymentProofUseCase = void 0;
const InscriptionManagementService_1 = require("../../../domain/services/InscriptionManagementService");
class UploadPaymentProofUseCase {
    constructor(inscriptionManagementService) {
        this.inscriptionManagementService = inscriptionManagementService;
    }
    async execute(request) {
        try {
            // Validaciones básicas
            if (!request.inscriptionId?.trim()) {
                return {
                    success: false,
                    error: 'El ID de la inscripción es obligatorio'
                };
            }
            if (!request.userId?.trim()) {
                return {
                    success: false,
                    error: 'El ID del usuario es obligatorio'
                };
            }
            if (!request.paymentProofBuffer || request.paymentProofBuffer.length === 0) {
                return {
                    success: false,
                    error: 'El archivo del comprobante es obligatorio'
                };
            }
            if (!request.filename?.trim()) {
                return {
                    success: false,
                    error: 'El nombre del archivo es obligatorio'
                };
            }
            // Validar archivo PDF
            try {
                InscriptionManagementService_1.InscriptionManagementService.validatePdfFile(request.paymentProofBuffer, request.filename);
            }
            catch (validationError) {
                return {
                    success: false,
                    error: validationError instanceof Error ? validationError.message : 'Error en validación de archivo'
                };
            }
            // Actualizar comprobante de pago
            const updatedInscription = await this.inscriptionManagementService.updatePaymentProof(request.inscriptionId, request.userId, request.paymentProofBuffer, request.filename);
            return {
                success: true,
                inscription: updatedInscription.toPublicObject(),
                message: 'Comprobante de pago subido exitosamente'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al subir comprobante de pago'
            };
        }
    }
}
exports.UploadPaymentProofUseCase = UploadPaymentProofUseCase;
//# sourceMappingURL=UploadPaymentProofUseCase.js.map