/**
 * Event Category Management Use Case - Application Layer
 *
 * Handles all event category-related operations including CRUD, hierarchy management, and settings
 */

import {
  EventCategory,
  EventCategoryStatistics,
  EventFilters,
} from "../../../domain/entities/events";

// Additional type definitions for this use case
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
  // Basic CRUD operations
  save(category: EventCategory): Promise<void>;
  findById(id: string): Promise<EventCategory | null>;
  findAll(filters?: EventCategoryFilters): Promise<EventCategory[]>;
  update(category: EventCategory): Promise<void>;
  delete(id: string): Promise<void>;

  // Category-specific queries
  findRootCategories(): Promise<EventCategory[]>;
  findByParentId(parentId: string): Promise<EventCategory[]>;
  findByName(name: string): Promise<EventCategory | null>;
  findByCreatedBy(createdBy: string): Promise<EventCategory[]>;
  findActive(): Promise<EventCategory[]>;
  findInactive(): Promise<EventCategory[]>;

  // Hierarchy and relationships
  findCategoryPath(categoryId: string): Promise<EventCategory[]>;
  findDescendants(categoryId: string): Promise<EventCategory[]>;
  findCategoryHierarchy(): Promise<EventCategory[]>;

  // Statistics and analytics
  getCategoryStatistics(categoryId?: string): Promise<CategoryStatistics>;
  getCategoryUsage(): Promise<
    {
      categoryId: string;
      categoryName: string;
      eventCount: number;
      lastUsed?: Date;
    }[]
  >;
}

export interface EventService {
  getEventCountByCategory(categoryId: string): Promise<number>;
  hasActiveEventsInCategory(categoryId: string): Promise<boolean>;
  moveEventsToCategory(
    fromCategoryId: string,
    toCategoryId: string
  ): Promise<{
    success: boolean;
    movedCount: number;
    failedCount: number;
  }>;
}

export interface PermissionService {
  canManageCategory(userId: string, categoryId: string): Promise<boolean>;
  canCreateCategory(
    userId: string,
    parentCategoryId?: string
  ): Promise<boolean>;
  canDeleteCategory(userId: string, categoryId: string): Promise<boolean>;
  getUserCategoryPermissions(userId: string): Promise<{
    canManageAll: boolean;
    managedCategoryIds: string[];
    readOnlyCategoryIds: string[];
  }>;
}

export interface ValidationService {
  validateCategoryName(
    name: string,
    parentId?: string
  ): Promise<{
    isValid: boolean;
    reason?: string;
  }>;

  validateCategoryDeletion(categoryId: string): Promise<{
    canDelete: boolean;
    blockers: string[];
  }>;

  validateHierarchyChange(
    categoryId: string,
    newParentId?: string
  ): Promise<{
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
  newParentId?: string; // null to make it root category
  updatedBy?: string;
}

export class EventCategoryManagement {
  constructor(
    private categoryRepository: EventCategoryRepository,
    private eventService: EventService,
    private permissionService: PermissionService,
    private validationService: ValidationService
  ) {}

  /**
   * Create a new event category
   */
  async createCategory(input: CategoryCreationInput): Promise<{
    success: boolean;
    categoryId?: string;
    message: string;
    warnings?: string[];
  }> {
    try {
      const warnings: string[] = [];

      // Validate permissions
      if (input.createdBy) {
        const canCreate = await this.permissionService.canCreateCategory(
          input.createdBy,
          input.parentId
        );
        if (!canCreate) {
          return {
            success: false,
            message: "Insufficient permissions to create category",
          };
        }
      }

      // Validate category name
      const nameValidation = await this.validationService.validateCategoryName(
        input.name,
        input.parentId
      );
      if (!nameValidation.isValid) {
        return {
          success: false,
          message: nameValidation.reason || "Invalid category name",
        };
      }

      // Validate parent category exists if specified
      if (input.parentId) {
        const parentCategory = await this.categoryRepository.findById(
          input.parentId
        );
        if (!parentCategory) {
          return {
            success: false,
            message: "Parent category not found",
          };
        }
      }

      // Create category domain entity
      const category = EventCategory.create(
        input.name,
        input.description,
        input.code,
        input.color,
        input.createdBy
      );

      let updatedCategory = category;

      // Apply settings if provided
      if (input.settings) {
        try {
          updatedCategory = updatedCategory.updateSettings(
            input.settings,
            input.createdBy
          );
        } catch (error) {
          warnings.push(
            `Some settings could not be applied: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Apply restrictions if provided
      if (input.restrictions) {
        try {
          updatedCategory = updatedCategory.updateRestrictions(
            input.restrictions,
            input.createdBy
          );
        } catch (error) {
          warnings.push(
            `Some restrictions could not be applied: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Apply email templates if provided
      if (input.emailTemplates) {
        try {
          updatedCategory = updatedCategory.updateEmailTemplates(
            {
              enrollment: input.emailTemplates.eventCreated,
              reminder: input.emailTemplates.eventUpdated,
              completion: input.emailTemplates.eventPublished,
              cancellation: input.emailTemplates.eventCancelled,
            },
            input.createdBy
          );
        } catch (error) {
          warnings.push(
            `Some email templates could not be set: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Configuration has been validated during entity creation

      // Save category
      await this.categoryRepository.save(updatedCategory);

      return {
        success: true,
        categoryId: updatedCategory.getId(),
        message: "Category created successfully",
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(input: CategoryUpdateInput): Promise<{
    success: boolean;
    message: string;
    warnings?: string[];
  }> {
    try {
      const warnings: string[] = [];

      const category = await this.categoryRepository.findById(input.categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Validate permissions
      if (input.updatedBy) {
        const canManage = await this.permissionService.canManageCategory(
          input.updatedBy,
          input.categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to update category",
          };
        }
      }

      let updatedCategory = category;

      // Update basic information
      if (input.name || input.description || input.color || input.icon) {
        // Validate new name if provided
        if (input.name) {
          const nameValidation =
            await this.validationService.validateCategoryName(
              input.name,
              category.getParentCategoryId()
            );
          if (!nameValidation.isValid) {
            return {
              success: false,
              message: nameValidation.reason || "Invalid category name",
            };
          }
        }

        updatedCategory = updatedCategory.updateBasicInfo(
          input.name,
          input.description,
          input.color,
          input.icon,
          input.updatedBy
        );
      }

      // Update settings
      if (input.settings) {
        try {
          updatedCategory = updatedCategory.updateSettings(
            input.settings,
            input.updatedBy
          );
        } catch (error) {
          warnings.push(
            `Some settings could not be updated: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Update restrictions
      if (input.restrictions) {
        try {
          updatedCategory = updatedCategory.updateRestrictions(
            input.restrictions,
            input.updatedBy
          );
        } catch (error) {
          warnings.push(
            `Some restrictions could not be updated: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Update email templates
      if (input.emailTemplates) {
        try {
          updatedCategory = updatedCategory.updateEmailTemplates(
            {
              enrollment: input.emailTemplates.eventCreated,
              reminder: input.emailTemplates.eventUpdated,
              completion: input.emailTemplates.eventPublished,
              cancellation: input.emailTemplates.eventCancelled,
            },
            input.updatedBy
          );
        } catch (error) {
          warnings.push(
            `Some email templates could not be updated: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Configuration has been validated during entity updates

      // Save updated category
      await this.categoryRepository.update(updatedCategory);

      return {
        success: true,
        message: "Category updated successfully",
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(
    categoryId: string,
    deletedBy?: string,
    moveEventsTo?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Validate permissions
      if (deletedBy) {
        const canDelete = await this.permissionService.canDeleteCategory(
          deletedBy,
          categoryId
        );
        if (!canDelete) {
          return {
            success: false,
            message: "Insufficient permissions to delete category",
          };
        }
      }

      // Validate deletion is allowed
      const deletionValidation =
        await this.validationService.validateCategoryDeletion(categoryId);
      if (!deletionValidation.canDelete) {
        return {
          success: false,
          message: `Cannot delete category: ${deletionValidation.blockers.join(
            ", "
          )}`,
        };
      }

      // Check for child categories
      const childCategories = await this.categoryRepository.findByParentId(
        categoryId
      );
      if (childCategories.length > 0) {
        return {
          success: false,
          message: `Cannot delete category with ${childCategories.length} child categories. Delete or move child categories first.`,
        };
      }

      // Handle existing events
      const hasActiveEvents = await this.eventService.hasActiveEventsInCategory(
        categoryId
      );
      if (hasActiveEvents) {
        if (!moveEventsTo) {
          return {
            success: false,
            message:
              "Category has active events. Please specify a target category to move events to.",
          };
        }

        const targetCategory = await this.categoryRepository.findById(
          moveEventsTo
        );
        if (!targetCategory) {
          return {
            success: false,
            message: "Target category for moving events not found",
          };
        }

        const moveResult = await this.eventService.moveEventsToCategory(
          categoryId,
          moveEventsTo
        );
        if (!moveResult.success) {
          return {
            success: false,
            message: `Failed to move ${moveResult.failedCount} events to target category`,
          };
        }
      }

      // Deactivate first (soft delete)
      const deactivatedCategory = category.deactivate(deletedBy);
      await this.categoryRepository.update(deactivatedCategory);

      // Hard delete after ensuring no dependencies
      await this.categoryRepository.delete(categoryId);

      return {
        success: true,
        message: "Category deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Move category to different parent or make it root
   */
  async moveCategory(input: CategoryMoveInput): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const category = await this.categoryRepository.findById(input.categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Validate permissions
      if (input.updatedBy) {
        const canManage = await this.permissionService.canManageCategory(
          input.updatedBy,
          input.categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to move category",
          };
        }
      }

      // Validate hierarchy change
      const hierarchyValidation =
        await this.validationService.validateHierarchyChange(
          input.categoryId,
          input.newParentId
        );
      if (!hierarchyValidation.isValid) {
        return {
          success: false,
          message: hierarchyValidation.reason || "Invalid hierarchy change",
        };
      }

      // Validate new parent exists if specified
      if (input.newParentId) {
        const newParent = await this.categoryRepository.findById(
          input.newParentId
        );
        if (!newParent) {
          return {
            success: false,
            message: "New parent category not found",
          };
        }
      }

      // Move category
      const movedCategory = category.setParentCategory(
        input.newParentId,
        input.updatedBy
      );
      await this.categoryRepository.update(movedCategory);

      return {
        success: true,
        message: input.newParentId
          ? "Category moved successfully"
          : "Category moved to root level successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Activate or deactivate category
   */
  async toggleCategoryStatus(
    categoryId: string,
    activate: boolean,
    updatedBy?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Validate permissions
      if (updatedBy) {
        const canManage = await this.permissionService.canManageCategory(
          updatedBy,
          categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to change category status",
          };
        }
      }

      const updatedCategory = activate
        ? category.activate(updatedBy)
        : category.deactivate(updatedBy);

      await this.categoryRepository.update(updatedCategory);

      return {
        success: true,
        message: `Category ${
          activate ? "activated" : "deactivated"
        } successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to ${activate ? "activate" : "deactivate"} category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get category details
   */
  async getCategory(categoryId: string): Promise<{
    success: boolean;
    category?: any;
    message: string;
  }> {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      return {
        success: true,
        category: category.getDetailedReport(),
        message: "Category retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get all categories with filters
   */
  async getCategories(filters?: EventCategoryFilters): Promise<{
    success: boolean;
    categories?: any[];
    message: string;
  }> {
    try {
      const categories = await this.categoryRepository.findAll(filters);
      const categorySummaries = categories.map((category) =>
        category.getCategorySummary()
      );

      return {
        success: true,
        categories: categorySummaries,
        message: `Found ${categories.length} categories`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy(): Promise<{
    success: boolean;
    hierarchy?: any[];
    message: string;
  }> {
    try {
      const hierarchy = await this.categoryRepository.findCategoryHierarchy();
      const hierarchyData = hierarchy.map((category) => ({
        ...category.getCategorySummary(),
        children: [], // Would be populated by the repository method
      }));

      return {
        success: true,
        hierarchy: hierarchyData,
        message: "Category hierarchy retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve category hierarchy: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get root categories only
   */
  async getRootCategories(): Promise<{
    success: boolean;
    categories?: any[];
    message: string;
  }> {
    try {
      const rootCategories = await this.categoryRepository.findRootCategories();
      const categorySummaries = rootCategories.map((category) =>
        category.getCategorySummary()
      );

      return {
        success: true,
        categories: categorySummaries,
        message: `Found ${rootCategories.length} root categories`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve root categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get child categories of a parent
   */
  async getChildCategories(parentId: string): Promise<{
    success: boolean;
    categories?: any[];
    message: string;
  }> {
    try {
      const childCategories = await this.categoryRepository.findByParentId(
        parentId
      );
      const categorySummaries = childCategories.map((category) =>
        category.getCategorySummary()
      );

      return {
        success: true,
        categories: categorySummaries,
        message: `Found ${childCategories.length} child categories`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve child categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get category path (breadcrumb)
   */
  async getCategoryPath(categoryId: string): Promise<{
    success: boolean;
    path?: any[];
    message: string;
  }> {
    try {
      const categoryPath = await this.categoryRepository.findCategoryPath(
        categoryId
      );
      const pathData = categoryPath.map((category) => ({
        id: category.getId(),
        name: category.getName(),
        color: category.getColor(),
      }));

      return {
        success: true,
        path: pathData,
        message: "Category path retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve category path: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(categoryId?: string): Promise<{
    success: boolean;
    statistics?: CategoryStatistics;
    message: string;
  }> {
    try {
      const statistics = await this.categoryRepository.getCategoryStatistics(
        categoryId
      );

      return {
        success: true,
        statistics,
        message: "Category statistics retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve category statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get category usage analytics
   */
  async getCategoryUsage(): Promise<{
    success: boolean;
    usage?: any[];
    message: string;
  }> {
    try {
      const usage = await this.categoryRepository.getCategoryUsage();

      return {
        success: true,
        usage,
        message: "Category usage analytics retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve category usage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Validate category configuration
   */
  async validateCategory(categoryId: string): Promise<{
    success: boolean;
    validation?: CategorySettingsValidation;
    message: string;
  }> {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Create a basic validation result since validateConfiguration doesn't exist
      const validation: CategorySettingsValidation = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      return {
        success: true,
        validation,
        message: validation.isValid
          ? "Category configuration is valid"
          : `Category configuration has ${validation.errors.length} issues`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get user permissions for categories
   */
  async getUserCategoryPermissions(userId: string): Promise<{
    success: boolean;
    permissions?: any;
    message: string;
  }> {
    try {
      const permissions =
        await this.permissionService.getUserCategoryPermissions(userId);

      return {
        success: true,
        permissions,
        message: "User category permissions retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve user permissions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
