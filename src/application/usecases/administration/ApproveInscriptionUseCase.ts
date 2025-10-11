/**
 * Approve Inscription Use Case
 *
 * Caso de uso para aprobar inscripciones en eventos y cursos
 */

import { EventAdministration } from "../../../domain/entities/administration/EventAdministration";
import { CourseAdministration } from "../../../domain/entities/administration/CourseAdministration";
import { InscriptionApprovalRequest, InscriptionApprovalResult } from "../../../domain/entities/administration";

export interface ApproveInscriptionRequest {
  activityId: string;
  activityType: 'EVENTO' | 'CURSO';
  userId: string;
  approvalData: {
    paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'BECA';
    paymentAmount?: number;
    paymentReference?: string;
    scholarshipType?: 'COMPLETA' | 'PARCIAL';
    scholarshipPercentage?: number;
    scholarshipReason?: string;
    additionalNotes?: string;
  };
  approvedBy: string;
  approvalReason?: string;
}

export interface ApproveInscriptionResponse {
  success: boolean;
  message: string;
  inscriptionId?: string;
  paymentRequired: boolean;
  paymentAmount?: number;
  certificateEligible: boolean;
  activityInfo?: {
    title: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    capacity: number;
    currentInscriptions: number;
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

export interface INotificationService {
  sendInscriptionApprovalNotification(
    userId: string, 
    activityTitle: string, 
    activityType: string,
    paymentRequired: boolean,
    paymentAmount?: number
  ): Promise<void>;
}

export class ApproveInscriptionUseCase {
  constructor(
    private eventRepo: IEventAdministrationRepository,
    private courseRepo: ICourseAdministrationRepository,
    private notificationService: INotificationService
  ) {}

  public async execute(request: ApproveInscriptionRequest): Promise<ApproveInscriptionResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Obtener la actividad según el tipo
      const activity = await this.getActivity(request.activityId, request.activityType);
      
      if (!activity) {
        return {
          success: false,
          message: `Activity not found with ID: ${request.activityId}`,
          paymentRequired: false,
          certificateEligible: false
        };
      }

      // Preparar datos de aprobación
      const approvalRequest: InscriptionApprovalRequest = {
        userId: request.userId,
        paymentMethod: request.approvalData.paymentMethod || 'EFECTIVO',
        paymentAmount: request.approvalData.paymentAmount,
        paymentReference: request.approvalData.paymentReference,
        scholarshipType: request.approvalData.scholarshipType,
        scholarshipPercentage: request.approvalData.scholarshipPercentage,
        scholarshipReason: request.approvalData.scholarshipReason,
        additionalNotes: request.approvalData.additionalNotes,
        approvedBy: request.approvedBy,
        approvalReason: request.approvalReason,
        approvalDate: new Date()
      };

      // Buscar inscripción del usuario
      let inscription;
      if (activity instanceof EventAdministration) {
        inscription = activity.getInscriptions().find(ins => ins.participantEmail === request.userId);
      } else {
        inscription = activity.getInscriptions().find(ins => ins.participantEmail === request.userId);
      }

      if (!inscription) {
        return {
          success: false,
          message: `No inscription found for user ${request.userId}`,
          paymentRequired: false,
          certificateEligible: false
        };
      }

      if (inscription.paymentStatus === "APPROVED") {
        return {
          success: false,
          message: "Inscription is already approved",
          paymentRequired: false,
          certificateEligible: false
        };
      }

      // Aprobar inscripción
      const updatedActivity = activity.approveInscription(inscription.id);

      // Guardar cambios
      await this.saveActivity(updatedActivity, request.activityType);

      // Obtener información de la actividad
      const activityInfo = this.getActivityInfo(updatedActivity);

      // Calcular información de pago
      const paymentRequired = (request.approvalData.paymentAmount || 0) > 0;
      const activityCost = updatedActivity instanceof EventAdministration 
        ? updatedActivity.getEventCost() 
        : updatedActivity.getCourseCost();
      const paymentAmount = request.approvalData.paymentAmount || activityCost;

      // Enviar notificación
      try {
        await this.notificationService.sendInscriptionApprovalNotification(
          request.userId,
          activityInfo.title,
          request.activityType,
          paymentRequired,
          paymentAmount
        );
      } catch (notificationError) {
        // Log error pero no fallar la operación principal
        console.error('Failed to send notification:', notificationError);
      }

      return {
        success: true,
        message: "Inscription approved successfully",
        inscriptionId: inscription.id,
        paymentRequired,
        paymentAmount,
        certificateEligible: true,
        activityInfo
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return {
        success: false,
        message: `Error approving inscription: ${errorMessage}`,
        paymentRequired: false,
        certificateEligible: false
      };
    }
  }

  private validateRequest(request: ApproveInscriptionRequest): void {
    if (!request.activityId?.trim()) {
      throw new Error("Activity ID is required");
    }

    if (!request.userId?.trim()) {
      throw new Error("User ID is required");
    }

    if (!request.approvedBy?.trim()) {
      throw new Error("Approved by is required");
    }

    if (!['EVENTO', 'CURSO'].includes(request.activityType)) {
      throw new Error("Activity type must be 'EVENTO' or 'CURSO'");
    }

    if (request.approvalData.paymentMethod && 
        !['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'BECA'].includes(request.approvalData.paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    if (request.approvalData.paymentAmount && request.approvalData.paymentAmount < 0) {
      throw new Error("Payment amount cannot be negative");
    }

    if (request.approvalData.scholarshipType && 
        !['COMPLETA', 'PARCIAL'].includes(request.approvalData.scholarshipType)) {
      throw new Error("Invalid scholarship type");
    }

    if (request.approvalData.scholarshipPercentage) {
      if (request.approvalData.scholarshipPercentage < 0 || request.approvalData.scholarshipPercentage > 100) {
        throw new Error("Scholarship percentage must be between 0 and 100");
      }
    }

    if (request.approvalData.scholarshipReason && request.approvalData.scholarshipReason.length > 500) {
      throw new Error("Scholarship reason cannot exceed 500 characters");
    }

    if (request.approvalData.additionalNotes && request.approvalData.additionalNotes.length > 1000) {
      throw new Error("Additional notes cannot exceed 1000 characters");
    }

    if (request.approvalReason && request.approvalReason.length > 500) {
      throw new Error("Approval reason cannot exceed 500 characters");
    }
  }

  private async getActivity(
    activityId: string, 
    activityType: 'EVENTO' | 'CURSO'
  ): Promise<EventAdministration | CourseAdministration | null> {
    if (activityType === 'EVENTO') {
      return await this.eventRepo.findById(activityId);
    } else {
      return await this.courseRepo.findById(activityId);
    }
  }

  private async saveActivity(
    activity: EventAdministration | CourseAdministration, 
    activityType: 'EVENTO' | 'CURSO'
  ): Promise<void> {
    if (activityType === 'EVENTO') {
      await this.eventRepo.update(activity as EventAdministration);
    } else {
      await this.courseRepo.update(activity as CourseAdministration);
    }
  }

  private getActivityInfo(activity: EventAdministration | CourseAdministration) {
    const baseInfo = {
      title: activity instanceof EventAdministration ? activity.getEventName() : activity.getCourseName(),
      startDate: activity.getStartDate(),
      endDate: activity.getEndDate(),
      capacity: activity.getMaxCapacity(),
      currentInscriptions: activity.getStatistics().totalInscriptions
    };

    if (activity instanceof EventAdministration) {
      return {
        ...baseInfo,
        location: "Event Location" // EventAdministration doesn't have location field, would need to be added
      };
    }

    return baseInfo;
  }
}