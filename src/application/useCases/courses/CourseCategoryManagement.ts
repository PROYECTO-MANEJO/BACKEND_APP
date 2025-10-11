/**
 * Course Category Management Use Case - Application Layer
 *
 * Simplified version that works with the actual CourseCategory domain entity
 */

import {
  CourseCategory,
  CourseCategoryStatistics,
  CourseCategoryFilters,
} from "../../../domain/entities/courses";

// Repository Interface for Category persistence
export interface CourseCategoryRepository {
  // Basic CRUD operations
  save(category: CourseCategory): Promise<void>;
  findById(id: string): Promise<CourseCategory | null>;
  findAll(filters?: CourseCategoryFilters): Promise<CourseCategory[]>;
  update(category: CourseCategory): Promise<void>;
  delete(id: string): Promise<void>;

  // Category-specific queries
  findByParent(parentId: string | null): Promise<CourseCategory[]>;
  findRootCategories(): Promise<CourseCategory[]>;
  findChildCategories(parentId: string): Promise<CourseCategory[]>;
  findByStatus(isActive: boolean): Promise<CourseCategory[]>;
  findByName(name: string): Promise<CourseCategory | null>;

  // Statistics and analytics
  getCategoryStatistics(categoryId: string): Promise<CourseCategoryStatistics>;
  getCourseCount(categoryId: string): Promise<number>;
  getActiveCoursesCount(categoryId: string): Promise<number>;
}

// External Service Dependencies
export interface CategoryValidationService {
  validateCategoryName(
    name: string,
    parentId?: string
  ): Promise<{ isValid: boolean; message?: string }>;
  validateParentCategory(
    parentId: string
  ): Promise<{ isValid: boolean; message?: string }>;
}

export interface CourseService {
  getCoursesByCategory(categoryId: string): Promise<any[]>;
}

export interface NotificationService {
  notifyCategoryCreated(
    category: CourseCategory,
    recipients: string[]
  ): Promise<void>;
  notifyCategoryUpdated(
    category: CourseCategory,
    changes: string[],
    recipients: string[]
  ): Promise<void>;
  notifyCategoryDeleted(
    categoryName: string,
    affectedCourses: number,
    recipients: string[]
  ): Promise<void>;
}

export interface PermissionService {
  canManageCategory(userId: string, categoryId?: string): Promise<boolean>;
  canCreateCategory(userId: string, parentId?: string): Promise<boolean>;
  canDeleteCategory(userId: string, categoryId: string): Promise<boolean>;
}

// Use Case Input Types
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

export class CourseCategoryManagement {
  constructor(
    private categoryRepository: CourseCategoryRepository,
    private validationService: CategoryValidationService,
    private courseService: CourseService,
    private notificationService: NotificationService,
    private permissionService: PermissionService
  ) {}

  /**
   * Create a new category
   */
  async createCategory(
    input: CategoryCreationInput,
    userId?: string
  ): Promise<{
    success: boolean;
    categoryId?: string;
    message: string;
    warnings?: string[];
  }> {
    try {
      const warnings: string[] = [];

      // Check permissions
      if (userId) {
        const canCreate = await this.permissionService.canCreateCategory(
          userId
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
        input.name
      );
      if (!nameValidation.isValid) {
        return {
          success: false,
          message: nameValidation.message || "Invalid category name",
        };
      }

      // Create category domain entity
      const category = CourseCategory.create(
        input.name,
        input.description || "",
        input.code,
        input.color,
        input.createdBy
      );

      // Save to repository
      await this.categoryRepository.save(category);

      // Send notifications
      if (userId) {
        try {
          await this.notificationService.notifyCategoryCreated(category, [
            userId,
          ]);
        } catch (error) {
          warnings.push("Category created but notification failed");
        }
      }

      return {
        success: true,
        categoryId: category.getId(),
        message: "Category created successfully",
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create category",
      };
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    input: CategoryUpdateInput,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    warnings?: string[];
  }> {
    try {
      const warnings: string[] = [];

      // Check permissions
      if (userId) {
        const canManage = await this.permissionService.canManageCategory(
          userId,
          input.categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to update category",
          };
        }
      }

      // Find existing category
      const category = await this.categoryRepository.findById(input.categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      let updatedCategory = category;

      // Update basic information
      if (
        input.name !== undefined ||
        input.description !== undefined ||
        input.code !== undefined ||
        input.color !== undefined
      ) {
        // Validate new name if provided
        if (input.name !== undefined && input.name !== category.getName()) {
          const nameValidation =
            await this.validationService.validateCategoryName(input.name);
          if (!nameValidation.isValid) {
            return {
              success: false,
              message: nameValidation.message || "Invalid category name",
            };
          }
        }

        updatedCategory = updatedCategory.updateBasicInfo(
          input.name,
          input.description,
          input.code,
          input.color,
          input.updatedBy
        );
      }

      // Save updated category
      await this.categoryRepository.update(updatedCategory);

      // Send notification about changes
      try {
        const changes = this.buildChangesList(category, updatedCategory);
        if (changes.length > 0) {
          await this.notificationService.notifyCategoryUpdated(
            updatedCategory,
            changes,
            [input.updatedBy || "system"]
          );
        }
      } catch (error) {
        warnings.push("Category updated but notification failed");
      }

      return {
        success: true,
        message: "Category updated successfully",
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update category",
      };
    }
  }

  /**
   * Activate a category
   */
  async activateCategory(
    categoryId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Check permissions
      if (userId) {
        const canManage = await this.permissionService.canManageCategory(
          userId,
          categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to activate category",
          };
        }
      }

      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      const activatedCategory = category.activate(userId);
      await this.categoryRepository.update(activatedCategory);

      return {
        success: true,
        message: "Category activated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to activate category",
      };
    }
  }

  /**
   * Deactivate a category
   */
  async deactivateCategory(
    categoryId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Check permissions
      if (userId) {
        const canManage = await this.permissionService.canManageCategory(
          userId,
          categoryId
        );
        if (!canManage) {
          return {
            success: false,
            message: "Insufficient permissions to deactivate category",
          };
        }
      }

      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      const deactivatedCategory = category.deactivate(userId);
      await this.categoryRepository.update(deactivatedCategory);

      return {
        success: true,
        message: "Category deactivated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to deactivate category",
      };
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(
    categoryId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    warnings?: string[];
  }> {
    try {
      const warnings: string[] = [];

      // Check permissions
      if (userId) {
        const canDelete = await this.permissionService.canDeleteCategory(
          userId,
          categoryId
        );
        if (!canDelete) {
          return {
            success: false,
            message: "Insufficient permissions to delete category",
          };
        }
      }

      // Find category
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Check for child categories
      const childCategories = await this.categoryRepository.findByParent(
        categoryId
      );
      if (childCategories.length > 0) {
        return {
          success: false,
          message: `Cannot delete category with ${childCategories.length} child categories`,
        };
      }

      // Check for courses in this category
      const coursesInCategory = await this.courseService.getCoursesByCategory(
        categoryId
      );
      if (coursesInCategory.length > 0) {
        return {
          success: false,
          message: `Cannot delete category with ${coursesInCategory.length} courses`,
        };
      }

      // Delete category
      await this.categoryRepository.delete(categoryId);

      // Send notification
      try {
        await this.notificationService.notifyCategoryDeleted(
          category.getName(),
          coursesInCategory.length,
          [userId || "system"]
        );
      } catch (error) {
        warnings.push("Category deleted but notification failed");
      }

      return {
        success: true,
        message: "Category deleted successfully",
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete category",
      };
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(categoryId: string): Promise<{
    success: boolean;
    category?: CourseCategory;
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
        category,
        message: "Category retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve category",
      };
    }
  }

  /**
   * Get categories with filters
   */
  async getCategories(filters?: CategoryFiltersInput): Promise<{
    success: boolean;
    categories?: CourseCategory[];
    totalCount?: number;
    message: string;
  }> {
    try {
      const categoryFilters: CourseCategoryFilters = {
        name: filters?.name,
        isActive: filters?.isActive,
        isVisible: filters?.isVisible,
      };

      const categories = await this.categoryRepository.findAll(categoryFilters);

      // Apply name filter
      let filteredCategories = categories;
      if (filters?.name) {
        const nameFilter = filters.name.toLowerCase();
        filteredCategories = categories.filter(
          (category) =>
            category.getName().toLowerCase().includes(nameFilter) ||
            category.getDescription().toLowerCase().includes(nameFilter)
        );
      }

      return {
        success: true,
        categories: filteredCategories,
        totalCount: filteredCategories.length,
        message: "Categories retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve categories",
      };
    }
  }

  /**
   * Get root categories
   */
  async getRootCategories(): Promise<{
    success: boolean;
    categories?: CourseCategory[];
    message: string;
  }> {
    try {
      const categories = await this.categoryRepository.findRootCategories();

      return {
        success: true,
        categories,
        message: "Root categories retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve root categories",
      };
    }
  }

  /**
   * Get child categories
   */
  async getChildCategories(parentId: string): Promise<{
    success: boolean;
    categories?: CourseCategory[];
    message: string;
  }> {
    try {
      const categories = await this.categoryRepository.findChildCategories(
        parentId
      );

      return {
        success: true,
        categories,
        message: "Child categories retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve child categories",
      };
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(categoryId: string): Promise<{
    success: boolean;
    statistics?: CourseCategoryStatistics;
    message: string;
  }> {
    try {
      const statistics = await this.categoryRepository.getCategoryStatistics(
        categoryId
      );

      return {
        success: true,
        statistics,
        message: "Statistics retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve statistics",
      };
    }
  }

  /**
   * Update category statistics
   */
  async updateCategoryStatistics(
    categoryId: string,
    statistics: Partial<CourseCategoryStatistics>,
    userId?: string
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

      const updatedCategory = category.updateStatistics(statistics, userId);
      await this.categoryRepository.update(updatedCategory);

      return {
        success: true,
        message: "Statistics updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update statistics",
      };
    }
  }

  /**
   * Increment course count
   */
  async incrementCourseCount(
    categoryId: string,
    courseStatus: "ACTIVE" | "COMPLETED" = "ACTIVE",
    userId?: string
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

      const updatedCategory = category.incrementCourseCount(
        courseStatus,
        userId
      );
      await this.categoryRepository.update(updatedCategory);

      return {
        success: true,
        message: "Course count incremented successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to increment course count",
      };
    }
  }

  /**
   * Private helper methods
   */
  private buildChangesList(
    originalCategory: CourseCategory,
    updatedCategory: CourseCategory
  ): string[] {
    const changes: string[] = [];

    if (originalCategory.getName() !== updatedCategory.getName()) {
      changes.push(
        `Name changed from "${originalCategory.getName()}" to "${updatedCategory.getName()}"`
      );
    }

    if (
      originalCategory.getDescription() !== updatedCategory.getDescription()
    ) {
      changes.push("Description updated");
    }

    if (originalCategory.getCode() !== updatedCategory.getCode()) {
      changes.push("Code updated");
    }

    if (originalCategory.getColor() !== updatedCategory.getColor()) {
      changes.push("Color updated");
    }

    if (
      originalCategory.isActiveCategory() !== updatedCategory.isActiveCategory()
    ) {
      changes.push(
        `Status changed to ${
          updatedCategory.isActiveCategory() ? "active" : "inactive"
        }`
      );
    }

    if (
      originalCategory.getParentCategoryId() !==
      updatedCategory.getParentCategoryId()
    ) {
      changes.push("Parent category updated");
    }

    return changes;
  }
}
