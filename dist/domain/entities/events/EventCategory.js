"use strict";
/**
 * EventCategory Entity - Domain Layer
 *
 * Representa una categoría de eventos con todas sus propiedades y reglas de negocio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCategory = void 0;
class EventCategory {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(name, description, code, color, createdBy) {
        const now = new Date();
        const categoryData = {
            id: `event-category-${Date.now()}`,
            name: name.trim(),
            description: description.trim(),
            code: code?.trim().toUpperCase(),
            color: color || "#007bff",
            settings: {
                defaultDuration: 2, // 2 hours
                defaultCapacity: 50,
                defaultRequiresApproval: false,
                defaultMinimumAttendance: 80,
                allowVirtualEvents: true,
                requiresInstructorApproval: false,
                autoPublishEvents: true,
            },
            emailTemplates: {},
            restrictions: {
                requiresSpecialApproval: false,
                minimumAdvanceNotice: 7, // 7 days
            },
            statistics: {
                totalEvents: 0,
                activeEvents: 0,
                completedEvents: 0,
                totalEnrollments: 0,
                averageAttendance: 0,
                revenueGenerated: 0,
            },
            isActive: true,
            displayOrder: 0,
            createdAt: now,
            updatedAt: now,
            createdBy,
            keywords: [],
            isPopular: false,
            isFeatured: false,
            subcategoryIds: [],
        };
        return new EventCategory(categoryData);
    }
    static fromPrismaData(categoryData) {
        const category = {
            id: categoryData.id_cat?.toString() || "",
            name: categoryData.nom_cat || "",
            description: categoryData.des_cat || "",
            code: categoryData.codigo_cat,
            color: categoryData.color_cat || "#007bff",
            icon: categoryData.icono_cat,
            imageUrl: categoryData.imagen_cat,
            settings: {
                defaultDuration: categoryData.duracion_default || 2,
                defaultCapacity: categoryData.capacidad_default || 50,
                defaultRequiresApproval: categoryData.requiere_aprobacion_default === true,
                defaultMinimumAttendance: categoryData.asistencia_minima_default || 80,
                allowVirtualEvents: categoryData.permite_eventos_virtuales !== false,
                requiresInstructorApproval: categoryData.requiere_aprobacion_instructor === true,
                autoPublishEvents: categoryData.auto_publicar_eventos !== false,
            },
            emailTemplates: {
                enrollment: categoryData.plantilla_email_inscripcion,
                reminder: categoryData.plantilla_email_recordatorio,
                completion: categoryData.plantilla_email_completado,
                cancellation: categoryData.plantilla_email_cancelacion,
            },
            restrictions: {
                maxEventsPerMonth: categoryData.max_eventos_mes,
                maxCapacityPerEvent: categoryData.max_capacidad_evento,
                restrictedToRoles: categoryData.roles_restringidos
                    ? JSON.parse(categoryData.roles_restringidos)
                    : undefined,
                requiresSpecialApproval: categoryData.requiere_aprobacion_especial === true,
                minimumAdvanceNotice: categoryData.aviso_minimo_dias || 7,
            },
            statistics: {
                totalEvents: categoryData._count?.eventos || 0,
                activeEvents: categoryData.eventos_activos_count || 0,
                completedEvents: categoryData.eventos_completados_count || 0,
                totalEnrollments: categoryData.total_inscripciones || 0,
                averageAttendance: categoryData.promedio_asistencia || 0,
                averageRating: categoryData.promedio_calificacion,
                revenueGenerated: categoryData.ingresos_generados || 0,
            },
            isActive: categoryData.activa !== false,
            displayOrder: categoryData.orden_visualizacion || 0,
            createdAt: categoryData.fecha_creacion
                ? new Date(categoryData.fecha_creacion)
                : new Date(),
            updatedAt: categoryData.fecha_actualizacion
                ? new Date(categoryData.fecha_actualizacion)
                : new Date(),
            createdBy: categoryData.creado_por,
            lastModifiedBy: categoryData.modificado_por,
            keywords: categoryData.palabras_clave
                ? JSON.parse(categoryData.palabras_clave)
                : [],
            isPopular: categoryData.es_popular === true,
            isFeatured: categoryData.es_destacada === true,
            parentCategoryId: categoryData.id_categoria_padre?.toString(),
            subcategoryIds: (categoryData.subcategorias || []).map((sub) => sub.id_cat.toString()),
        };
        return new EventCategory(category);
    }
    validateData() {
        if (!this.data.name?.trim()) {
            throw new Error("Category name is required");
        }
        if (!this.data.description?.trim()) {
            throw new Error("Category description is required");
        }
        if (this.data.code && this.data.code.length > 10) {
            throw new Error("Category code cannot exceed 10 characters");
        }
        if (this.data.settings.defaultDuration <= 0) {
            throw new Error("Default duration must be greater than 0");
        }
        if (this.data.settings.defaultCapacity <= 0) {
            throw new Error("Default capacity must be greater than 0");
        }
        if (this.data.settings.defaultMinimumAttendance < 0 ||
            this.data.settings.defaultMinimumAttendance > 100) {
            throw new Error("Default minimum attendance must be between 0 and 100");
        }
        if (this.data.restrictions.minimumAdvanceNotice < 0) {
            throw new Error("Minimum advance notice cannot be negative");
        }
        if (this.data.displayOrder < 0) {
            throw new Error("Display order cannot be negative");
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
    getCode() {
        return this.data.code;
    }
    getColor() {
        return this.data.color;
    }
    getIcon() {
        return this.data.icon;
    }
    getImageUrl() {
        return this.data.imageUrl;
    }
    getSettings() {
        return { ...this.data.settings };
    }
    getEmailTemplates() {
        return { ...this.data.emailTemplates };
    }
    getRestrictions() {
        return { ...this.data.restrictions };
    }
    getStatistics() {
        return { ...this.data.statistics };
    }
    getDisplayOrder() {
        return this.data.displayOrder;
    }
    getKeywords() {
        return [...this.data.keywords];
    }
    getParentCategoryId() {
        return this.data.parentCategoryId;
    }
    getSubcategoryIds() {
        return [...this.data.subcategoryIds];
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getCreatedBy() {
        return this.data.createdBy;
    }
    // Status checks
    isActive() {
        return this.data.isActive;
    }
    isPopular() {
        return this.data.isPopular;
    }
    isFeatured() {
        return this.data.isFeatured;
    }
    hasSubcategories() {
        return this.data.subcategoryIds.length > 0;
    }
    hasParentCategory() {
        return !!this.data.parentCategoryId;
    }
    allowsVirtualEvents() {
        return this.data.settings.allowVirtualEvents;
    }
    requiresInstructorApproval() {
        return this.data.settings.requiresInstructorApproval;
    }
    requiresSpecialApproval() {
        return this.data.restrictions.requiresSpecialApproval;
    }
    autoPublishesEvents() {
        return this.data.settings.autoPublishEvents;
    }
    hasEventLimit() {
        return !!this.data.restrictions.maxEventsPerMonth;
    }
    hasCapacityLimit() {
        return !!this.data.restrictions.maxCapacityPerEvent;
    }
    isRestrictedToRoles() {
        return (!!this.data.restrictions.restrictedToRoles &&
            this.data.restrictions.restrictedToRoles.length > 0);
    }
    // Validation methods
    canCreateEvent(organizerRoles, eventsThisMonth, eventCapacity, advanceNotice) {
        if (!this.data.isActive) {
            return { canCreate: false, reason: "Category is not active" };
        }
        if (this.isRestrictedToRoles()) {
            const hasRequiredRole = organizerRoles.some((role) => this.data.restrictions.restrictedToRoles.includes(role));
            if (!hasRequiredRole) {
                return {
                    canCreate: false,
                    reason: `Category is restricted to roles: ${this.data.restrictions.restrictedToRoles.join(", ")}`,
                };
            }
        }
        if (this.hasEventLimit()) {
            if (eventsThisMonth >= this.data.restrictions.maxEventsPerMonth) {
                return {
                    canCreate: false,
                    reason: `Monthly event limit reached (${this.data.restrictions.maxEventsPerMonth})`,
                };
            }
        }
        if (this.hasCapacityLimit()) {
            if (eventCapacity > this.data.restrictions.maxCapacityPerEvent) {
                return {
                    canCreate: false,
                    reason: `Event capacity exceeds category limit (${this.data.restrictions.maxCapacityPerEvent})`,
                };
            }
        }
        if (advanceNotice < this.data.restrictions.minimumAdvanceNotice) {
            return {
                canCreate: false,
                reason: `Minimum advance notice is ${this.data.restrictions.minimumAdvanceNotice} days`,
            };
        }
        return { canCreate: true };
    }
    // Actions
    updateBasicInfo(name, description, code, color, updatedBy) {
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
        if (code !== undefined) {
            updates.code = code?.trim().toUpperCase() || undefined;
        }
        if (color && color.trim()) {
            updates.color = color.trim();
        }
        const updatedData = { ...this.data, ...updates };
        return new EventCategory(updatedData);
    }
    updateVisualElements(icon, imageUrl, updatedBy) {
        const updatedData = {
            ...this.data,
            icon: icon?.trim() || this.data.icon,
            imageUrl: imageUrl?.trim() || this.data.imageUrl,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    updateSettings(settings, updatedBy) {
        const updatedSettings = { ...this.data.settings, ...settings };
        // Validate updated settings
        if (updatedSettings.defaultDuration <= 0) {
            throw new Error("Default duration must be greater than 0");
        }
        if (updatedSettings.defaultCapacity <= 0) {
            throw new Error("Default capacity must be greater than 0");
        }
        if (updatedSettings.defaultMinimumAttendance < 0 ||
            updatedSettings.defaultMinimumAttendance > 100) {
            throw new Error("Default minimum attendance must be between 0 and 100");
        }
        const updatedData = {
            ...this.data,
            settings: updatedSettings,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    updateEmailTemplates(templates, updatedBy) {
        const updatedTemplates = { ...this.data.emailTemplates, ...templates };
        const updatedData = {
            ...this.data,
            emailTemplates: updatedTemplates,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    updateRestrictions(restrictions, updatedBy) {
        const updatedRestrictions = { ...this.data.restrictions, ...restrictions };
        // Validate restrictions
        if (updatedRestrictions.minimumAdvanceNotice < 0) {
            throw new Error("Minimum advance notice cannot be negative");
        }
        if (updatedRestrictions.maxEventsPerMonth !== undefined &&
            updatedRestrictions.maxEventsPerMonth <= 0) {
            throw new Error("Maximum events per month must be greater than 0");
        }
        if (updatedRestrictions.maxCapacityPerEvent !== undefined &&
            updatedRestrictions.maxCapacityPerEvent <= 0) {
            throw new Error("Maximum capacity per event must be greater than 0");
        }
        const updatedData = {
            ...this.data,
            restrictions: updatedRestrictions,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    addKeyword(keyword, updatedBy) {
        if (!keyword?.trim()) {
            throw new Error("Keyword cannot be empty");
        }
        const trimmedKeyword = keyword.trim().toLowerCase();
        if (this.data.keywords.includes(trimmedKeyword)) {
            throw new Error("Keyword already exists");
        }
        const updatedData = {
            ...this.data,
            keywords: [...this.data.keywords, trimmedKeyword],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    removeKeyword(keyword, updatedBy) {
        const updatedKeywords = this.data.keywords.filter((k) => k !== keyword.toLowerCase());
        const updatedData = {
            ...this.data,
            keywords: updatedKeywords,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    addSubcategory(subcategoryId, updatedBy) {
        if (this.data.subcategoryIds.includes(subcategoryId)) {
            throw new Error("Subcategory already exists");
        }
        const updatedData = {
            ...this.data,
            subcategoryIds: [...this.data.subcategoryIds, subcategoryId],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    removeSubcategory(subcategoryId, updatedBy) {
        const updatedSubcategoryIds = this.data.subcategoryIds.filter((id) => id !== subcategoryId);
        const updatedData = {
            ...this.data,
            subcategoryIds: updatedSubcategoryIds,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    setParentCategory(parentCategoryId, updatedBy) {
        const updatedData = {
            ...this.data,
            parentCategoryId,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    activate(updatedBy) {
        const updatedData = {
            ...this.data,
            isActive: true,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    deactivate(updatedBy) {
        const updatedData = {
            ...this.data,
            isActive: false,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    setDisplayOrder(order, updatedBy) {
        if (order < 0) {
            throw new Error("Display order cannot be negative");
        }
        const updatedData = {
            ...this.data,
            displayOrder: order,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    markAsPopular(updatedBy) {
        const updatedData = {
            ...this.data,
            isPopular: true,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    unmarkAsPopular(updatedBy) {
        const updatedData = {
            ...this.data,
            isPopular: false,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    markAsFeatured(updatedBy) {
        const updatedData = {
            ...this.data,
            isFeatured: true,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    unmarkAsFeatured(updatedBy) {
        const updatedData = {
            ...this.data,
            isFeatured: false,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new EventCategory(updatedData);
    }
    updateStatistics(statistics) {
        const updatedStatistics = { ...this.data.statistics, ...statistics };
        const updatedData = {
            ...this.data,
            statistics: updatedStatistics,
            updatedAt: new Date(),
        };
        return new EventCategory(updatedData);
    }
    // Analytics and reporting
    getAverageEventsPerMonth() {
        if (this.data.statistics.totalEvents === 0)
            return 0;
        const monthsActive = Math.max(1, Math.floor((new Date().getTime() - this.data.createdAt.getTime()) /
            (1000 * 60 * 60 * 24 * 30)));
        return this.data.statistics.totalEvents / monthsActive;
    }
    getCompletionRate() {
        if (this.data.statistics.totalEvents === 0)
            return 0;
        return ((this.data.statistics.completedEvents /
            this.data.statistics.totalEvents) *
            100);
    }
    getAverageEnrollmentsPerEvent() {
        if (this.data.statistics.totalEvents === 0)
            return 0;
        return (this.data.statistics.totalEnrollments / this.data.statistics.totalEvents);
    }
    getCategorySummary() {
        return {
            id: this.data.id,
            name: this.data.name,
            description: this.data.description,
            code: this.data.code,
            color: this.data.color,
            isActive: this.data.isActive,
            isPopular: this.data.isPopular,
            isFeatured: this.data.isFeatured,
            displayOrder: this.data.displayOrder,
            totalEvents: this.data.statistics.totalEvents,
            activeEvents: this.data.statistics.activeEvents,
            completionRate: this.getCompletionRate(),
            averageEnrollmentsPerEvent: this.getAverageEnrollmentsPerEvent(),
            averageAttendance: this.data.statistics.averageAttendance,
            revenueGenerated: this.data.statistics.revenueGenerated,
            hasSubcategories: this.hasSubcategories(),
            subcategoryCount: this.data.subcategoryIds.length,
        };
    }
    getDetailedReport() {
        return {
            ...this.getCategorySummary(),
            settings: this.data.settings,
            restrictions: this.data.restrictions,
            statistics: this.data.statistics,
            keywords: this.data.keywords,
            parentCategoryId: this.data.parentCategoryId,
            subcategoryIds: this.data.subcategoryIds,
            emailTemplates: this.data.emailTemplates,
            icon: this.data.icon,
            imageUrl: this.data.imageUrl,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
            createdBy: this.data.createdBy,
            lastModifiedBy: this.data.lastModifiedBy,
            averageEventsPerMonth: this.getAverageEventsPerMonth(),
        };
    }
}
exports.EventCategory = EventCategory;
//# sourceMappingURL=EventCategory.js.map