"use strict";
/**
 * Event Management Use Case - Application Layer
 *
 * Handles all event-related operations including creation, updates, capacity management, and analytics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManagement = void 0;
const events_1 = require("../../../domain/entities/events");
class EventManagement {
    constructor(eventRepository, categoryService, userService, notificationService, calendarService) {
        this.eventRepository = eventRepository;
        this.categoryService = categoryService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.calendarService = calendarService;
    }
    /**
     * Create a new event
     */
    async createEvent(input) {
        try {
            const warnings = [];
            // Validate organizer
            const organizer = await this.userService.getUserDetails(input.organizerId);
            if (!organizer) {
                return {
                    success: false,
                    message: "Organizer not found",
                };
            }
            // Validate category and access
            const category = await this.categoryService.getCategoryById(input.categoryId);
            if (!category) {
                return {
                    success: false,
                    message: "Category not found",
                };
            }
            const hasAccess = await this.categoryService.validateCategoryAccess(input.categoryId, organizer.roles);
            if (!hasAccess) {
                return {
                    success: false,
                    message: "Insufficient permissions to create events in this category",
                };
            }
            // Calculate advance notice
            const advanceNoticeDays = Math.ceil((input.startDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24));
            // Check category restrictions
            const canCreate = await this.validateEventCreation(input.categoryId, organizer.roles, input.capacity, advanceNoticeDays, input.organizerId);
            if (!canCreate.canCreate) {
                return {
                    success: false,
                    message: canCreate.reason ||
                        "Cannot create event due to category restrictions",
                };
            }
            // Validate instructors if provided
            if (input.instructorIds && input.instructorIds.length > 0) {
                for (const instructorId of input.instructorIds) {
                    const isValid = await this.userService.validateInstructor(instructorId);
                    if (!isValid) {
                        warnings.push(`Instructor ${instructorId} not found or invalid`);
                    }
                }
            }
            // Create event domain entity
            const event = events_1.Event.create(input.name, input.description, input.categoryId, input.startDate, input.startTime, input.duration, input.venue, input.capacity, input.organizerId, input.area, input.audience, input.isFree, input.price, input.endDate, input.endTime, input.minimumAttendancePercentage, input.createdBy);
            // Apply additional configurations
            let updatedEvent = event;
            if (input.requiresMotivationLetter !== undefined ||
                input.requiresDocumentVerification !== undefined ||
                input.requiresApproval !== undefined ||
                input.requiredDocuments) {
                updatedEvent = updatedEvent.updateRequirements(input.minimumAttendancePercentage, input.requiresMotivationLetter, input.requiresDocumentVerification, input.requiresApproval, input.requiredDocuments, undefined, input.createdBy);
            }
            // Add tags if provided
            if (input.tags && input.tags.length > 0) {
                for (const tag of input.tags) {
                    try {
                        updatedEvent = updatedEvent.addTag(tag, input.createdBy);
                    }
                    catch (error) {
                        warnings.push(`Could not add tag "${tag}": ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                }
            }
            // Add instructors if provided and valid
            if (input.instructorIds && input.instructorIds.length > 0) {
                for (const instructorId of input.instructorIds) {
                    try {
                        const instructor = await this.userService.getUserDetails(instructorId);
                        if (instructor) {
                            updatedEvent = updatedEvent.addInstructor(instructor.id, instructor.name, instructor.email, "Instructor", undefined, input.createdBy);
                        }
                    }
                    catch (error) {
                        warnings.push(`Could not add instructor ${instructorId}: ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                }
            }
            // Associate with careers if specified
            if (input.associatedCareers &&
                input.associatedCareers.length > 0 &&
                input.audience === "CARRERA_ESPECIFICA") {
                try {
                    const careers = input.associatedCareers.map((careerId) => ({
                        id: careerId,
                        name: `Career ${careerId}`, // Would need to fetch actual career data
                        code: `CAR${careerId}`,
                    }));
                    updatedEvent = updatedEvent.associateWithCareers(careers, input.createdBy);
                }
                catch (error) {
                    warnings.push(`Could not associate careers: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            }
            // Save event
            await this.eventRepository.save(updatedEvent);
            // Create calendar event if sync is enabled
            try {
                const calendarResult = await this.calendarService.createCalendarEvent(updatedEvent);
                if (!calendarResult.success) {
                    warnings.push(`Calendar sync failed: ${calendarResult.errorMessage}`);
                }
            }
            catch (error) {
                warnings.push("Calendar sync failed");
            }
            // Check for conflicts
            try {
                const conflicts = await this.eventRepository.checkConflicts(updatedEvent.getId());
                if (conflicts.conflicts.length > 0) {
                    warnings.push(`${conflicts.conflicts.length} potential conflicts detected`);
                    await this.notificationService.sendConflictAlertNotification(conflicts);
                }
            }
            catch (error) {
                // Conflict check is non-critical
            }
            // Send notifications
            await this.notificationService.sendEventCreatedNotification(updatedEvent);
            // Auto-publish if category settings allow
            if (category.settings.autoPublishEvents) {
                try {
                    const publishedEvent = updatedEvent.publish(input.createdBy);
                    await this.eventRepository.update(publishedEvent);
                    await this.notificationService.sendEventPublishedNotification(publishedEvent);
                }
                catch (error) {
                    warnings.push("Auto-publish failed - event created but not published");
                }
            }
            return {
                success: true,
                eventId: updatedEvent.getId(),
                message: "Event created successfully",
                warnings: warnings.length > 0 ? warnings : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Update an existing event
     */
    async updateEvent(input) {
        try {
            const warnings = [];
            const event = await this.eventRepository.findById(input.eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            if (!event.canEdit()) {
                return {
                    success: false,
                    message: "Event cannot be edited in its current state",
                };
            }
            let updatedEvent = event;
            const changes = [];
            // Update basic information
            if (input.name || input.description) {
                updatedEvent = updatedEvent.updateBasicInfo(input.name, input.description, input.updatedBy);
                if (input.name)
                    changes.push("name");
                if (input.description)
                    changes.push("description");
            }
            // Update schedule
            if (input.startDate ||
                input.endDate ||
                input.startTime ||
                input.endTime ||
                input.duration) {
                updatedEvent = updatedEvent.updateSchedule(input.startDate, input.endDate, input.startTime, input.endTime, input.duration, input.updatedBy);
                changes.push("schedule");
            }
            // Update location and capacity
            if (input.venue || input.capacity !== undefined) {
                updatedEvent = updatedEvent.updateLocation(input.venue, undefined, undefined, input.capacity, undefined, undefined, input.updatedBy);
                if (input.venue)
                    changes.push("venue");
                if (input.capacity !== undefined)
                    changes.push("capacity");
            }
            // Update pricing
            if (input.isFree !== undefined || input.price !== undefined) {
                updatedEvent = updatedEvent.updatePricing(input.isFree, input.price, undefined, input.updatedBy);
                changes.push("pricing");
            }
            // Update requirements
            if (input.minimumAttendancePercentage !== undefined ||
                input.requiresMotivationLetter !== undefined ||
                input.requiresDocumentVerification !== undefined ||
                input.requiresApproval !== undefined ||
                input.requiredDocuments) {
                updatedEvent = updatedEvent.updateRequirements(input.minimumAttendancePercentage, input.requiresMotivationLetter, input.requiresDocumentVerification, input.requiresApproval, input.requiredDocuments, undefined, input.updatedBy);
                changes.push("requirements");
            }
            // Update tags
            if (input.tags) {
                // Remove existing tags and add new ones
                const currentTags = updatedEvent.getTags();
                for (const tag of currentTags) {
                    try {
                        updatedEvent = updatedEvent.removeTag(tag, input.updatedBy);
                    }
                    catch (error) {
                        // Ignore removal errors
                    }
                }
                for (const tag of input.tags) {
                    try {
                        updatedEvent = updatedEvent.addTag(tag, input.updatedBy);
                    }
                    catch (error) {
                        warnings.push(`Could not add tag "${tag}": ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                }
                changes.push("tags");
            }
            // Save updated event
            await this.eventRepository.update(updatedEvent);
            // Update calendar event if sync is enabled
            try {
                // Would need to store calendar event ID in the event entity
                // const calendarResult = await this.calendarService.updateCalendarEvent(calendarEventId, updatedEvent);
                // if (!calendarResult.success) {
                //   warnings.push(`Calendar sync failed: ${calendarResult.errorMessage}`);
                // }
            }
            catch (error) {
                warnings.push("Calendar sync failed");
            }
            // Check for new conflicts after update
            try {
                const conflicts = await this.eventRepository.checkConflicts(updatedEvent.getId());
                if (conflicts.conflicts.length > 0) {
                    warnings.push(`${conflicts.conflicts.length} potential conflicts detected after update`);
                    await this.notificationService.sendConflictAlertNotification(conflicts);
                }
            }
            catch (error) {
                // Conflict check is non-critical
            }
            // Send update notification
            if (changes.length > 0) {
                await this.notificationService.sendEventUpdatedNotification(updatedEvent, changes);
            }
            return {
                success: true,
                message: "Event updated successfully",
                warnings: warnings.length > 0 ? warnings : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Cancel an event
     */
    async cancelEvent(eventId, reason, cancelledBy) {
        try {
            const event = await this.eventRepository.findById(eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            if (!event.canCancel()) {
                return {
                    success: false,
                    message: "Event cannot be cancelled in its current state",
                };
            }
            const cancelledEvent = event.cancel(reason, cancelledBy);
            await this.eventRepository.update(cancelledEvent);
            // Send cancellation notification
            await this.notificationService.sendEventCancelledNotification(cancelledEvent, reason);
            // Cancel calendar event if sync is enabled
            try {
                // Would need calendar event ID
                // await this.calendarService.deleteCalendarEvent(calendarEventId);
            }
            catch (error) {
                // Calendar cancellation is non-critical
            }
            return {
                success: true,
                message: "Event cancelled successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to cancel event: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Publish or unpublish an event
     */
    async toggleEventPublication(eventId, publish, updatedBy) {
        try {
            const event = await this.eventRepository.findById(eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            const updatedEvent = publish
                ? event.publish(updatedBy)
                : event.unpublish(updatedBy);
            await this.eventRepository.update(updatedEvent);
            if (publish) {
                await this.notificationService.sendEventPublishedNotification(updatedEvent);
            }
            return {
                success: true,
                message: `Event ${publish ? "published" : "unpublished"} successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to ${publish ? "publish" : "unpublish"} event: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Add instructor to event
     */
    async addInstructor(input) {
        try {
            const event = await this.eventRepository.findById(input.eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            const updatedEvent = event.addInstructor(input.instructorId, input.instructorName, input.instructorEmail, input.role, input.biography, input.updatedBy);
            await this.eventRepository.update(updatedEvent);
            return {
                success: true,
                message: "Instructor added successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to add instructor: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Remove instructor from event
     */
    async removeInstructor(eventId, instructorId, updatedBy) {
        try {
            const event = await this.eventRepository.findById(eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            const updatedEvent = event.removeInstructor(instructorId, updatedBy);
            await this.eventRepository.update(updatedEvent);
            return {
                success: true,
                message: "Instructor removed successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to remove instructor: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get event details
     */
    async getEvent(eventId) {
        try {
            const event = await this.eventRepository.findById(eventId);
            if (!event) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            // Increment view count
            const updatedEvent = event.incrementViewCount();
            await this.eventRepository.update(updatedEvent);
            return {
                success: true,
                event: updatedEvent.getDetailedReport(),
                message: "Event retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve event: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Search events with filters
     */
    async searchEvents(criteria) {
        try {
            const result = await this.eventRepository.search(criteria);
            const eventSummaries = result.events.map((event) => event.getEventSummary());
            return {
                success: true,
                events: eventSummaries,
                totalCount: result.totalCount,
                hasMore: result.hasMore,
                message: `Found ${result.events.length} events`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to search events: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get events by organizer
     */
    async getEventsByOrganizer(organizerId) {
        try {
            const events = await this.eventRepository.findByOrganizerId(organizerId);
            const eventSummaries = events.map((event) => event.getEventSummary());
            return {
                success: true,
                events: eventSummaries,
                message: `Found ${events.length} events for organizer`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve organizer events: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get upcoming events
     */
    async getUpcomingEvents(days) {
        try {
            const events = await this.eventRepository.findUpcomingEvents(days);
            const eventSummaries = events.map((event) => event.getEventSummary());
            return {
                success: true,
                events: eventSummaries,
                message: `Found ${events.length} upcoming events`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve upcoming events: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get event analytics
     */
    async getEventAnalytics(filters) {
        try {
            const analytics = await this.eventRepository.getEventAnalytics(filters);
            return {
                success: true,
                analytics,
                message: "Event analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve event analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get capacity management for an event
     */
    async getCapacityManagement(eventId) {
        try {
            const capacityManagement = await this.eventRepository.getCapacityManagement(eventId);
            // Check for capacity alerts
            if (capacityManagement.occupancyRate >= 90) {
                const event = await this.eventRepository.findById(eventId);
                if (event) {
                    await this.notificationService.sendCapacityAlertNotification(event, capacityManagement.occupancyRate);
                }
            }
            return {
                success: true,
                capacityManagement,
                message: "Capacity management data retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve capacity management: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Perform bulk operations on events
     */
    async bulkOperations(operation) {
        const startTime = Date.now();
        const result = {
            successful: [],
            failed: [],
            summary: {
                total: operation.eventIds.length,
                successful: 0,
                failed: 0,
                processingTime: 0,
            },
        };
        for (const eventId of operation.eventIds) {
            try {
                const event = await this.eventRepository.findById(eventId);
                if (!event) {
                    result.failed.push({
                        eventId,
                        eventName: "Unknown",
                        reason: "Event not found",
                    });
                    continue;
                }
                let success = false;
                let updatedEvent = event;
                switch (operation.operation) {
                    case "PUBLISH":
                        updatedEvent = event.publish();
                        success = true;
                        break;
                    case "UNPUBLISH":
                        updatedEvent = event.unpublish();
                        success = true;
                        break;
                    case "ACTIVATE":
                        updatedEvent = event.updateStatus("ACTIVO");
                        success = true;
                        break;
                    case "DEACTIVATE":
                        updatedEvent = event.updateStatus("INACTIVO");
                        success = true;
                        break;
                    case "CANCEL":
                        if (event.canCancel()) {
                            updatedEvent = event.cancel(operation.parameters?.reason);
                            success = true;
                        }
                        else {
                            throw new Error("Event cannot be cancelled");
                        }
                        break;
                    case "UPDATE_STATUS":
                        if (operation.parameters?.status) {
                            updatedEvent = event.updateStatus(operation.parameters.status);
                            success = true;
                        }
                        else {
                            throw new Error("Status parameter is required");
                        }
                        break;
                    default:
                        throw new Error(`Unsupported operation: ${operation.operation}`);
                }
                if (success) {
                    await this.eventRepository.update(updatedEvent);
                    result.successful.push({
                        eventId: event.getId(),
                        eventName: event.getName(),
                    });
                    result.summary.successful++;
                }
            }
            catch (error) {
                const event = await this.eventRepository.findById(eventId);
                result.failed.push({
                    eventId,
                    eventName: event?.getName() || "Unknown",
                    reason: error instanceof Error ? error.message : "Unknown error",
                });
                result.summary.failed++;
            }
        }
        result.summary.processingTime = Date.now() - startTime;
        return result;
    }
    /**
     * Private helper methods
     */
    async validateEventCreation(categoryId, organizerRoles, capacity, advanceNoticeDays, organizerId) {
        try {
            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return { canCreate: false, reason: "Category not found" };
            }
            // Check category restrictions
            if (category.restrictions.requiresSpecialApproval) {
                // Would need to check if special approval exists
                return {
                    canCreate: false,
                    reason: "Category requires special approval",
                };
            }
            if (category.restrictions.maxCapacityPerEvent &&
                capacity > category.restrictions.maxCapacityPerEvent) {
                return {
                    canCreate: false,
                    reason: `Capacity exceeds category limit of ${category.restrictions.maxCapacityPerEvent}`,
                };
            }
            if (advanceNoticeDays < category.restrictions.minimumAdvanceNotice) {
                return {
                    canCreate: false,
                    reason: `Minimum advance notice is ${category.restrictions.minimumAdvanceNotice} days`,
                };
            }
            // Check monthly event limit
            if (category.restrictions.maxEventsPerMonth) {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const monthlyEvents = await this.eventRepository.findByDateRange(startOfMonth, endOfMonth);
                const organizerEvents = monthlyEvents.filter((event) => event.getOrganizerId() === organizerId);
                if (organizerEvents.length >= category.restrictions.maxEventsPerMonth) {
                    return {
                        canCreate: false,
                        reason: `Monthly event limit of ${category.restrictions.maxEventsPerMonth} reached`,
                    };
                }
            }
            return { canCreate: true };
        }
        catch (error) {
            return {
                canCreate: false,
                reason: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
}
exports.EventManagement = EventManagement;
//# sourceMappingURL=EventManagement.js.map