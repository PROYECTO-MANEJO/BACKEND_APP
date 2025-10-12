/**
 * CourseCategory Domain Entity - Clean Architecture Domain Layer
 *
 * Represents course categories with hierarchical organization, settings management,
 * and comprehensive business logic for course classification and organization
 */
interface CourseCategoryData {
    id: string;
    name: string;
    description: string;
    code?: string;
    color?: string;
    icon?: string;
    parentCategoryId?: string;
    level: number;
    path: string;
    settings: {
        allowSubcategories: boolean;
        requireApproval: boolean;
        defaultCapacity: number;
        defaultDuration: number;
        allowRegistration: boolean;
        autoPublishCourses: boolean;
        maxCoursesPerInstructor?: number;
        allowedInstructorRoles: string[];
    };
    restrictions: {
        maxCoursesPerMonth?: number;
        maxCapacityPerCourse?: number;
        minimumDuration?: number;
        maximumDuration?: number;
        minimumAdvanceNotice?: number;
        maximumAdvanceNotice?: number;
        allowedDaysOfWeek: number[];
        restrictedTimeSlots?: Array<{
            startTime: string;
            endTime: string;
            reason: string;
        }>;
        requiresSpecialApproval: boolean;
    };
    emailTemplates: {
        enrollment?: string;
        reminder?: string;
        completion?: string;
        cancellation?: string;
    };
    statistics: {
        totalCourses: number;
        activeCourses: number;
        completedCourses: number;
        totalEnrollments: number;
        averageRating?: number;
        completionRate?: number;
    };
    isActive: boolean;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastModifiedBy?: string;
}
export interface CourseCategoryStatistics {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    totalEnrollments: number;
    averageRating?: number;
    completionRate?: number;
    subcategoriesCount: number;
    averageCourseCapacity: number;
    averageCourseDuration: number;
    popularityRank?: number;
    monthlyGrowth?: number;
}
export interface CourseCategoryFilters {
    name?: string;
    parentId?: string;
    isActive?: boolean;
    isVisible?: boolean;
    level?: number;
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    hasActiveCourses?: boolean;
}
export declare class CourseCategory {
    private data;
    constructor(categoryData: CourseCategoryData);
    /**
     * Create a new course category
     */
    static create(name: string, description: string, code?: string, color?: string, createdBy?: string): CourseCategory;
    /**
     * Create CourseCategory from existing data (e.g., from database)
     */
    static fromData(categoryData: any): CourseCategory;
    /**
     * Validate category data integrity
     */
    private validateData;
    getId(): string;
    getName(): string;
    getDescription(): string;
    getCode(): string | undefined;
    getColor(): string | undefined;
    getParentCategoryId(): string | undefined;
    getLevel(): number;
    getPath(): string;
    getSettings(): CourseCategoryData["settings"];
    getRestrictions(): CourseCategoryData["restrictions"];
    getStatistics(): CourseCategoryData["statistics"];
    isActiveCategory(): boolean;
    isVisibleCategory(): boolean;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    /**
     * Check if this category is a root category
     */
    isRootCategory(): boolean;
    /**
     * Check if this category has a parent category
     */
    hasParentCategory(): boolean;
    /**
     * Check if subcategories are allowed
     */
    allowsSubcategories(): boolean;
    /**
     * Check if courses require approval in this category
     */
    requiresCourseApproval(): boolean;
    /**
     * Check if registration is allowed
     */
    allowsRegistration(): boolean;
    /**
     * Get default course capacity for this category
     */
    getDefaultCapacity(): number;
    /**
     * Get default course duration for this category
     */
    getDefaultDuration(): number;
    /**
     * Check if a day of week is allowed for courses
     */
    isDayAllowed(dayOfWeek: number): boolean;
    /**
     * Get allowed days of week
     */
    getAllowedDays(): number[];
    /**
     * Check if instructor role is allowed
     */
    isInstructorRoleAllowed(role: string): boolean;
    /**
     * Update basic category information
     */
    updateBasicInfo(name?: string, description?: string, code?: string, color?: string, updatedBy?: string): CourseCategory;
    /**
     * Update category settings
     */
    updateSettings(settings: Partial<CourseCategoryData["settings"]>, updatedBy?: string): CourseCategory;
    /**
     * Update category restrictions
     */
    updateRestrictions(restrictions: Partial<CourseCategoryData["restrictions"]>, updatedBy?: string): CourseCategory;
    /**
     * Update email templates
     */
    updateEmailTemplates(templates: Partial<CourseCategoryData["emailTemplates"]>, updatedBy?: string): CourseCategory;
    /**
     * Set parent category
     */
    setParentCategory(parentCategoryId: string | undefined, parentLevel?: number, parentPath?: string, updatedBy?: string): CourseCategory;
    /**
     * Activate category
     */
    activate(activatedBy?: string): CourseCategory;
    /**
     * Deactivate category
     */
    deactivate(deactivatedBy?: string): CourseCategory;
    /**
     * Show category (make visible)
     */
    show(shownBy?: string): CourseCategory;
    /**
     * Hide category (make invisible)
     */
    hide(hiddenBy?: string): CourseCategory;
    /**
     * Update course statistics
     */
    updateStatistics(statistics: Partial<CourseCategoryData["statistics"]>, updatedBy?: string): CourseCategory;
    /**
     * Increment course count
     */
    incrementCourseCount(courseStatus?: "ACTIVE" | "COMPLETED", updatedBy?: string): CourseCategory;
    /**
     * Decrement course count
     */
    decrementCourseCount(courseStatus?: "ACTIVE" | "COMPLETED", updatedBy?: string): CourseCategory;
    /**
     * Add enrollment to statistics
     */
    addEnrollment(updatedBy?: string): CourseCategory;
    /**
     * Remove enrollment from statistics
     */
    removeEnrollment(updatedBy?: string): CourseCategory;
    /**
     * Calculate category utilization rate
     */
    calculateUtilizationRate(): number;
    /**
     * Calculate average enrollments per course
     */
    calculateAverageEnrollments(): number;
    /**
     * Check if category can accept new courses
     */
    canAcceptNewCourses(currentMonth?: Date): {
        canAccept: boolean;
        reason?: string;
        remainingSlots?: number;
    };
    /**
     * Validate course against category rules
     */
    validateCourse(courseData: {
        duration: number;
        startDate: Date;
        capacity: number;
        instructorRole?: string;
    }): {
        isValid: boolean;
        violations: string[];
    };
    /**
     * Generate category performance report
     */
    generatePerformanceReport(): {
        category: {
            id: string;
            name: string;
            level: number;
        };
        statistics: CourseCategoryData["statistics"];
        performance: {
            utilizationRate: number;
            averageEnrollments: number;
            completionRate: number;
            growthRate?: number;
        };
        configuration: {
            defaultCapacity: number;
            defaultDuration: number;
            requiresApproval: boolean;
            allowsRegistration: boolean;
        };
        restrictions: {
            maxCoursesPerMonth?: number;
            allowedDays: number[];
            requiresSpecialApproval: boolean;
        };
        status: {
            isActive: boolean;
            isVisible: boolean;
            canAcceptCourses: boolean;
        };
    };
    /**
     * Convert to database format
     */
    toDatabaseFormat(): any;
    /**
     * Generate full category summary
     */
    generateSummary(): {
        id: string;
        name: string;
        description: string;
        hierarchy: {
            level: number;
            path: string;
            hasParent: boolean;
        };
        configuration: {
            allowsSubcategories: boolean;
            requiresApproval: boolean;
            allowsRegistration: boolean;
            defaultSettings: {
                capacity: number;
                duration: number;
            };
        };
        statistics: CourseCategoryData["statistics"];
        performance: {
            utilizationRate: number;
            averageEnrollments: number;
        };
        status: {
            isActive: boolean;
            isVisible: boolean;
        };
        metadata: {
            createdAt: Date;
            updatedAt: Date;
            createdBy?: string;
        };
    };
}
export {};
//# sourceMappingURL=CourseCategory.d.ts.map