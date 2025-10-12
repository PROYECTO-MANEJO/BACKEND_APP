/**
 * Approve Inscription Use Case
 *
 * Caso de uso para aprobar inscripciones en eventos y cursos
 */
import { EventAdministration } from "../../../domain/entities/administration/EventAdministration";
import { CourseAdministration } from "../../../domain/entities/administration/CourseAdministration";
export interface ApproveInscriptionRequest {
    activityId: string;
    activityType: "EVENTO" | "CURSO";
    userId: string;
    approvalData: {
        paymentMethod?: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "BECA";
        paymentAmount?: number;
        paymentReference?: string;
        scholarshipType?: "COMPLETA" | "PARCIAL";
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
    sendInscriptionApprovalNotification(userId: string, activityTitle: string, activityType: string, paymentRequired: boolean, paymentAmount?: number): Promise<void>;
}
export declare class ApproveInscriptionUseCase {
    private eventRepo;
    private courseRepo;
    private notificationService;
    constructor(eventRepo: IEventAdministrationRepository, courseRepo: ICourseAdministrationRepository, notificationService: INotificationService);
    execute(request: ApproveInscriptionRequest): Promise<ApproveInscriptionResponse>;
    private validateRequest;
    private getActivity;
    private saveActivity;
    private getActivityInfo;
}
//# sourceMappingURL=ApproveInscriptionUseCase.d.ts.map