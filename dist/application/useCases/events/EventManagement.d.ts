/**
 * Event Management Use Case - Application Layer
 *
 * Handles all event-related operations including creation, updates, capacity management, and analytics
 */
import { Event, EventArea, EventAudience, EventStatus, EventFilters, EventSearchCriteria, EventAnalytics, BulkEventOperation, BulkEventResult, EventCapacityManagement, EventConflictCheck } from "../../../domain/entities/events";
export interface EventRepository {
    save(event: Event): Promise<void>;
    findById(id: string): Promise<Event | null>;
    findAll(filters?: EventFilters): Promise<Event[]>;
    update(event: Event): Promise<void>;
    delete(id: string): Promise<void>;
    findByOrganizerId(organizerId: string): Promise<Event[]>;
    findByCategoryId(categoryId: string): Promise<Event[]>;
    findByStatus(status: EventStatus): Promise<Event[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
    findUpcomingEvents(days?: number): Promise<Event[]>;
    findOngoingEvents(): Promise<Event[]>;
    findByLocationPattern(locationPattern: string): Promise<Event[]>;
    findByInstructorId(instructorId: string): Promise<Event[]>;
    search(criteria: EventSearchCriteria): Promise<{
        events: Event[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getEventAnalytics(filters?: EventFilters): Promise<EventAnalytics>;
    getCapacityManagement(eventId: string): Promise<EventCapacityManagement>;
    checkConflicts(eventId: string): Promise<EventConflictCheck>;
    bulkUpdate(eventIds: string[], updates: Partial<any>): Promise<BulkEventResult>;
}
export interface CategoryService {
    getCategoryById(categoryId: string): Promise<{
        id: string;
        name: string;
        settings: any;
        restrictions: any;
    } | null>;
    validateCategoryAccess(categoryId: string, organizerRoles: string[]): Promise<boolean>;
}
export interface UserService {
    getUserDetails(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        roles: string[];
    } | null>;
    validateOrganizer(organizerId: string): Promise<boolean>;
    validateInstructor(instructorId: string): Promise<boolean>;
}
export interface NotificationService {
    sendEventCreatedNotification(event: Event): Promise<void>;
    sendEventUpdatedNotification(event: Event, changes: string[]): Promise<void>;
    sendEventCancelledNotification(event: Event, reason?: string): Promise<void>;
    sendEventPublishedNotification(event: Event): Promise<void>;
    sendCapacityAlertNotification(event: Event, occupancyRate: number): Promise<void>;
    sendConflictAlertNotification(conflicts: EventConflictCheck): Promise<void>;
}
export interface CalendarService {
    createCalendarEvent(event: Event): Promise<{
        success: boolean;
        calendarEventId?: string;
        errorMessage?: string;
    }>;
    updateCalendarEvent(calendarEventId: string, event: Event): Promise<{
        success: boolean;
        errorMessage?: string;
    }>;
    deleteCalendarEvent(calendarEventId: string): Promise<{
        success: boolean;
        errorMessage?: string;
    }>;
}
export interface EventCreationInput {
    name: string;
    description: string;
    categoryId: string;
    startDate: Date;
    startTime: Date;
    duration: number;
    venue: string;
    capacity: number;
    organizerId: string;
    area: EventArea;
    audience?: EventAudience;
    isFree?: boolean;
    price?: number;
    endDate?: Date;
    endTime?: Date;
    minimumAttendancePercentage?: number;
    requiresMotivationLetter?: boolean;
    requiresDocumentVerification?: boolean;
    requiresApproval?: boolean;
    requiredDocuments?: string[];
    associatedCareers?: string[];
    instructorIds?: string[];
    tags?: string[];
    createdBy?: string;
}
export interface EventUpdateInput {
    eventId: string;
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    venue?: string;
    capacity?: number;
    isFree?: boolean;
    price?: number;
    minimumAttendancePercentage?: number;
    requiresMotivationLetter?: boolean;
    requiresDocumentVerification?: boolean;
    requiresApproval?: boolean;
    requiredDocuments?: string[];
    tags?: string[];
    updatedBy?: string;
}
export interface InstructorManagementInput {
    eventId: string;
    instructorId: string;
    instructorName: string;
    instructorEmail: string;
    role: string;
    biography?: string;
    updatedBy?: string;
}
export declare class EventManagement {
    private eventRepository;
    private categoryService;
    private userService;
    private notificationService;
    private calendarService;
    constructor(eventRepository: EventRepository, categoryService: CategoryService, userService: UserService, notificationService: NotificationService, calendarService: CalendarService);
    /**
     * Create a new event
     */
    createEvent(input: EventCreationInput): Promise<{
        success: boolean;
        eventId?: string;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Update an existing event
     */
    updateEvent(input: EventUpdateInput): Promise<{
        success: boolean;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Cancel an event
     */
    cancelEvent(eventId: string, reason?: string, cancelledBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Publish or unpublish an event
     */
    toggleEventPublication(eventId: string, publish: boolean, updatedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Add instructor to event
     */
    addInstructor(input: InstructorManagementInput): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Remove instructor from event
     */
    removeInstructor(eventId: string, instructorId: string, updatedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get event details
     */
    getEvent(eventId: string): Promise<{
        success: boolean;
        event?: any;
        message: string;
    }>;
    /**
     * Search events with filters
     */
    searchEvents(criteria: EventSearchCriteria): Promise<{
        success: boolean;
        events?: any[];
        totalCount?: number;
        hasMore?: boolean;
        message: string;
    }>;
    /**
     * Get events by organizer
     */
    getEventsByOrganizer(organizerId: string): Promise<{
        success: boolean;
        events?: any[];
        message: string;
    }>;
    /**
     * Get upcoming events
     */
    getUpcomingEvents(days?: number): Promise<{
        success: boolean;
        events?: any[];
        message: string;
    }>;
    /**
     * Get event analytics
     */
    getEventAnalytics(filters?: EventFilters): Promise<{
        success: boolean;
        analytics?: EventAnalytics;
        message: string;
    }>;
    /**
     * Get capacity management for an event
     */
    getCapacityManagement(eventId: string): Promise<{
        success: boolean;
        capacityManagement?: EventCapacityManagement;
        message: string;
    }>;
    /**
     * Perform bulk operations on events
     */
    bulkOperations(operation: BulkEventOperation): Promise<BulkEventResult>;
    /**
     * Private helper methods
     */
    private validateEventCreation;
}
//# sourceMappingURL=EventManagement.d.ts.map