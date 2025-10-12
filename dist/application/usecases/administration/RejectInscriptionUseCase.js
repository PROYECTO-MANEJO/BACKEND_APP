"use strict";
/**
 * Reject Inscription Use Case
 *
 * Caso de uso para rechazar inscripciones en eventos y cursos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectInscriptionUseCase = void 0;
const EventAdministration_1 = require("../../../domain/entities/administration/EventAdministration");
class RejectInscriptionUseCase {
    constructor(eventRepo, courseRepo, refundService, notificationService) {
        this.eventRepo = eventRepo;
        this.courseRepo = courseRepo;
        this.refundService = refundService;
        this.notificationService = notificationService;
    }
    async execute(request) {
        try {
            // Validar entrada
            this.validateRequest(request);
            // Obtener la actividad según el tipo
            const activity = await this.getActivity(request.activityId, request.activityType);
            if (!activity) {
                return {
                    success: false,
                    message: `Activity not found with ID: ${request.activityId}`,
                    refundProcessed: false,
                };
            }
            // Buscar inscripción del usuario
            let inscription;
            if (activity instanceof EventAdministration_1.EventAdministration) {
                inscription = activity
                    .getInscriptions()
                    .find((ins) => ins.participantEmail === request.userId);
            }
            else {
                inscription = activity
                    .getInscriptions()
                    .find((ins) => ins.participantEmail === request.userId);
            }
            if (!inscription) {
                return {
                    success: false,
                    message: `No inscription found for user ${request.userId}`,
                    refundProcessed: false,
                };
            }
            if (inscription.paymentStatus === "REJECTED") {
                return {
                    success: false,
                    message: "Inscription is already rejected",
                    refundProcessed: false,
                };
            }
            // Rechazar inscripción
            const updatedActivity = activity.rejectInscription(inscription.id);
            // Procesar reembolso si es necesario
            let refundProcessed = false;
            let refundAmount = 0;
            if (request.refundRequired && inscription.paymentStatus === "APPROVED") {
                try {
                    const activityCost = updatedActivity instanceof EventAdministration_1.EventAdministration
                        ? updatedActivity.getEventCost()
                        : updatedActivity.getCourseCost();
                    refundAmount = request.refundAmount || activityCost;
                    const refundResult = await this.refundService.processRefund(request.userId, refundAmount, request.refundMethod || "TRANSFERENCIA", inscription.id);
                    refundProcessed = refundResult.processed;
                }
                catch (refundError) {
                    console.error("Failed to process refund:", refundError);
                    // Continue with rejection even if refund fails
                }
            }
            // Guardar cambios
            await this.saveActivity(updatedActivity, request.activityType);
            // Obtener información de la actividad
            const activityInfo = this.getActivityInfo(updatedActivity);
            // Enviar notificación
            try {
                await this.notificationService.sendInscriptionRejectionNotification(request.userId, activityInfo.title, request.activityType, request.rejectionReason, refundProcessed ? refundAmount : undefined);
            }
            catch (notificationError) {
                // Log error pero no fallar la operación principal
                console.error("Failed to send notification:", notificationError);
            }
            return {
                success: true,
                message: "Inscription rejected successfully",
                inscriptionId: inscription.id,
                refundProcessed,
                refundAmount: refundProcessed ? refundAmount : undefined,
                activityInfo,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                success: false,
                message: `Error rejecting inscription: ${errorMessage}`,
                refundProcessed: false,
            };
        }
    }
    validateRequest(request) {
        if (!request.activityId?.trim()) {
            throw new Error("Activity ID is required");
        }
        if (!request.userId?.trim()) {
            throw new Error("User ID is required");
        }
        if (!request.rejectedBy?.trim()) {
            throw new Error("Rejected by is required");
        }
        if (!request.rejectionReason?.trim()) {
            throw new Error("Rejection reason is required");
        }
        if (request.rejectionReason.length > 500) {
            throw new Error("Rejection reason cannot exceed 500 characters");
        }
        if (!["EVENTO", "CURSO"].includes(request.activityType)) {
            throw new Error("Activity type must be 'EVENTO' or 'CURSO'");
        }
        if (request.refundAmount && request.refundAmount < 0) {
            throw new Error("Refund amount cannot be negative");
        }
        if (request.refundMethod &&
            !["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(request.refundMethod)) {
            throw new Error("Invalid refund method");
        }
    }
    async getActivity(activityId, activityType) {
        if (activityType === "EVENTO") {
            return await this.eventRepo.findById(activityId);
        }
        else {
            return await this.courseRepo.findById(activityId);
        }
    }
    async saveActivity(activity, activityType) {
        if (activityType === "EVENTO") {
            await this.eventRepo.update(activity);
        }
        else {
            await this.courseRepo.update(activity);
        }
    }
    getActivityInfo(activity) {
        const baseInfo = {
            title: activity instanceof EventAdministration_1.EventAdministration
                ? activity.getEventName()
                : activity.getCourseName(),
            type: activity instanceof EventAdministration_1.EventAdministration ? "EVENTO" : "CURSO",
            currentCapacity: activity.getStatistics().totalInscriptions,
        };
        return {
            ...baseInfo,
            waitingList: 0, // Could be implemented based on business needs
        };
    }
}
exports.RejectInscriptionUseCase = RejectInscriptionUseCase;
//# sourceMappingURL=RejectInscriptionUseCase.js.map