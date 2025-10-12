/**
 * Administration Use Cases - Index
 *
 * Exporta todos los casos de uso del dominio de administración
 */
export { GetAdministrableActivitiesUseCase } from "./GetAdministrableActivitiesUseCase";
export type { GetAdministrableActivitiesRequest, GetAdministrableActivitiesResponse, IEventAdministrationRepository as IEventAdminRepository, ICourseAdministrationRepository as ICourseAdminRepository, } from "./GetAdministrableActivitiesUseCase";
export { ApproveInscriptionUseCase } from "./ApproveInscriptionUseCase";
export type { ApproveInscriptionRequest, ApproveInscriptionResponse, INotificationService as IApprovalNotificationService, } from "./ApproveInscriptionUseCase";
export { RegisterParticipationUseCase } from "./RegisterParticipationUseCase";
export type { RegisterParticipationRequest, RegisterParticipationResponse, IParticipationRegistrationRepository, IActivityRepository, ICertificateService, INotificationService as IParticipationNotificationService, } from "./RegisterParticipationUseCase";
export { RejectInscriptionUseCase } from "./RejectInscriptionUseCase";
export type { RejectInscriptionRequest, RejectInscriptionResponse, IRefundService, } from "./RejectInscriptionUseCase";
export { GenerateActivityReportUseCase } from "./GenerateActivityReportUseCase";
export type { GenerateActivityReportRequest, GenerateActivityReportResponse, ActivityReportData, ActivityReportItem, ParticipantReportItem, FinancialReportSummary, PeriodComparisonData, IReportGenerationService, } from "./GenerateActivityReportUseCase";
export interface AdministrationUseCaseResponse {
    success: boolean;
    message: string;
}
export interface AdministrationPaginatedResponse<T> extends AdministrationUseCaseResponse {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export interface AdministrationFilters {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    dateFrom?: Date;
    dateTo?: Date;
    searchTerm?: string;
    categoryId?: string;
    organizerId?: string;
    status?: string[];
}
//# sourceMappingURL=index.d.ts.map