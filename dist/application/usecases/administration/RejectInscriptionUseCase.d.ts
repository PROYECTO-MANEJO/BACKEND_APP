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
    processRefund(userId: string, amount: number, method: string, reference: string): Promise<{
        refundId: string;
        processed: boolean;
    }>;
}
export interface INotificationService {
    sendInscriptionRejectionNotification(userId: string, activityTitle: string, activityType: string, reason: string, refundAmount?: number): Promise<void>;
}
export declare class RejectInscriptionUseCase {
    private eventRepo;
    private courseRepo;
    private refundService;
    private notificationService;
    constructor(eventRepo: IEventAdministrationRepository, courseRepo: ICourseAdministrationRepository, refundService: IRefundService, notificationService: INotificationService);
    execute(request: RejectInscriptionRequest): Promise<RejectInscriptionResponse>;
    private validateRequest;
    private getActivity;
    private saveActivity;
    private getActivityInfo;
}
//# sourceMappingURL=RejectInscriptionUseCase.d.ts.map