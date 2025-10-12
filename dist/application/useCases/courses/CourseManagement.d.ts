/**
 * Course Management Use Case - Application Layer
 *
 * Handles all course-related operations including CRUD, lifecycle management,
 * enrollment processing, and prerequisite validation
 */
import { Course, CourseStatistics, CourseFilters } from "../../../domain/entities/courses";
export interface CourseRepository {
    save(course: Course): Promise<void>;
    findById(id: string): Promise<Course | null>;
    findAll(filters?: CourseFilters): Promise<Course[]>;
    update(course: Course): Promise<void>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: string): Promise<Course[]>;
    findByOrganizer(organizerId: string): Promise<Course[]>;
    findByStatus(status: string): Promise<Course[]>;
    findUpcoming(days?: number): Promise<Course[]>;
    findByCareer(careerIds: string[]): Promise<Course[]>;
    findAvailableForEnrollment(): Promise<Course[]>;
    findWithPrerequisites(prerequisiteIds: string[]): Promise<Course[]>;
    getCourseStatistics(courseId: string): Promise<CourseStatistics>;
    getEnrollmentCount(courseId: string): Promise<number>;
    findConflictingCourses(startDate: Date, endDate: Date, organizerId?: string): Promise<Course[]>;
}
export interface UserService {
    findById(userId: string): Promise<any>;
    getUserCareers(userId: string): Promise<string[]>;
    getUserCompletedCourses(userId: string): Promise<string[]>;
    getUserSkills(userId: string): Promise<string[]>;
    validateUserExists(userId: string): Promise<boolean>;
}
export interface CategoryService {
    findById(categoryId: string): Promise<any>;
    validateCategoryExists(categoryId: string): Promise<boolean>;
    getCategorySettings(categoryId: string): Promise<any>;
}
export interface NotificationService {
    notifyCourseCreated(course: Course, recipients: string[]): Promise<void>;
    notifyCourseUpdated(course: Course, changes: string[], recipients: string[]): Promise<void>;
    notifyCoursePublished(course: Course, recipients: string[]): Promise<void>;
    notifyCourseCancelled(course: Course, reason: string, recipients: string[]): Promise<void>;
    notifyEnrollmentOpened(course: Course, recipients: string[]): Promise<void>;
}
export interface EnrollmentService {
    enrollUser(courseId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unenrollUser(courseId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getEnrollments(courseId: string): Promise<any[]>;
    checkUserEnrollment(courseId: string, userId: string): Promise<boolean>;
}
export interface ValidationService {
    validateCourseName(name: string, categoryId?: string): Promise<{
        isValid: boolean;
        message?: string;
    }>;
    validateScheduling(startDate: Date, endDate: Date, organizerId: string): Promise<{
        isValid: boolean;
        conflicts?: any[];
    }>;
    validateCapacity(capacity: number, categoryId: string): Promise<{
        isValid: boolean;
        message?: string;
    }>;
    validatePrerequisites(prerequisiteIds: string[]): Promise<{
        isValid: boolean;
        message?: string;
    }>;
}
export interface CourseCreationInput {
    name: string;
    description: string;
    duration: number;
    startDate: Date;
    endDate: Date;
    categoryId: string;
    organizerId: string;
    maxCapacity: number;
    audienceType?: "CARRERA_ESPECIFICA" | "TODAS_CARRERAS" | "PUBLICO_GENERAL";
    requiresDocumentVerification?: boolean;
    requiresMotivationLetter?: boolean;
    isFree?: boolean;
    price?: number;
    attendancePercentageForApproval?: number;
    minimumGradeForApproval?: number;
    associatedCareers?: string[];
    prerequisites?: {
        requiredCourses?: string[];
        requiredSkills?: string[];
        minimumExperience?: string;
        educationLevel?: string;
    };
    createdBy?: string;
}
export interface CourseUpdateInput {
    courseId: string;
    name?: string;
    description?: string;
    duration?: number;
    startDate?: Date;
    endDate?: Date;
    maxCapacity?: number;
    isFree?: boolean;
    price?: number;
    attendancePercentageForApproval?: number;
    minimumGradeForApproval?: number;
    requiresDocumentVerification?: boolean;
    requiresMotivationLetter?: boolean;
    updatedBy?: string;
}
export interface CourseFiltersInput {
    categoryId?: string;
    organizerId?: string;
    status?: string[];
    audienceType?: string;
    isFree?: boolean;
    startDateFrom?: Date;
    startDateTo?: Date;
    hasAvailableSpots?: boolean;
    careerIds?: string[];
    page?: number;
    limit?: number;
}
export declare class CourseManagement {
    private courseRepository;
    private userService;
    private categoryService;
    private notificationService;
    private enrollmentService;
    private validationService;
    constructor(courseRepository: CourseRepository, userService: UserService, categoryService: CategoryService, notificationService: NotificationService, enrollmentService: EnrollmentService, validationService: ValidationService);
    /**
     * Create a new course
     */
    createCourse(input: CourseCreationInput): Promise<{
        success: boolean;
        courseId?: string;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Update an existing course
     */
    updateCourse(input: CourseUpdateInput): Promise<{
        success: boolean;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Delete/Cancel a course
     */
    deleteCourse(courseId: string, reason: string, deletedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get course by ID
     */
    getCourse(courseId: string): Promise<{
        success: boolean;
        course?: Course;
        message: string;
    }>;
    /**
     * Get courses with filters
     */
    getCourses(filters?: CourseFiltersInput): Promise<{
        success: boolean;
        courses?: Course[];
        totalCount?: number;
        message: string;
    }>;
    /**
     * Publish a course (make it active for enrollment)
     */
    publishCourse(courseId: string, publishedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Start a course (transition to in-progress)
     */
    startCourse(courseId: string, startedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Complete a course
     */
    completeCourse(courseId: string, completedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Check if user is eligible for course enrollment
     */
    checkEnrollmentEligibility(courseId: string, userId: string): Promise<{
        eligible: boolean;
        reasons: string[];
        course?: Course;
    }>;
    /**
     * Get course statistics
     */
    getCourseStatistics(courseId: string): Promise<{
        success: boolean;
        statistics?: CourseStatistics;
        message: string;
    }>;
    /**
     * Find courses by organizer
     */
    getCoursesByOrganizer(organizerId: string): Promise<{
        success: boolean;
        courses?: Course[];
        message: string;
    }>;
    /**
     * Get upcoming courses
     */
    getUpcomingCourses(days?: number): Promise<{
        success: boolean;
        courses?: Course[];
        message: string;
    }>;
    /**
     * Private helper methods
     */
    private buildChangesList;
}
//# sourceMappingURL=CourseManagement.d.ts.map