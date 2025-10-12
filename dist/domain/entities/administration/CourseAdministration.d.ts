/**
 * Course Administration Entity - Domain Layer
 *
 * Representa la administración de cursos con estadísticas e inscripciones
 */
export interface CourseStatistics {
    totalInscriptions: number;
    approvedInscriptions: number;
    pendingInscriptions: number;
    rejectedInscriptions: number;
    availableSlots: number;
    capacityUtilization: number;
}
export interface CourseInscriptionSummary {
    id: string;
    participantName: string;
    participantEmail: string;
    participantCedula: string;
    inscriptionDate: Date;
    paymentStatus: "APPROVED" | "PENDING" | "REJECTED";
    paymentAmount: number;
    paymentProof?: string;
    participationRegistered: boolean;
    completionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
    completionPercentage: number;
}
export interface CourseAdministrationData {
    id: string;
    courseId: string;
    courseName: string;
    courseDescription: string;
    startDate: Date;
    endDate: Date;
    inscriptionStartDate: Date;
    inscriptionEndDate: Date;
    maxCapacity: number;
    minCapacity: number;
    categoryId: string;
    categoryName: string;
    organizerId: string;
    organizerName: string;
    isActive: boolean;
    isAdministrable: boolean;
    canRegisterParticipation: boolean;
    duration: number;
    modalidad: "PRESENCIAL" | "VIRTUAL" | "HIBRIDA";
    statistics: CourseStatistics;
    inscriptions: CourseInscriptionSummary[];
    courseCost: number;
    totalRevenue: number;
    pendingRevenue: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CourseAdministration {
    private data;
    constructor(data: CourseAdministrationData);
    static create(courseId: string, courseName: string, startDate: Date, endDate: Date, maxCapacity: number, categoryId: string, categoryName: string, organizerId: string, organizerName: string, duration: number, modalidad: "PRESENCIAL" | "VIRTUAL" | "HIBRIDA", courseCost?: number, courseDescription?: string): CourseAdministration;
    static fromPrismaData(courseData: any): CourseAdministration;
    private static mapPaymentStatus;
    private static mapCompletionStatus;
    private static mapModalidad;
    private static formatOrganizerName;
    private static calculateStatistics;
    private validateData;
    getId(): string;
    getCourseId(): string;
    getCourseName(): string;
    getCourseDescription(): string;
    getStartDate(): Date;
    getEndDate(): Date;
    getMaxCapacity(): number;
    getDuration(): number;
    getModalidad(): "PRESENCIAL" | "VIRTUAL" | "HIBRIDA";
    getCategoryName(): string;
    getOrganizerName(): string;
    getStatistics(): CourseStatistics;
    getInscriptions(): CourseInscriptionSummary[];
    getCourseCost(): number;
    getTotalRevenue(): number;
    getPendingRevenue(): number;
    isActive(): boolean;
    isAdministrable(): boolean;
    canRegisterParticipation(): boolean;
    hasAvailableSlots(): boolean;
    isFullyBooked(): boolean;
    isVirtual(): boolean;
    isHybrid(): boolean;
    getCapacityUtilization(): number;
    hasInscriptions(): boolean;
    hasPendingInscriptions(): boolean;
    getInscriptionById(inscriptionId: string): CourseInscriptionSummary | undefined;
    getInscriptionsByStatus(status: "APPROVED" | "PENDING" | "REJECTED"): CourseInscriptionSummary[];
    getInscriptionsByCompletion(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED"): CourseInscriptionSummary[];
    approveInscription(inscriptionId: string): CourseAdministration;
    rejectInscription(inscriptionId: string): CourseAdministration;
    markParticipationRegistered(inscriptionId: string): CourseAdministration;
    updateCompletionStatus(inscriptionId: string, status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED", percentage?: number): CourseAdministration;
    getCompletionSummary(): {
        completedStudents: number;
        inProgressStudents: number;
        droppedStudents: number;
        notStartedStudents: number;
        completionRate: number;
        dropoutRate: number;
    };
    getFinancialSummary(): {
        totalRevenue: number;
        pendingRevenue: number;
        potentialRevenue: number;
        revenuePercentage: number;
    };
    getAverageCompletionPercentage(): number;
    toPlainObject(): CourseAdministrationData;
    toJSON(): CourseAdministrationData;
}
//# sourceMappingURL=CourseAdministration.d.ts.map