/**
 * Enrollment Management Use Case - Application Layer
 *
 * Handles all enrollment-related operations including creation, approval, payment processing, and waiting list management
 */
import { Enrollment, EnrollmentType, PaymentStatus, EnrollmentStatus, ParticipationFilters, BulkEnrollmentResult, ActivityCapacity, WaitingListManagement } from "../../../domain/entities/participation";
export interface EnrollmentRepository {
    save(enrollment: Enrollment): Promise<void>;
    findById(id: string): Promise<Enrollment | null>;
    findAll(filters?: ParticipationFilters): Promise<Enrollment[]>;
    update(enrollment: Enrollment): Promise<void>;
    delete(id: string): Promise<void>;
    findByParticipantId(participantId: string): Promise<Enrollment[]>;
    findByActivityId(activityId: string): Promise<Enrollment[]>;
    findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Enrollment[]>;
    findByEnrollmentStatus(status: EnrollmentStatus): Promise<Enrollment[]>;
    findPendingApprovals(): Promise<Enrollment[]>;
    findWaitingList(activityId: string): Promise<Enrollment[]>;
    countByActivityId(activityId: string): Promise<number>;
    countConfirmedByActivityId(activityId: string): Promise<number>;
    getActivityCapacity(activityId: string): Promise<ActivityCapacity>;
    getEnrollmentsByDateRange(startDate: Date, endDate: Date): Promise<Enrollment[]>;
    getTopActivities(limit: number): Promise<Array<{
        activityId: string;
        activityName: string;
        enrollmentCount: number;
    }>>;
}
export interface ActivityService {
    getActivityDetails(activityId: string): Promise<{
        id: string;
        name: string;
        type: EnrollmentType;
        startDate?: Date;
        endDate?: Date;
        location?: string;
        instructor?: string;
        price: number;
        maxCapacity?: number;
        requiresApproval?: boolean;
        requiredDocuments?: string[];
    } | null>;
    isActivityAvailable(activityId: string): Promise<boolean>;
    hasAvailableCapacity(activityId: string): Promise<boolean>;
}
export interface UserService {
    getUserDetails(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        cedula: string;
        phone?: string;
    } | null>;
    validateUser(userId: string): Promise<boolean>;
}
export interface NotificationService {
    sendEnrollmentConfirmation(enrollment: Enrollment): Promise<void>;
    sendPaymentConfirmation(enrollment: Enrollment): Promise<void>;
    sendApprovalNotification(enrollment: Enrollment, approved: boolean, notes?: string): Promise<void>;
    sendWaitingListNotification(enrollment: Enrollment, position: number): Promise<void>;
    sendReminderNotification(enrollment: Enrollment): Promise<void>;
}
export interface PaymentService {
    processPayment(amount: number, currency: string, paymentMethod: string, customerInfo: any): Promise<{
        success: boolean;
        transactionId?: string;
        errorMessage?: string;
    }>;
    refundPayment(transactionId: string, amount?: number): Promise<{
        success: boolean;
        refundId?: string;
        errorMessage?: string;
    }>;
}
export interface EnrollmentManagementInput {
    participantId: string;
    activityId: string;
    paymentMethod?: string;
    notes?: string;
    priority?: number;
    source?: string;
    createdBy?: string;
}
export interface BulkEnrollmentInput {
    activityId: string;
    participants: Array<{
        participantId: string;
        priority?: number;
    }>;
    paymentMethod?: string;
    source?: string;
    createdBy?: string;
}
export interface ApprovalInput {
    enrollmentId: string;
    approved: boolean;
    approvedBy: string;
    notes?: string;
}
export interface PaymentUpdateInput {
    enrollmentId: string;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    paymentMethod?: string;
    notes?: string;
    processedBy?: string;
}
export declare class EnrollmentManagement {
    private enrollmentRepository;
    private activityService;
    private userService;
    private notificationService;
    private paymentService;
    constructor(enrollmentRepository: EnrollmentRepository, activityService: ActivityService, userService: UserService, notificationService: NotificationService, paymentService: PaymentService);
    /**
     * Create a new enrollment for a participant in an activity
     */
    createEnrollment(input: EnrollmentManagementInput): Promise<{
        success: boolean;
        enrollmentId?: string;
        waitingListPosition?: number;
        message: string;
    }>;
    /**
     * Process bulk enrollments for multiple participants
     */
    createBulkEnrollments(input: BulkEnrollmentInput): Promise<BulkEnrollmentResult>;
    /**
     * Process enrollment approval or rejection
     */
    processApproval(input: ApprovalInput): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Update payment status for an enrollment
     */
    updatePaymentStatus(input: PaymentUpdateInput): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Cancel an enrollment
     */
    cancelEnrollment(enrollmentId: string, reason: string, cancelledBy?: string, processRefund?: boolean): Promise<{
        success: boolean;
        message: string;
        refundId?: string;
    }>;
    /**
     * Get enrollment details by ID
     */
    getEnrollment(enrollmentId: string): Promise<{
        success: boolean;
        enrollment?: any;
        message: string;
    }>;
    /**
     * Get enrollments by various filters
     */
    getEnrollments(filters?: ParticipationFilters): Promise<{
        success: boolean;
        enrollments?: any[];
        message: string;
    }>;
    /**
     * Get activity capacity information
     */
    getActivityCapacity(activityId: string): Promise<{
        success: boolean;
        capacity?: ActivityCapacity;
        message: string;
    }>;
    /**
     * Manage waiting list for an activity
     */
    getWaitingListManagement(activityId: string): Promise<{
        success: boolean;
        waitingList?: WaitingListManagement;
        message: string;
    }>;
    /**
     * Private helper methods
     */
    private processWaitingListPromotion;
    private promoteFromWaitingList;
    private reorderWaitingList;
    private reorderWaitingListPositions;
    private notifyWaitingList;
    private cleanupWaitingList;
    private calculateEstimatedWaitTime;
}
//# sourceMappingURL=EnrollmentManagement.d.ts.map