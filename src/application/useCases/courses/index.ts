/**
 * Courses System - Application Layer Use Cases Index
 *
 * Exports all use cases for the courses system following Clean Architecture principles
 */

// Course Management Use Case
export { CourseManagement } from "./CourseManagement";
export type {
  CourseRepository,
  UserService,
  CategoryService,
  NotificationService,
  EnrollmentService,
  ValidationService,
  CourseCreationInput,
  CourseUpdateInput,
  CourseFiltersInput,
} from "./CourseManagement";

// Course Category Management Use Case  
export { CourseCategoryManagement } from "./CourseCategoryManagement";
export type {
  CourseCategoryRepository,
  CategoryValidationService,
  CourseService,
  PermissionService,
  CategoryCreationInput,
  CategoryUpdateInput,
  CategoryFiltersInput,
} from "./CourseCategoryManagement";

// Course Analytics Use Case
export { CourseAnalytics } from "./CourseAnalytics";
export type {
  CourseAnalyticsRepository,
  UserRepository,
  ReportService,
  EnrollmentTrend,
  CategoryPerformance,
  OrganizerPerformance,
  CoursePerformanceMetrics,
  AnalyticsDashboard,
  AnalyticsFilters,
} from "./CourseAnalytics";

// Re-export domain entities for convenience
export {
  Course,
  CourseCategory,
} from "../../../domain/entities/courses";

export type {
  CourseStatistics,
  CourseCategoryStatistics,
  CourseFilters,
  CourseCategoryFilters,
} from "../../../domain/entities/courses";