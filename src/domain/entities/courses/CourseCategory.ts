/**
 * CourseCategory Domain Entity - Clean Architecture Domain Layer
 *
 * Represents course categories with hierarchical organization, settings management,
 * and comprehensive business logic for course classification and organization
 */

// Core Course Category Data Structure
interface CourseCategoryData {
  id: string;
  name: string;
  description: string;
  code?: string;
  color?: string;
  icon?: string;

  // Hierarchy Management
  parentCategoryId?: string;
  level: number; // 0 for root categories, increments with depth
  path: string; // Hierarchical path like "/parent/child"

  // Category Configuration
  settings: {
    allowSubcategories: boolean;
    requireApproval: boolean;
    defaultCapacity: number;
    defaultDuration: number; // Default course duration in hours
    allowRegistration: boolean;
    autoPublishCourses: boolean;
    maxCoursesPerInstructor?: number;
    allowedInstructorRoles: string[];
  };

  // Category Restrictions and Rules
  restrictions: {
    maxCoursesPerMonth?: number;
    maxCapacityPerCourse?: number;
    minimumDuration?: number;
    maximumDuration?: number;
    minimumAdvanceNotice?: number; // Days before course can start
    maximumAdvanceNotice?: number; // Maximum days in advance to schedule
    allowedDaysOfWeek: number[]; // 0-6, Sunday-Saturday
    restrictedTimeSlots?: Array<{
      startTime: string;
      endTime: string;
      reason: string;
    }>;
    requiresSpecialApproval: boolean;
  };

  // Email Templates for Course Category
  emailTemplates: {
    enrollment?: string;
    reminder?: string;
    completion?: string;
    cancellation?: string;
  };

  // Category Statistics
  statistics: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    totalEnrollments: number;
    averageRating?: number;
    completionRate?: number;
  };

  // Category Status
  isActive: boolean;
  isVisible: boolean; // For public display

  // Administrative Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Course Category Statistics
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

// Course Category Filters
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

export class CourseCategory {
  private data: CourseCategoryData;

  constructor(categoryData: CourseCategoryData) {
    this.data = { ...categoryData };
    this.validateData();
  }

  /**
   * Create a new course category
   */
  public static create(
    name: string,
    description: string,
    code?: string,
    color?: string,
    createdBy?: string
  ): CourseCategory {
    const now = new Date();

    const categoryData: CourseCategoryData = {
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
  public static fromData(categoryData: any): CourseCategory {
    // Map from database format (categoriaEvento table)
    const mappedData: CourseCategoryData = {
      id: categoryData.id_cat,
      name: categoryData.nom_cat,
      description: categoryData.des_cat || "",
      code: categoryData.codigo_cat,
      color: categoryData.color_cat,
      parentCategoryId: categoryData.id_categoria_padre?.toString(),
      level: 0, // Will be calculated based on hierarchy
      path: `/${
        categoryData.nom_cat?.toLowerCase().replace(/\s+/g, "-") || ""
      }`,
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
  private validateData(): void {
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

    if (
      this.data.restrictions.maxCoursesPerMonth !== undefined &&
      this.data.restrictions.maxCoursesPerMonth <= 0
    ) {
      throw new Error("Max courses per month must be positive");
    }

    if (
      this.data.restrictions.minimumAdvanceNotice !== undefined &&
      this.data.restrictions.minimumAdvanceNotice < 0
    ) {
      throw new Error("Minimum advance notice cannot be negative");
    }

    if (
      this.data.restrictions.maximumAdvanceNotice !== undefined &&
      this.data.restrictions.maximumAdvanceNotice < 0
    ) {
      throw new Error("Maximum advance notice cannot be negative");
    }

    if (
      this.data.restrictions.minimumAdvanceNotice !== undefined &&
      this.data.restrictions.maximumAdvanceNotice !== undefined &&
      this.data.restrictions.minimumAdvanceNotice >
        this.data.restrictions.maximumAdvanceNotice
    ) {
      throw new Error(
        "Minimum advance notice cannot be greater than maximum advance notice"
      );
    }
  }

  // Getter methods
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getDescription(): string {
    return this.data.description;
  }

  public getCode(): string | undefined {
    return this.data.code;
  }

  public getColor(): string | undefined {
    return this.data.color;
  }

  public getParentCategoryId(): string | undefined {
    return this.data.parentCategoryId;
  }

  public getLevel(): number {
    return this.data.level;
  }

  public getPath(): string {
    return this.data.path;
  }

  public getSettings(): CourseCategoryData["settings"] {
    return { ...this.data.settings };
  }

  public getRestrictions(): CourseCategoryData["restrictions"] {
    return { ...this.data.restrictions };
  }

  public getStatistics(): CourseCategoryData["statistics"] {
    return { ...this.data.statistics };
  }

  public isActiveCategory(): boolean {
    return this.data.isActive;
  }

  public isVisibleCategory(): boolean {
    return this.data.isVisible;
  }

  public getCreatedAt(): Date {
    return new Date(this.data.createdAt);
  }

  public getUpdatedAt(): Date {
    return new Date(this.data.updatedAt);
  }

  /**
   * Check if this category is a root category
   */
  public isRootCategory(): boolean {
    return !this.data.parentCategoryId;
  }

  /**
   * Check if this category has a parent category
   */
  public hasParentCategory(): boolean {
    return !!this.data.parentCategoryId;
  }

  /**
   * Check if subcategories are allowed
   */
  public allowsSubcategories(): boolean {
    return this.data.settings.allowSubcategories;
  }

  /**
   * Check if courses require approval in this category
   */
  public requiresCourseApproval(): boolean {
    return this.data.settings.requireApproval;
  }

  /**
   * Check if registration is allowed
   */
  public allowsRegistration(): boolean {
    return this.data.settings.allowRegistration;
  }

  /**
   * Get default course capacity for this category
   */
  public getDefaultCapacity(): number {
    return this.data.settings.defaultCapacity;
  }

  /**
   * Get default course duration for this category
   */
  public getDefaultDuration(): number {
    return this.data.settings.defaultDuration;
  }

  /**
   * Check if a day of week is allowed for courses
   */
  public isDayAllowed(dayOfWeek: number): boolean {
    return this.data.restrictions.allowedDaysOfWeek.includes(dayOfWeek);
  }

  /**
   * Get allowed days of week
   */
  public getAllowedDays(): number[] {
    return [...this.data.restrictions.allowedDaysOfWeek];
  }

  /**
   * Check if instructor role is allowed
   */
  public isInstructorRoleAllowed(role: string): boolean {
    return this.data.settings.allowedInstructorRoles.includes(role);
  }

  /**
   * Update basic category information
   */
  public updateBasicInfo(
    name?: string,
    description?: string,
    code?: string,
    color?: string,
    updatedBy?: string
  ): CourseCategory {
    const updatedData = {
      ...this.data,
      name: name !== undefined ? name.trim() : this.data.name,
      description:
        description !== undefined ? description.trim() : this.data.description,
      code: code !== undefined ? code?.trim() : this.data.code,
      color: color !== undefined ? color : this.data.color,
      path:
        name !== undefined
          ? `${this.data.path.substring(
              0,
              this.data.path.lastIndexOf("/")
            )}/${name.trim().toLowerCase().replace(/\s+/g, "-")}`
          : this.data.path,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy,
    };

    return new CourseCategory(updatedData);
  }

  /**
   * Update category settings
   */
  public updateSettings(
    settings: Partial<CourseCategoryData["settings"]>,
    updatedBy?: string
  ): CourseCategory {
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
  public updateRestrictions(
    restrictions: Partial<CourseCategoryData["restrictions"]>,
    updatedBy?: string
  ): CourseCategory {
    const updatedRestrictions = { ...this.data.restrictions, ...restrictions };

    // Validate restrictions
    if (
      updatedRestrictions.minimumAdvanceNotice !== undefined &&
      updatedRestrictions.minimumAdvanceNotice < 0
    ) {
      throw new Error("Minimum advance notice cannot be negative");
    }

    if (
      updatedRestrictions.maximumAdvanceNotice !== undefined &&
      updatedRestrictions.maximumAdvanceNotice < 0
    ) {
      throw new Error("Maximum advance notice cannot be negative");
    }

    if (
      updatedRestrictions.minimumAdvanceNotice !== undefined &&
      updatedRestrictions.maximumAdvanceNotice !== undefined &&
      updatedRestrictions.minimumAdvanceNotice >
        updatedRestrictions.maximumAdvanceNotice
    ) {
      throw new Error(
        "Minimum advance notice cannot be greater than maximum advance notice"
      );
    }

    if (
      updatedRestrictions.maxCoursesPerMonth !== undefined &&
      updatedRestrictions.maxCoursesPerMonth <= 0
    ) {
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
  public updateEmailTemplates(
    templates: Partial<CourseCategoryData["emailTemplates"]>,
    updatedBy?: string
  ): CourseCategory {
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
  public setParentCategory(
    parentCategoryId: string | undefined,
    parentLevel: number = 0,
    parentPath: string = "",
    updatedBy?: string
  ): CourseCategory {
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
  public activate(activatedBy?: string): CourseCategory {
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
  public deactivate(deactivatedBy?: string): CourseCategory {
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
  public show(shownBy?: string): CourseCategory {
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
  public hide(hiddenBy?: string): CourseCategory {
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
  public updateStatistics(
    statistics: Partial<CourseCategoryData["statistics"]>,
    updatedBy?: string
  ): CourseCategory {
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
  public incrementCourseCount(
    courseStatus: "ACTIVE" | "COMPLETED" = "ACTIVE",
    updatedBy?: string
  ): CourseCategory {
    const updatedStats = {
      ...this.data.statistics,
      totalCourses: this.data.statistics.totalCourses + 1,
      activeCourses:
        courseStatus === "ACTIVE"
          ? this.data.statistics.activeCourses + 1
          : this.data.statistics.activeCourses,
      completedCourses:
        courseStatus === "COMPLETED"
          ? this.data.statistics.completedCourses + 1
          : this.data.statistics.completedCourses,
    };

    return this.updateStatistics(updatedStats, updatedBy);
  }

  /**
   * Decrement course count
   */
  public decrementCourseCount(
    courseStatus: "ACTIVE" | "COMPLETED" = "ACTIVE",
    updatedBy?: string
  ): CourseCategory {
    const updatedStats = {
      ...this.data.statistics,
      totalCourses: Math.max(0, this.data.statistics.totalCourses - 1),
      activeCourses:
        courseStatus === "ACTIVE"
          ? Math.max(0, this.data.statistics.activeCourses - 1)
          : this.data.statistics.activeCourses,
      completedCourses:
        courseStatus === "COMPLETED"
          ? Math.max(0, this.data.statistics.completedCourses - 1)
          : this.data.statistics.completedCourses,
    };

    return this.updateStatistics(updatedStats, updatedBy);
  }

  /**
   * Add enrollment to statistics
   */
  public addEnrollment(updatedBy?: string): CourseCategory {
    const updatedStats = {
      ...this.data.statistics,
      totalEnrollments: this.data.statistics.totalEnrollments + 1,
    };

    return this.updateStatistics(updatedStats, updatedBy);
  }

  /**
   * Remove enrollment from statistics
   */
  public removeEnrollment(updatedBy?: string): CourseCategory {
    const updatedStats = {
      ...this.data.statistics,
      totalEnrollments: Math.max(0, this.data.statistics.totalEnrollments - 1),
    };

    return this.updateStatistics(updatedStats, updatedBy);
  }

  /**
   * Calculate category utilization rate
   */
  public calculateUtilizationRate(): number {
    if (this.data.statistics.totalCourses === 0) {
      return 0;
    }

    return (
      (this.data.statistics.activeCourses / this.data.statistics.totalCourses) *
      100
    );
  }

  /**
   * Calculate average enrollments per course
   */
  public calculateAverageEnrollments(): number {
    if (this.data.statistics.totalCourses === 0) {
      return 0;
    }

    return (
      this.data.statistics.totalEnrollments / this.data.statistics.totalCourses
    );
  }

  /**
   * Check if category can accept new courses
   */
  public canAcceptNewCourses(currentMonth: Date = new Date()): {
    canAccept: boolean;
    reason?: string;
    remainingSlots?: number;
  } {
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
      const remainingSlots =
        this.data.restrictions.maxCoursesPerMonth - monthlyCoursesCount;

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
  public validateCourse(courseData: {
    duration: number;
    startDate: Date;
    capacity: number;
    instructorRole?: string;
  }): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check duration restrictions
    if (
      this.data.restrictions.minimumDuration !== undefined &&
      courseData.duration < this.data.restrictions.minimumDuration
    ) {
      violations.push(
        `Course duration (${courseData.duration}h) is below minimum (${this.data.restrictions.minimumDuration}h)`
      );
    }

    if (
      this.data.restrictions.maximumDuration !== undefined &&
      courseData.duration > this.data.restrictions.maximumDuration
    ) {
      violations.push(
        `Course duration (${courseData.duration}h) exceeds maximum (${this.data.restrictions.maximumDuration}h)`
      );
    }

    // Check capacity restrictions
    if (
      this.data.restrictions.maxCapacityPerCourse !== undefined &&
      courseData.capacity > this.data.restrictions.maxCapacityPerCourse
    ) {
      violations.push(
        `Course capacity (${courseData.capacity}) exceeds maximum allowed (${this.data.restrictions.maxCapacityPerCourse})`
      );
    }

    // Check advance notice
    const daysDifference = Math.ceil(
      (courseData.startDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (
      this.data.restrictions.minimumAdvanceNotice !== undefined &&
      daysDifference < this.data.restrictions.minimumAdvanceNotice
    ) {
      violations.push(
        `Course must be scheduled at least ${this.data.restrictions.minimumAdvanceNotice} days in advance`
      );
    }

    if (
      this.data.restrictions.maximumAdvanceNotice !== undefined &&
      daysDifference > this.data.restrictions.maximumAdvanceNotice
    ) {
      violations.push(
        `Course cannot be scheduled more than ${this.data.restrictions.maximumAdvanceNotice} days in advance`
      );
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
      violations.push(
        `Courses cannot be scheduled on ${dayNames[dayOfWeek]} in this category`
      );
    }

    // Check instructor role
    if (
      courseData.instructorRole &&
      !this.isInstructorRoleAllowed(courseData.instructorRole)
    ) {
      violations.push(
        `Instructor role '${courseData.instructorRole}' is not allowed in this category`
      );
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate category performance report
   */
  public generatePerformanceReport(): {
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
  } {
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
  public toDatabaseFormat(): any {
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
  public generateSummary(): {
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
  } {
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
