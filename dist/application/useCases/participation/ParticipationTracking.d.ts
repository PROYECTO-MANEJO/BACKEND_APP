/**
 * Participation Tracking Use Case - Application Layer
 *
 * Handles attendance tracking, grade management, and participation evaluation
 */
import { Participation, ParticipationStatus, AttendanceRecord, ParticipationFilters, CertificateEligibilityCheck, ParticipationAnalytics } from "../../../domain/entities/participation";
export interface ParticipationRepository {
    save(participation: Participation): Promise<void>;
    findById(id: string): Promise<Participation | null>;
    findAll(filters?: ParticipationFilters): Promise<Participation[]>;
    update(participation: Participation): Promise<void>;
    delete(id: string): Promise<void>;
    findByParticipantId(participantId: string): Promise<Participation[]>;
    findByActivityId(activityId: string): Promise<Participation[]>;
    findByEnrollmentId(enrollmentId: string): Promise<Participation | null>;
    findByStatus(status: ParticipationStatus): Promise<Participation[]>;
    findPendingEvaluations(): Promise<Participation[]>;
    findEligibleForCertificates(): Promise<Participation[]>;
    getParticipationAnalytics(participantId: string): Promise<ParticipationAnalytics>;
    getActivityStatistics(activityId: string): Promise<{
        totalParticipants: number;
        averageAttendance: number;
        averageGrade?: number;
        completionRate: number;
    }>;
    getAttendanceByDateRange(activityId: string, startDate: Date, endDate: Date): Promise<AttendanceRecord[]>;
}
export interface EnrollmentRepository {
    findById(id: string): Promise<any>;
    findByActivityId(activityId: string): Promise<any[]>;
}
export interface CertificateService {
    generateCertificate(participationId: string, participantName: string, activityName: string, completionDate: Date): Promise<{
        success: boolean;
        certificateId?: string;
        certificateUrl?: string;
        errorMessage?: string;
    }>;
}
export interface NotificationService {
    sendGradeNotification(participation: Participation): Promise<void>;
    sendAttendanceAlert(participation: Participation): Promise<void>;
    sendCertificateNotification(participation: Participation, certificateUrl: string): Promise<void>;
    sendCompletionNotification(participation: Participation): Promise<void>;
}
export interface AttendanceInput {
    participationId: string;
    sessionDate: Date;
    present: boolean;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
    recordedBy?: string;
}
export interface GradeInput {
    participationId: string;
    finalGrade: number;
    evaluatedBy: string;
    comments?: string;
}
export interface AttendanceUpdateInput {
    participationId: string;
    attendancePercentage: number;
    evaluatedBy: string;
}
export interface BulkAttendanceInput {
    activityId: string;
    sessionDate: Date;
    attendance: Array<{
        participationId: string;
        present: boolean;
        checkInTime?: Date;
        checkOutTime?: Date;
        notes?: string;
    }>;
    recordedBy: string;
}
export interface BulkGradeInput {
    activityId: string;
    grades: Array<{
        participationId: string;
        finalGrade: number;
        comments?: string;
    }>;
    evaluatedBy: string;
}
export declare class ParticipationTracking {
    private participationRepository;
    private enrollmentRepository;
    private certificateService;
    private notificationService;
    constructor(participationRepository: ParticipationRepository, enrollmentRepository: EnrollmentRepository, certificateService: CertificateService, notificationService: NotificationService);
    /**
     * Record attendance for a single session
     */
    recordAttendance(input: AttendanceInput): Promise<{
        success: boolean;
        message: string;
        updatedParticipation?: any;
    }>;
    /**
     * Record attendance for multiple participants in a session
     */
    recordBulkAttendance(input: BulkAttendanceInput): Promise<{
        success: boolean;
        message: string;
        results: Array<{
            participationId: string;
            success: boolean;
            message: string;
        }>;
    }>;
    /**
     * Update final grade for a course participation
     */
    updateGrade(input: GradeInput): Promise<{
        success: boolean;
        message: string;
        updatedParticipation?: any;
    }>;
    /**
     * Update grades for multiple course participations
     */
    updateBulkGrades(input: BulkGradeInput): Promise<{
        success: boolean;
        message: string;
        results: Array<{
            participationId: string;
            success: boolean;
            message: string;
        }>;
    }>;
    /**
     * Update attendance percentage directly (for events or manual corrections)
     */
    updateAttendancePercentage(input: AttendanceUpdateInput): Promise<{
        success: boolean;
        message: string;
        updatedParticipation?: any;
    }>;
    /**
     * Generate certificate for eligible participation
     */
    generateCertificate(participationId: string): Promise<{
        success: boolean;
        message: string;
        certificateId?: string;
        certificateUrl?: string;
    }>;
    /**
     * Check certificate eligibility for a participation
     */
    checkCertificateEligibility(participationId: string): Promise<{
        success: boolean;
        eligibility?: CertificateEligibilityCheck;
        message: string;
    }>;
    /**
     * Withdraw a participant from an activity
     */
    withdrawParticipant(participationId: string, reason: string, withdrawnBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get participation details
     */
    getParticipation(participationId: string): Promise<{
        success: boolean;
        participation?: any;
        message: string;
    }>;
    /**
     * Get participations by filters
     */
    getParticipations(filters?: ParticipationFilters): Promise<{
        success: boolean;
        participations?: any[];
        message: string;
    }>;
    /**
     * Get participant analytics
     */
    getParticipantAnalytics(participantId: string): Promise<{
        success: boolean;
        analytics?: ParticipationAnalytics;
        message: string;
    }>;
    /**
     * Get activity statistics
     */
    getActivityStatistics(activityId: string): Promise<{
        success: boolean;
        statistics?: any;
        message: string;
    }>;
    /**
     * Process pending evaluations (batch job)
     */
    processPendingEvaluations(): Promise<{
        success: boolean;
        processed: number;
        message: string;
    }>;
    /**
     * Generate certificates for all eligible participations (batch job)
     */
    generateEligibleCertificates(): Promise<{
        success: boolean;
        generated: number;
        message: string;
    }>;
}
//# sourceMappingURL=ParticipationTracking.d.ts.map