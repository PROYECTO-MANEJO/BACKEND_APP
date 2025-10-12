/**
 * Participation Entity - Domain Layer
 *
 * Representa la participación de un usuario en eventos o cursos
 */
export type ParticipationType = "EVENT" | "COURSE";
export type ParticipationStatus = "ENROLLED" | "ATTENDING" | "COMPLETED" | "FAILED" | "WITHDRAWN" | "PENDING_EVALUATION";
export interface ParticipationGrading {
    finalGrade?: number;
    attendancePercentage: number;
    evaluationDate?: Date;
    evaluatedBy?: string;
    comments?: string;
    isApproved: boolean;
    certificateGenerated: boolean;
    certificateId?: string;
}
export interface AttendanceRecord {
    id: string;
    date: Date;
    present: boolean;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
    recordedBy: string;
}
export interface ParticipationData {
    id: string;
    activityId: string;
    activityName: string;
    activityType: ParticipationType;
    participantId: string;
    participantName: string;
    participantEmail: string;
    participantCedula: string;
    enrollmentId: string;
    enrollmentDate: Date;
    paymentStatus: "APPROVED" | "PENDING" | "REJECTED";
    status: ParticipationStatus;
    startDate?: Date;
    completionDate?: Date;
    withdrawalDate?: Date;
    withdrawalReason?: string;
    grading: ParticipationGrading;
    attendanceRecords: AttendanceRecord[];
    minimumAttendancePercentage: number;
    minimumGradeRequired?: number;
    totalSessions: number;
    sessionsAttended: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastEvaluatedBy?: string;
    notificationsEnabled: boolean;
    remindersSent: number;
}
export declare class Participation {
    private data;
    constructor(data: ParticipationData);
    static create(activityId: string, activityName: string, activityType: ParticipationType, participantId: string, participantName: string, participantEmail: string, participantCedula: string, enrollmentId: string, minimumAttendancePercentage: number, totalSessions: number, minimumGradeRequired?: number, createdBy?: string): Participation;
    static fromPrismaData(participationData: any, activityType: ParticipationType): Participation;
    private static fromEventParticipation;
    private static fromCourseParticipation;
    private static mapParticipationStatus;
    private static mapCourseStatus;
    private validateData;
    getId(): string;
    getActivityId(): string;
    getActivityName(): string;
    getActivityType(): ParticipationType;
    getParticipantId(): string;
    getParticipantName(): string;
    getParticipantEmail(): string;
    getParticipantCedula(): string;
    getEnrollmentId(): string;
    getEnrollmentDate(): Date;
    getPaymentStatus(): "APPROVED" | "PENDING" | "REJECTED";
    getStatus(): ParticipationStatus;
    getGrading(): ParticipationGrading;
    getAttendanceRecords(): AttendanceRecord[];
    getAttendancePercentage(): number;
    getFinalGrade(): number | undefined;
    getSessionsAttended(): number;
    getTotalSessions(): number;
    getMinimumAttendancePercentage(): number;
    getMinimumGradeRequired(): number | undefined;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getLastEvaluatedBy(): string | undefined;
    isEnrolled(): boolean;
    isAttending(): boolean;
    isCompleted(): boolean;
    isFailed(): boolean;
    isWithdrawn(): boolean;
    isPendingEvaluation(): boolean;
    isApproved(): boolean;
    hasCertificate(): boolean;
    canBeEvaluated(): boolean;
    canGenerateCertificate(): boolean;
    isEligibleForCertificate(): boolean;
    recordAttendance(sessionDate: Date, present: boolean, checkInTime?: Date, checkOutTime?: Date, notes?: string, recordedBy?: string): Participation;
    updateGrade(finalGrade: number, evaluatedBy: string, comments?: string): Participation;
    updateAttendancePercentage(attendancePercentage: number, evaluatedBy: string): Participation;
    generateCertificate(certificateId: string): Participation;
    withdraw(reason: string, withdrawnBy?: string): Participation;
    updatePaymentStatus(paymentStatus: "APPROVED" | "PENDING" | "REJECTED"): Participation;
    private calculateApprovalStatus;
    getProgressPercentage(): number;
    getParticipationSummary(): {
        participantName: string;
        activityName: string;
        activityType: ParticipationType;
        status: ParticipationStatus;
        attendancePercentage: number;
        finalGrade: number | undefined;
        isApproved: boolean;
        certificateGenerated: boolean;
        enrollmentDate: Date;
        completionDate: Date | undefined;
        progressPercentage: number;
        paymentStatus: "APPROVED" | "REJECTED" | "PENDING";
    };
    getDetailedReport(): {
        participantId: string;
        participantEmail: string;
        participantCedula: string;
        enrollmentId: string;
        sessionsAttended: number;
        totalSessions: number;
        minimumAttendanceRequired: number;
        minimumGradeRequired: number | undefined;
        attendanceRecords: AttendanceRecord[];
        evaluationDate: Date | undefined;
        evaluatedBy: string | undefined;
        comments: string | undefined;
        withdrawalReason: string | undefined;
        createdAt: Date;
        updatedAt: Date;
        participantName: string;
        activityName: string;
        activityType: ParticipationType;
        status: ParticipationStatus;
        attendancePercentage: number;
        finalGrade: number | undefined;
        isApproved: boolean;
        certificateGenerated: boolean;
        enrollmentDate: Date;
        completionDate: Date | undefined;
        progressPercentage: number;
        paymentStatus: "APPROVED" | "REJECTED" | "PENDING";
    };
}
//# sourceMappingURL=Participation.d.ts.map