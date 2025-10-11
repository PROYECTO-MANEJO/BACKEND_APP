/**
 * Events Application Layer - Use Cases Index
 * 
 * Clean Architecture Application Layer for Events Domain
 * Provides use case implementations with dependency injection and error handling
 */

// Use Cases Exports
export { EventManagement } from "./EventManagement";
export { EventCategoryManagement } from "./EventCategoryManagement";
export { EventAnalytics } from "./EventAnalytics";

// Import classes for type usage
import { EventManagement } from "./EventManagement";
import { EventCategoryManagement } from "./EventCategoryManagement";
import { EventAnalytics } from "./EventAnalytics";

// Repository Interfaces
export type { 
  EventRepository,
} from "./EventManagement";

export type {
  EventCategoryRepository,
} from "./EventCategoryManagement";

// Use Case Input/Output Types from EventManagement
export type {
  EventCreationInput,
  EventUpdateInput,
} from "./EventManagement";

// Use Case Input/Output Types from EventCategoryManagement
export type {
  CategoryCreationInput,
  CategoryUpdateInput,
  CategoryMoveInput,
  EventCategoryFilters,
  CategoryStatistics,
  CategorySettingsValidation,
} from "./EventCategoryManagement";

// Use Case Input/Output Types from EventAnalytics
export type {
  AnalyticsFilters,
  AnalyticsDateRange,
  EventMetrics,
  CategoryAnalytics,
  TrendAnalysis,
  PerformanceReport,
} from "./EventAnalytics";

// Additional convenient aliases
export type {
  CategoryCreationInput as EventCategoryCreationInput,
  CategoryUpdateInput as EventCategoryUpdateInput,
  CategoryMoveInput as EventCategoryMoveInput,
} from "./EventCategoryManagement";

export type {
  AnalyticsFilters as EventAnalyticsFilters,
} from "./EventAnalytics";

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
export class EventsApplicationServices {
  constructor(
    public readonly eventManagement: EventManagement,
    public readonly categoryManagement: EventCategoryManagement,
    public readonly analytics: EventAnalytics
  ) {}

  /**
   * Health check for all event services
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    services: {
      eventManagement: boolean;
      categoryManagement: boolean;
      analytics: boolean;
    };
    timestamp: Date;
  }> {
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
      const status = 
        healthyCount === 3 ? "healthy" : 
        healthyCount >= 2 ? "degraded" : 
        "unhealthy";

      return {
        status,
        services,
        timestamp: new Date(),
      };
    } catch (error) {
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

  private async testEventManagement(): Promise<void> {
    // Basic smoke test - just check if service responds
    await this.eventManagement.getUpcomingEvents(1);
  }

  private async testCategoryManagement(): Promise<void> {
    // Basic smoke test - just check if service responds 
    await this.categoryManagement.getCategories();
  }

  private async testAnalytics(): Promise<void> {
    // Basic smoke test - just check if service responds
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    await this.analytics.getEventAnalytics({ 
      startDate,
      endDate,
    });
  }
}

/**
 * Application Layer Error Types
 */
export class EventApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "EventApplicationError";
  }
}

export class EventNotFoundError extends EventApplicationError {
  constructor(eventId: string, cause?: Error) {
    super(`Event with ID '${eventId}' not found`, "EVENT_NOT_FOUND", cause);
    this.name = "EventNotFoundError";
  }
}

export class EventCategoryNotFoundError extends EventApplicationError {
  constructor(categoryId: string, cause?: Error) {
    super(`Event category with ID '${categoryId}' not found`, "CATEGORY_NOT_FOUND", cause);
    this.name = "EventCategoryNotFoundError";
  }
}

export class EventConflictError extends EventApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, "EVENT_CONFLICT", cause);
    this.name = "EventConflictError";
  }
}

export class EventCapacityError extends EventApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, "EVENT_CAPACITY", cause);
    this.name = "EventCapacityError";
  }
}

export class EventPermissionError extends EventApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, "EVENT_PERMISSION", cause);
    this.name = "EventPermissionError";
  }
}

/**
 * Default Factory Implementation
 */
export class DefaultEventsUseCasesFactory implements EventsUseCasesFactory {
  constructor(
    private eventRepository: any, // Replace with actual repository types
    private categoryRepository: any,
    private permissionService: any,
    private validationService: any,
    private notificationService: any,
    private auditService: any
  ) {}

  createEventManagement(): EventManagement {
    return new EventManagement(
      this.eventRepository,
      this.categoryRepository,
      this.permissionService,
      this.validationService,
      this.notificationService
    );
  }

  createEventCategoryManagement(): EventCategoryManagement {
    return new EventCategoryManagement(
      this.categoryRepository,
      this.eventRepository, // EventService dependency
      this.permissionService,
      this.validationService
    );
  }

  createEventAnalytics(): EventAnalytics {
    return new EventAnalytics(
      this.eventRepository,
      this.categoryRepository,
      this.auditService
    );
  }
}

/**
 * Application Layer Constants
 */
export const EVENTS_APPLICATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_ANALYTICS_PERIOD_DAYS: 30,
  MAX_ANALYTICS_PERIOD_DAYS: 365,
  DEFAULT_CACHE_TTL_MINUTES: 15,
  MAX_BULK_OPERATION_SIZE: 50,
} as const;

/**
 * Utility Functions
 */
export const EventsApplicationUtils = {
  /**
   * Validates pagination parameters
   */
  validatePagination(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(
      EVENTS_APPLICATION_CONSTANTS.MAX_PAGE_SIZE,
      Math.max(1, limit || EVENTS_APPLICATION_CONSTANTS.DEFAULT_PAGE_SIZE)
    );
    return { page: validatedPage, limit: validatedLimit };
  },

  /**
   * Validates date range for analytics
   */
  validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new EventApplicationError("Start date must be before end date", "INVALID_DATE_RANGE");
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > EVENTS_APPLICATION_CONSTANTS.MAX_ANALYTICS_PERIOD_DAYS) {
      throw new EventApplicationError(
        `Date range exceeds maximum allowed period of ${EVENTS_APPLICATION_CONSTANTS.MAX_ANALYTICS_PERIOD_DAYS} days`,
        "DATE_RANGE_TOO_LARGE"
      );
    }
  },

  /**
   * Creates a standardized error response
   */
  createErrorResponse(error: Error): {
    success: false;
    message: string;
    code?: string;
    timestamp: Date;
  } {
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
  createSuccessResponse<T>(data: T, message?: string): {
    success: true;
    data: T;
    message?: string;
    timestamp: Date;
  } {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
    };
  },
};