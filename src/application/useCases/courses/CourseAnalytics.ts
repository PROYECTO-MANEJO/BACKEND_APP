/**
 * Course Analytics Use Case - Application Layer
 *
 * Handles analytics and reporting for courses including performance metrics,
 * enrollment statistics, completion rates, and business intelligence
 */

import {
  Course,
  CourseStatistics,
  CourseCategory,
  CourseCategoryStatistics,
} from "../../../domain/entities/courses";

// Analytics Data Types
export interface EnrollmentTrend {
  period: string;
  enrollments: number;
  completions: number;
  dropouts: number;
  averageRating: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  utilizationRate: number;
}

export interface OrganizerPerformance {
  organizerId: string;
  organizerName: string;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageCapacityUtilization: number;
  averageRating: number;
  completionRate: number;
}

export interface CoursePerformanceMetrics {
  courseId: string;
  courseName: string;
  categoryName: string;
  organizerName: string;
  enrollmentCount: number;
  capacityUtilization: number;
  completionRate: number;
  dropoutRate: number;
  averageRating: number;
  attendanceRate: number;
  certificateIssuanceRate: number;
}

export interface AnalyticsDashboard {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  overallCompletionRate: number;
  averageRating: number;
  topCategories: CategoryPerformance[];
  topOrganizers: OrganizerPerformance[];
  enrollmentTrends: EnrollmentTrend[];
  recentActivity: any[];
}

// Repository Interfaces
export interface CourseAnalyticsRepository {
  // Course metrics
  getCourseMetrics(courseId: string): Promise<CoursePerformanceMetrics>;
  getBulkCourseMetrics(courseIds: string[]): Promise<CoursePerformanceMetrics[]>;
  getAllCoursesMetrics(filters?: any): Promise<CoursePerformanceMetrics[]>;

  // Enrollment analytics
  getEnrollmentTrends(period: string, startDate: Date, endDate: Date): Promise<EnrollmentTrend[]>;
  getEnrollmentsByCategory(categoryId?: string): Promise<any[]>;
  getEnrollmentsByOrganizer(organizerId?: string): Promise<any[]>;
  getEnrollmentsByPeriod(startDate: Date, endDate: Date): Promise<any[]>;

  // Performance analytics
  getCategoryPerformance(categoryId?: string): Promise<CategoryPerformance[]>;
  getOrganizerPerformance(organizerId?: string): Promise<OrganizerPerformance[]>;
  getTopPerformingCourses(limit?: number): Promise<CoursePerformanceMetrics[]>;
  getUnderperformingCourses(limit?: number): Promise<CoursePerformanceMetrics[]>;

  // Dashboard data
  getDashboardData(dateRange?: { start: Date; end: Date }): Promise<AnalyticsDashboard>;
}

export interface UserRepository {
  findById(userId: string): Promise<any>;
  getUserEnrollments(userId: string): Promise<any[]>;
  getUserCompletions(userId: string): Promise<any[]>;
}

export interface ReportService {
  generateReport(type: string, data: any): Promise<Buffer>;
  exportToCSV(data: any[]): Promise<Buffer>;
  exportToPDF(data: any): Promise<Buffer>;
}

// Analytics Filters
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  organizerId?: string;
  courseStatus?: string[];
  minEnrollments?: number;
  maxEnrollments?: number;
  minRating?: number;
  maxRating?: number;
}

export class CourseAnalytics {
  constructor(
    private analyticsRepository: CourseAnalyticsRepository,
    private userRepository: UserRepository,
    private reportService: ReportService
  ) {}

  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboard(dateRange?: { start: Date; end: Date }): Promise<{
    success: boolean;
    dashboard?: AnalyticsDashboard;
    message: string;
  }> {
    try {
      const dashboard = await this.analyticsRepository.getDashboardData(dateRange);

      return {
        success: true,
        dashboard,
        message: "Dashboard data retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve dashboard data",
      };
    }
  }

  /**
   * Get course performance metrics
   */
  async getCoursePerformance(courseId?: string, filters?: AnalyticsFilters): Promise<{
    success: boolean;
    metrics?: CoursePerformanceMetrics[];
    message: string;
  }> {
    try {
      let metrics: CoursePerformanceMetrics[];

      if (courseId) {
        const singleMetric = await this.analyticsRepository.getCourseMetrics(courseId);
        metrics = [singleMetric];
      } else {
        metrics = await this.analyticsRepository.getAllCoursesMetrics(filters);
      }

      // Apply additional filters
      if (filters) {
        metrics = this.applyPerformanceFilters(metrics, filters);
      }

      return {
        success: true,
        metrics,
        message: "Course performance metrics retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve course performance",
      };
    }
  }

  /**
   * Get enrollment trends
   */
  async getEnrollmentTrends(
    period: "daily" | "weekly" | "monthly" | "quarterly" = "monthly",
    startDate: Date,
    endDate: Date
  ): Promise<{
    success: boolean;
    trends?: EnrollmentTrend[];
    message: string;
  }> {
    try {
      const trends = await this.analyticsRepository.getEnrollmentTrends(period, startDate, endDate);

      return {
        success: true,
        trends,
        message: "Enrollment trends retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve enrollment trends",
      };
    }
  }

  /**
   * Get category performance analytics
   */
  async getCategoryAnalytics(categoryId?: string): Promise<{
    success: boolean;
    categories?: CategoryPerformance[];
    message: string;
  }> {
    try {
      const categories = await this.analyticsRepository.getCategoryPerformance(categoryId);

      // Sort by performance score (combination of completion rate and rating)
      categories.sort((a, b) => {
        const scoreA = (a.completionRate * 0.6) + (a.averageRating * 20 * 0.4);
        const scoreB = (b.completionRate * 0.6) + (b.averageRating * 20 * 0.4);
        return scoreB - scoreA;
      });

      return {
        success: true,
        categories,
        message: "Category analytics retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve category analytics",
      };
    }
  }

  /**
   * Get organizer performance analytics
   */
  async getOrganizerAnalytics(organizerId?: string): Promise<{
    success: boolean;
    organizers?: OrganizerPerformance[];
    message: string;
  }> {
    try {
      const organizers = await this.analyticsRepository.getOrganizerPerformance(organizerId);

      // Sort by performance score
      organizers.sort((a, b) => {
        const scoreA = (a.completionRate * 0.4) + (a.averageRating * 20 * 0.3) + (a.averageCapacityUtilization * 0.3);
        const scoreB = (b.completionRate * 0.4) + (b.averageRating * 20 * 0.3) + (b.averageCapacityUtilization * 0.3);
        return scoreB - scoreA;
      });

      return {
        success: true,
        organizers,
        message: "Organizer analytics retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve organizer analytics",
      };
    }
  }

  /**
   * Get top performing courses
   */
  async getTopPerformingCourses(limit: number = 10): Promise<{
    success: boolean;
    courses?: CoursePerformanceMetrics[];
    message: string;
  }> {
    try {
      const courses = await this.analyticsRepository.getTopPerformingCourses(limit);

      return {
        success: true,
        courses,
        message: "Top performing courses retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve top performing courses",
      };
    }
  }

  /**
   * Get underperforming courses
   */
  async getUnderperformingCourses(limit: number = 10): Promise<{
    success: boolean;
    courses?: CoursePerformanceMetrics[];
    message: string;
  }> {
    try {
      const courses = await this.analyticsRepository.getUnderperformingCourses(limit);

      return {
        success: true,
        courses,
        message: "Underperforming courses retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve underperforming courses",
      };
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    reportType: "course_performance" | "enrollment_trends" | "category_analytics" | "organizer_analytics",
    filters?: AnalyticsFilters,
    format: "csv" | "pdf" = "csv"
  ): Promise<{
    success: boolean;
    report?: Buffer;
    filename?: string;
    message: string;
  }> {
    try {
      let data: any;
      let filename: string;

      switch (reportType) {
        case "course_performance":
          const courseMetrics = await this.analyticsRepository.getAllCoursesMetrics(filters);
          data = this.applyPerformanceFilters(courseMetrics, filters || {});
          filename = `course_performance_${new Date().toISOString().split('T')[0]}.${format}`;
          break;

        case "enrollment_trends":
          const startDate = filters?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          const endDate = filters?.endDate || new Date();
          data = await this.analyticsRepository.getEnrollmentTrends("monthly", startDate, endDate);
          filename = `enrollment_trends_${new Date().toISOString().split('T')[0]}.${format}`;
          break;

        case "category_analytics":
          data = await this.analyticsRepository.getCategoryPerformance(filters?.categoryId);
          filename = `category_analytics_${new Date().toISOString().split('T')[0]}.${format}`;
          break;

        case "organizer_analytics":
          data = await this.analyticsRepository.getOrganizerPerformance(filters?.organizerId);
          filename = `organizer_analytics_${new Date().toISOString().split('T')[0]}.${format}`;
          break;

        default:
          return {
            success: false,
            message: "Invalid report type",
          };
      }

      let report: Buffer;
      if (format === "csv") {
        report = await this.reportService.exportToCSV(data);
      } else {
        report = await this.reportService.exportToPDF(data);
      }

      return {
        success: true,
        report,
        filename,
        message: "Report generated successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate report",
      };
    }
  }

  /**
   * Get comparative analytics between periods
   */
  async getComparativeAnalytics(
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date }
  ): Promise<{
    success: boolean;
    comparison?: {
      current: AnalyticsDashboard;
      previous: AnalyticsDashboard;
      growth: {
        coursesGrowth: number;
        enrollmentsGrowth: number;
        completionsGrowth: number;
        ratingImprovement: number;
      };
    };
    message: string;
  }> {
    try {
      const [currentData, previousData] = await Promise.all([
        this.analyticsRepository.getDashboardData(currentPeriod),
        this.analyticsRepository.getDashboardData(previousPeriod),
      ]);

      const growth = {
        coursesGrowth: this.calculateGrowthPercentage(currentData.totalCourses, previousData.totalCourses),
        enrollmentsGrowth: this.calculateGrowthPercentage(currentData.totalEnrollments, previousData.totalEnrollments),
        completionsGrowth: this.calculateGrowthPercentage(currentData.totalCompletions, previousData.totalCompletions),
        ratingImprovement: currentData.averageRating - previousData.averageRating,
      };

      return {
        success: true,
        comparison: {
          current: currentData,
          previous: previousData,
          growth,
        },
        message: "Comparative analytics retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve comparative analytics",
      };
    }
  }

  /**
   * Get user analytics (individual user performance across courses)
   */
  async getUserAnalytics(userId: string): Promise<{
    success: boolean;
    analytics?: {
      totalEnrollments: number;
      completedCourses: number;
      completionRate: number;
      averageRating: number;
      totalLearningHours: number;
      categoriesEngaged: string[];
      enrollmentTrend: Array<{ month: string; enrollments: number; completions: number }>;
    };
    message: string;
  }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const [enrollments, completions] = await Promise.all([
        this.userRepository.getUserEnrollments(userId),
        this.userRepository.getUserCompletions(userId),
      ]);

      const totalEnrollments = enrollments.length;
      const completedCourses = completions.length;
      const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0;

      const averageRating = completions.reduce((sum, completion) => 
        sum + (completion.rating || 0), 0) / (completions.length || 1);

      const totalLearningHours = completions.reduce((sum, completion) => 
        sum + (completion.courseDuration || 0), 0);

      const categoriesEngaged = [...new Set(enrollments.map(e => e.categoryName).filter(Boolean))];

      // Group by month for trend
      const enrollmentsByMonth = enrollments.reduce((acc: any, enrollment: any) => {
        const month = new Date(enrollment.enrolledAt).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const completionsByMonth = completions.reduce((acc: any, completion: any) => {
        const month = new Date(completion.completedAt).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const enrollmentTrend = Object.keys(enrollmentsByMonth).map(month => ({
        month,
        enrollments: enrollmentsByMonth[month] || 0,
        completions: completionsByMonth[month] || 0,
      })).sort();

      return {
        success: true,
        analytics: {
          totalEnrollments,
          completedCourses,
          completionRate,
          averageRating,
          totalLearningHours,
          categoriesEngaged,
          enrollmentTrend,
        },
        message: "User analytics retrieved successfully",
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve user analytics",
      };
    }
  }

  /**
   * Private helper methods
   */
  private applyPerformanceFilters(metrics: CoursePerformanceMetrics[], filters: AnalyticsFilters): CoursePerformanceMetrics[] {
    let filtered = metrics;

    if (filters.minEnrollments !== undefined) {
      filtered = filtered.filter(m => m.enrollmentCount >= filters.minEnrollments!);
    }

    if (filters.maxEnrollments !== undefined) {
      filtered = filtered.filter(m => m.enrollmentCount <= filters.maxEnrollments!);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter(m => m.averageRating >= filters.minRating!);
    }

    if (filters.maxRating !== undefined) {
      filtered = filtered.filter(m => m.averageRating <= filters.maxRating!);
    }

    return filtered;
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}