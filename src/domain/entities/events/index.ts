/**
 * Events Domain Entities - Index
 *
 * Exports all entities and types for the Events domain
 */

// Event Entity
export {
  Event,
  type EventArea,
  type EventAudience,
  type EventStatus,
  type EventSchedule,
  type EventLocation,
  type EventPricing,
  type EventRequirements,
  type EventRegistration,
  type EventMaterials,
  type EventFeedback,
  type EventData
} from './Event';

// EventCategory Entity
export {
  EventCategory,
  type EventCategoryStatistics,
  type EventCategorySettings,
  type EventCategoryData
} from './EventCategory';

// Common types for events domain
export interface EventFilters {
  categoryId?: string;
  organizerId?: string;
  area?: 'PRACTICA' | 'INVESTIGACION' | 'ACADEMICA' | 'TECNICA' | 'INDUSTRIAL' | 'EMPRESARIAL' | 'IA' | 'REDES';
  audience?: 'CARRERA_ESPECIFICA' | 'TODAS_CARRERAS' | 'PUBLICO_GENERAL';
  status?: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO';
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  isPublished?: boolean;
  isFree?: boolean;
  hasCapacity?: boolean;
  location?: string;
  tags?: string[];
  careerId?: string;
  instructorId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  registrationOpen?: boolean;
  upcoming?: boolean;
  ongoing?: boolean;
  completed?: boolean;
}

export interface EventSearchCriteria {
  query?: string;
  filters?: EventFilters;
  sortBy?: 'name' | 'startDate' | 'createdAt' | 'price' | 'popularity' | 'rating';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface EventAnalytics {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  
  totalEnrollments: number;
  averageEnrollmentsPerEvent: number;
  averageOccupancyRate: number;
  
  revenueMetrics: {
    totalRevenue: number;
    averageRevenuePerEvent: number;
    paidEvents: number;
    freeEvents: number;
  };
  
  popularCategories: Array<{
    categoryId: string;
    categoryName: string;
    eventCount: number;
    enrollmentCount: number;
  }>;
  
  topPerformingEvents: Array<{
    eventId: string;
    eventName: string;
    enrollmentCount: number;
    occupancyRate: number;
    rating?: number;
  }>;
  
  monthlyTrends: Array<{
    month: string;
    eventsCreated: number;
    enrollments: number;
    revenue: number;
    averageAttendance: number;
  }>;
  
  attendanceStatistics: {
    averageAttendance: number;
    highAttendanceEvents: number;
    lowAttendanceEvents: number;
    noShowRate: number;
  };
}

export interface EventDashboardData {
  summary: {
    totalEvents: number;
    activeEvents: number;
    totalEnrollments: number;
    revenueThisMonth: number;
    averageRating: number;
  };
  
  recentActivity: Array<{
    type: 'EVENT_CREATED' | 'EVENT_PUBLISHED' | 'EVENT_UPDATED' | 'EVENT_CANCELLED' | 'ENROLLMENT_RECEIVED';
    eventName: string;
    organizerName: string;
    timestamp: Date;
    details: string;
  }>;
  
  upcomingDeadlines: Array<{
    eventId: string;
    eventName: string;
    deadline: Date;
    type: 'REGISTRATION_CLOSE' | 'EVENT_START' | 'EVENT_END';
    daysRemaining: number;
  }>;
  
  capacityAlerts: Array<{
    eventId: string;
    eventName: string;
    currentCapacity: number;
    maxCapacity: number;
    occupancyRate: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  
  performanceMetrics: {
    enrollmentsByMonth: Array<{
      month: string;
      enrollments: number;
      events: number;
    }>;
    
    categoryPerformance: Array<{
      categoryName: string;
      eventCount: number;
      averageAttendance: number;
      revenue: number;
    }>;
    
    organizerPerformance: Array<{
      organizerName: string;
      eventCount: number;
      averageRating: number;
      totalEnrollments: number;
    }>;
  };
}

export interface BulkEventOperation {
  eventIds: string[];
  operation: 'PUBLISH' | 'UNPUBLISH' | 'ACTIVATE' | 'DEACTIVATE' | 'CANCEL' | 'UPDATE_CATEGORY' | 'UPDATE_STATUS';
  parameters?: {
    categoryId?: string;
    status?: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO';
    reason?: string;
  };
}

export interface BulkEventResult {
  successful: Array<{
    eventId: string;
    eventName: string;
  }>;
  
  failed: Array<{
    eventId: string;
    eventName: string;
    reason: string;
  }>;
  
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export interface EventCapacityManagement {
  eventId: string;
  currentCapacity: number;
  maxCapacity: number;
  availableSpots: number;
  occupancyRate: number;
  waitingListCount: number;
  
  projections: {
    expectedFinalEnrollments: number;
    probabilityOfFullCapacity: number;
    recommendedCapacityIncrease?: number;
  };
  
  recommendations: Array<{
    type: 'INCREASE_CAPACITY' | 'ENABLE_WAITING_LIST' | 'CLOSE_REGISTRATION' | 'PROMOTE_EVENT';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    action?: string;
  }>;
}

export interface EventConflictCheck {
  eventId: string;
  conflicts: Array<{
    conflictingEventId: string;
    conflictingEventName: string;
    conflictType: 'SAME_ORGANIZER' | 'SAME_VENUE' | 'SAME_INSTRUCTOR' | 'SAME_TARGET_AUDIENCE';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    timeOverlap: {
      startTime: Date;
      endTime: Date;
      durationMinutes: number;
    };
    suggestedResolution?: string;
  }>;
  
  recommendations: Array<{
    type: 'RESCHEDULE' | 'CHANGE_VENUE' | 'CHANGE_INSTRUCTOR' | 'MERGE_EVENTS';
    description: string;
    impact: string;
  }>;
}

export interface EventTemplateData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  defaultDuration: number;
  defaultCapacity: number;
  defaultRequirements: {
    minimumAttendancePercentage: number;
    requiresMotivationLetter: boolean;
    requiresDocumentVerification: boolean;
    requiredDocuments: string[];
  };
  defaultPricing: {
    isFree: boolean;
    suggestedPrice?: number;
  };
  contentTemplate: {
    descriptionTemplate: string;
    emailTemplates: {
      enrollment: string;
      reminder: string;
      completion: string;
    };
    certificateTemplate?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isActive: boolean;
}

// Validation utilities
export class EventValidation {
  static validateEventSchedule(schedule: any): string[] {
    const errors: string[] = [];
    
    if (!schedule.startDate) {
      errors.push("Start date is required");
    }
    
    if (schedule.startDate && schedule.startDate < new Date()) {
      errors.push("Start date cannot be in the past");
    }
    
    if (schedule.endDate && schedule.endDate < schedule.startDate) {
      errors.push("End date cannot be before start date");
    }
    
    if (schedule.duration <= 0) {
      errors.push("Duration must be greater than 0");
    }
    
    if (schedule.endTime && schedule.startTime && schedule.endTime <= schedule.startTime) {
      errors.push("End time must be after start time");
    }
    
    return errors;
  }
  
  static validateEventLocation(location: any): string[] {
    const errors: string[] = [];
    
    if (!location.venue?.trim()) {
      errors.push("Venue is required");
    }
    
    if (location.capacity <= 0) {
      errors.push("Capacity must be greater than 0");
    }
    
    if (location.hasVirtualOption && !location.virtualLink?.trim()) {
      errors.push("Virtual link is required for virtual events");
    }
    
    return errors;
  }
  
  static validateEventPricing(pricing: any): string[] {
    const errors: string[] = [];
    
    if (!pricing.isFree && (!pricing.price || pricing.price <= 0)) {
      errors.push("Price must be greater than 0 for paid events");
    }
    
    if (pricing.isFree && pricing.price) {
      errors.push("Free events cannot have a price");
    }
    
    if (pricing.earlyBirdDiscount) {
      if (pricing.earlyBirdDiscount.percentage <= 0 || pricing.earlyBirdDiscount.percentage >= 100) {
        errors.push("Early bird discount must be between 0 and 100%");
      }
      
      if (pricing.earlyBirdDiscount.validUntil <= new Date()) {
        errors.push("Early bird discount valid until date must be in the future");
      }
    }
    
    return errors;
  }
}

// Event status transitions
export class EventStatusTransitions {
  private static readonly VALID_TRANSITIONS: Record<'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO', ('ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO')[]> = {
    ACTIVO: ['INACTIVO', 'CANCELADO', 'EN_PROCESO'],
    INACTIVO: ['ACTIVO', 'CANCELADO'],
    EN_PROCESO: ['COMPLETADO', 'CANCELADO'],
    COMPLETADO: [], // Terminal state
    CANCELADO: [] // Terminal state
  };

  static canTransitionTo(
    currentStatus: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO',
    newStatus: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO'
  ): boolean {
    return this.VALID_TRANSITIONS[currentStatus].includes(newStatus);
  }

  static getValidTransitions(
    currentStatus: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO'
  ): ('ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO')[] {
    return this.VALID_TRANSITIONS[currentStatus];
  }
}

// Error types specific to events domain
export class EventError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EventError';
  }
}

export class EventValidationError extends EventError {
  constructor(message: string, details?: any) {
    super(message, 'EVENT_VALIDATION_ERROR', details);
    this.name = 'EventValidationError';
  }
}

export class EventCapacityError extends EventError {
  constructor(message: string, details?: any) {
    super(message, 'EVENT_CAPACITY_ERROR', details);
    this.name = 'EventCapacityError';
  }
}

export class EventSchedulingError extends EventError {
  constructor(message: string, details?: any) {
    super(message, 'EVENT_SCHEDULING_ERROR', details);
    this.name = 'EventSchedulingError';
  }
}

export class CategoryError extends EventError {
  constructor(message: string, details?: any) {
    super(message, 'CATEGORY_ERROR', details);
    this.name = 'CategoryError';
  }
}