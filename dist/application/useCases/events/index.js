"use strict";
/**
 * Events Application Layer - Use Cases Index
 *
 * Clean Architecture Application Layer for Events Domain
 * Provides use case implementations with dependency injection and error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsApplicationUtils = exports.EVENTS_APPLICATION_CONSTANTS = exports.DefaultEventsUseCasesFactory = exports.EventPermissionError = exports.EventCapacityError = exports.EventConflictError = exports.EventCategoryNotFoundError = exports.EventNotFoundError = exports.EventApplicationError = exports.EventsApplicationServices = exports.EventAnalytics = exports.EventCategoryManagement = exports.EventManagement = void 0;
// Use Cases Exports
var EventManagement_1 = require("./EventManagement");
Object.defineProperty(exports, "EventManagement", { enumerable: true, get: function () { return EventManagement_1.EventManagement; } });
var EventCategoryManagement_1 = require("./EventCategoryManagement");
Object.defineProperty(exports, "EventCategoryManagement", { enumerable: true, get: function () { return EventCategoryManagement_1.EventCategoryManagement; } });
var EventAnalytics_1 = require("./EventAnalytics");
Object.defineProperty(exports, "EventAnalytics", { enumerable: true, get: function () { return EventAnalytics_1.EventAnalytics; } });
// Import classes for type usage
const EventManagement_2 = require("./EventManagement");
const EventCategoryManagement_2 = require("./EventCategoryManagement");
const EventAnalytics_2 = require("./EventAnalytics");
/**
 * Events Application Services Container
 */
class EventsApplicationServices {
    constructor(eventManagement, categoryManagement, analytics) {
        this.eventManagement = eventManagement;
        this.categoryManagement = categoryManagement;
        this.analytics = analytics;
    }
    /**
     * Health check for all event services
     */
    async healthCheck() {
        try {
            // Test basic functionality of each service
            const [eventsHealth, categoriesHealth, analyticsHealth] = await Promise.allSettled([
                this.testEventManagement(),
                this.testCategoryManagement(),
                this.testAnalytics(),
            ]);
            const services = {
                eventManagement: eventsHealth.status === "fulfilled",
                categoryManagement: categoriesHealth.status === "fulfilled",
                analytics: analyticsHealth.status === "fulfilled",
            };
            const healthyCount = Object.values(services).filter(Boolean).length;
            const status = healthyCount === 3
                ? "healthy"
                : healthyCount >= 2
                    ? "degraded"
                    : "unhealthy";
            return {
                status,
                services,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                status: "unhealthy",
                services: {
                    eventManagement: false,
                    categoryManagement: false,
                    analytics: false,
                },
                timestamp: new Date(),
            };
        }
    }
    async testEventManagement() {
        // Basic smoke test - just check if service responds
        await this.eventManagement.getUpcomingEvents(1);
    }
    async testCategoryManagement() {
        // Basic smoke test - just check if service responds
        await this.categoryManagement.getCategories();
    }
    async testAnalytics() {
        // Basic smoke test - just check if service responds
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        await this.analytics.getEventAnalytics({
            startDate,
            endDate,
        });
    }
}
exports.EventsApplicationServices = EventsApplicationServices;
/**
 * Application Layer Error Types
 */
class EventApplicationError extends Error {
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "EventApplicationError";
    }
}
exports.EventApplicationError = EventApplicationError;
class EventNotFoundError extends EventApplicationError {
    constructor(eventId, cause) {
        super(`Event with ID '${eventId}' not found`, "EVENT_NOT_FOUND", cause);
        this.name = "EventNotFoundError";
    }
}
exports.EventNotFoundError = EventNotFoundError;
class EventCategoryNotFoundError extends EventApplicationError {
    constructor(categoryId, cause) {
        super(`Event category with ID '${categoryId}' not found`, "CATEGORY_NOT_FOUND", cause);
        this.name = "EventCategoryNotFoundError";
    }
}
exports.EventCategoryNotFoundError = EventCategoryNotFoundError;
class EventConflictError extends EventApplicationError {
    constructor(message, cause) {
        super(message, "EVENT_CONFLICT", cause);
        this.name = "EventConflictError";
    }
}
exports.EventConflictError = EventConflictError;
class EventCapacityError extends EventApplicationError {
    constructor(message, cause) {
        super(message, "EVENT_CAPACITY", cause);
        this.name = "EventCapacityError";
    }
}
exports.EventCapacityError = EventCapacityError;
class EventPermissionError extends EventApplicationError {
    constructor(message, cause) {
        super(message, "EVENT_PERMISSION", cause);
        this.name = "EventPermissionError";
    }
}
exports.EventPermissionError = EventPermissionError;
/**
 * Default Factory Implementation
 */
class DefaultEventsUseCasesFactory {
    constructor(eventRepository, // Replace with actual repository types
    categoryRepository, permissionService, validationService, notificationService, auditService) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.permissionService = permissionService;
        this.validationService = validationService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }
    createEventManagement() {
        return new EventManagement_2.EventManagement(this.eventRepository, this.categoryRepository, this.permissionService, this.validationService, this.notificationService);
    }
    createEventCategoryManagement() {
        return new EventCategoryManagement_2.EventCategoryManagement(this.categoryRepository, this.eventRepository, // EventService dependency
        this.permissionService, this.validationService);
    }
    createEventAnalytics() {
        return new EventAnalytics_2.EventAnalytics(this.eventRepository, this.categoryRepository, this.auditService);
    }
}
exports.DefaultEventsUseCasesFactory = DefaultEventsUseCasesFactory;
/**
 * Application Layer Constants
 */
exports.EVENTS_APPLICATION_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_ANALYTICS_PERIOD_DAYS: 30,
    MAX_ANALYTICS_PERIOD_DAYS: 365,
    DEFAULT_CACHE_TTL_MINUTES: 15,
    MAX_BULK_OPERATION_SIZE: 50,
};
/**
 * Utility Functions
 */
exports.EventsApplicationUtils = {
    /**
     * Validates pagination parameters
     */
    validatePagination(page, limit) {
        const validatedPage = Math.max(1, page || 1);
        const validatedLimit = Math.min(exports.EVENTS_APPLICATION_CONSTANTS.MAX_PAGE_SIZE, Math.max(1, limit || exports.EVENTS_APPLICATION_CONSTANTS.DEFAULT_PAGE_SIZE));
        return { page: validatedPage, limit: validatedLimit };
    },
    /**
     * Validates date range for analytics
     */
    validateDateRange(startDate, endDate) {
        if (startDate >= endDate) {
            throw new EventApplicationError("Start date must be before end date", "INVALID_DATE_RANGE");
        }
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > exports.EVENTS_APPLICATION_CONSTANTS.MAX_ANALYTICS_PERIOD_DAYS) {
            throw new EventApplicationError(`Date range exceeds maximum allowed period of ${exports.EVENTS_APPLICATION_CONSTANTS.MAX_ANALYTICS_PERIOD_DAYS} days`, "DATE_RANGE_TOO_LARGE");
        }
    },
    /**
     * Creates a standardized error response
     */
    createErrorResponse(error) {
        return {
            success: false,
            message: error.message,
            code: error instanceof EventApplicationError ? error.code : "UNKNOWN_ERROR",
            timestamp: new Date(),
        };
    },
    /**
     * Creates a standardized success response
     */
    createSuccessResponse(data, message) {
        return {
            success: true,
            data,
            message,
            timestamp: new Date(),
        };
    },
};
//# sourceMappingURL=index.js.map