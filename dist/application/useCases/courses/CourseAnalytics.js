"use strict";
/**
 * Course Analytics Use Case - Application Layer
 *
 * Handles analytics and reporting for courses including performance metrics,
 * enrollment statistics, completion rates, and business intelligence
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseAnalytics = void 0;
class CourseAnalytics {
    constructor(analyticsRepository, userRepository, reportService) {
        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
        this.reportService = reportService;
    }
    /**
     * Get comprehensive analytics dashboard
     */
    async getDashboard(dateRange) {
        try {
            const dashboard = await this.analyticsRepository.getDashboardData(dateRange);
            return {
                success: true,
                dashboard,
                message: "Dashboard data retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve dashboard data",
            };
        }
    }
    /**
     * Get course performance metrics
     */
    async getCoursePerformance(courseId, filters) {
        try {
            let metrics;
            if (courseId) {
                const singleMetric = await this.analyticsRepository.getCourseMetrics(courseId);
                metrics = [singleMetric];
            }
            else {
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
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve course performance",
            };
        }
    }
    /**
     * Get enrollment trends
     */
    async getEnrollmentTrends(period = "monthly", startDate, endDate) {
        try {
            const trends = await this.analyticsRepository.getEnrollmentTrends(period, startDate, endDate);
            return {
                success: true,
                trends,
                message: "Enrollment trends retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve enrollment trends",
            };
        }
    }
    /**
     * Get category performance analytics
     */
    async getCategoryAnalytics(categoryId) {
        try {
            const categories = await this.analyticsRepository.getCategoryPerformance(categoryId);
            // Sort by performance score (combination of completion rate and rating)
            categories.sort((a, b) => {
                const scoreA = a.completionRate * 0.6 + a.averageRating * 20 * 0.4;
                const scoreB = b.completionRate * 0.6 + b.averageRating * 20 * 0.4;
                return scoreB - scoreA;
            });
            return {
                success: true,
                categories,
                message: "Category analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve category analytics",
            };
        }
    }
    /**
     * Get organizer performance analytics
     */
    async getOrganizerAnalytics(organizerId) {
        try {
            const organizers = await this.analyticsRepository.getOrganizerPerformance(organizerId);
            // Sort by performance score
            organizers.sort((a, b) => {
                const scoreA = a.completionRate * 0.4 +
                    a.averageRating * 20 * 0.3 +
                    a.averageCapacityUtilization * 0.3;
                const scoreB = b.completionRate * 0.4 +
                    b.averageRating * 20 * 0.3 +
                    b.averageCapacityUtilization * 0.3;
                return scoreB - scoreA;
            });
            return {
                success: true,
                organizers,
                message: "Organizer analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve organizer analytics",
            };
        }
    }
    /**
     * Get top performing courses
     */
    async getTopPerformingCourses(limit = 10) {
        try {
            const courses = await this.analyticsRepository.getTopPerformingCourses(limit);
            return {
                success: true,
                courses,
                message: "Top performing courses retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve top performing courses",
            };
        }
    }
    /**
     * Get underperforming courses
     */
    async getUnderperformingCourses(limit = 10) {
        try {
            const courses = await this.analyticsRepository.getUnderperformingCourses(limit);
            return {
                success: true,
                courses,
                message: "Underperforming courses retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve underperforming courses",
            };
        }
    }
    /**
     * Generate analytics report
     */
    async generateReport(reportType, filters, format = "csv") {
        try {
            let data;
            let filename;
            switch (reportType) {
                case "course_performance":
                    const courseMetrics = await this.analyticsRepository.getAllCoursesMetrics(filters);
                    data = this.applyPerformanceFilters(courseMetrics, filters || {});
                    filename = `course_performance_${new Date().toISOString().split("T")[0]}.${format}`;
                    break;
                case "enrollment_trends":
                    const startDate = filters?.startDate ||
                        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                    const endDate = filters?.endDate || new Date();
                    data = await this.analyticsRepository.getEnrollmentTrends("monthly", startDate, endDate);
                    filename = `enrollment_trends_${new Date().toISOString().split("T")[0]}.${format}`;
                    break;
                case "category_analytics":
                    data = await this.analyticsRepository.getCategoryPerformance(filters?.categoryId);
                    filename = `category_analytics_${new Date().toISOString().split("T")[0]}.${format}`;
                    break;
                case "organizer_analytics":
                    data = await this.analyticsRepository.getOrganizerPerformance(filters?.organizerId);
                    filename = `organizer_analytics_${new Date().toISOString().split("T")[0]}.${format}`;
                    break;
                default:
                    return {
                        success: false,
                        message: "Invalid report type",
                    };
            }
            let report;
            if (format === "csv") {
                report = await this.reportService.exportToCSV(data);
            }
            else {
                report = await this.reportService.exportToPDF(data);
            }
            return {
                success: true,
                report,
                filename,
                message: "Report generated successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to generate report",
            };
        }
    }
    /**
     * Get comparative analytics between periods
     */
    async getComparativeAnalytics(currentPeriod, previousPeriod) {
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
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve comparative analytics",
            };
        }
    }
    /**
     * Get user analytics (individual user performance across courses)
     */
    async getUserAnalytics(userId) {
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
            const averageRating = completions.reduce((sum, completion) => sum + (completion.rating || 0), 0) / (completions.length || 1);
            const totalLearningHours = completions.reduce((sum, completion) => sum + (completion.courseDuration || 0), 0);
            const categoriesEngaged = [
                ...new Set(enrollments.map((e) => e.categoryName).filter(Boolean)),
            ];
            // Group by month for trend
            const enrollmentsByMonth = enrollments.reduce((acc, enrollment) => {
                const month = new Date(enrollment.enrolledAt)
                    .toISOString()
                    .slice(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});
            const completionsByMonth = completions.reduce((acc, completion) => {
                const month = new Date(completion.completedAt)
                    .toISOString()
                    .slice(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});
            const enrollmentTrend = Object.keys(enrollmentsByMonth)
                .map((month) => ({
                month,
                enrollments: enrollmentsByMonth[month] || 0,
                completions: completionsByMonth[month] || 0,
            }))
                .sort();
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
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve user analytics",
            };
        }
    }
    /**
     * Private helper methods
     */
    applyPerformanceFilters(metrics, filters) {
        let filtered = metrics;
        if (filters.minEnrollments !== undefined) {
            filtered = filtered.filter((m) => m.enrollmentCount >= filters.minEnrollments);
        }
        if (filters.maxEnrollments !== undefined) {
            filtered = filtered.filter((m) => m.enrollmentCount <= filters.maxEnrollments);
        }
        if (filters.minRating !== undefined) {
            filtered = filtered.filter((m) => m.averageRating >= filters.minRating);
        }
        if (filters.maxRating !== undefined) {
            filtered = filtered.filter((m) => m.averageRating <= filters.maxRating);
        }
        return filtered;
    }
    calculateGrowthPercentage(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
}
exports.CourseAnalytics = CourseAnalytics;
//# sourceMappingURL=CourseAnalytics.js.map