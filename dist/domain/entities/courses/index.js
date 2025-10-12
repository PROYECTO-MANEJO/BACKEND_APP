"use strict";
/**
 * Courses Domain Layer - Index
 *
 * Clean Architecture Domain Layer for Courses System
 * Exports domain entities, value objects, and interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseDomainUtils = exports.CourseSchedulingError = exports.CoursePrerequisiteError = exports.CourseCategoryError = exports.CourseCapacityError = exports.CourseStateError = exports.CourseValidationError = exports.CourseDomainError = exports.COURSE_DOMAIN_EVENTS = exports.COURSE_DOMAIN_CONSTANTS = exports.CourseCategory = exports.Course = void 0;
// Domain Entities
var Course_1 = require("./Course");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return Course_1.Course; } });
var CourseCategory_1 = require("./CourseCategory");
Object.defineProperty(exports, "CourseCategory", { enumerable: true, get: function () { return CourseCategory_1.CourseCategory; } });
// Domain Constants
exports.COURSE_DOMAIN_CONSTANTS = {
    // Course Status Values
    COURSE_STATUS: {
        DRAFT: "DRAFT",
        ACTIVE: "ACTIVE",
        FULL: "FULL",
        IN_PROGRESS: "IN_PROGRESS",
        COMPLETED: "COMPLETED",
        CANCELLED: "CANCELLED",
        ARCHIVED: "ARCHIVED",
    },
    // Audience Types
    AUDIENCE_TYPE: {
        CAREER_SPECIFIC: "CARRERA_ESPECIFICA",
        ALL_CAREERS: "TODAS_CARRERAS",
        GENERAL_PUBLIC: "PUBLICO_GENERAL",
    },
    // Certificate Types
    CERTIFICATE_TYPE: {
        PARTICIPATION: "PARTICIPATION",
        COMPLETION: "COMPLETION",
        ACHIEVEMENT: "ACHIEVEMENT",
    },
    // Education Levels
    EDUCATION_LEVEL: {
        SECONDARY: "SECONDARY",
        TECHNICAL: "TECHNICAL",
        UNIVERSITY: "UNIVERSITY",
        POSTGRADUATE: "POSTGRADUATE",
    },
    // Default Values
    DEFAULTS: {
        COURSE: {
            MAX_CAPACITY: 30,
            DURATION: 40,
            ATTENDANCE_PERCENTAGE: 80,
            MINIMUM_GRADE: 7.0,
            ADVANCE_NOTICE_DAYS: 7,
            SESSION_DURATION: 60,
        },
        CATEGORY: {
            DEFAULT_CAPACITY: 30,
            DEFAULT_DURATION: 40,
            MAX_COURSES_PER_MONTH: 10,
            MIN_ADVANCE_NOTICE: 7,
            MAX_ADVANCE_NOTICE: 365,
            ALLOWED_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
        },
    },
    // Validation Limits
    LIMITS: {
        COURSE_NAME_MAX_LENGTH: 200,
        COURSE_DESCRIPTION_MAX_LENGTH: 500,
        CATEGORY_NAME_MAX_LENGTH: 100,
        CATEGORY_DESCRIPTION_MAX_LENGTH: 500,
        MIN_DURATION_HOURS: 1,
        MAX_DURATION_HOURS: 200,
        MIN_CAPACITY: 1,
        MAX_CAPACITY: 1000,
        MIN_GRADE: 0,
        MAX_GRADE: 10,
        MIN_ATTENDANCE_PERCENTAGE: 0,
        MAX_ATTENDANCE_PERCENTAGE: 100,
    },
};
// Domain Events (for future event sourcing implementation)
exports.COURSE_DOMAIN_EVENTS = {
    // Course Events
    COURSE_CREATED: "course.created",
    COURSE_UPDATED: "course.updated",
    COURSE_PUBLISHED: "course.published",
    COURSE_STARTED: "course.started",
    COURSE_COMPLETED: "course.completed",
    COURSE_CANCELLED: "course.cancelled",
    COURSE_ARCHIVED: "course.archived",
    COURSE_CAPACITY_UPDATED: "course.capacity.updated",
    COURSE_ENROLLMENT_ADDED: "course.enrollment.added",
    COURSE_ENROLLMENT_REMOVED: "course.enrollment.removed",
    // Category Events
    CATEGORY_CREATED: "category.created",
    CATEGORY_UPDATED: "category.updated",
    CATEGORY_ACTIVATED: "category.activated",
    CATEGORY_DEACTIVATED: "category.deactivated",
    CATEGORY_SETTINGS_UPDATED: "category.settings.updated",
    CATEGORY_RESTRICTIONS_UPDATED: "category.restrictions.updated",
    CATEGORY_HIERARCHY_CHANGED: "category.hierarchy.changed",
};
// Domain Error Types
class CourseDomainError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "CourseDomainError";
    }
}
exports.CourseDomainError = CourseDomainError;
class CourseValidationError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_VALIDATION_ERROR");
        this.name = "CourseValidationError";
    }
}
exports.CourseValidationError = CourseValidationError;
class CourseStateError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_STATE_ERROR");
        this.name = "CourseStateError";
    }
}
exports.CourseStateError = CourseStateError;
class CourseCapacityError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_CAPACITY_ERROR");
        this.name = "CourseCapacityError";
    }
}
exports.CourseCapacityError = CourseCapacityError;
class CourseCategoryError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_CATEGORY_ERROR");
        this.name = "CourseCategoryError";
    }
}
exports.CourseCategoryError = CourseCategoryError;
class CoursePrerequisiteError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_PREREQUISITE_ERROR");
        this.name = "CoursePrerequisiteError";
    }
}
exports.CoursePrerequisiteError = CoursePrerequisiteError;
class CourseSchedulingError extends CourseDomainError {
    constructor(message) {
        super(message, "COURSE_SCHEDULING_ERROR");
        this.name = "CourseSchedulingError";
    }
}
exports.CourseSchedulingError = CourseSchedulingError;
// Utility Functions
exports.CourseDomainUtils = {
    /**
     * Validate course name
     */
    validateCourseName(name) {
        if (!name || name.trim().length === 0) {
            return { isValid: false, error: "Course name is required" };
        }
        if (name.length > exports.COURSE_DOMAIN_CONSTANTS.LIMITS.COURSE_NAME_MAX_LENGTH) {
            return {
                isValid: false,
                error: `Course name cannot exceed ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.COURSE_NAME_MAX_LENGTH} characters`,
            };
        }
        return { isValid: true };
    },
    /**
     * Validate course description
     */
    validateCourseDescription(description) {
        if (!description || description.trim().length === 0) {
            return { isValid: false, error: "Course description is required" };
        }
        if (description.length >
            exports.COURSE_DOMAIN_CONSTANTS.LIMITS.COURSE_DESCRIPTION_MAX_LENGTH) {
            return {
                isValid: false,
                error: `Course description cannot exceed ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.COURSE_DESCRIPTION_MAX_LENGTH} characters`,
            };
        }
        return { isValid: true };
    },
    /**
     * Validate course duration
     */
    validateCourseDuration(duration) {
        if (duration < exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_DURATION_HOURS) {
            return {
                isValid: false,
                error: `Course duration must be at least ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_DURATION_HOURS} hour(s)`,
            };
        }
        if (duration > exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_DURATION_HOURS) {
            return {
                isValid: false,
                error: `Course duration cannot exceed ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_DURATION_HOURS} hours`,
            };
        }
        return { isValid: true };
    },
    /**
     * Validate course capacity
     */
    validateCourseCapacity(capacity) {
        if (capacity < exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_CAPACITY) {
            return {
                isValid: false,
                error: `Course capacity must be at least ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_CAPACITY}`,
            };
        }
        if (capacity > exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_CAPACITY) {
            return {
                isValid: false,
                error: `Course capacity cannot exceed ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_CAPACITY}`,
            };
        }
        return { isValid: true };
    },
    /**
     * Validate date range
     */
    validateDateRange(startDate, endDate) {
        if (startDate >= endDate) {
            return { isValid: false, error: "Start date must be before end date" };
        }
        const now = new Date();
        if (startDate < now) {
            return { isValid: false, error: "Start date cannot be in the past" };
        }
        return { isValid: true };
    },
    /**
     * Validate grade
     */
    validateGrade(grade) {
        if (grade < exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_GRADE ||
            grade > exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_GRADE) {
            return {
                isValid: false,
                error: `Grade must be between ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_GRADE} and ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_GRADE}`,
            };
        }
        return { isValid: true };
    },
    /**
     * Validate attendance percentage
     */
    validateAttendancePercentage(percentage) {
        if (percentage < exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_ATTENDANCE_PERCENTAGE ||
            percentage > exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_ATTENDANCE_PERCENTAGE) {
            return {
                isValid: false,
                error: `Attendance percentage must be between ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MIN_ATTENDANCE_PERCENTAGE}% and ${exports.COURSE_DOMAIN_CONSTANTS.LIMITS.MAX_ATTENDANCE_PERCENTAGE}%`,
            };
        }
        return { isValid: true };
    },
    /**
     * Calculate days between dates
     */
    calculateDaysBetween(startDate, endDate) {
        const timeDifference = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDifference / (1000 * 3600 * 24));
    },
    /**
     * Check if date is in allowed days of week
     */
    isDateInAllowedDays(date, allowedDays) {
        return allowedDays.includes(date.getDay());
    },
    /**
     * Generate course code
     */
    generateCourseCode(categoryCode) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        const prefix = categoryCode
            ? categoryCode.substring(0, 3).toUpperCase()
            : "CUR";
        return `${prefix}-${timestamp}-${random}`;
    },
    /**
     * Format duration for display
     */
    formatDuration(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} minutes`;
        }
        else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? "s" : ""}`;
        }
        else {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            if (remainingHours === 0) {
                return `${days} day${days !== 1 ? "s" : ""}`;
            }
            else {
                return `${days} day${days !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
            }
        }
    },
    /**
     * Calculate course intensity (hours per week)
     */
    calculateCourseIntensity(duration, startDate, endDate) {
        const totalDays = this.calculateDaysBetween(startDate, endDate);
        const weeks = totalDays / 7;
        return weeks > 0 ? Math.round((duration / weeks) * 100) / 100 : duration;
    },
    /**
     * Check if course is intensive
     */
    isCourseIntensive(duration, startDate, endDate) {
        const intensity = this.calculateCourseIntensity(duration, startDate, endDate);
        return intensity >= 20; // 20+ hours per week is considered intensive
    },
    /**
     * Generate category path
     */
    generateCategoryPath(name, parentPath) {
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Remove duplicate hyphens
            .trim();
        return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
    },
};
//# sourceMappingURL=index.js.map