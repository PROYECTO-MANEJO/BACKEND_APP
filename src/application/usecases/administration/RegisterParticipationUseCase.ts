/**
 * Register Participation Use Case
 *
 * Caso de uso para registrar participación en eventos y cursos
 */

import { ParticipationRegistration } from "../../../domain/entities/administration/ParticipationRegistration";
import { ParticipationType, ParticipationStatus } from "../../../domain/entities/administration";

export interface RegisterParticipationRequest {
  activityId: string;
  activityType: 'EVENTO' | 'CURSO';
  userId: string;
  userName: string;
  userEmail: string;
  userCedula: string;
  participationType: ParticipationType;
  attendanceData?: {
    checkInTime?: Date;
    checkOutTime?: Date;
    attendancePercentage?: number;
    sessionsAttended?: number;
    totalSessions?: number;
    notes?: string;
  };
  registeredBy: string;
}

export interface RegisterParticipationResponse {
  success: boolean;
  message: string;
  participationId?: string;
  currentStatus: ParticipationStatus;
  certificateEligible: boolean;
  certificateGenerated: boolean;
  progressPercentage: number;
  nextSteps?: string[];
  activityInfo?: {
    title: string;
    type: string;
    duration?: string;
    completionRequirements?: string;
  };
}

export interface IParticipationRegistrationRepository {
  findById(id: string): Promise<ParticipationRegistration | null>;
  findByUserAndActivity(userId: string, activityId: string, activityType: string): Promise<ParticipationRegistration | null>;
  save(participation: ParticipationRegistration): Promise<ParticipationRegistration>;
  update(participation: ParticipationRegistration): Promise<ParticipationRegistration>;
}

export interface IActivityRepository {
  findById(id: string, type: 'EVENTO' | 'CURSO'): Promise<{
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    duration?: number;
    minAttendancePercentage?: number;
    completionRequirements?: string;
  } | null>;
}

export interface ICertificateService {
  generateCertificate(
    participationId: string, 
    activityType: string, 
    participantData: any
  ): Promise<{ certificateId: string; downloadUrl: string }>;
}

export interface INotificationService {
  sendParticipationRegisteredNotification(
    userId: string, 
    activityTitle: string, 
    activityType: string,
    certificateEligible: boolean
  ): Promise<void>;
  
  sendCertificateGeneratedNotification(
    userId: string, 
    activityTitle: string, 
    certificateId: string,
    downloadUrl: string
  ): Promise<void>;
}

export class RegisterParticipationUseCase {
  constructor(
    private participationRepo: IParticipationRegistrationRepository,
    private activityRepo: IActivityRepository,
    private certificateService: ICertificateService,
    private notificationService: INotificationService
  ) {}

  public async execute(request: RegisterParticipationRequest): Promise<RegisterParticipationResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Verificar si ya existe participación para este usuario y actividad
      const existingParticipation = await this.participationRepo.findByUserAndActivity(
        request.userId, 
        request.activityId, 
        request.activityType
      );

      if (existingParticipation) {
        return await this.updateExistingParticipation(existingParticipation, request);
      }

      // Obtener información de la actividad
      const activityInfo = await this.activityRepo.findById(request.activityId, request.activityType);
      
      if (!activityInfo) {
        return {
          success: false,
          message: `Activity not found with ID: ${request.activityId}`,
          currentStatus: 'REGISTERED',
          certificateEligible: false,
          certificateGenerated: false,
          progressPercentage: 0
        };
      }

      // Crear nueva participación
      const participationData = {
        id: `participation-${Date.now()}-${request.userId}`,
        activityId: request.activityId,
        activityType: request.activityType,
        activityTitle: activityInfo.title,
        participantId: request.userId,
        participantName: request.userName,
        participantEmail: request.userEmail,
        participantCedula: request.userCedula,
        participationType: request.participationType,
        currentStatus: 'REGISTERED' as ParticipationStatus,
        registrationDate: new Date(),
        lastUpdated: new Date(),
        registeredBy: request.registeredBy,
        attendanceRecords: [],
        progressTracking: {
          currentStage: 'REGISTERED',
          completionPercentage: 0,
          milestones: [],
          notes: []
        },
        certificateData: {
          isEligible: false,
          isGenerated: false,
          eligibilityCheckedAt: undefined,
          generatedAt: undefined,
          certificateId: undefined,
          downloadUrl: undefined
        }
      };

      const participation = ParticipationRegistration.create(
        participationData.participantId,
        participationData.participantName,
        participationData.participantEmail,
        participationData.participantCedula,
        participationData.activityId,
        participationData.activityTitle,
        participationData.participationType,
        participationData.registeredBy
      );

      // Registrar asistencia si se proporciona
      let updatedParticipation = participation;
      if (request.attendanceData?.checkInTime) {
        updatedParticipation = participation.markAttendance(
          request.attendanceData.attendancePercentage || 100
        );
        
        if (request.attendanceData.notes) {
          updatedParticipation = updatedParticipation.addNote(request.attendanceData.notes);
        }
      }

      // Guardar participación
      const savedParticipation = await this.participationRepo.save(updatedParticipation);

      // Verificar elegibilidad para certificado
      const certificateEligible = savedParticipation.canGenerateCertificate();
      let certificateGenerated = false;
      let certificateData = null;

      // Generar certificado si es elegible
      if (certificateEligible) {
        try {
          certificateData = await this.certificateService.generateCertificate(
            savedParticipation.getId(),
            request.activityType,
            {
              participantName: request.userName,
              activityTitle: activityInfo.title,
              completionDate: new Date()
            }
          );

          // Actualizar participación con datos del certificado
          const updatedParticipation = savedParticipation.generateCertificate(
            certificateData.certificateId
          );
          
          await this.participationRepo.update(updatedParticipation);
          certificateGenerated = true;

          // Notificar generación de certificado
          await this.notificationService.sendCertificateGeneratedNotification(
            request.userId,
            activityInfo.title,
            certificateData.certificateId,
            certificateData.downloadUrl
          );

        } catch (certError) {
          console.error('Failed to generate certificate:', certError);
          // No fallar la operación principal por error en certificado
        }
      }

      // Enviar notificación de participación registrada
      try {
        await this.notificationService.sendParticipationRegisteredNotification(
          request.userId,
          activityInfo.title,
          request.activityType,
          certificateEligible
        );
      } catch (notificationError) {
        console.error('Failed to send participation notification:', notificationError);
      }

      // Calcular próximos pasos
      const nextSteps = this.calculateNextSteps(
        savedParticipation.getStatus(),
        certificateEligible,
        certificateGenerated
      );

      return {
        success: true,
        message: "Participation registered successfully",
        participationId: savedParticipation.getId(),
        currentStatus: savedParticipation.getStatus(),
        certificateEligible,
        certificateGenerated,
        progressPercentage: savedParticipation.getCompletionPercentage(),
        nextSteps,
        activityInfo: {
          title: activityInfo.title,
          type: request.activityType,
          duration: activityInfo.duration ? `${activityInfo.duration} hours` : undefined,
          completionRequirements: activityInfo.completionRequirements
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return {
        success: false,
        message: `Error registering participation: ${errorMessage}`,
        currentStatus: 'REGISTERED',
        certificateEligible: false,
        certificateGenerated: false,
        progressPercentage: 0
      };
    }
  }

  private async updateExistingParticipation(
    existingParticipation: ParticipationRegistration, 
    request: RegisterParticipationRequest
  ): Promise<RegisterParticipationResponse> {
    // Si ya existe, actualizar con nueva asistencia
    let updatedExistingParticipation = existingParticipation;
    if (request.attendanceData?.checkInTime) {
      updatedExistingParticipation = existingParticipation.markAttendance(
        request.attendanceData.attendancePercentage || 100
      );
      
      if (request.attendanceData.notes) {
        updatedExistingParticipation = updatedExistingParticipation.addNote(request.attendanceData.notes);
      }

      // Guardar cambios
      await this.participationRepo.update(updatedExistingParticipation);
    }

    const certificateEligible = updatedExistingParticipation.canGenerateCertificate();
    const certificateGenerated = updatedExistingParticipation.isCertificateGenerated();

    return {
      success: true,
      message: "Participation updated successfully",
      participationId: updatedExistingParticipation.getId(),
      currentStatus: updatedExistingParticipation.getStatus(),
      certificateEligible,
      certificateGenerated,
      progressPercentage: updatedExistingParticipation.getCompletionPercentage(),
      nextSteps: this.calculateNextSteps(
        updatedExistingParticipation.getStatus(),
        certificateEligible,
        certificateGenerated
      )
    };
  }

  private validateRequest(request: RegisterParticipationRequest): void {
    if (!request.activityId?.trim()) {
      throw new Error("Activity ID is required");
    }

    if (!request.userId?.trim()) {
      throw new Error("User ID is required");
    }

    if (!request.userName?.trim()) {
      throw new Error("User name is required");
    }

    if (!request.userEmail?.trim()) {
      throw new Error("User email is required");
    }

    if (!request.userCedula?.trim()) {
      throw new Error("User cedula is required");
    }

    if (!request.registeredBy?.trim()) {
      throw new Error("Registered by is required");
    }

    if (!['EVENTO', 'CURSO'].includes(request.activityType)) {
      throw new Error("Activity type must be 'EVENTO' or 'CURSO'");
    }

    if (!['PRESENCIAL', 'VIRTUAL', 'HIBRIDA'].includes(request.participationType)) {
      throw new Error("Invalid participation type");
    }

    // Validar datos de asistencia si se proporcionan
    if (request.attendanceData) {
      if (request.attendanceData.attendancePercentage && 
          (request.attendanceData.attendancePercentage < 0 || request.attendanceData.attendancePercentage > 100)) {
        throw new Error("Attendance percentage must be between 0 and 100");
      }

      if (request.attendanceData.checkInTime && request.attendanceData.checkOutTime &&
          request.attendanceData.checkInTime >= request.attendanceData.checkOutTime) {
        throw new Error("Check-in time must be before check-out time");
      }
    }
  }

  private calculateNextSteps(
    currentStatus: ParticipationStatus,
    certificateEligible: boolean,
    certificateGenerated: boolean
  ): string[] {
    const steps: string[] = [];

    switch (currentStatus) {
      case 'REGISTERED':
        steps.push('Attend the activity sessions');
        steps.push('Complete all required activities');
        break;
      case 'ATTENDED':
        if (!certificateEligible) {
          steps.push('Complete additional requirements for certificate eligibility');
        } else if (!certificateGenerated) {
          steps.push('Certificate generation in progress');
        }
        break;
      case 'COMPLETED':
        if (certificateGenerated) {
          steps.push('Download your certificate');
        } else {
          steps.push('Certificate will be generated shortly');
        }
        break;
      case 'CANCELLED':
        steps.push('Contact administrator if you need to reactivate');
        break;
    }

    return steps;
  }
}