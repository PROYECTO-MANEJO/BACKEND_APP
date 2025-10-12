/**
 * Event Entity - Domain Layer
 *
 * Representa un evento con todas sus propiedades, validaciones y reglas de negocio
 */
export type EventArea = "PRACTICA" | "INVESTIGACION" | "ACADEMICA" | "TECNICA" | "INDUSTRIAL" | "EMPRESARIAL" | "IA" | "REDES";
export type EventAudience = "CARRERA_ESPECIFICA" | "TODAS_CARRERAS" | "PUBLICO_GENERAL";
export type EventStatus = "ACTIVO" | "INACTIVO" | "CANCELADO" | "COMPLETADO" | "EN_PROCESO";
export interface EventSchedule {
    startDate: Date;
    endDate?: Date;
    startTime: Date;
    endTime?: Date;
    duration: number;
}
export interface EventLocation {
    venue: string;
    address?: string;
    city?: string;
    capacity: number;
    hasVirtualOption: boolean;
    virtualLink?: string;
}
export interface EventPricing {
    isFree: boolean;
    price?: number;
    currency: string;
    earlyBirdDiscount?: {
        percentage: number;
        validUntil: Date;
    };
    groupDiscount?: {
        minParticipants: number;
        percentage: number;
    };
}
export interface EventRequirements {
    requiresMotivationLetter: boolean;
    requiresDocumentVerification: boolean;
    minimumAttendancePercentage: number;
    requiresApproval?: boolean;
    requiredDocuments: string[];
    prerequisites: string[];
}
export interface EventRegistration {
    isOpen: boolean;
    openDate?: Date;
    closeDate?: Date;
    maxCapacity: number;
    currentEnrollments: number;
    waitingListEnabled: boolean;
    autoApproval: boolean;
}
export interface EventMaterials {
    certificateTemplate?: string;
    presentationFiles: string[];
    resourceLinks: string[];
    recordingUrl?: string;
    handoutFiles: string[];
}
export interface EventFeedback {
    averageRating?: number;
    totalReviews: number;
    feedbackSummary?: string;
    improvementSuggestions: string[];
}
export interface EventData {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    categoryName?: string;
    schedule: EventSchedule;
    location: EventLocation;
    organizerId: string;
    organizerName?: string;
    organizerEmail?: string;
    instructors: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        biography?: string;
    }>;
    area: EventArea;
    audience: EventAudience;
    tags: string[];
    pricing: EventPricing;
    requirements: EventRequirements;
    registration: EventRegistration;
    associatedCareers: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    materials: EventMaterials;
    feedback: EventFeedback;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastModifiedBy?: string;
    viewCount: number;
    shareCount: number;
    completionRate?: number;
    isPublished: boolean;
    publishDate?: Date;
    featuredUntil?: Date;
    externalEventId?: string;
    syncWithCalendar: boolean;
}
export declare class Event {
    private data;
    constructor(data: EventData);
    static create(name: string, description: string, categoryId: string, startDate: Date, startTime: Date, duration: number, venue: string, capacity: number, organizerId: string, area: EventArea, audience?: EventAudience, isFree?: boolean, price?: number, endDate?: Date, endTime?: Date, minimumAttendancePercentage?: number, createdBy?: string): Event;
    static fromPrismaData(eventData: any): Event;
    private validateData;
    getId(): string;
    getName(): string;
    getDescription(): string;
    getCategoryId(): string;
    getCategoryName(): string | undefined;
    getSchedule(): EventSchedule;
    getLocation(): EventLocation;
    getOrganizerId(): string;
    getOrganizerName(): string | undefined;
    getInstructors(): Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        biography?: string;
    }>;
    getArea(): EventArea;
    getAudience(): EventAudience;
    getTags(): string[];
    getPricing(): EventPricing;
    getRequirements(): EventRequirements;
    getRegistration(): EventRegistration;
    getAssociatedCareers(): Array<{
        id: string;
        name: string;
        code: string;
    }>;
    getMaterials(): EventMaterials;
    getFeedback(): EventFeedback;
    getStatus(): EventStatus;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getViewCount(): number;
    getCompletionRate(): number | undefined;
    isPublished(): boolean;
    isFeatured(): boolean;
    isActive(): boolean;
    isCompleted(): boolean;
    isCancelled(): boolean;
    isInProgress(): boolean;
    isFree(): boolean;
    isRegistrationOpen(): boolean;
    hasCapacity(): boolean;
    isWaitingListEnabled(): boolean;
    requiresApproval(): boolean;
    requiresMotivationLetter(): boolean;
    hasStarted(): boolean;
    hasEnded(): boolean;
    isUpcoming(): boolean;
    isOngoing(): boolean;
    canEnroll(): boolean;
    canEdit(): boolean;
    canCancel(): boolean;
    updateBasicInfo(name?: string, description?: string, updatedBy?: string): Event;
    updateSchedule(startDate?: Date, endDate?: Date, startTime?: Date, endTime?: Date, duration?: number, updatedBy?: string): Event;
    updateLocation(venue?: string, address?: string, city?: string, capacity?: number, hasVirtualOption?: boolean, virtualLink?: string, updatedBy?: string): Event;
    updatePricing(isFree?: boolean, price?: number, currency?: string, updatedBy?: string): Event;
    updateRequirements(minimumAttendancePercentage?: number, requiresMotivationLetter?: boolean, requiresDocumentVerification?: boolean, requiresApproval?: boolean, requiredDocuments?: string[], prerequisites?: string[], updatedBy?: string): Event;
    addInstructor(id: string, name: string, email: string, role: string, biography?: string, updatedBy?: string): Event;
    removeInstructor(instructorId: string, updatedBy?: string): Event;
    associateWithCareers(careers: Array<{
        id: string;
        name: string;
        code: string;
    }>, updatedBy?: string): Event;
    addTag(tag: string, updatedBy?: string): Event;
    removeTag(tag: string, updatedBy?: string): Event;
    incrementEnrollment(): Event;
    decrementEnrollment(): Event;
    updateStatus(status: EventStatus, updatedBy?: string): Event;
    cancel(reason?: string, updatedBy?: string): Event;
    publish(updatedBy?: string): Event;
    unpublish(updatedBy?: string): Event;
    incrementViewCount(): Event;
    incrementShareCount(): Event;
    updateCompletionRate(completionRate: number): Event;
    getAvailableSpots(): number;
    getOccupancyRate(): number;
    getDaysUntilStart(): number;
    getDurationInDays(): number;
    getEventSummary(): {
        id: string;
        name: string;
        description: string;
        categoryName: string | undefined;
        startDate: Date;
        endDate: Date | undefined;
        duration: number;
        venue: string;
        capacity: number;
        currentEnrollments: number;
        availableSpots: number;
        occupancyRate: number;
        area: EventArea;
        audience: EventAudience;
        isFree: boolean;
        price: number | undefined;
        status: EventStatus;
        isRegistrationOpen: boolean;
        daysUntilStart: number;
        isPublished: boolean;
        viewCount: number;
        organizerName: string | undefined;
    };
    getDetailedReport(): {
        organizerId: string;
        organizerEmail: string | undefined;
        instructors: {
            id: string;
            name: string;
            email: string;
            role: string;
            biography?: string;
        }[];
        associatedCareers: {
            id: string;
            name: string;
            code: string;
        }[];
        requirements: EventRequirements;
        registration: EventRegistration;
        materials: EventMaterials;
        feedback: EventFeedback;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | undefined;
        lastModifiedBy: string | undefined;
        completionRate: number | undefined;
        shareCount: number;
        publishDate: Date | undefined;
        featuredUntil: Date | undefined;
        id: string;
        name: string;
        description: string;
        categoryName: string | undefined;
        startDate: Date;
        endDate: Date | undefined;
        duration: number;
        venue: string;
        capacity: number;
        currentEnrollments: number;
        availableSpots: number;
        occupancyRate: number;
        area: EventArea;
        audience: EventAudience;
        isFree: boolean;
        price: number | undefined;
        status: EventStatus;
        isRegistrationOpen: boolean;
        daysUntilStart: number;
        isPublished: boolean;
        viewCount: number;
        organizerName: string | undefined;
    };
}
//# sourceMappingURL=Event.d.ts.map