/**
 * Participation Registration Entity - Domain Layer
 *
 * Representa el registro de participación de usuarios en eventos y cursos
 */
export type ParticipationType = "EVENT" | "COURSE";
export type ParticipationStatus = "REGISTERED" | "ATTENDED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
export interface ParticipationData {
    id: string;
    participantId: string;
    participantName: string;
    participantEmail: string;
    participantCedula: string;
    activityId: string;
    activityName: string;
    activityType: ParticipationType;
    registrationDate: Date;
    attendanceDate?: Date;
    completionDate?: Date;
    status: ParticipationStatus;
    attendancePercentage: number;
    completionPercentage: number;
    certificateGenerated: boolean;
    certificateId?: string;
    certificateDate?: Date;
    registeredBy: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ParticipationRegistration {
    private data;
    constructor(data: ParticipationData);
    static create(participantId: string, participantName: string, participantEmail: string, participantCedula: string, activityId: string, activityName: string, activityType: ParticipationType, registeredBy: string, notes?: string): ParticipationRegistration;
    static fromPrismaData(participationData: any, activityType: ParticipationType): ParticipationRegistration;
    private static mapStatus;
    private validateData;
    private isValidEmail;
    getId(): string;
    getParticipantId(): string;
    getParticipantName(): string;
    getParticipantEmail(): string;
    getParticipantCedula(): string;
    getActivityId(): string;
    getActivityName(): string;
    getActivityType(): ParticipationType;
    getRegistrationDate(): Date;
    getAttendanceDate(): Date | undefined;
    getCompletionDate(): Date | undefined;
    getStatus(): ParticipationStatus;
    getAttendancePercentage(): number;
    getCompletionPercentage(): number;
    isCertificateGenerated(): boolean;
    getCertificateId(): string | undefined;
    getCertificateDate(): Date | undefined;
    getRegisteredBy(): string;
    getNotes(): string | undefined;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    isEvent(): boolean;
    isCourse(): boolean;
    isRegistered(): boolean;
    hasAttended(): boolean;
    isCompleted(): boolean;
    isCancelled(): boolean;
    isNoShow(): boolean;
    canMarkAttendance(): boolean;
    canMarkCompletion(): boolean;
    canGenerateCertificate(): boolean;
    getProgressStatus(): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    markAttendance(attendancePercentage?: number): ParticipationRegistration;
    markCompletion(completionPercentage?: number): ParticipationRegistration;
    markNoShow(): ParticipationRegistration;
    cancel(reason?: string): ParticipationRegistration;
    generateCertificate(certificateId: string): ParticipationRegistration;
    updateProgress(attendancePercentage?: number, completionPercentage?: number): ParticipationRegistration;
    addNote(note: string): ParticipationRegistration;
    getDurationInActivity(): number;
    getOverallProgress(): number;
    isEligibleForCertificate(): boolean;
    toPlainObject(): ParticipationData;
    toJSON(): ParticipationData;
    getSummary(): {
        participant: string;
        activity: string;
        type: ParticipationType;
        status: ParticipationStatus;
        progress: number;
        certificateReady: boolean;
    };
}
//# sourceMappingURL=ParticipationRegistration.d.ts.map