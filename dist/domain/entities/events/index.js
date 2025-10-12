"use strict";
/**
 * Events Domain Entities - Index
 *
 * Exports all entities and types for the Events domain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryError = exports.EventSchedulingError = exports.EventCapacityError = exports.EventValidationError = exports.EventError = exports.EventStatusTransitions = exports.EventValidation = exports.EventCategory = exports.Event = void 0;
// Event Entity
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return Event_1.Event; } });
// EventCategory Entity
var EventCategory_1 = require("./EventCategory");
Object.defineProperty(exports, "EventCategory", { enumerable: true, get: function () { return EventCategory_1.EventCategory; } });
// Validation utilities
class EventValidation {
    static validateEventSchedule(schedule) {
        const errors = [];
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
        if (schedule.endTime &&
            schedule.startTime &&
            schedule.endTime <= schedule.startTime) {
            errors.push("End time must be after start time");
        }
        return errors;
    }
    static validateEventLocation(location) {
        const errors = [];
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
    static validateEventPricing(pricing) {
        const errors = [];
        if (!pricing.isFree && (!pricing.price || pricing.price <= 0)) {
            errors.push("Price must be greater than 0 for paid events");
        }
        if (pricing.isFree && pricing.price) {
            errors.push("Free events cannot have a price");
        }
        if (pricing.earlyBirdDiscount) {
            if (pricing.earlyBirdDiscount.percentage <= 0 ||
                pricing.earlyBirdDiscount.percentage >= 100) {
                errors.push("Early bird discount must be between 0 and 100%");
            }
            if (pricing.earlyBirdDiscount.validUntil <= new Date()) {
                errors.push("Early bird discount valid until date must be in the future");
            }
        }
        return errors;
    }
}
exports.EventValidation = EventValidation;
// Event status transitions
class EventStatusTransitions {
    static canTransitionTo(currentStatus, newStatus) {
        return this.VALID_TRANSITIONS[currentStatus].includes(newStatus);
    }
    static getValidTransitions(currentStatus) {
        return this.VALID_TRANSITIONS[currentStatus];
    }
}
exports.EventStatusTransitions = EventStatusTransitions;
EventStatusTransitions.VALID_TRANSITIONS = {
    ACTIVO: ["INACTIVO", "CANCELADO", "EN_PROCESO"],
    INACTIVO: ["ACTIVO", "CANCELADO"],
    EN_PROCESO: ["COMPLETADO", "CANCELADO"],
    COMPLETADO: [], // Terminal state
    CANCELADO: [], // Terminal state
};
// Error types specific to events domain
class EventError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "EventError";
    }
}
exports.EventError = EventError;
class EventValidationError extends EventError {
    constructor(message, details) {
        super(message, "EVENT_VALIDATION_ERROR", details);
        this.name = "EventValidationError";
    }
}
exports.EventValidationError = EventValidationError;
class EventCapacityError extends EventError {
    constructor(message, details) {
        super(message, "EVENT_CAPACITY_ERROR", details);
        this.name = "EventCapacityError";
    }
}
exports.EventCapacityError = EventCapacityError;
class EventSchedulingError extends EventError {
    constructor(message, details) {
        super(message, "EVENT_SCHEDULING_ERROR", details);
        this.name = "EventSchedulingError";
    }
}
exports.EventSchedulingError = EventSchedulingError;
class CategoryError extends EventError {
    constructor(message, details) {
        super(message, "CATEGORY_ERROR", details);
        this.name = "CategoryError";
    }
}
exports.CategoryError = CategoryError;
//# sourceMappingURL=index.js.map