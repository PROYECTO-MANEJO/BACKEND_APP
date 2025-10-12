/**
 * Course Analytics Use Case - Application Layer
 *
 * Handles analytics and reporting for courses including performance metrics,
 * enrollment statistics, completion rates, and business intelligence
 */
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
export interface CourseAnalyticsRepository {
    getCourseMetrics(courseId: string): Promise<CoursePerformanceMetrics>;
    getBulkCourseMetrics(courseIds: string[]): Promise<CoursePerformanceMetrics[]>;
    getAllCoursesMetrics(filters?: any): Promise<CoursePerformanceMetrics[]>;
    getEnrollmentTrends(period: string, startDate: Date, endDate: Date): Promise<EnrollmentTrend[]>;
    getEnrollmentsByCategory(categoryId?: string): Promise<any[]>;
    getEnrollmentsByOrganizer(organizerId?: string): Promise<any[]>;
    getEnrollmentsByPeriod(startDate: Date, endDate: Date): Promise<any[]>;
    getCategoryPerformance(categoryId?: string): Promise<CategoryPerformance[]>;
    getOrganizerPerformance(organizerId?: string): Promise<OrganizerPerformance[]>;
    getTopPerformingCourses(limit?: number): Promise<CoursePerformanceMetrics[]>;
    getUnderperformingCourses(limit?: number): Promise<CoursePerformanceMetrics[]>;
    getDashboardData(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<AnalyticsDashboard>;
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
export declare class CourseAnalytics {
    private analyticsRepository;
    private userRepository;
    private reportService;
    constructor(analyticsRepository: CourseAnalyticsRepository, userRepository: UserRepository, reportService: ReportService);
    /**
     * Get comprehensive analytics dashboard
     */
    getDashboard(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        success: boolean;
        dashboard?: AnalyticsDashboard;
        message: string;
    }>;
    /**
     * Get course performance metrics
     */
    getCoursePerformance(courseId?: string, filters?: AnalyticsFilters): Promise<{
        success: boolean;
        metrics?: CoursePerformanceMetrics[];
        message: string;
    }>;
    /**
     * Get enrollment trends
     */
    getEnrollmentTrends(period: "daily" | "weekly" | "monthly" | "quarterly" | undefined, startDate: Date, endDate: Date): Promise<{
        success: boolean;
        trends?: EnrollmentTrend[];
        message: string;
    }>;
    /**
     * Get category performance analytics
     */
    getCategoryAnalytics(categoryId?: string): Promise<{
        success: boolean;
        categories?: CategoryPerformance[];
        message: string;
    }>;
    /**
     * Get organizer performance analytics
     */
    getOrganizerAnalytics(organizerId?: string): Promise<{
        success: boolean;
        organizers?: OrganizerPerformance[];
        message: string;
    }>;
    /**
     * Get top performing courses
     */
    getTopPerformingCourses(limit?: number): Promise<{
        success: boolean;
        courses?: CoursePerformanceMetrics[];
        message: string;
    }>;
    /**
     * Get underperforming courses
     */
    getUnderperformingCourses(limit?: number): Promise<{
        success: boolean;
        courses?: CoursePerformanceMetrics[];
        message: string;
    }>;
    /**
     * Generate analytics report
     */
    generateReport(reportType: "course_performance" | "enrollment_trends" | "category_analytics" | "organizer_analytics", filters?: AnalyticsFilters, format?: "csv" | "pdf"): Promise<{
        success: boolean;
        report?: Buffer;
        filename?: string;
        message: string;
    }>;
    /**
     * Get comparative analytics between periods
     */
    getComparativeAnalytics(currentPeriod: {
        start: Date;
        end: Date;
    }, previousPeriod: {
        start: Date;
        end: Date;
    }): Promise<{
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
    }>;
    /**
     * Get user analytics (individual user performance across courses)
     */
    getUserAnalytics(userId: string): Promise<{
        success: boolean;
        analytics?: {
            totalEnrollments: number;
            completedCourses: number;
            completionRate: number;
            averageRating: number;
            totalLearningHours: number;
            categoriesEngaged: string[];
            enrollmentTrend: Array<{
                month: string;
                enrollments: number;
                completions: number;
            }>;
        };
        message: string;
    }>;
    /**
     * Private helper methods
     */
    private applyPerformanceFilters;
    private calculateGrowthPercentage;
}
//# sourceMappingURL=CourseAnalytics.d.ts.map