/**
 * Course Category Management Use Case - Application Layer
 *
 * Simplified version that works with the actual CourseCategory domain entity
 */
import { CourseCategory, CourseCategoryStatistics, CourseCategoryFilters } from "../../../domain/entities/courses";
export interface CourseCategoryRepository {
    save(category: CourseCategory): Promise<void>;
    findById(id: string): Promise<CourseCategory | null>;
    findAll(filters?: CourseCategoryFilters): Promise<CourseCategory[]>;
    update(category: CourseCategory): Promise<void>;
    delete(id: string): Promise<void>;
    findByParent(parentId: string | null): Promise<CourseCategory[]>;
    findRootCategories(): Promise<CourseCategory[]>;
    findChildCategories(parentId: string): Promise<CourseCategory[]>;
    findByStatus(isActive: boolean): Promise<CourseCategory[]>;
    findByName(name: string): Promise<CourseCategory | null>;
    getCategoryStatistics(categoryId: string): Promise<CourseCategoryStatistics>;
    getCourseCount(categoryId: string): Promise<number>;
    getActiveCoursesCount(categoryId: string): Promise<number>;
}
export interface CategoryValidationService {
    validateCategoryName(name: string, parentId?: string): Promise<{
        isValid: boolean;
        message?: string;
    }>;
    validateParentCategory(parentId: string): Promise<{
        isValid: boolean;
        message?: string;
    }>;
}
export interface CourseService {
    getCoursesByCategory(categoryId: string): Promise<any[]>;
}
export interface NotificationService {
    notifyCategoryCreated(category: CourseCategory, recipients: string[]): Promise<void>;
    notifyCategoryUpdated(category: CourseCategory, changes: string[], recipients: string[]): Promise<void>;
    notifyCategoryDeleted(categoryName: string, affectedCourses: number, recipients: string[]): Promise<void>;
}
export interface PermissionService {
    canManageCategory(userId: string, categoryId?: string): Promise<boolean>;
    canCreateCategory(userId: string, parentId?: string): Promise<boolean>;
    canDeleteCategory(userId: string, categoryId: string): Promise<boolean>;
}
export interface CategoryCreationInput {
    name: string;
    description?: string;
    code?: string;
    color?: string;
    createdBy?: string;
}
export interface CategoryUpdateInput {
    categoryId: string;
    name?: string;
    description?: string;
    code?: string;
    color?: string;
    updatedBy?: string;
}
export interface CategoryFiltersInput {
    name?: string;
    isActive?: boolean;
    isVisible?: boolean;
}
export declare class CourseCategoryManagement {
    private categoryRepository;
    private validationService;
    private courseService;
    private notificationService;
    private permissionService;
    constructor(categoryRepository: CourseCategoryRepository, validationService: CategoryValidationService, courseService: CourseService, notificationService: NotificationService, permissionService: PermissionService);
    /**
     * Create a new category
     */
    createCategory(input: CategoryCreationInput, userId?: string): Promise<{
        success: boolean;
        categoryId?: string;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Update an existing category
     */
    updateCategory(input: CategoryUpdateInput, userId?: string): Promise<{
        success: boolean;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Activate a category
     */
    activateCategory(categoryId: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Deactivate a category
     */
    deactivateCategory(categoryId: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Delete a category
     */
    deleteCategory(categoryId: string, userId?: string): Promise<{
        success: boolean;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Get category by ID
     */
    getCategory(categoryId: string): Promise<{
        success: boolean;
        category?: CourseCategory;
        message: string;
    }>;
    /**
     * Get categories with filters
     */
    getCategories(filters?: CategoryFiltersInput): Promise<{
        success: boolean;
        categories?: CourseCategory[];
        totalCount?: number;
        message: string;
    }>;
    /**
     * Get root categories
     */
    getRootCategories(): Promise<{
        success: boolean;
        categories?: CourseCategory[];
        message: string;
    }>;
    /**
     * Get child categories
     */
    getChildCategories(parentId: string): Promise<{
        success: boolean;
        categories?: CourseCategory[];
        message: string;
    }>;
    /**
     * Get category statistics
     */
    getCategoryStatistics(categoryId: string): Promise<{
        success: boolean;
        statistics?: CourseCategoryStatistics;
        message: string;
    }>;
    /**
     * Update category statistics
     */
    updateCategoryStatistics(categoryId: string, statistics: Partial<CourseCategoryStatistics>, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Increment course count
     */
    incrementCourseCount(categoryId: string, courseStatus?: "ACTIVE" | "COMPLETED", userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Private helper methods
     */
    private buildChangesList;
}
//# sourceMappingURL=CourseCategoryManagement.d.ts.map