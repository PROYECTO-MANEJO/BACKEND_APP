/**
 * Reject Inscription Use Case
 *
 * Caso de uso para rechazar inscripciones en eventos y cursos
 */

import { EventAdministration } from "../../../domain/entities/administration/EventAdministration";
import { CourseAdministration } from "../../../domain/entities/administration/CourseAdministration";

export interface RejectInscriptionRequest {
  activityId: string;
  activityType: "EVENTO" | "CURSO";
  userId: string;
  rejectionReason: string;
  rejectedBy: string;
  refundRequired?: boolean;
  refundAmount?: number;
  refundMethod?: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
}

export interface RejectInscriptionResponse {
  success: boolean;
  message: string;
  inscriptionId?: string;
  refundProcessed: boolean;
  refundAmount?: number;
  activityInfo?: {
    title: string;
    type: string;
    currentCapacity: number;
    waitingList?: number;
  };
}

export interface IEventAdministrationRepository {
  findById(id: string): Promise<EventAdministration | null>;
  update(eventAdmin: EventAdministration): Promise<EventAdministration>;
}

export interface ICourseAdministrationRepository {
  findById(id: string): Promise<CourseAdministration | null>;
  update(courseAdmin: CourseAdministration): Promise<CourseAdministration>;
}

export interface IRefundService {
  processRefund(
    userId: string,
    amount: number,
    method: string,
    reference: string
  ): Promise<{ refundId: string; processed: boolean }>;
}

export interface INotificationService {
  sendInscriptionRejectionNotification(
    userId: string,
    activityTitle: string,
    activityType: string,
    reason: string,
    refundAmount?: number
  ): Promise<void>;
}

export class RejectInscriptionUseCase {
  constructor(
    private eventRepo: IEventAdministrationRepository,
    private courseRepo: ICourseAdministrationRepository,
    private refundService: IRefundService,
    private notificationService: INotificationService
  ) {}

  public async execute(
    request: RejectInscriptionRequest
  ): Promise<RejectInscriptionResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Obtener la actividad según el tipo
      const activity = await this.getActivity(
        request.activityId,
        request.activityType
      );

      if (!activity) {
        return {
          success: false,
          message: `Activity not found with ID: ${request.activityId}`,
          refundProcessed: false,
        };
      }

      // Buscar inscripción del usuario
      let inscription;
      if (activity instanceof EventAdministration) {
        inscription = activity
          .getInscriptions()
          .find((ins) => ins.participantEmail === request.userId);
      } else {
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
          const activityCost =
            updatedActivity instanceof EventAdministration
              ? updatedActivity.getEventCost()
              : updatedActivity.getCourseCost();

          refundAmount = request.refundAmount || activityCost;

          const refundResult = await this.refundService.processRefund(
            request.userId,
            refundAmount,
            request.refundMethod || "TRANSFERENCIA",
            inscription.id
          );

          refundProcessed = refundResult.processed;
        } catch (refundError) {
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
        await this.notificationService.sendInscriptionRejectionNotification(
          request.userId,
          activityInfo.title,
          request.activityType,
          request.rejectionReason,
          refundProcessed ? refundAmount : undefined
        );
      } catch (notificationError) {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        message: `Error rejecting inscription: ${errorMessage}`,
        refundProcessed: false,
      };
    }
  }

  private validateRequest(request: RejectInscriptionRequest): void {
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

    if (
      request.refundMethod &&
      !["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(request.refundMethod)
    ) {
      throw new Error("Invalid refund method");
    }
  }

  private async getActivity(
    activityId: string,
    activityType: "EVENTO" | "CURSO"
  ): Promise<EventAdministration | CourseAdministration | null> {
    if (activityType === "EVENTO") {
      return await this.eventRepo.findById(activityId);
    } else {
      return await this.courseRepo.findById(activityId);
    }
  }

  private async saveActivity(
    activity: EventAdministration | CourseAdministration,
    activityType: "EVENTO" | "CURSO"
  ): Promise<void> {
    if (activityType === "EVENTO") {
      await this.eventRepo.update(activity as EventAdministration);
    } else {
      await this.courseRepo.update(activity as CourseAdministration);
    }
  }

  private getActivityInfo(
    activity: EventAdministration | CourseAdministration
  ) {
    const baseInfo = {
      title:
        activity instanceof EventAdministration
          ? activity.getEventName()
          : activity.getCourseName(),
      type: activity instanceof EventAdministration ? "EVENTO" : "CURSO",
      currentCapacity: activity.getStatistics().totalInscriptions,
    };

    return {
      ...baseInfo,
      waitingList: 0, // Could be implemented based on business needs
    };
  }
}
