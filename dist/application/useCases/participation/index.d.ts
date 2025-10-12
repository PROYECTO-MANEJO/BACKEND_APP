/**
 * Participation Use Cases - Index
 *
 * Exports all use cases for the Participation domain
 */
import { EnrollmentManagement } from "./EnrollmentManagement";
import { ParticipationTracking } from "./ParticipationTracking";
export { EnrollmentManagement, type EnrollmentRepository as EnrollmentManagementRepository, type ActivityService as EnrollmentActivityService, type UserService as EnrollmentUserService, type NotificationService as EnrollmentNotificationService, type PaymentService, type EnrollmentManagementInput, type BulkEnrollmentInput, type ApprovalInput, type PaymentUpdateInput, } from "./EnrollmentManagement";
export { ParticipationTracking, type ParticipationRepository, type EnrollmentRepository as ParticipationEnrollmentRepository, type CertificateService, type NotificationService as ParticipationNotificationService, type AttendanceInput, type GradeInput, type AttendanceUpdateInput, type BulkAttendanceInput, type BulkGradeInput, } from "./ParticipationTracking";
export interface ParticipationUseCaseResult<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}
export interface ParticipationReportFilters {
    activityType?: "EVENT" | "COURSE";
    startDate?: Date;
    endDate?: Date;
    status?: string;
    participantId?: string;
    activityId?: string;
    instructorId?: string;
    location?: string;
    includeWithdrawn?: boolean;
    certificatesOnly?: boolean;
}
export interface ParticipationDashboardData {
    summary: {
        totalEnrollments: number;
        activeParticipations: number;
        completedParticipations: number;
        certificatesGenerated: number;
        averageCompletionRate: number;
    };
    recentActivity: Array<{
        type: "ENROLLMENT" | "ATTENDANCE" | "GRADE" | "CERTIFICATE" | "WITHDRAWAL";
        participantName: string;
        activityName: string;
        timestamp: Date;
        details: string;
    }>;
    upcomingDeadlines: Array<{
        activityName: string;
        participantCount: number;
        deadline: Date;
        type: "START" | "END" | "EVALUATION";
    }>;
    performanceMetrics: {
        attendanceByMonth: Array<{
            month: string;
            averageAttendance: number;
        }>;
        gradeDistribution: Array<{
            gradeRange: string;
            count: number;
            percentage: number;
        }>;
        completionTrends: Array<{
            month: string;
            enrolled: number;
            completed: number;
            completionRate: number;
        }>;
    };
    alerts: Array<{
        type: "LOW_ATTENDANCE" | "MISSING_GRADES" | "PENDING_CERTIFICATES" | "CAPACITY_FULL";
        message: string;
        count: number;
        priority: "HIGH" | "MEDIUM" | "LOW";
        activityId?: string;
    }>;
}
export interface ParticipationUseCaseDependencies {
    enrollmentRepository: any;
    participationRepository: any;
    activityService: any;
    userService: any;
    certificateService: any;
    notificationService: any;
    paymentService: any;
}
export declare class ParticipationUseCaseFactory {
    private dependencies;
    constructor(dependencies: ParticipationUseCaseDependencies);
    createEnrollmentManagement(): EnrollmentManagement;
    createParticipationTracking(): ParticipationTracking;
}
export declare class ParticipationValidation {
    static validateAttendanceInput(input: any): string[];
    static validateGradeInput(input: any): string[];
    static validateEnrollmentInput(input: any): string[];
}
export type ParticipationDomainEvent = {
    type: "ENROLLMENT_CREATED";
    enrollmentId: string;
    participantId: string;
    activityId: string;
    timestamp: Date;
} | {
    type: "ENROLLMENT_CONFIRMED";
    enrollmentId: string;
    participantId: string;
    activityId: string;
    timestamp: Date;
} | {
    type: "ATTENDANCE_RECORDED";
    participationId: string;
    sessionDate: Date;
    present: boolean;
    timestamp: Date;
} | {
    type: "GRADE_UPDATED";
    participationId: string;
    finalGrade: number;
    evaluatedBy: string;
    timestamp: Date;
} | {
    type: "CERTIFICATE_GENERATED";
    participationId: string;
    certificateId: string;
    timestamp: Date;
} | {
    type: "PARTICIPATION_COMPLETED";
    participationId: string;
    participantId: string;
    activityId: string;
    timestamp: Date;
} | {
    type: "PARTICIPANT_WITHDRAWN";
    participationId: string;
    reason: string;
    timestamp: Date;
};
export declare class ParticipationError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
export declare class EnrollmentError extends ParticipationError {
    constructor(message: string, code: string, details?: any);
}
export declare class AttendanceError extends ParticipationError {
    constructor(message: string, code: string, details?: any);
}
export declare class GradingError extends ParticipationError {
    constructor(message: string, code: string, details?: any);
}
export declare class CertificateError extends ParticipationError {
    constructor(message: string, code: string, details?: any);
}
//# sourceMappingURL=index.d.ts.map