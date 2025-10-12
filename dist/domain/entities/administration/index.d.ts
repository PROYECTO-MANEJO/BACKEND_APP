/**
 * Administration Domain Entities - Index
 *
 * Exporta todas las entidades del dominio de administración
 */
export { EventAdministration } from "./EventAdministration";
export type { EventAdministrationData, EventStatistics, InscriptionSummary, } from "./EventAdministration";
export { CourseAdministration } from "./CourseAdministration";
export type { CourseAdministrationData, CourseStatistics, CourseInscriptionSummary, } from "./CourseAdministration";
export { ParticipationRegistration } from "./ParticipationRegistration";
export type { ParticipationData, ParticipationType, ParticipationStatus, } from "./ParticipationRegistration";
export interface AdministrationSummary {
    events: {
        total: number;
        active: number;
        upcoming: number;
        completed: number;
    };
    courses: {
        total: number;
        active: number;
        upcoming: number;
        completed: number;
    };
    inscriptions: {
        totalEvents: number;
        totalCourses: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    participations: {
        registered: number;
        attended: number;
        completed: number;
        certificates: number;
    };
    revenue: {
        total: number;
        pending: number;
        events: number;
        courses: number;
    };
}
export interface AdministrationFilters {
    dateFrom?: Date;
    dateTo?: Date;
    categoryId?: string;
    organizerId?: string;
    status?: string[];
    searchTerm?: string;
}
export interface AdministrationPagination {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface PaymentProof {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: Date;
    uploadedBy: string;
    verified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
}
export interface PaymentSummary {
    inscriptionId: string;
    participantName: string;
    activityName: string;
    amount: number;
    status: "APPROVED" | "PENDING" | "REJECTED";
    paymentDate: Date;
    proof?: PaymentProof;
}
export interface CertificateTemplate {
    id: string;
    name: string;
    type: "EVENT" | "COURSE";
    template: string;
    variables: string[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CertificateGeneration {
    participationId: string;
    templateId: string;
    certificateData: Record<string, any>;
    generatedBy: string;
    generatedAt: Date;
    downloadCount: number;
    lastDownloadAt?: Date;
}
export interface CapacityAlert {
    activityId: string;
    activityName: string;
    activityType: "EVENT" | "COURSE";
    currentCapacity: number;
    maxCapacity: number;
    utilizationPercentage: number;
    alertLevel: "LOW" | "MEDIUM" | "HIGH" | "FULL";
    alertDate: Date;
}
export type ActivityStatus = "PLANNING" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export interface ActivityStatusChange {
    activityId: string;
    activityType: "EVENT" | "COURSE";
    previousStatus: ActivityStatus;
    newStatus: ActivityStatus;
    changedBy: string;
    changeDate: Date;
    reason?: string;
}
export interface AdministrationReport {
    id: string;
    title: string;
    type: "FINANCIAL" | "PARTICIPATION" | "COMPLETION" | "CAPACITY" | "CUSTOM";
    parameters: Record<string, any>;
    generatedBy: string;
    generatedAt: Date;
    fileUrl?: string;
    expiresAt?: Date;
}
export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: "FINANCIAL" | "PARTICIPATION" | "COMPLETION" | "CAPACITY" | "CUSTOM";
    template: string;
    parameters: Array<{
        name: string;
        type: "string" | "number" | "date" | "boolean";
        required: boolean;
        defaultValue?: any;
    }>;
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AdministrationAuditLog {
    id: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "CANCEL";
    entityType: "EVENT" | "COURSE" | "INSCRIPTION" | "PARTICIPATION" | "CERTIFICATE";
    entityId: string;
    userId: string;
    userName: string;
    details: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}
export interface AdministrationNotification {
    id: string;
    type: "INSCRIPTION_PENDING" | "PAYMENT_RECEIVED" | "CAPACITY_ALERT" | "DEADLINE_APPROACHING";
    title: string;
    message: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    recipients: string[];
    readBy: string[];
    createdAt: Date;
    expiresAt?: Date;
    actionUrl?: string;
    metadata?: Record<string, any>;
}
export interface InscriptionApprovalRequest {
    userId: string;
    paymentMethod?: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "BECA";
    paymentAmount?: number;
    paymentReference?: string;
    scholarshipType?: "COMPLETA" | "PARCIAL";
    scholarshipPercentage?: number;
    scholarshipReason?: string;
    additionalNotes?: string;
    approvedBy: string;
    approvalReason?: string;
    approvalDate: Date;
}
export interface InscriptionApprovalResult {
    success: boolean;
    message: string;
    inscriptionId?: string;
    paymentRequired: boolean;
    paymentAmount?: number;
    certificateEligible: boolean;
}
//# sourceMappingURL=index.d.ts.map