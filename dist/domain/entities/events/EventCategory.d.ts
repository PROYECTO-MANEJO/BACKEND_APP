/**
 * EventCategory Entity - Domain Layer
 *
 * Representa una categoría de eventos con todas sus propiedades y reglas de negocio
 */
export interface EventCategoryStatistics {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalEnrollments: number;
    averageAttendance: number;
    averageRating?: number;
    revenueGenerated: number;
}
export interface EventCategorySettings {
    defaultDuration: number;
    defaultCapacity: number;
    defaultRequiresApproval: boolean;
    defaultMinimumAttendance: number;
    allowVirtualEvents: boolean;
    requiresInstructorApproval: boolean;
    autoPublishEvents: boolean;
}
export interface EventCategoryData {
    id: string;
    name: string;
    description: string;
    code?: string;
    color?: string;
    icon?: string;
    imageUrl?: string;
    settings: EventCategorySettings;
    certificateTemplate?: string;
    emailTemplates: {
        enrollment?: string;
        reminder?: string;
        completion?: string;
        cancellation?: string;
    };
    restrictions: {
        maxEventsPerMonth?: number;
        maxCapacityPerEvent?: number;
        restrictedToRoles?: string[];
        requiresSpecialApproval: boolean;
        minimumAdvanceNotice: number;
    };
    statistics: EventCategoryStatistics;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastModifiedBy?: string;
    keywords: string[];
    isPopular: boolean;
    isFeatured: boolean;
    parentCategoryId?: string;
    subcategoryIds: string[];
}
export declare class EventCategory {
    private data;
    constructor(data: EventCategoryData);
    static create(name: string, description: string, code?: string, color?: string, createdBy?: string): EventCategory;
    static fromPrismaData(categoryData: any): EventCategory;
    private validateData;
    getId(): string;
    getName(): string;
    getDescription(): string;
    getCode(): string | undefined;
    getColor(): string | undefined;
    getIcon(): string | undefined;
    getImageUrl(): string | undefined;
    getSettings(): EventCategorySettings;
    getEmailTemplates(): typeof this.data.emailTemplates;
    getRestrictions(): typeof this.data.restrictions;
    getStatistics(): EventCategoryStatistics;
    getDisplayOrder(): number;
    getKeywords(): string[];
    getParentCategoryId(): string | undefined;
    getSubcategoryIds(): string[];
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getCreatedBy(): string | undefined;
    isActive(): boolean;
    isPopular(): boolean;
    isFeatured(): boolean;
    hasSubcategories(): boolean;
    hasParentCategory(): boolean;
    allowsVirtualEvents(): boolean;
    requiresInstructorApproval(): boolean;
    requiresSpecialApproval(): boolean;
    autoPublishesEvents(): boolean;
    hasEventLimit(): boolean;
    hasCapacityLimit(): boolean;
    isRestrictedToRoles(): boolean;
    canCreateEvent(organizerRoles: string[], eventsThisMonth: number, eventCapacity: number, advanceNotice: number): {
        canCreate: boolean;
        reason?: string;
    };
    updateBasicInfo(name?: string, description?: string, code?: string, color?: string, updatedBy?: string): EventCategory;
    updateVisualElements(icon?: string, imageUrl?: string, updatedBy?: string): EventCategory;
    updateSettings(settings: Partial<EventCategorySettings>, updatedBy?: string): EventCategory;
    updateEmailTemplates(templates: Partial<typeof this.data.emailTemplates>, updatedBy?: string): EventCategory;
    updateRestrictions(restrictions: Partial<typeof this.data.restrictions>, updatedBy?: string): EventCategory;
    addKeyword(keyword: string, updatedBy?: string): EventCategory;
    removeKeyword(keyword: string, updatedBy?: string): EventCategory;
    addSubcategory(subcategoryId: string, updatedBy?: string): EventCategory;
    removeSubcategory(subcategoryId: string, updatedBy?: string): EventCategory;
    setParentCategory(parentCategoryId: string | undefined, updatedBy?: string): EventCategory;
    activate(updatedBy?: string): EventCategory;
    deactivate(updatedBy?: string): EventCategory;
    setDisplayOrder(order: number, updatedBy?: string): EventCategory;
    markAsPopular(updatedBy?: string): EventCategory;
    unmarkAsPopular(updatedBy?: string): EventCategory;
    markAsFeatured(updatedBy?: string): EventCategory;
    unmarkAsFeatured(updatedBy?: string): EventCategory;
    updateStatistics(statistics: Partial<EventCategoryStatistics>): EventCategory;
    getAverageEventsPerMonth(): number;
    getCompletionRate(): number;
    getAverageEnrollmentsPerEvent(): number;
    getCategorySummary(): {
        id: string;
        name: string;
        description: string;
        code: string | undefined;
        color: string | undefined;
        isActive: boolean;
        isPopular: boolean;
        isFeatured: boolean;
        displayOrder: number;
        totalEvents: number;
        activeEvents: number;
        completionRate: number;
        averageEnrollmentsPerEvent: number;
        averageAttendance: number;
        revenueGenerated: number;
        hasSubcategories: boolean;
        subcategoryCount: number;
    };
    getDetailedReport(): {
        settings: EventCategorySettings;
        restrictions: {
            maxEventsPerMonth?: number;
            maxCapacityPerEvent?: number;
            restrictedToRoles?: string[];
            requiresSpecialApproval: boolean;
            minimumAdvanceNotice: number;
        };
        statistics: EventCategoryStatistics;
        keywords: string[];
        parentCategoryId: string | undefined;
        subcategoryIds: string[];
        emailTemplates: {
            enrollment?: string;
            reminder?: string;
            completion?: string;
            cancellation?: string;
        };
        icon: string | undefined;
        imageUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | undefined;
        lastModifiedBy: string | undefined;
        averageEventsPerMonth: number;
        id: string;
        name: string;
        description: string;
        code: string | undefined;
        color: string | undefined;
        isActive: boolean;
        isPopular: boolean;
        isFeatured: boolean;
        displayOrder: number;
        totalEvents: number;
        activeEvents: number;
        completionRate: number;
        averageEnrollmentsPerEvent: number;
        averageAttendance: number;
        revenueGenerated: number;
        hasSubcategories: boolean;
        subcategoryCount: number;
    };
}
//# sourceMappingURL=EventCategory.d.ts.map