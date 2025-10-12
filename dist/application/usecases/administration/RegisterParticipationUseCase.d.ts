/**
 * Register Participation Use Case
 *
 * Caso de uso para registrar participación en eventos y cursos
 */
import { ParticipationRegistration } from "../../../domain/entities/administration/ParticipationRegistration";
import { ParticipationType, ParticipationStatus } from "../../../domain/entities/administration";
export interface RegisterParticipationRequest {
    activityId: string;
    activityType: "EVENTO" | "CURSO";
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
    findById(id: string, type: "EVENTO" | "CURSO"): Promise<{
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
    generateCertificate(participationId: string, activityType: string, participantData: any): Promise<{
        certificateId: string;
        downloadUrl: string;
    }>;
}
export interface INotificationService {
    sendParticipationRegisteredNotification(userId: string, activityTitle: string, activityType: string, certificateEligible: boolean): Promise<void>;
    sendCertificateGeneratedNotification(userId: string, activityTitle: string, certificateId: string, downloadUrl: string): Promise<void>;
}
export declare class RegisterParticipationUseCase {
    private participationRepo;
    private activityRepo;
    private certificateService;
    private notificationService;
    constructor(participationRepo: IParticipationRegistrationRepository, activityRepo: IActivityRepository, certificateService: ICertificateService, notificationService: INotificationService);
    execute(request: RegisterParticipationRequest): Promise<RegisterParticipationResponse>;
    private updateExistingParticipation;
    private validateRequest;
    private calculateNextSteps;
}
//# sourceMappingURL=RegisterParticipationUseCase.d.ts.map