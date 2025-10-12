/**
 * Course Domain Entity - Clean Architecture Domain Layer
 *
 * Represents a course in the educational system with comprehensive business logic
 * for course management, enrollment, prerequisites, and career associations
 */
interface CourseData {
    id: string;
    name: string;
    description: string;
    duration: number;
    startDate: Date;
    endDate: Date;
    categoryId: string;
    organizerId: string;
    maxCapacity: number;
    currentEnrollments: number;
    audienceType: "CARRERA_ESPECIFICA" | "TODAS_CARRERAS" | "PUBLICO_GENERAL";
    requiresDocumentVerification: boolean;
    requiresMotivationLetter: boolean;
    isFree: boolean;
    price?: number;
    attendancePercentageForApproval: number;
    minimumGradeForApproval: number;
    status: "DRAFT" | "ACTIVE" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
    associatedCareers: string[];
    prerequisites: {
        requiredCourses: string[];
        minimumExperience?: string;
        requiredSkills: string[];
        educationLevel?: "SECONDARY" | "TECHNICAL" | "UNIVERSITY" | "POSTGRADUATE";
    };
    materials: {
        syllabus?: string;
        resources: Array<{
            type: "PDF" | "VIDEO" | "LINK" | "DOCUMENT";
            title: string;
            url: string;
            required: boolean;
        }>;
        bibliography?: string[];
    };
    schedule: {
        sessions: Array<{
            date: Date;
            startTime: string;
            endTime: string;
            topic: string;
            isRequired: boolean;
        }>;
        totalSessions: number;
        sessionDuration: number;
    };
    evaluation: {
        hasExam: boolean;
        examDate?: Date;
        hasProject: boolean;
        projectDeadline?: Date;
        certificationType: "PARTICIPATION" | "COMPLETION" | "ACHIEVEMENT";
        certificateTemplate?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastModifiedBy?: string;
}
export interface CourseStatistics {
    totalEnrollments: number;
    completionRate: number;
    averageGrade: number;
    attendanceRate: number;
    satisfactionRating?: number;
    dropoutRate: number;
    waitingListCount: number;
}
export interface CourseFilters {
    categoryId?: string;
    organizerId?: string;
    status?: string[];
    audienceType?: string;
    isFree?: boolean;
    startDateFrom?: Date;
    startDateTo?: Date;
    priceRange?: {
        min: number;
        max: number;
    };
    hasAvailableSpots?: boolean;
    requiredSkills?: string[];
}
export declare class Course {
    private data;
    constructor(courseData: CourseData);
    /**
     * Create a new course with validation
     */
    static create(name: string, description: string, duration: number, startDate: Date, endDate: Date, categoryId: string, organizerId: string, maxCapacity: number, audienceType?: CourseData["audienceType"], createdBy?: string): Course;
    /**
     * Create Course from existing data (e.g., from database)
     */
    static fromData(courseData: any): Course;
    /**
     * Validate course data integrity
     */
    private validateData;
    getId(): string;
    getName(): string;
    getDescription(): string;
    getDuration(): number;
    getStartDate(): Date;
    getEndDate(): Date;
    getCategoryId(): string;
    getOrganizerId(): string;
    getMaxCapacity(): number;
    getCurrentEnrollments(): number;
    getAudienceType(): CourseData["audienceType"];
    getStatus(): CourseData["status"];
    isFree(): boolean;
    getPrice(): number | undefined;
    getAssociatedCareers(): string[];
    getAttendanceRequirement(): number;
    getMinimumGrade(): number;
    requiresDocumentVerification(): boolean;
    requiresMotivationLetter(): boolean;
    getPrerequisites(): CourseData["prerequisites"];
    /**
     * Check if course has available spots
     */
    hasAvailableSpots(): boolean;
    /**
     * Get available spots count
     */
    getAvailableSpots(): number;
    /**
     * Check if course is in enrollment period
     */
    isInEnrollmentPeriod(): boolean;
    /**
     * Check if course has started
     */
    hasStarted(): boolean;
    /**
     * Check if course has ended
     */
    hasEnded(): boolean;
    /**
     * Check if user meets prerequisites
     */
    meetsPrerequisites(userCompletedCourses: string[], userSkills: string[]): {
        meets: boolean;
        missing: {
            courses: string[];
            skills: string[];
        };
    };
    /**
     * Check if user is eligible for enrollment based on career
     */
    isEligibleForCareer(userCareerIds: string[]): boolean;
    /**
     * Update course basic information
     */
    updateBasicInfo(name?: string, description?: string, duration?: number, updatedBy?: string): Course;
    /**
     * Update course dates
     */
    updateDates(startDate?: Date, endDate?: Date, updatedBy?: string): Course;
    /**
     * Update course capacity
     */
    updateCapacity(newCapacity: number, updatedBy?: string): Course;
    /**
     * Update pricing information
     */
    updatePricing(isFree: boolean, price?: number, updatedBy?: string): Course;
    /**
     * Update approval criteria
     */
    updateApprovalCriteria(attendancePercentage?: number, minimumGrade?: number, updatedBy?: string): Course;
    /**
     * Update course requirements
     */
    updateRequirements(requiresDocumentVerification?: boolean, requiresMotivationLetter?: boolean, updatedBy?: string): Course;
    /**
     * Add career association
     */
    addCareerAssociation(careerId: string, updatedBy?: string): Course;
    /**
     * Remove career association
     */
    removeCareerAssociation(careerId: string, updatedBy?: string): Course;
    /**
     * Update audience type
     */
    updateAudienceType(audienceType: CourseData["audienceType"], updatedBy?: string): Course;
    /**
     * Add prerequisite course
     */
    addPrerequisiteCourse(courseId: string, updatedBy?: string): Course;
    /**
     * Remove prerequisite course
     */
    removePrerequisiteCourse(courseId: string, updatedBy?: string): Course;
    /**
     * Update required skills
     */
    updateRequiredSkills(skills: string[], updatedBy?: string): Course;
    /**
     * Publish course (make it active)
     */
    publish(publishedBy?: string): Course;
    /**
     * Start course
     */
    start(startedBy?: string): Course;
    /**
     * Complete course
     */
    complete(completedBy?: string): Course;
    /**
     * Cancel course
     */
    cancel(reason: string, cancelledBy?: string): Course;
    /**
     * Archive course
     */
    archive(archivedBy?: string): Course;
    /**
     * Increment enrollment count
     */
    incrementEnrollments(updatedBy?: string): Course;
    /**
     * Decrement enrollment count
     */
    decrementEnrollments(updatedBy?: string): Course;
    /**
     * Calculate course progress percentage
     */
    calculateProgress(): number;
    /**
     * Get course enrollment rate
     */
    getEnrollmentRate(): number;
    /**
     * Check if student passes the course based on criteria
     */
    checkPassingCriteria(attendancePercentage: number, finalGrade: number): {
        passes: boolean;
        attendanceMet: boolean;
        gradeMet: boolean;
    };
    /**
     * Generate course summary for reports
     */
    generateSummary(): {
        id: string;
        name: string;
        description: string;
        duration: number;
        schedule: {
            startDate: Date;
            endDate: Date;
        };
        capacity: {
            max: number;
            current: number;
            available: number;
            enrollmentRate: number;
        };
        requirements: {
            documentVerification: boolean;
            motivationLetter: boolean;
            prerequisites: number;
        };
        approval: {
            attendanceRequired: number;
            minimumGrade: number;
        };
        pricing: {
            isFree: boolean;
            price?: number;
        };
        status: CourseData["status"];
        audienceType: CourseData["audienceType"];
        associatedCareers: number;
        progress: number;
    };
    /**
     * Convert to database format
     */
    toDatabaseFormat(): any;
}
export {};
//# sourceMappingURL=Course.d.ts.map