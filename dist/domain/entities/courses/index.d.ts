/**
 * Courses Domain Layer - Index
 *
 * Clean Architecture Domain Layer for Courses System
 * Exports domain entities, value objects, and interfaces
 */
export { Course } from "./Course";
export { CourseCategory } from "./CourseCategory";
export type { CourseStatistics, CourseFilters } from "./Course";
export type { CourseCategoryStatistics, CourseCategoryFilters, } from "./CourseCategory";
export declare const COURSE_DOMAIN_CONSTANTS: {
    readonly COURSE_STATUS: {
        readonly DRAFT: "DRAFT";
        readonly ACTIVE: "ACTIVE";
        readonly FULL: "FULL";
        readonly IN_PROGRESS: "IN_PROGRESS";
        readonly COMPLETED: "COMPLETED";
        readonly CANCELLED: "CANCELLED";
        readonly ARCHIVED: "ARCHIVED";
    };
    readonly AUDIENCE_TYPE: {
        readonly CAREER_SPECIFIC: "CARRERA_ESPECIFICA";
        readonly ALL_CAREERS: "TODAS_CARRERAS";
        readonly GENERAL_PUBLIC: "PUBLICO_GENERAL";
    };
    readonly CERTIFICATE_TYPE: {
        readonly PARTICIPATION: "PARTICIPATION";
        readonly COMPLETION: "COMPLETION";
        readonly ACHIEVEMENT: "ACHIEVEMENT";
    };
    readonly EDUCATION_LEVEL: {
        readonly SECONDARY: "SECONDARY";
        readonly TECHNICAL: "TECHNICAL";
        readonly UNIVERSITY: "UNIVERSITY";
        readonly POSTGRADUATE: "POSTGRADUATE";
    };
    readonly DEFAULTS: {
        readonly COURSE: {
            readonly MAX_CAPACITY: 30;
            readonly DURATION: 40;
            readonly ATTENDANCE_PERCENTAGE: 80;
            readonly MINIMUM_GRADE: 7;
            readonly ADVANCE_NOTICE_DAYS: 7;
            readonly SESSION_DURATION: 60;
        };
        readonly CATEGORY: {
            readonly DEFAULT_CAPACITY: 30;
            readonly DEFAULT_DURATION: 40;
            readonly MAX_COURSES_PER_MONTH: 10;
            readonly MIN_ADVANCE_NOTICE: 7;
            readonly MAX_ADVANCE_NOTICE: 365;
            readonly ALLOWED_DAYS: readonly [1, 2, 3, 4, 5];
        };
    };
    readonly LIMITS: {
        readonly COURSE_NAME_MAX_LENGTH: 200;
        readonly COURSE_DESCRIPTION_MAX_LENGTH: 500;
        readonly CATEGORY_NAME_MAX_LENGTH: 100;
        readonly CATEGORY_DESCRIPTION_MAX_LENGTH: 500;
        readonly MIN_DURATION_HOURS: 1;
        readonly MAX_DURATION_HOURS: 200;
        readonly MIN_CAPACITY: 1;
        readonly MAX_CAPACITY: 1000;
        readonly MIN_GRADE: 0;
        readonly MAX_GRADE: 10;
        readonly MIN_ATTENDANCE_PERCENTAGE: 0;
        readonly MAX_ATTENDANCE_PERCENTAGE: 100;
    };
};
export declare const COURSE_DOMAIN_EVENTS: {
    readonly COURSE_CREATED: "course.created";
    readonly COURSE_UPDATED: "course.updated";
    readonly COURSE_PUBLISHED: "course.published";
    readonly COURSE_STARTED: "course.started";
    readonly COURSE_COMPLETED: "course.completed";
    readonly COURSE_CANCELLED: "course.cancelled";
    readonly COURSE_ARCHIVED: "course.archived";
    readonly COURSE_CAPACITY_UPDATED: "course.capacity.updated";
    readonly COURSE_ENROLLMENT_ADDED: "course.enrollment.added";
    readonly COURSE_ENROLLMENT_REMOVED: "course.enrollment.removed";
    readonly CATEGORY_CREATED: "category.created";
    readonly CATEGORY_UPDATED: "category.updated";
    readonly CATEGORY_ACTIVATED: "category.activated";
    readonly CATEGORY_DEACTIVATED: "category.deactivated";
    readonly CATEGORY_SETTINGS_UPDATED: "category.settings.updated";
    readonly CATEGORY_RESTRICTIONS_UPDATED: "category.restrictions.updated";
    readonly CATEGORY_HIERARCHY_CHANGED: "category.hierarchy.changed";
};
export declare class CourseDomainError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class CourseValidationError extends CourseDomainError {
    constructor(message: string);
}
export declare class CourseStateError extends CourseDomainError {
    constructor(message: string);
}
export declare class CourseCapacityError extends CourseDomainError {
    constructor(message: string);
}
export declare class CourseCategoryError extends CourseDomainError {
    constructor(message: string);
}
export declare class CoursePrerequisiteError extends CourseDomainError {
    constructor(message: string);
}
export declare class CourseSchedulingError extends CourseDomainError {
    constructor(message: string);
}
export declare const CourseDomainUtils: {
    /**
     * Validate course name
     */
    validateCourseName(name: string): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate course description
     */
    validateCourseDescription(description: string): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate course duration
     */
    validateCourseDuration(duration: number): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate course capacity
     */
    validateCourseCapacity(capacity: number): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate date range
     */
    validateDateRange(startDate: Date, endDate: Date): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate grade
     */
    validateGrade(grade: number): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Validate attendance percentage
     */
    validateAttendancePercentage(percentage: number): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Calculate days between dates
     */
    calculateDaysBetween(startDate: Date, endDate: Date): number;
    /**
     * Check if date is in allowed days of week
     */
    isDateInAllowedDays(date: Date, allowedDays: number[]): boolean;
    /**
     * Generate course code
     */
    generateCourseCode(categoryCode?: string): string;
    /**
     * Format duration for display
     */
    formatDuration(hours: number): string;
    /**
     * Calculate course intensity (hours per week)
     */
    calculateCourseIntensity(duration: number, startDate: Date, endDate: Date): number;
    /**
     * Check if course is intensive
     */
    isCourseIntensive(duration: number, startDate: Date, endDate: Date): boolean;
    /**
     * Generate category path
     */
    generateCategoryPath(name: string, parentPath?: string): string;
};
//# sourceMappingURL=index.d.ts.map