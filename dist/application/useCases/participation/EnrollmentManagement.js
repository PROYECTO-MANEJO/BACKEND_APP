"use strict";
/**
 * Enrollment Management Use Case - Application Layer
 *
 * Handles all enrollment-related operations including creation, approval, payment processing, and waiting list management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentManagement = void 0;
const participation_1 = require("../../../domain/entities/participation");
class EnrollmentManagement {
    constructor(enrollmentRepository, activityService, userService, notificationService, paymentService) {
        this.enrollmentRepository = enrollmentRepository;
        this.activityService = activityService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.paymentService = paymentService;
    }
    /**
     * Create a new enrollment for a participant in an activity
     */
    async createEnrollment(input) {
        try {
            // Validate participant
            const user = await this.userService.getUserDetails(input.participantId);
            if (!user) {
                return {
                    success: false,
                    message: "Participant not found",
                };
            }
            // Validate activity
            const activity = await this.activityService.getActivityDetails(input.activityId);
            if (!activity) {
                return {
                    success: false,
                    message: "Activity not found",
                };
            }
            // Check if activity is available
            const isAvailable = await this.activityService.isActivityAvailable(input.activityId);
            if (!isAvailable) {
                return {
                    success: false,
                    message: "Activity is not available for enrollment",
                };
            }
            // Check for existing enrollment
            const existingEnrollments = await this.enrollmentRepository.findByParticipantId(input.participantId);
            const alreadyEnrolled = existingEnrollments.some((enrollment) => enrollment.getActivityId() === input.activityId &&
                !enrollment.isCancelled());
            if (alreadyEnrolled) {
                return {
                    success: false,
                    message: "Participant is already enrolled in this activity",
                };
            }
            // Create enrollment
            const enrollment = participation_1.Enrollment.create(activity.id, activity.name, activity.type, user.id, user.name, user.email, user.cedula, activity.price, "CRC", user.phone, activity.startDate, activity.endDate, activity.location, activity.instructor, activity.requiresApproval || false, activity.requiredDocuments || [], input.source || "WEB", input.createdBy);
            // Check capacity and handle waiting list
            const hasCapacity = await this.activityService.hasAvailableCapacity(input.activityId);
            let waitingListPosition;
            if (!hasCapacity) {
                const waitingList = await this.enrollmentRepository.findWaitingList(input.activityId);
                waitingListPosition = waitingList.length + 1;
                const enrollmentWithWaitingList = enrollment.addToWaitingList(waitingListPosition, input.priority || 0);
                await this.enrollmentRepository.save(enrollmentWithWaitingList);
                await this.notificationService.sendWaitingListNotification(enrollmentWithWaitingList, waitingListPosition);
                return {
                    success: true,
                    enrollmentId: enrollment.getId(),
                    waitingListPosition,
                    message: `Enrollment created and added to waiting list at position ${waitingListPosition}`,
                };
            }
            // Save enrollment
            await this.enrollmentRepository.save(enrollment);
            // Send confirmation if enrollment is automatically confirmed
            if (enrollment.isConfirmed()) {
                await this.notificationService.sendEnrollmentConfirmation(enrollment);
            }
            return {
                success: true,
                enrollmentId: enrollment.getId(),
                message: "Enrollment created successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to create enrollment: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Process bulk enrollments for multiple participants
     */
    async createBulkEnrollments(input) {
        const startTime = Date.now();
        const result = {
            successful: [],
            failed: [],
            summary: {
                total: input.participants.length,
                successful: 0,
                failed: 0,
                processingTime: 0,
            },
        };
        // Validate activity first
        const activity = await this.activityService.getActivityDetails(input.activityId);
        if (!activity) {
            input.participants.forEach((participant) => {
                result.failed.push({
                    participantEmail: participant.participantId,
                    reason: "Activity not found",
                });
            });
            result.summary.failed = input.participants.length;
            result.summary.processingTime = Date.now() - startTime;
            return result;
        }
        // Process each participant
        for (const participant of input.participants) {
            try {
                const enrollmentResult = await this.createEnrollment({
                    participantId: participant.participantId,
                    activityId: input.activityId,
                    paymentMethod: input.paymentMethod,
                    priority: participant.priority,
                    source: input.source,
                    createdBy: input.createdBy,
                });
                if (enrollmentResult.success) {
                    const user = await this.userService.getUserDetails(participant.participantId);
                    result.successful.push({
                        enrollmentId: enrollmentResult.enrollmentId,
                        participantEmail: user?.email || participant.participantId,
                    });
                    result.summary.successful++;
                }
                else {
                    const user = await this.userService.getUserDetails(participant.participantId);
                    result.failed.push({
                        participantEmail: user?.email || participant.participantId,
                        reason: enrollmentResult.message,
                    });
                    result.summary.failed++;
                }
            }
            catch (error) {
                const user = await this.userService.getUserDetails(participant.participantId);
                result.failed.push({
                    participantEmail: user?.email || participant.participantId,
                    reason: error instanceof Error ? error.message : "Unknown error",
                    details: error,
                });
                result.summary.failed++;
            }
        }
        result.summary.processingTime = Date.now() - startTime;
        return result;
    }
    /**
     * Process enrollment approval or rejection
     */
    async processApproval(input) {
        try {
            const enrollment = await this.enrollmentRepository.findById(input.enrollmentId);
            if (!enrollment) {
                return {
                    success: false,
                    message: "Enrollment not found",
                };
            }
            if (!enrollment.requiresApproval()) {
                return {
                    success: false,
                    message: "This enrollment does not require approval",
                };
            }
            if (!enrollment.isApprovalPending()) {
                return {
                    success: false,
                    message: "Approval has already been processed for this enrollment",
                };
            }
            const approvalStatus = input.approved ? "APPROVED" : "REJECTED";
            const updatedEnrollment = enrollment.updateApprovalStatus(approvalStatus, input.approvedBy, input.notes);
            await this.enrollmentRepository.update(updatedEnrollment);
            await this.notificationService.sendApprovalNotification(updatedEnrollment, input.approved, input.notes);
            return {
                success: true,
                message: `Enrollment ${input.approved ? "approved" : "rejected"} successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to process approval: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Update payment status for an enrollment
     */
    async updatePaymentStatus(input) {
        try {
            const enrollment = await this.enrollmentRepository.findById(input.enrollmentId);
            if (!enrollment) {
                return {
                    success: false,
                    message: "Enrollment not found",
                };
            }
            const updatedEnrollment = enrollment.updatePaymentStatus(input.paymentStatus, input.transactionId, input.paymentMethod, input.notes, input.processedBy);
            await this.enrollmentRepository.update(updatedEnrollment);
            // Send notifications based on payment status
            if (input.paymentStatus === "APPROVED") {
                await this.notificationService.sendPaymentConfirmation(updatedEnrollment);
                if (updatedEnrollment.isConfirmed()) {
                    await this.notificationService.sendEnrollmentConfirmation(updatedEnrollment);
                }
            }
            return {
                success: true,
                message: "Payment status updated successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to update payment status: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Cancel an enrollment
     */
    async cancelEnrollment(enrollmentId, reason, cancelledBy, processRefund = false) {
        try {
            const enrollment = await this.enrollmentRepository.findById(enrollmentId);
            if (!enrollment) {
                return {
                    success: false,
                    message: "Enrollment not found",
                };
            }
            if (!enrollment.canBeCancelled()) {
                return {
                    success: false,
                    message: "This enrollment cannot be cancelled",
                };
            }
            // Process refund if requested and payment was approved
            let refundId;
            if (processRefund && enrollment.isPaymentApproved()) {
                const paymentDetails = enrollment.getPaymentDetails();
                if (paymentDetails.transactionId) {
                    const refundResult = await this.paymentService.refundPayment(paymentDetails.transactionId, paymentDetails.amount);
                    if (refundResult.success) {
                        refundId = refundResult.refundId;
                    }
                    else {
                        return {
                            success: false,
                            message: `Failed to process refund: ${refundResult.errorMessage}`,
                        };
                    }
                }
            }
            const cancelledEnrollment = enrollment.cancel(reason, cancelledBy);
            // Update payment status to refunded if refund was processed
            const finalEnrollment = refundId
                ? cancelledEnrollment.updatePaymentStatus("REFUNDED", refundId)
                : cancelledEnrollment;
            await this.enrollmentRepository.update(finalEnrollment);
            // Check if we can promote someone from waiting list
            if (enrollment.isConfirmed()) {
                await this.processWaitingListPromotion(enrollment.getActivityId());
            }
            return {
                success: true,
                message: "Enrollment cancelled successfully",
                refundId,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to cancel enrollment: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get enrollment details by ID
     */
    async getEnrollment(enrollmentId) {
        try {
            const enrollment = await this.enrollmentRepository.findById(enrollmentId);
            if (!enrollment) {
                return {
                    success: false,
                    message: "Enrollment not found",
                };
            }
            return {
                success: true,
                enrollment: enrollment.getDetailedReport(),
                message: "Enrollment retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve enrollment: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get enrollments by various filters
     */
    async getEnrollments(filters) {
        try {
            const enrollments = await this.enrollmentRepository.findAll(filters);
            const enrollmentSummaries = enrollments.map((enrollment) => enrollment.getEnrollmentSummary());
            return {
                success: true,
                enrollments: enrollmentSummaries,
                message: `Retrieved ${enrollments.length} enrollments`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve enrollments: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get activity capacity information
     */
    async getActivityCapacity(activityId) {
        try {
            const capacity = await this.enrollmentRepository.getActivityCapacity(activityId);
            return {
                success: true,
                capacity,
                message: "Activity capacity retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve activity capacity: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Manage waiting list for an activity
     */
    async getWaitingListManagement(activityId) {
        try {
            const waitingListEnrollments = await this.enrollmentRepository.findWaitingList(activityId);
            const capacity = await this.enrollmentRepository.getActivityCapacity(activityId);
            const waitingList = {
                activityId,
                waitingList: waitingListEnrollments
                    .map((enrollment) => ({
                    enrollmentId: enrollment.getId(),
                    participantName: enrollment.getParticipantName(),
                    participantEmail: enrollment.getParticipantEmail(),
                    position: enrollment.getWaitingListPosition() || 0,
                    priorityScore: enrollment.getPriorityScore(),
                    enrollmentDate: enrollment.getEnrollmentDate(),
                    daysWaiting: enrollment.getDaysEnrolled(),
                }))
                    .sort((a, b) => a.position - b.position),
                availableSpots: capacity.availableSpots,
                estimatedWaitTime: this.calculateEstimatedWaitTime(waitingListEnrollments.length, capacity.availableSpots),
                operations: {
                    promote: async (enrollmentId) => {
                        await this.promoteFromWaitingList(enrollmentId);
                    },
                    reorder: async (enrollmentId, newPosition) => {
                        await this.reorderWaitingList(enrollmentId, newPosition);
                    },
                    notify: async (position) => {
                        await this.notifyWaitingList(activityId, position);
                    },
                    cleanup: async () => {
                        await this.cleanupWaitingList(activityId);
                    },
                },
            };
            return {
                success: true,
                waitingList,
                message: "Waiting list management retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve waiting list management: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Private helper methods
     */
    async processWaitingListPromotion(activityId) {
        const hasCapacity = await this.activityService.hasAvailableCapacity(activityId);
        if (!hasCapacity)
            return;
        const waitingList = await this.enrollmentRepository.findWaitingList(activityId);
        if (waitingList.length === 0)
            return;
        // Sort by position and priority
        const sortedWaitingList = waitingList.sort((a, b) => {
            const posA = a.getWaitingListPosition() || 999;
            const posB = b.getWaitingListPosition() || 999;
            if (posA !== posB)
                return posA - posB;
            return b.getPriorityScore() - a.getPriorityScore();
        });
        const nextEnrollment = sortedWaitingList[0];
        if (nextEnrollment) {
            await this.promoteFromWaitingList(nextEnrollment.getId());
        }
    }
    async promoteFromWaitingList(enrollmentId) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (!enrollment || !enrollment.isOnWaitingList())
            return;
        const promotedEnrollment = enrollment.removeFromWaitingList();
        await this.enrollmentRepository.update(promotedEnrollment);
        // Reorder remaining waiting list
        await this.reorderWaitingListPositions(enrollment.getActivityId());
        // Send notification
        await this.notificationService.sendEnrollmentConfirmation(promotedEnrollment);
    }
    async reorderWaitingList(enrollmentId, newPosition) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (!enrollment || !enrollment.isOnWaitingList())
            return;
        const activityId = enrollment.getActivityId();
        const waitingList = await this.enrollmentRepository.findWaitingList(activityId);
        // Reorder logic would be implemented here
        // This is a simplified version - full implementation would handle position swapping
        await this.reorderWaitingListPositions(activityId);
    }
    async reorderWaitingListPositions(activityId) {
        const waitingList = await this.enrollmentRepository.findWaitingList(activityId);
        const sortedList = waitingList.sort((a, b) => {
            const posA = a.getWaitingListPosition() || 999;
            const posB = b.getWaitingListPosition() || 999;
            if (posA !== posB)
                return posA - posB;
            return b.getPriorityScore() - a.getPriorityScore();
        });
        for (let i = 0; i < sortedList.length; i++) {
            const enrollment = sortedList[i];
            if (enrollment) {
                const currentPosition = enrollment.getWaitingListPosition();
                const newPosition = i + 1;
                if (currentPosition !== newPosition) {
                    const reorderedEnrollment = enrollment.addToWaitingList(newPosition, enrollment.getPriorityScore());
                    await this.enrollmentRepository.update(reorderedEnrollment);
                }
            }
        }
    }
    async notifyWaitingList(activityId, upToPosition) {
        const waitingList = await this.enrollmentRepository.findWaitingList(activityId);
        const enrollmentsToNotify = upToPosition
            ? waitingList.filter((e) => (e.getWaitingListPosition() || 0) <= upToPosition)
            : waitingList;
        for (const enrollment of enrollmentsToNotify) {
            await this.notificationService.sendWaitingListNotification(enrollment, enrollment.getWaitingListPosition() || 0);
        }
    }
    async cleanupWaitingList(activityId) {
        const waitingList = await this.enrollmentRepository.findWaitingList(activityId);
        const activity = await this.activityService.getActivityDetails(activityId);
        if (!activity || !activity.startDate)
            return;
        // Remove expired waiting list entries (e.g., activity started or too old)
        const now = new Date();
        const expiredEnrollments = waitingList.filter((enrollment) => {
            const daysSinceEnrollment = enrollment.getDaysEnrolled();
            return activity.startDate < now || daysSinceEnrollment > 30; // Configurable expiry
        });
        for (const enrollment of expiredEnrollments) {
            const cancelledEnrollment = enrollment.cancel("Automatically removed from waiting list due to expiration", "system");
            await this.enrollmentRepository.update(cancelledEnrollment);
        }
    }
    calculateEstimatedWaitTime(waitingListSize, availableSpots) {
        if (availableSpots > 0)
            return 0;
        if (waitingListSize === 0)
            return undefined;
        // Simple estimation: assume 1 spot becomes available per week
        // In real implementation, this could be based on historical data
        return waitingListSize * 7; // days
    }
}
exports.EnrollmentManagement = EnrollmentManagement;
//# sourceMappingURL=EnrollmentManagement.js.map