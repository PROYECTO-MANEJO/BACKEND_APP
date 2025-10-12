"use strict";
/**
 * Event Entity - Domain Layer
 *
 * Representa un evento con todas sus propiedades, validaciones y reglas de negocio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(name, description, categoryId, startDate, startTime, duration, venue, capacity, organizerId, area, audience = "PUBLICO_GENERAL", isFree = true, price, endDate, endTime, minimumAttendancePercentage = 80, createdBy) {
        const now = new Date();
        const eventData = {
            id: `event-${Date.now()}`,
            name: name.trim(),
            description: description.trim(),
            categoryId,
            schedule: {
                startDate,
                endDate,
                startTime,
                endTime,
                duration,
            },
            location: {
                venue: venue.trim(),
                capacity,
                hasVirtualOption: false,
            },
            organizerId,
            instructors: [],
            area,
            audience,
            tags: [],
            pricing: {
                isFree,
                price: isFree ? undefined : price,
                currency: "CRC",
            },
            requirements: {
                requiresMotivationLetter: true,
                requiresDocumentVerification: false,
                minimumAttendancePercentage,
                requiredDocuments: [],
                prerequisites: [],
            },
            registration: {
                isOpen: true,
                maxCapacity: capacity,
                currentEnrollments: 0,
                waitingListEnabled: true,
                autoApproval: true,
            },
            associatedCareers: [],
            materials: {
                presentationFiles: [],
                resourceLinks: [],
                handoutFiles: [],
            },
            feedback: {
                totalReviews: 0,
                improvementSuggestions: [],
            },
            status: "ACTIVO",
            createdAt: now,
            updatedAt: now,
            createdBy,
            viewCount: 0,
            shareCount: 0,
            isPublished: false,
            syncWithCalendar: false,
        };
        return new Event(eventData);
    }
    static fromPrismaData(eventData) {
        const event = {
            id: eventData.id_eve.toString(),
            name: eventData.nom_eve,
            description: eventData.des_eve,
            categoryId: eventData.id_cat_eve?.toString(),
            categoryName: eventData.categoriaEvento?.nom_cat,
            schedule: {
                startDate: new Date(eventData.fec_ini_eve),
                endDate: eventData.fec_fin_eve
                    ? new Date(eventData.fec_fin_eve)
                    : undefined,
                startTime: eventData.hor_ini_eve
                    ? new Date(eventData.hor_ini_eve)
                    : new Date(),
                endTime: eventData.hor_fin_eve
                    ? new Date(eventData.hor_fin_eve)
                    : undefined,
                duration: eventData.dur_eve || 1,
            },
            location: {
                venue: eventData.ubi_eve || "",
                capacity: eventData.capacidad_max_eve || 0,
                hasVirtualOption: false,
            },
            organizerId: eventData.ced_org_eve?.toString() || "",
            organizerName: eventData.organizador?.nom_org,
            organizerEmail: eventData.organizador?.email_org,
            instructors: [],
            area: eventData.are_eve || "ACADEMICA",
            audience: eventData.tipo_audiencia_eve || "PUBLICO_GENERAL",
            tags: [],
            pricing: {
                isFree: eventData.es_gratuito !== false,
                price: eventData.precio || undefined,
                currency: "CRC",
            },
            requirements: {
                requiresMotivationLetter: eventData.requiere_carta_motivacion !== false,
                requiresDocumentVerification: eventData.requiere_verificacion_docs === true,
                minimumAttendancePercentage: eventData.porcentaje_asistencia_aprobacion || 80,
                requiresApproval: eventData.requiere_aprobacion === true,
                requiredDocuments: [],
                prerequisites: [],
            },
            registration: {
                isOpen: eventData.estado === "ACTIVO",
                maxCapacity: eventData.capacidad_max_eve || 0,
                currentEnrollments: eventData._count?.inscripciones || 0,
                waitingListEnabled: true,
                autoApproval: eventData.requiere_aprobacion !== true,
            },
            associatedCareers: (eventData.eventosPorCarrera || []).map((epc) => ({
                id: epc.carrera?.id_car?.toString() || "",
                name: epc.carrera?.nom_car || "",
                code: epc.carrera?.codigo_car || "",
            })),
            materials: {
                presentationFiles: [],
                resourceLinks: [],
                handoutFiles: [],
            },
            feedback: {
                totalReviews: 0,
                improvementSuggestions: [],
            },
            status: eventData.estado || "ACTIVO",
            createdAt: eventData.created_at
                ? new Date(eventData.created_at)
                : new Date(),
            updatedAt: eventData.updated_at
                ? new Date(eventData.updated_at)
                : new Date(),
            viewCount: 0,
            shareCount: 0,
            isPublished: eventData.estado === "ACTIVO",
            syncWithCalendar: false,
        };
        return new Event(event);
    }
    validateData() {
        if (!this.data.name?.trim()) {
            throw new Error("Event name is required");
        }
        if (!this.data.description?.trim()) {
            throw new Error("Event description is required");
        }
        if (!this.data.categoryId?.trim()) {
            throw new Error("Category ID is required");
        }
        if (!this.data.organizerId?.trim()) {
            throw new Error("Organizer ID is required");
        }
        if (!this.data.location.venue?.trim()) {
            throw new Error("Event venue is required");
        }
        if (this.data.location.capacity <= 0) {
            throw new Error("Event capacity must be greater than 0");
        }
        if (this.data.schedule.duration <= 0) {
            throw new Error("Event duration must be greater than 0");
        }
        if (this.data.schedule.startDate < new Date("2000-01-01")) {
            throw new Error("Event start date must be valid");
        }
        if (this.data.schedule.endDate &&
            this.data.schedule.endDate < this.data.schedule.startDate) {
            throw new Error("Event end date must be after start date");
        }
        if (this.data.requirements.minimumAttendancePercentage < 0 ||
            this.data.requirements.minimumAttendancePercentage > 100) {
            throw new Error("Minimum attendance percentage must be between 0 and 100");
        }
        if (!this.data.pricing.isFree &&
            (!this.data.pricing.price || this.data.pricing.price <= 0)) {
            throw new Error("Paid events must have a positive price");
        }
        if (this.data.pricing.isFree && this.data.pricing.price) {
            throw new Error("Free events cannot have a price");
        }
        if (this.data.registration.currentEnrollments < 0) {
            throw new Error("Current enrollments cannot be negative");
        }
        if (this.data.registration.currentEnrollments >
            this.data.registration.maxCapacity) {
            throw new Error("Current enrollments cannot exceed maximum capacity");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getName() {
        return this.data.name;
    }
    getDescription() {
        return this.data.description;
    }
    getCategoryId() {
        return this.data.categoryId;
    }
    getCategoryName() {
        return this.data.categoryName;
    }
    getSchedule() {
        return { ...this.data.schedule };
    }
    getLocation() {
        return { ...this.data.location };
    }
    getOrganizerId() {
        return this.data.organizerId;
    }
    getOrganizerName() {
        return this.data.organizerName;
    }
    getInstructors() {
        return [...this.data.instructors];
    }
    getArea() {
        return this.data.area;
    }
    getAudience() {
        return this.data.audience;
    }
    getTags() {
        return [...this.data.tags];
    }
    getPricing() {
        return { ...this.data.pricing };
    }
    getRequirements() {
        return { ...this.data.requirements };
    }
    getRegistration() {
        return { ...this.data.registration };
    }
    getAssociatedCareers() {
        return [...this.data.associatedCareers];
    }
    getMaterials() {
        return { ...this.data.materials };
    }
    getFeedback() {
        return { ...this.data.feedback };
    }
    getStatus() {
        return this.data.status;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getViewCount() {
        return this.data.viewCount;
    }
    getCompletionRate() {
        return this.data.completionRate;
    }
    isPublished() {
        return this.data.isPublished;
    }
    isFeatured() {
        return this.data.featuredUntil
            ? new Date() < this.data.featuredUntil
            : false;
    }
    // Status checks
    isActive() {
        return this.data.status === "ACTIVO";
    }
    isCompleted() {
        return this.data.status === "COMPLETADO";
    }
    isCancelled() {
        return this.data.status === "CANCELADO";
    }
    isInProgress() {
        return this.data.status === "EN_PROCESO";
    }
    isFree() {
        return this.data.pricing.isFree;
    }
    isRegistrationOpen() {
        const now = new Date();
        return (this.data.registration.isOpen &&
            this.data.status === "ACTIVO" &&
            (!this.data.registration.closeDate ||
                now <= this.data.registration.closeDate) &&
            (!this.data.registration.openDate ||
                now >= this.data.registration.openDate));
    }
    hasCapacity() {
        return (this.data.registration.currentEnrollments <
            this.data.registration.maxCapacity);
    }
    isWaitingListEnabled() {
        return this.data.registration.waitingListEnabled;
    }
    requiresApproval() {
        return this.data.requirements.requiresApproval === true;
    }
    requiresMotivationLetter() {
        return this.data.requirements.requiresMotivationLetter;
    }
    hasStarted() {
        return new Date() >= this.data.schedule.startDate;
    }
    hasEnded() {
        const endDate = this.data.schedule.endDate || this.data.schedule.startDate;
        return new Date() > endDate;
    }
    isUpcoming() {
        return !this.hasStarted();
    }
    isOngoing() {
        return this.hasStarted() && !this.hasEnded();
    }
    canEnroll() {
        return (this.isRegistrationOpen() &&
            (this.hasCapacity() || this.isWaitingListEnabled()) &&
            this.isUpcoming());
    }
    canEdit() {
        return !this.hasStarted() || this.data.status === "ACTIVO";
    }
    canCancel() {
        return this.data.status === "ACTIVO" && !this.hasEnded();
    }
    // Actions
    updateBasicInfo(name, description, updatedBy) {
        if (!this.canEdit()) {
            throw new Error("Cannot edit event after it has started");
        }
        const updates = {
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        if (name && name.trim()) {
            updates.name = name.trim();
        }
        if (description && description.trim()) {
            updates.description = description.trim();
        }
        const updatedData = { ...this.data, ...updates };
        return new Event(updatedData);
    }
    updateSchedule(startDate, endDate, startTime, endTime, duration, updatedBy) {
        if (!this.canEdit()) {
            throw new Error("Cannot edit event schedule after it has started");
        }
        const updatedSchedule = { ...this.data.schedule };
        if (startDate) {
            if (startDate < new Date()) {
                throw new Error("Start date cannot be in the past");
            }
            updatedSchedule.startDate = startDate;
        }
        if (endDate) {
            if (endDate < (startDate || this.data.schedule.startDate)) {
                throw new Error("End date cannot be before start date");
            }
            updatedSchedule.endDate = endDate;
        }
        if (startTime) {
            updatedSchedule.startTime = startTime;
        }
        if (endTime) {
            updatedSchedule.endTime = endTime;
        }
        if (duration !== undefined) {
            if (duration <= 0) {
                throw new Error("Duration must be greater than 0");
            }
            updatedSchedule.duration = duration;
        }
        const updatedData = {
            ...this.data,
            schedule: updatedSchedule,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    updateLocation(venue, address, city, capacity, hasVirtualOption, virtualLink, updatedBy) {
        const updatedLocation = { ...this.data.location };
        if (venue && venue.trim()) {
            updatedLocation.venue = venue.trim();
        }
        if (address !== undefined) {
            updatedLocation.address = address?.trim() || undefined;
        }
        if (city !== undefined) {
            updatedLocation.city = city?.trim() || undefined;
        }
        if (capacity !== undefined) {
            if (capacity <= 0) {
                throw new Error("Capacity must be greater than 0");
            }
            if (capacity < this.data.registration.currentEnrollments) {
                throw new Error("Cannot reduce capacity below current enrollments");
            }
            updatedLocation.capacity = capacity;
        }
        if (hasVirtualOption !== undefined) {
            updatedLocation.hasVirtualOption = hasVirtualOption;
            if (!hasVirtualOption) {
                updatedLocation.virtualLink = undefined;
            }
        }
        if (virtualLink !== undefined) {
            updatedLocation.virtualLink = virtualLink?.trim() || undefined;
        }
        const updatedRegistration = { ...this.data.registration };
        if (capacity !== undefined) {
            updatedRegistration.maxCapacity = capacity;
        }
        const updatedData = {
            ...this.data,
            location: updatedLocation,
            registration: updatedRegistration,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    updatePricing(isFree, price, currency, updatedBy) {
        if (!this.canEdit()) {
            throw new Error("Cannot edit event pricing after it has started");
        }
        const updatedPricing = { ...this.data.pricing };
        if (isFree !== undefined) {
            updatedPricing.isFree = isFree;
            if (isFree) {
                updatedPricing.price = undefined;
            }
        }
        if (!updatedPricing.isFree && price !== undefined) {
            if (price <= 0) {
                throw new Error("Price must be greater than 0 for paid events");
            }
            updatedPricing.price = price;
        }
        if (currency && currency.trim()) {
            updatedPricing.currency = currency.trim();
        }
        const updatedData = {
            ...this.data,
            pricing: updatedPricing,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    updateRequirements(minimumAttendancePercentage, requiresMotivationLetter, requiresDocumentVerification, requiresApproval, requiredDocuments, prerequisites, updatedBy) {
        const updatedRequirements = { ...this.data.requirements };
        if (minimumAttendancePercentage !== undefined) {
            if (minimumAttendancePercentage < 0 ||
                minimumAttendancePercentage > 100) {
                throw new Error("Minimum attendance percentage must be between 0 and 100");
            }
            updatedRequirements.minimumAttendancePercentage =
                minimumAttendancePercentage;
        }
        if (requiresMotivationLetter !== undefined) {
            updatedRequirements.requiresMotivationLetter = requiresMotivationLetter;
        }
        if (requiresDocumentVerification !== undefined) {
            updatedRequirements.requiresDocumentVerification =
                requiresDocumentVerification;
        }
        if (requiresApproval !== undefined) {
            updatedRequirements.requiresApproval = requiresApproval;
        }
        if (requiredDocuments) {
            updatedRequirements.requiredDocuments = [...requiredDocuments];
        }
        if (prerequisites) {
            updatedRequirements.prerequisites = [...prerequisites];
        }
        const updatedData = {
            ...this.data,
            requirements: updatedRequirements,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    addInstructor(id, name, email, role, biography, updatedBy) {
        if (this.data.instructors.some((instructor) => instructor.id === id)) {
            throw new Error("Instructor already exists for this event");
        }
        const newInstructor = {
            id: id.trim(),
            name: name.trim(),
            email: email.trim(),
            role: role.trim(),
            biography: biography?.trim(),
        };
        const updatedData = {
            ...this.data,
            instructors: [...this.data.instructors, newInstructor],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    removeInstructor(instructorId, updatedBy) {
        const updatedInstructors = this.data.instructors.filter((instructor) => instructor.id !== instructorId);
        if (updatedInstructors.length === this.data.instructors.length) {
            throw new Error("Instructor not found");
        }
        const updatedData = {
            ...this.data,
            instructors: updatedInstructors,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    associateWithCareers(careers, updatedBy) {
        if (this.data.audience !== "CARRERA_ESPECIFICA") {
            throw new Error("Can only associate careers with career-specific events");
        }
        const updatedData = {
            ...this.data,
            associatedCareers: [...careers],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    addTag(tag, updatedBy) {
        if (!tag?.trim()) {
            throw new Error("Tag cannot be empty");
        }
        const trimmedTag = tag.trim().toLowerCase();
        if (this.data.tags.includes(trimmedTag)) {
            throw new Error("Tag already exists");
        }
        const updatedData = {
            ...this.data,
            tags: [...this.data.tags, trimmedTag],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    removeTag(tag, updatedBy) {
        const updatedTags = this.data.tags.filter((t) => t !== tag.toLowerCase());
        const updatedData = {
            ...this.data,
            tags: updatedTags,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    incrementEnrollment() {
        const updatedRegistration = {
            ...this.data.registration,
            currentEnrollments: this.data.registration.currentEnrollments + 1,
        };
        const updatedData = {
            ...this.data,
            registration: updatedRegistration,
            updatedAt: new Date(),
        };
        return new Event(updatedData);
    }
    decrementEnrollment() {
        if (this.data.registration.currentEnrollments <= 0) {
            throw new Error("Cannot decrement enrollments below 0");
        }
        const updatedRegistration = {
            ...this.data.registration,
            currentEnrollments: this.data.registration.currentEnrollments - 1,
        };
        const updatedData = {
            ...this.data,
            registration: updatedRegistration,
            updatedAt: new Date(),
        };
        return new Event(updatedData);
    }
    updateStatus(status, updatedBy) {
        const updatedData = {
            ...this.data,
            status,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    cancel(reason, updatedBy) {
        if (!this.canCancel()) {
            throw new Error("Cannot cancel event in current status");
        }
        const updatedData = {
            ...this.data,
            status: "CANCELADO",
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    publish(updatedBy) {
        const now = new Date();
        const updatedData = {
            ...this.data,
            isPublished: true,
            publishDate: now,
            updatedAt: now,
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    unpublish(updatedBy) {
        const updatedData = {
            ...this.data,
            isPublished: false,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Event(updatedData);
    }
    incrementViewCount() {
        const updatedData = {
            ...this.data,
            viewCount: this.data.viewCount + 1,
            updatedAt: new Date(),
        };
        return new Event(updatedData);
    }
    incrementShareCount() {
        const updatedData = {
            ...this.data,
            shareCount: this.data.shareCount + 1,
            updatedAt: new Date(),
        };
        return new Event(updatedData);
    }
    updateCompletionRate(completionRate) {
        if (completionRate < 0 || completionRate > 100) {
            throw new Error("Completion rate must be between 0 and 100");
        }
        const updatedData = {
            ...this.data,
            completionRate,
            updatedAt: new Date(),
        };
        return new Event(updatedData);
    }
    // Analytics and reporting
    getAvailableSpots() {
        return Math.max(0, this.data.registration.maxCapacity -
            this.data.registration.currentEnrollments);
    }
    getOccupancyRate() {
        if (this.data.registration.maxCapacity === 0)
            return 0;
        return ((this.data.registration.currentEnrollments /
            this.data.registration.maxCapacity) *
            100);
    }
    getDaysUntilStart() {
        const today = new Date();
        const diffTime = this.data.schedule.startDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getDurationInDays() {
        if (!this.data.schedule.endDate)
            return 1;
        const diffTime = this.data.schedule.endDate.getTime() -
            this.data.schedule.startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    getEventSummary() {
        return {
            id: this.data.id,
            name: this.data.name,
            description: this.data.description,
            categoryName: this.data.categoryName,
            startDate: this.data.schedule.startDate,
            endDate: this.data.schedule.endDate,
            duration: this.data.schedule.duration,
            venue: this.data.location.venue,
            capacity: this.data.location.capacity,
            currentEnrollments: this.data.registration.currentEnrollments,
            availableSpots: this.getAvailableSpots(),
            occupancyRate: this.getOccupancyRate(),
            area: this.data.area,
            audience: this.data.audience,
            isFree: this.data.pricing.isFree,
            price: this.data.pricing.price,
            status: this.data.status,
            isRegistrationOpen: this.isRegistrationOpen(),
            daysUntilStart: this.getDaysUntilStart(),
            isPublished: this.data.isPublished,
            viewCount: this.data.viewCount,
            organizerName: this.data.organizerName,
        };
    }
    getDetailedReport() {
        return {
            ...this.getEventSummary(),
            organizerId: this.data.organizerId,
            organizerEmail: this.data.organizerEmail,
            instructors: this.data.instructors,
            associatedCareers: this.data.associatedCareers,
            requirements: this.data.requirements,
            registration: this.data.registration,
            materials: this.data.materials,
            feedback: this.data.feedback,
            tags: this.data.tags,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
            createdBy: this.data.createdBy,
            lastModifiedBy: this.data.lastModifiedBy,
            completionRate: this.data.completionRate,
            shareCount: this.data.shareCount,
            publishDate: this.data.publishDate,
            featuredUntil: this.data.featuredUntil,
        };
    }
}
exports.Event = Event;
//# sourceMappingURL=Event.js.map