/**
 * Event Category Management Use Case - Application Layer
 *
 * Handles all event category-related operations including CRUD, hierarchy management, and settings
 */
import { EventCategory } from "../../../domain/entities/events";
export interface EventCategoryFilters {
    name?: string;
    parentId?: string;
    isActive?: boolean;
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
}
export interface CategoryStatistics {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
    subcategories: number;
    eventsCount: number;
    avgEventsPerCategory: number;
}
export interface CategorySettingsValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface EventCategoryRepository {
    save(category: EventCategory): Promise<void>;
    findById(id: string): Promise<EventCategory | null>;
    findAll(filters?: EventCategoryFilters): Promise<EventCategory[]>;
    update(category: EventCategory): Promise<void>;
    delete(id: string): Promise<void>;
    findRootCategories(): Promise<EventCategory[]>;
    findByParentId(parentId: string): Promise<EventCategory[]>;
    findByName(name: string): Promise<EventCategory | null>;
    findByCreatedBy(createdBy: string): Promise<EventCategory[]>;
    findActive(): Promise<EventCategory[]>;
    findInactive(): Promise<EventCategory[]>;
    findCategoryPath(categoryId: string): Promise<EventCategory[]>;
    findDescendants(categoryId: string): Promise<EventCategory[]>;
    findCategoryHierarchy(): Promise<EventCategory[]>;
    getCategoryStatistics(categoryId?: string): Promise<CategoryStatistics>;
    getCategoryUsage(): Promise<{
        categoryId: string;
        categoryName: string;
        eventCount: number;
        lastUsed?: Date;
    }[]>;
}
export interface EventService {
    getEventCountByCategory(categoryId: string): Promise<number>;
    hasActiveEventsInCategory(categoryId: string): Promise<boolean>;
    moveEventsToCategory(fromCategoryId: string, toCategoryId: string): Promise<{
        success: boolean;
        movedCount: number;
        failedCount: number;
    }>;
}
export interface PermissionService {
    canManageCategory(userId: string, categoryId: string): Promise<boolean>;
    canCreateCategory(userId: string, parentCategoryId?: string): Promise<boolean>;
    canDeleteCategory(userId: string, categoryId: string): Promise<boolean>;
    getUserCategoryPermissions(userId: string): Promise<{
        canManageAll: boolean;
        managedCategoryIds: string[];
        readOnlyCategoryIds: string[];
    }>;
}
export interface ValidationService {
    validateCategoryName(name: string, parentId?: string): Promise<{
        isValid: boolean;
        reason?: string;
    }>;
    validateCategoryDeletion(categoryId: string): Promise<{
        canDelete: boolean;
        blockers: string[];
    }>;
    validateHierarchyChange(categoryId: string, newParentId?: string): Promise<{
        isValid: boolean;
        reason?: string;
    }>;
}
export interface CategoryCreationInput {
    name: string;
    description: string;
    code?: string;
    parentId?: string;
    color?: string;
    icon?: string;
    settings?: {
        requiresApproval?: boolean;
        allowsPublicEvents?: boolean;
        autoPublishEvents?: boolean;
        maxCapacityPerEvent?: number;
        defaultEventDuration?: number;
        allowedAreas?: string[];
    };
    restrictions?: {
        minimumAdvanceNotice?: number;
        maxEventsPerMonth?: number;
        requiresSpecialApproval?: boolean;
        allowedInstructorRoles?: string[];
    };
    emailTemplates?: {
        eventCreated?: string;
        eventUpdated?: string;
        eventCancelled?: string;
        eventPublished?: string;
    };
    createdBy?: string;
}
export interface CategoryUpdateInput {
    categoryId: string;
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    settings?: Partial<{
        requiresApproval: boolean;
        allowsPublicEvents: boolean;
        autoPublishEvents: boolean;
        maxCapacityPerEvent: number;
        defaultEventDuration: number;
        allowedAreas: string[];
    }>;
    restrictions?: Partial<{
        minimumAdvanceNotice: number;
        maxEventsPerMonth: number;
        requiresSpecialApproval: boolean;
        allowedInstructorRoles: string[];
    }>;
    emailTemplates?: Partial<{
        eventCreated: string;
        eventUpdated: string;
        eventCancelled: string;
        eventPublished: string;
    }>;
    updatedBy?: string;
}
export interface CategoryMoveInput {
    categoryId: string;
    newParentId?: string;
    updatedBy?: string;
}
export declare class EventCategoryManagement {
    private categoryRepository;
    private eventService;
    private permissionService;
    private validationService;
    constructor(categoryRepository: EventCategoryRepository, eventService: EventService, permissionService: PermissionService, validationService: ValidationService);
    /**
     * Create a new event category
     */
    createCategory(input: CategoryCreationInput): Promise<{
        success: boolean;
        categoryId?: string;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Update an existing category
     */
    updateCategory(input: CategoryUpdateInput): Promise<{
        success: boolean;
        message: string;
        warnings?: string[];
    }>;
    /**
     * Delete a category
     */
    deleteCategory(categoryId: string, deletedBy?: string, moveEventsTo?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Move category to different parent or make it root
     */
    moveCategory(input: CategoryMoveInput): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Activate or deactivate category
     */
    toggleCategoryStatus(categoryId: string, activate: boolean, updatedBy?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get category details
     */
    getCategory(categoryId: string): Promise<{
        success: boolean;
        category?: any;
        message: string;
    }>;
    /**
     * Get all categories with filters
     */
    getCategories(filters?: EventCategoryFilters): Promise<{
        success: boolean;
        categories?: any[];
        message: string;
    }>;
    /**
     * Get category hierarchy
     */
    getCategoryHierarchy(): Promise<{
        success: boolean;
        hierarchy?: any[];
        message: string;
    }>;
    /**
     * Get root categories only
     */
    getRootCategories(): Promise<{
        success: boolean;
        categories?: any[];
        message: string;
    }>;
    /**
     * Get child categories of a parent
     */
    getChildCategories(parentId: string): Promise<{
        success: boolean;
        categories?: any[];
        message: string;
    }>;
    /**
     * Get category path (breadcrumb)
     */
    getCategoryPath(categoryId: string): Promise<{
        success: boolean;
        path?: any[];
        message: string;
    }>;
    /**
     * Get category statistics
     */
    getCategoryStatistics(categoryId?: string): Promise<{
        success: boolean;
        statistics?: CategoryStatistics;
        message: string;
    }>;
    /**
     * Get category usage analytics
     */
    getCategoryUsage(): Promise<{
        success: boolean;
        usage?: any[];
        message: string;
    }>;
    /**
     * Validate category configuration
     */
    validateCategory(categoryId: string): Promise<{
        success: boolean;
        validation?: CategorySettingsValidation;
        message: string;
    }>;
    /**
     * Get user permissions for categories
     */
    getUserCategoryPermissions(userId: string): Promise<{
        success: boolean;
        permissions?: any;
        message: string;
    }>;
}
//# sourceMappingURL=EventCategoryManagement.d.ts.map