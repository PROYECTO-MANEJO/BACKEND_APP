/**
 * Events Application Layer - Use Cases Index
 *
 * Clean Architecture Application Layer for Events Domain
 * Provides use case implementations with dependency injection and error handling
 */
export { EventManagement } from "./EventManagement";
export { EventCategoryManagement } from "./EventCategoryManagement";
export { EventAnalytics } from "./EventAnalytics";
import { EventManagement } from "./EventManagement";
import { EventCategoryManagement } from "./EventCategoryManagement";
import { EventAnalytics } from "./EventAnalytics";
export type { EventRepository } from "./EventManagement";
export type { EventCategoryRepository } from "./EventCategoryManagement";
export type { EventCreationInput, EventUpdateInput } from "./EventManagement";
export type { CategoryCreationInput, CategoryUpdateInput, CategoryMoveInput, EventCategoryFilters, CategoryStatistics, CategorySettingsValidation, } from "./EventCategoryManagement";
export type { AnalyticsFilters, AnalyticsDateRange, EventMetrics, CategoryAnalytics, TrendAnalysis, PerformanceReport, } from "./EventAnalytics";
export type { CategoryCreationInput as EventCategoryCreationInput, CategoryUpdateInput as EventCategoryUpdateInput, CategoryMoveInput as EventCategoryMoveInput, } from "./EventCategoryManagement";
export type { AnalyticsFilters as EventAnalyticsFilters } from "./EventAnalytics";
/**
 * Use Case Factory for Dependency Injection
 */
export interface EventsUseCasesFactory {
    createEventManagement(): EventManagement;
    createEventCategoryManagement(): EventCategoryManagement;
    createEventAnalytics(): EventAnalytics;
}
/**
 * Events Application Services Container
 */
export declare class EventsApplicationServices {
    readonly eventManagement: EventManagement;
    readonly categoryManagement: EventCategoryManagement;
    readonly analytics: EventAnalytics;
    constructor(eventManagement: EventManagement, categoryManagement: EventCategoryManagement, analytics: EventAnalytics);
    /**
     * Health check for all event services
     */
    healthCheck(): Promise<{
        status: "healthy" | "degraded" | "unhealthy";
        services: {
            eventManagement: boolean;
            categoryManagement: boolean;
            analytics: boolean;
        };
        timestamp: Date;
    }>;
    private testEventManagement;
    private testCategoryManagement;
    private testAnalytics;
}
/**
 * Application Layer Error Types
 */
export declare class EventApplicationError extends Error {
    readonly code: string;
    readonly cause?: Error | undefined;
    constructor(message: string, code: string, cause?: Error | undefined);
}
export declare class EventNotFoundError extends EventApplicationError {
    constructor(eventId: string, cause?: Error);
}
export declare class EventCategoryNotFoundError extends EventApplicationError {
    constructor(categoryId: string, cause?: Error);
}
export declare class EventConflictError extends EventApplicationError {
    constructor(message: string, cause?: Error);
}
export declare class EventCapacityError extends EventApplicationError {
    constructor(message: string, cause?: Error);
}
export declare class EventPermissionError extends EventApplicationError {
    constructor(message: string, cause?: Error);
}
/**
 * Default Factory Implementation
 */
export declare class DefaultEventsUseCasesFactory implements EventsUseCasesFactory {
    private eventRepository;
    private categoryRepository;
    private permissionService;
    private validationService;
    private notificationService;
    private auditService;
    constructor(eventRepository: any, // Replace with actual repository types
    categoryRepository: any, permissionService: any, validationService: any, notificationService: any, auditService: any);
    createEventManagement(): EventManagement;
    createEventCategoryManagement(): EventCategoryManagement;
    createEventAnalytics(): EventAnalytics;
}
/**
 * Application Layer Constants
 */
export declare const EVENTS_APPLICATION_CONSTANTS: {
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
    readonly DEFAULT_ANALYTICS_PERIOD_DAYS: 30;
    readonly MAX_ANALYTICS_PERIOD_DAYS: 365;
    readonly DEFAULT_CACHE_TTL_MINUTES: 15;
    readonly MAX_BULK_OPERATION_SIZE: 50;
};
/**
 * Utility Functions
 */
export declare const EventsApplicationUtils: {
    /**
     * Validates pagination parameters
     */
    validatePagination(page?: number, limit?: number): {
        page: number;
        limit: number;
    };
    /**
     * Validates date range for analytics
     */
    validateDateRange(startDate: Date, endDate: Date): void;
    /**
     * Creates a standardized error response
     */
    createErrorResponse(error: Error): {
        success: false;
        message: string;
        code?: string;
        timestamp: Date;
    };
    /**
     * Creates a standardized success response
     */
    createSuccessResponse<T>(data: T, message?: string): {
        success: true;
        data: T;
        message?: string;
        timestamp: Date;
    };
};
//# sourceMappingURL=index.d.ts.map