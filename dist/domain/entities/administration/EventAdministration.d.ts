/**
 * Event Administration Entity - Domain Layer
 *
 * Representa la administración de eventos con estadísticas e inscripciones
 */
export interface EventStatistics {
    totalInscriptions: number;
    approvedInscriptions: number;
    pendingInscriptions: number;
    rejectedInscriptions: number;
    availableSlots: number;
    capacityUtilization: number;
}
export interface InscriptionSummary {
    id: string;
    participantName: string;
    participantEmail: string;
    participantCedula: string;
    inscriptionDate: Date;
    paymentStatus: "APPROVED" | "PENDING" | "REJECTED";
    paymentAmount: number;
    paymentProof?: string;
    participationRegistered: boolean;
}
export interface EventAdministrationData {
    id: string;
    eventId: string;
    eventName: string;
    eventDescription: string;
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
    statistics: EventStatistics;
    inscriptions: InscriptionSummary[];
    eventCost: number;
    totalRevenue: number;
    pendingRevenue: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class EventAdministration {
    private data;
    constructor(data: EventAdministrationData);
    static create(eventId: string, eventName: string, startDate: Date, endDate: Date, maxCapacity: number, categoryId: string, categoryName: string, organizerId: string, organizerName: string, eventCost?: number, eventDescription?: string): EventAdministration;
    static fromPrismaData(eventData: any): EventAdministration;
    private static mapPaymentStatus;
    private static formatOrganizerName;
    private static calculateStatistics;
    private validateData;
    getId(): string;
    getEventId(): string;
    getEventName(): string;
    getEventDescription(): string;
    getStartDate(): Date;
    getEndDate(): Date;
    getMaxCapacity(): number;
    getCategoryName(): string;
    getOrganizerName(): string;
    getStatistics(): EventStatistics;
    getInscriptions(): InscriptionSummary[];
    getEventCost(): number;
    getTotalRevenue(): number;
    getPendingRevenue(): number;
    isActive(): boolean;
    isAdministrable(): boolean;
    canRegisterParticipation(): boolean;
    hasAvailableSlots(): boolean;
    isFullyBooked(): boolean;
    getCapacityUtilization(): number;
    hasInscriptions(): boolean;
    hasPendingInscriptions(): boolean;
    getInscriptionById(inscriptionId: string): InscriptionSummary | undefined;
    getInscriptionsByStatus(status: "APPROVED" | "PENDING" | "REJECTED"): InscriptionSummary[];
    approveInscription(inscriptionId: string): EventAdministration;
    rejectInscription(inscriptionId: string): EventAdministration;
    markParticipationRegistered(inscriptionId: string): EventAdministration;
    updateCapacity(newMaxCapacity: number): EventAdministration;
    deactivate(): EventAdministration;
    getFinancialSummary(): {
        totalRevenue: number;
        pendingRevenue: number;
        potentialRevenue: number;
        revenuePercentage: number;
    };
    getParticipationSummary(): {
        totalParticipants: number;
        registeredParticipants: number;
        pendingParticipants: number;
        participationRate: number;
    };
    toPlainObject(): EventAdministrationData;
    toJSON(): EventAdministrationData;
}
//# sourceMappingURL=EventAdministration.d.ts.map