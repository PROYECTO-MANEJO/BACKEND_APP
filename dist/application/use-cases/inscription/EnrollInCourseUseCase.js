"use strict";
/**
 * EnrollInCourseUseCase - Application Layer
 *
 * Caso de uso para inscribir un usuario en un curso.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollInCourseUseCase = void 0;
const InscriptionManagementService_1 = require("../../../domain/services/InscriptionManagementService");
class EnrollInCourseUseCase {
    constructor(inscriptionManagementService) {
        this.inscriptionManagementService = inscriptionManagementService;
    }
    async execute(request) {
        try {
            // Validaciones básicas de entrada
            if (!request.userId?.trim()) {
                return { success: false, error: "El ID del usuario es obligatorio" };
            }
            if (!request.courseId?.trim()) {
                return { success: false, error: "El ID del curso es obligatorio" };
            }
            // Validar archivo PDF si se proporciona
            if (request.paymentProofBuffer && request.paymentProofFilename) {
                try {
                    InscriptionManagementService_1.InscriptionManagementService.validatePdfFile(request.paymentProofBuffer, request.paymentProofFilename);
                }
                catch (validationError) {
                    return {
                        success: false,
                        error: validationError instanceof Error
                            ? validationError.message
                            : "Error en validación de archivo",
                    };
                }
            }
            // Ejecutar inscripción
            const inscription = await this.inscriptionManagementService.enrollInCourse({
                userId: request.userId,
                courseId: request.courseId,
                paymentMethod: request.paymentMethod,
                motivationLetter: request.motivationLetter,
                paymentProofBuffer: request.paymentProofBuffer,
                paymentProofFilename: request.paymentProofFilename,
            });
            // Determinar mensaje de respuesta
            const message = inscription.isFree()
                ? "Inscripción gratuita realizada con éxito"
                : "Inscripción enviada. Pendiente de aprobación de pago";
            return {
                success: true,
                inscription: inscription.toPublicObject(),
                message,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error desconocido al inscribir en curso",
            };
        }
    }
}
exports.EnrollInCourseUseCase = EnrollInCourseUseCase;
//# sourceMappingURL=EnrollInCourseUseCase.js.map