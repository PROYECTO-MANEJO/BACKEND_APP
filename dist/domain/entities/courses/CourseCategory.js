"use strict";
/**
 * CourseCategory Domain Entity - Clean Architecture Domain Layer
 *
 * Represents course categories with hierarchical organization, settings management,
 * and comprehensive business logic for course classification and organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCategory = void 0;
class CourseCategory {
    constructor(categoryData) {
        this.data = { ...categoryData };
        this.validateData();
    }
    /**
     * Create a new course category
     */
    static create(name, description, code, color, createdBy) {
        const now = new Date();
        const categoryData = {
            id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            description: description.trim(),
            code: code?.trim(),
            color,
            level: 0,
            path: `/${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
            settings: {
                allowSubcategories: true,
                requireApproval: false,
                defaultCapacity: 30,
                defaultDuration: 40,
                allowRegistration: true,
                autoPublishCourses: false,
                allowedInstructorRoles: ["INSTRUCTOR", "COORDINATOR", "ADMIN"],
            },
            restrictions: {
                maxCoursesPerMonth: 10,
                minimumAdvanceNotice: 7,
                maximumAdvanceNotice: 365,
                allowedDaysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                requiresSpecialApproval: false,
            },
            emailTemplates: {},
            statistics: {
                totalCourses: 0,
                activeCourses: 0,
                completedCourses: 0,
                totalEnrollments: 0,
            },
            isActive: true,
            isVisible: true,
            createdAt: now,
            updatedAt: now,
            createdBy,
        };
        return new CourseCategory(categoryData);
    }
    /**
     * Create CourseCategory from existing data (e.g., from database)
     */
    static fromData(categoryData) {
        // Map from database format (categoriaEvento table)
        const mappedData = {
            id: categoryData.id_cat,
            name: categoryData.nom_cat,
            description: categoryData.des_cat || "",
            code: categoryData.codigo_cat,
            color: categoryData.color_cat,
            parentCategoryId: categoryData.id_categoria_padre?.toString(),
            level: 0, // Will be calculated based on hierarchy
            path: `/${categoryData.nom_cat?.toLowerCase().replace(/\s+/g, "-") || ""}`,
            settings: {
                allowSubcategories: true,
                requireApproval: false,
                defaultCapacity: 30,
                defaultDuration: 40,
                allowRegistration: true,
                autoPublishCourses: false,
                allowedInstructorRoles: ["INSTRUCTOR", "COORDINATOR", "ADMIN"],
            },
            restrictions: {
                maxCoursesPerMonth: 10,
                minimumAdvanceNotice: 7,
                maximumAdvanceNotice: 365,
                allowedDaysOfWeek: [1, 2, 3, 4, 5],
                requiresSpecialApproval: false,
            },
            emailTemplates: {},
            statistics: {
                totalCourses: categoryData._count?.cursos || 0,
                activeCourses: 0,
                completedCourses: 0,
                totalEnrollments: 0,
            },
            isActive: categoryData.activo !== false,
            isVisible: true,
            createdAt: categoryData.createdAt || new Date(),
            updatedAt: categoryData.updatedAt || new Date(),
        };
        return new CourseCategory(mappedData);
    }
    /**
     * Validate category data integrity
     */
    validateData() {
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error("Category name is required");
        }
        if (this.data.name.length > 100) {
            throw new Error("Category name cannot exceed 100 characters");
        }
        if (this.data.description && this.data.description.length > 500) {
            throw new Error("Category description cannot exceed 500 characters");
        }
        if (this.data.level < 0) {
            throw new Error("Category level cannot be negative");
        }
        if (this.data.settings.defaultCapacity <= 0) {
            throw new Error("Default capacity must be positive");
        }
        if (this.data.settings.defaultDuration <= 0) {
            throw new Error("Default duration must be positive");
        }
        if (this.data.restrictions.maxCoursesPerMonth !== undefined &&
            this.data.restrictions.maxCoursesPerMonth <= 0) {
            throw new Error("Max courses per month must be positive");
        }
        if (this.data.restrictions.minimumAdvanceNotice !== undefined &&
            this.data.restrictions.minimumAdvanceNotice < 0) {
            throw new Error("Minimum advance notice cannot be negative");
        }
        if (this.data.restrictions.maximumAdvanceNotice !== undefined &&
            this.data.restrictions.maximumAdvanceNotice < 0) {
            throw new Error("Maximum advance notice cannot be negative");
        }
        if (this.data.restrictions.minimumAdvanceNotice !== undefined &&
            this.data.restrictions.maximumAdvanceNotice !== undefined &&
            this.data.restrictions.minimumAdvanceNotice >
                this.data.restrictions.maximumAdvanceNotice) {
            throw new Error("Minimum advance notice cannot be greater than maximum advance notice");
        }
    }
    // Getter methods
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
    getParentCategoryId() {
        return this.data.parentCategoryId;
    }
    getLevel() {
        return this.data.level;
    }
    getPath() {
        return this.data.path;
    }
    getSettings() {
        return { ...this.data.settings };
    }
    getRestrictions() {
        return { ...this.data.restrictions };
    }
    getStatistics() {
        return { ...this.data.statistics };
    }
    isActiveCategory() {
        return this.data.isActive;
    }
    isVisibleCategory() {
        return this.data.isVisible;
    }
    getCreatedAt() {
        return new Date(this.data.createdAt);
    }
    getUpdatedAt() {
        return new Date(this.data.updatedAt);
    }
    /**
     * Check if this category is a root category
     */
    isRootCategory() {
        return !this.data.parentCategoryId;
    }
    /**
     * Check if this category has a parent category
     */
    hasParentCategory() {
        return !!this.data.parentCategoryId;
    }
    /**
     * Check if subcategories are allowed
     */
    allowsSubcategories() {
        return this.data.settings.allowSubcategories;
    }
    /**
     * Check if courses require approval in this category
     */
    requiresCourseApproval() {
        return this.data.settings.requireApproval;
    }
    /**
     * Check if registration is allowed
     */
    allowsRegistration() {
        return this.data.settings.allowRegistration;
    }
    /**
     * Get default course capacity for this category
     */
    getDefaultCapacity() {
        return this.data.settings.defaultCapacity;
    }
    /**
     * Get default course duration for this category
     */
    getDefaultDuration() {
        return this.data.settings.defaultDuration;
    }
    /**
     * Check if a day of week is allowed for courses
     */
    isDayAllowed(dayOfWeek) {
        return this.data.restrictions.allowedDaysOfWeek.includes(dayOfWeek);
    }
    /**
     * Get allowed days of week
     */
    getAllowedDays() {
        return [...this.data.restrictions.allowedDaysOfWeek];
    }
    /**
     * Check if instructor role is allowed
     */
    isInstructorRoleAllowed(role) {
        return this.data.settings.allowedInstructorRoles.includes(role);
    }
    /**
     * Update basic category information
     */
    updateBasicInfo(name, description, code, color, updatedBy) {
        const updatedData = {
            ...this.data,
            name: name !== undefined ? name.trim() : this.data.name,
            description: description !== undefined ? description.trim() : this.data.description,
            code: code !== undefined ? code?.trim() : this.data.code,
            color: color !== undefined ? color : this.data.color,
            path: name !== undefined
                ? `${this.data.path.substring(0, this.data.path.lastIndexOf("/"))}/${name.trim().toLowerCase().replace(/\s+/g, "-")}`
                : this.data.path,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Update category settings
     */
    updateSettings(settings, updatedBy) {
        const updatedSettings = { ...this.data.settings, ...settings };
        // Validate updated settings
        if (updatedSettings.defaultCapacity <= 0) {
            throw new Error("Default capacity must be positive");
        }
        if (updatedSettings.defaultDuration <= 0) {
            throw new Error("Default duration must be positive");
        }
        const updatedData = {
            ...this.data,
            settings: updatedSettings,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Update category restrictions
     */
    updateRestrictions(restrictions, updatedBy) {
        const updatedRestrictions = { ...this.data.restrictions, ...restrictions };
        // Validate restrictions
        if (updatedRestrictions.minimumAdvanceNotice !== undefined &&
            updatedRestrictions.minimumAdvanceNotice < 0) {
            throw new Error("Minimum advance notice cannot be negative");
        }
        if (updatedRestrictions.maximumAdvanceNotice !== undefined &&
            updatedRestrictions.maximumAdvanceNotice < 0) {
            throw new Error("Maximum advance notice cannot be negative");
        }
        if (updatedRestrictions.minimumAdvanceNotice !== undefined &&
            updatedRestrictions.maximumAdvanceNotice !== undefined &&
            updatedRestrictions.minimumAdvanceNotice >
                updatedRestrictions.maximumAdvanceNotice) {
            throw new Error("Minimum advance notice cannot be greater than maximum advance notice");
        }
        if (updatedRestrictions.maxCoursesPerMonth !== undefined &&
            updatedRestrictions.maxCoursesPerMonth <= 0) {
            throw new Error("Max courses per month must be positive");
        }
        const updatedData = {
            ...this.data,
            restrictions: updatedRestrictions,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Update email templates
     */
    updateEmailTemplates(templates, updatedBy) {
        const updatedTemplates = { ...this.data.emailTemplates, ...templates };
        const updatedData = {
            ...this.data,
            emailTemplates: updatedTemplates,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Set parent category
     */
    setParentCategory(parentCategoryId, parentLevel = 0, parentPath = "", updatedBy) {
        const newLevel = parentCategoryId ? parentLevel + 1 : 0;
        const newPath = parentCategoryId
            ? `${parentPath}/${this.data.name.toLowerCase().replace(/\s+/g, "-")}`
            : `/${this.data.name.toLowerCase().replace(/\s+/g, "-")}`;
        const updatedData = {
            ...this.data,
            parentCategoryId,
            level: newLevel,
            path: newPath,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Activate category
     */
    activate(activatedBy) {
        const updatedData = {
            ...this.data,
            isActive: true,
            updatedAt: new Date(),
            lastModifiedBy: activatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Deactivate category
     */
    deactivate(deactivatedBy) {
        const updatedData = {
            ...this.data,
            isActive: false,
            updatedAt: new Date(),
            lastModifiedBy: deactivatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Show category (make visible)
     */
    show(shownBy) {
        const updatedData = {
            ...this.data,
            isVisible: true,
            updatedAt: new Date(),
            lastModifiedBy: shownBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Hide category (make invisible)
     */
    hide(hiddenBy) {
        const updatedData = {
            ...this.data,
            isVisible: false,
            updatedAt: new Date(),
            lastModifiedBy: hiddenBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Update course statistics
     */
    updateStatistics(statistics, updatedBy) {
        const updatedStats = { ...this.data.statistics, ...statistics };
        const updatedData = {
            ...this.data,
            statistics: updatedStats,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new CourseCategory(updatedData);
    }
    /**
     * Increment course count
     */
    incrementCourseCount(courseStatus = "ACTIVE", updatedBy) {
        const updatedStats = {
            ...this.data.statistics,
            totalCourses: this.data.statistics.totalCourses + 1,
            activeCourses: courseStatus === "ACTIVE"
                ? this.data.statistics.activeCourses + 1
                : this.data.statistics.activeCourses,
            completedCourses: courseStatus === "COMPLETED"
                ? this.data.statistics.completedCourses + 1
                : this.data.statistics.completedCourses,
        };
        return this.updateStatistics(updatedStats, updatedBy);
    }
    /**
     * Decrement course count
     */
    decrementCourseCount(courseStatus = "ACTIVE", updatedBy) {
        const updatedStats = {
            ...this.data.statistics,
            totalCourses: Math.max(0, this.data.statistics.totalCourses - 1),
            activeCourses: courseStatus === "ACTIVE"
                ? Math.max(0, this.data.statistics.activeCourses - 1)
                : this.data.statistics.activeCourses,
            completedCourses: courseStatus === "COMPLETED"
                ? Math.max(0, this.data.statistics.completedCourses - 1)
                : this.data.statistics.completedCourses,
        };
        return this.updateStatistics(updatedStats, updatedBy);
    }
    /**
     * Add enrollment to statistics
     */
    addEnrollment(updatedBy) {
        const updatedStats = {
            ...this.data.statistics,
            totalEnrollments: this.data.statistics.totalEnrollments + 1,
        };
        return this.updateStatistics(updatedStats, updatedBy);
    }
    /**
     * Remove enrollment from statistics
     */
    removeEnrollment(updatedBy) {
        const updatedStats = {
            ...this.data.statistics,
            totalEnrollments: Math.max(0, this.data.statistics.totalEnrollments - 1),
        };
        return this.updateStatistics(updatedStats, updatedBy);
    }
    /**
     * Calculate category utilization rate
     */
    calculateUtilizationRate() {
        if (this.data.statistics.totalCourses === 0) {
            return 0;
        }
        return ((this.data.statistics.activeCourses / this.data.statistics.totalCourses) *
            100);
    }
    /**
     * Calculate average enrollments per course
     */
    calculateAverageEnrollments() {
        if (this.data.statistics.totalCourses === 0) {
            return 0;
        }
        return (this.data.statistics.totalEnrollments / this.data.statistics.totalCourses);
    }
    /**
     * Check if category can accept new courses
     */
    canAcceptNewCourses(currentMonth = new Date()) {
        if (!this.data.isActive) {
            return { canAccept: false, reason: "Category is not active" };
        }
        if (!this.data.settings.allowRegistration) {
            return {
                canAccept: false,
                reason: "Registration is not allowed for this category",
            };
        }
        if (this.data.restrictions.maxCoursesPerMonth !== undefined) {
            const monthlyCoursesCount = this.data.statistics.activeCourses; // Simplified - should be filtered by month
            const remainingSlots = this.data.restrictions.maxCoursesPerMonth - monthlyCoursesCount;
            if (remainingSlots <= 0) {
                return { canAccept: false, reason: "Monthly course limit reached" };
            }
            return { canAccept: true, remainingSlots };
        }
        return { canAccept: true };
    }
    /**
     * Validate course against category rules
     */
    validateCourse(courseData) {
        const violations = [];
        // Check duration restrictions
        if (this.data.restrictions.minimumDuration !== undefined &&
            courseData.duration < this.data.restrictions.minimumDuration) {
            violations.push(`Course duration (${courseData.duration}h) is below minimum (${this.data.restrictions.minimumDuration}h)`);
        }
        if (this.data.restrictions.maximumDuration !== undefined &&
            courseData.duration > this.data.restrictions.maximumDuration) {
            violations.push(`Course duration (${courseData.duration}h) exceeds maximum (${this.data.restrictions.maximumDuration}h)`);
        }
        // Check capacity restrictions
        if (this.data.restrictions.maxCapacityPerCourse !== undefined &&
            courseData.capacity > this.data.restrictions.maxCapacityPerCourse) {
            violations.push(`Course capacity (${courseData.capacity}) exceeds maximum allowed (${this.data.restrictions.maxCapacityPerCourse})`);
        }
        // Check advance notice
        const daysDifference = Math.ceil((courseData.startDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24));
        if (this.data.restrictions.minimumAdvanceNotice !== undefined &&
            daysDifference < this.data.restrictions.minimumAdvanceNotice) {
            violations.push(`Course must be scheduled at least ${this.data.restrictions.minimumAdvanceNotice} days in advance`);
        }
        if (this.data.restrictions.maximumAdvanceNotice !== undefined &&
            daysDifference > this.data.restrictions.maximumAdvanceNotice) {
            violations.push(`Course cannot be scheduled more than ${this.data.restrictions.maximumAdvanceNotice} days in advance`);
        }
        // Check day of week
        const dayOfWeek = courseData.startDate.getDay();
        if (!this.isDayAllowed(dayOfWeek)) {
            const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            violations.push(`Courses cannot be scheduled on ${dayNames[dayOfWeek]} in this category`);
        }
        // Check instructor role
        if (courseData.instructorRole &&
            !this.isInstructorRoleAllowed(courseData.instructorRole)) {
            violations.push(`Instructor role '${courseData.instructorRole}' is not allowed in this category`);
        }
        return {
            isValid: violations.length === 0,
            violations,
        };
    }
    /**
     * Generate category performance report
     */
    generatePerformanceReport() {
        const canAccept = this.canAcceptNewCourses();
        return {
            category: {
                id: this.data.id,
                name: this.data.name,
                level: this.data.level,
            },
            statistics: this.data.statistics,
            performance: {
                utilizationRate: this.calculateUtilizationRate(),
                averageEnrollments: this.calculateAverageEnrollments(),
                completionRate: this.data.statistics.completionRate || 0,
            },
            configuration: {
                defaultCapacity: this.data.settings.defaultCapacity,
                defaultDuration: this.data.settings.defaultDuration,
                requiresApproval: this.data.settings.requireApproval,
                allowsRegistration: this.data.settings.allowRegistration,
            },
            restrictions: {
                maxCoursesPerMonth: this.data.restrictions.maxCoursesPerMonth,
                allowedDays: this.data.restrictions.allowedDaysOfWeek,
                requiresSpecialApproval: this.data.restrictions.requiresSpecialApproval,
            },
            status: {
                isActive: this.data.isActive,
                isVisible: this.data.isVisible,
                canAcceptCourses: canAccept.canAccept,
            },
        };
    }
    /**
     * Convert to database format
     */
    toDatabaseFormat() {
        return {
            id_cat: this.data.id,
            nom_cat: this.data.name,
            des_cat: this.data.description,
            codigo_cat: this.data.code,
            color_cat: this.data.color,
            id_categoria_padre: this.data.parentCategoryId,
            activo: this.data.isActive,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
        };
    }
    /**
     * Generate full category summary
     */
    generateSummary() {
        return {
            id: this.data.id,
            name: this.data.name,
            description: this.data.description,
            hierarchy: {
                level: this.data.level,
                path: this.data.path,
                hasParent: this.hasParentCategory(),
            },
            configuration: {
                allowsSubcategories: this.data.settings.allowSubcategories,
                requiresApproval: this.data.settings.requireApproval,
                allowsRegistration: this.data.settings.allowRegistration,
                defaultSettings: {
                    capacity: this.data.settings.defaultCapacity,
                    duration: this.data.settings.defaultDuration,
                },
            },
            statistics: this.data.statistics,
            performance: {
                utilizationRate: this.calculateUtilizationRate(),
                averageEnrollments: this.calculateAverageEnrollments(),
            },
            status: {
                isActive: this.data.isActive,
                isVisible: this.data.isVisible,
            },
            metadata: {
                createdAt: this.data.createdAt,
                updatedAt: this.data.updatedAt,
                createdBy: this.data.createdBy,
            },
        };
    }
}
exports.CourseCategory = CourseCategory;
//# sourceMappingURL=CourseCategory.js.map