"use strict";
/**
 * Event Analytics Use Case - Application Layer
 *
 * Handles analytics, reporting, and dashboard data for events and categories
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventAnalytics = void 0;
class EventAnalytics {
    constructor(analyticsRepository, dashboardService, reportService) {
        this.analyticsRepository = analyticsRepository;
        this.dashboardService = dashboardService;
        this.reportService = reportService;
    }
    /**
     * Get comprehensive event analytics
     */
    async getEventAnalytics(filters) {
        try {
            const eventFilters = {
                startDateFrom: filters?.startDate,
                endDateTo: filters?.endDate,
                categoryId: filters?.categoryIds?.[0], // Use first category if multiple provided
                organizerId: filters?.organizerIds?.[0], // Use first organizer if multiple provided
                area: filters?.areas?.[0],
                status: filters?.statuses?.[0],
            };
            const [eventMetrics, attendanceAnalytics, popularityMetrics, performanceMetrics,] = await Promise.all([
                this.analyticsRepository.getEventMetrics(eventFilters),
                this.analyticsRepository.getAttendanceAnalytics(eventFilters),
                this.analyticsRepository.getPopularityMetrics(),
                this.analyticsRepository.getPerformanceMetrics(),
            ]);
            const analytics = {
                overview: eventMetrics,
                attendance: attendanceAnalytics,
                popularity: popularityMetrics,
                performance: performanceMetrics,
                generatedAt: new Date().toISOString(),
            };
            return {
                success: true,
                analytics,
                message: "Event analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve event analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get event trends over time
     */
    async getEventTrends(startDate, endDate, granularity = "day") {
        try {
            const trends = await this.analyticsRepository.getEventTrends(startDate, endDate, granularity);
            return {
                success: true,
                trends,
                message: `Event trends retrieved for ${trends.length} ${granularity}s`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve event trends: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get category performance analytics
     */
    async getCategoryAnalytics() {
        try {
            const categoryMetrics = await this.analyticsRepository.getCategoryMetrics();
            const enhancedMetrics = categoryMetrics.map((metric) => ({
                ...metric,
                performance: {
                    utilizationRate: (metric.averageOccupancyRate * 100).toFixed(1) + "%",
                    growthTrend: metric.totalEvents > 0 ? "positive" : "neutral",
                    lastActivity: metric.lastEventDate
                        ? Math.ceil((new Date().getTime() - metric.lastEventDate.getTime()) /
                            (1000 * 60 * 60 * 24)) + " days ago"
                        : "No events",
                },
            }));
            return {
                success: true,
                analytics: enhancedMetrics,
                message: `Category analytics retrieved for ${categoryMetrics.length} categories`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve category analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get organizer performance analytics
     */
    async getOrganizerAnalytics(organizerId) {
        try {
            const organizerMetrics = await this.analyticsRepository.getOrganizerMetrics(organizerId);
            const enhancedMetrics = organizerMetrics.map((metric) => ({
                ...metric,
                performance: {
                    publishingRate: ((metric.publishedEvents / metric.totalEvents) * 100).toFixed(1) +
                        "%",
                    capacityEfficiency: (metric.averageCapacityUtilization * 100).toFixed(1) + "%",
                    totalRevenue: metric.totalRevenue || 0,
                    averageRating: metric.averageEventRating || 0,
                },
            }));
            return {
                success: true,
                analytics: enhancedMetrics,
                message: organizerId
                    ? "Organizer analytics retrieved successfully"
                    : `Analytics retrieved for ${organizerMetrics.length} organizers`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve organizer analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get revenue analytics for paid events
     */
    async getRevenueAnalytics(filters) {
        try {
            const eventFilters = {
                startDateFrom: filters?.startDate,
                endDateTo: filters?.endDate,
                categoryId: filters?.categoryIds?.[0],
                organizerId: filters?.organizerIds?.[0],
                isFree: false, // Only paid events for revenue analytics
            };
            const revenueAnalytics = await this.analyticsRepository.getRevenueAnalytics(eventFilters);
            const enhancedAnalytics = {
                ...revenueAnalytics,
                insights: {
                    averageRevenuePerEvent: revenueAnalytics.paidEventsCount > 0
                        ? (revenueAnalytics.totalRevenue /
                            revenueAnalytics.paidEventsCount).toFixed(2)
                        : "0",
                    freeEventPercentage: ((revenueAnalytics.freeEventsCount /
                        (revenueAnalytics.paidEventsCount +
                            revenueAnalytics.freeEventsCount)) *
                        100).toFixed(1) + "%",
                    topRevenueCategory: revenueAnalytics.revenueByCategory.length > 0
                        ? revenueAnalytics.revenueByCategory.reduce((max, cat) => cat.revenue > max.revenue ? cat : max)
                        : null,
                },
                generatedAt: new Date().toISOString(),
            };
            return {
                success: true,
                analytics: enhancedAnalytics,
                message: "Revenue analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve revenue analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get location and venue analytics
     */
    async getLocationAnalytics() {
        try {
            const locationAnalytics = await this.analyticsRepository.getLocationAnalytics();
            const enhancedAnalytics = {
                ...locationAnalytics,
                insights: {
                    mostPopularVenue: locationAnalytics.venueUtilization.length > 0
                        ? locationAnalytics.venueUtilization.reduce((max, venue) => venue.eventCount > max.eventCount ? venue : max)
                        : null,
                    mostEfficientVenue: locationAnalytics.venueUtilization.length > 0
                        ? locationAnalytics.venueUtilization.reduce((max, venue) => venue.averageOccupancy > max.averageOccupancy ? venue : max)
                        : null,
                    totalVenues: locationAnalytics.venueUtilization.length,
                },
            };
            return {
                success: true,
                analytics: enhancedAnalytics,
                message: "Location analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve location analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get executive dashboard summary
     */
    async getExecutiveDashboard() {
        try {
            const dashboard = await this.dashboardService.generateExecutiveSummary();
            return {
                success: true,
                dashboard,
                message: "Executive dashboard generated successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate executive dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get event manager dashboard
     */
    async getEventManagerDashboard(organizerId) {
        try {
            const dashboard = await this.dashboardService.generateEventManagerDashboard(organizerId);
            return {
                success: true,
                dashboard,
                message: "Event manager dashboard generated successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate event manager dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Generate comprehensive event report
     */
    async generateEventReport(eventId, includeAttendees = false) {
        try {
            const report = await this.reportService.generateEventReport(eventId, includeAttendees);
            return {
                success: report.success,
                reportUrl: report.downloadUrl,
                message: report.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate event report: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Generate category performance report
     */
    async generateCategoryReport(categoryId, startDate, endDate) {
        try {
            const report = await this.reportService.generateCategoryReport(categoryId, startDate, endDate);
            return {
                success: report.success,
                reportUrl: report.downloadUrl,
                message: report.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate category report: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Generate attendance report
     */
    async generateAttendanceReport(filters) {
        try {
            const eventFilters = {
                startDateFrom: filters.startDate,
                endDateTo: filters.endDate,
                categoryId: filters.categoryIds?.[0],
                organizerId: filters.organizerIds?.[0],
                area: filters.areas?.[0],
                status: filters.statuses?.[0],
            };
            const report = await this.reportService.generateAttendanceReport(eventFilters);
            return {
                success: report.success,
                reportUrl: report.downloadUrl,
                message: report.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate attendance report: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Generate revenue report
     */
    async generateRevenueReport(startDate, endDate) {
        try {
            const report = await this.reportService.generateRevenueReport(startDate, endDate);
            return {
                success: report.success,
                reportUrl: report.downloadUrl,
                message: report.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate revenue report: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get real-time analytics summary
     */
    async getRealTimeAnalytics() {
        try {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const [todayTrends, monthTrends, performanceMetrics, popularityMetrics] = await Promise.all([
                this.analyticsRepository.getEventTrends(todayStart, now, "day"),
                this.analyticsRepository.getEventTrends(monthStart, now, "day"),
                this.analyticsRepository.getPerformanceMetrics(),
                this.analyticsRepository.getPopularityMetrics(),
            ]);
            const realTimeAnalytics = {
                today: {
                    events: todayTrends.length > 0 ? todayTrends[0] : null,
                    summary: "Today's activity",
                },
                thisMonth: {
                    totalEvents: monthTrends.reduce((sum, day) => sum + day.eventsCreated, 0),
                    totalAttendees: monthTrends.reduce((sum, day) => sum + day.totalAttendees, 0),
                    averageOccupancy: monthTrends.length > 0
                        ? (monthTrends.reduce((sum, day) => sum + day.averageOccupancy, 0) / monthTrends.length).toFixed(1) + "%"
                        : "0%",
                },
                performance: performanceMetrics,
                trending: {
                    topEvents: popularityMetrics.popularEvents.slice(0, 5),
                    topCategories: popularityMetrics.popularCategories.slice(0, 5),
                    trendingTags: popularityMetrics.trendingTags.slice(0, 10),
                },
                lastUpdated: new Date().toISOString(),
            };
            return {
                success: true,
                analytics: realTimeAnalytics,
                message: "Real-time analytics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to retrieve real-time analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Get comparative analytics between two time periods
     */
    async getComparativeAnalytics(period1Start, period1End, period2Start, period2End) {
        try {
            const [period1Metrics, period2Metrics] = await Promise.all([
                this.analyticsRepository.getEventMetrics({
                    startDateFrom: period1Start,
                    startDateTo: period1End,
                }),
                this.analyticsRepository.getEventMetrics({
                    startDateFrom: period2Start,
                    startDateTo: period2End,
                }),
            ]);
            const comparison = {
                period1: {
                    label: `${period1Start.toDateString()} - ${period1End.toDateString()}`,
                    metrics: period1Metrics,
                },
                period2: {
                    label: `${period2Start.toDateString()} - ${period2End.toDateString()}`,
                    metrics: period2Metrics,
                },
                changes: {
                    totalEvents: {
                        absolute: period1Metrics.totalEvents - period2Metrics.totalEvents,
                        percentage: period2Metrics.totalEvents > 0
                            ? (((period1Metrics.totalEvents - period2Metrics.totalEvents) /
                                period2Metrics.totalEvents) *
                                100).toFixed(1) + "%"
                            : "N/A",
                    },
                    totalAttendees: {
                        absolute: period1Metrics.totalAttendees - period2Metrics.totalAttendees,
                        percentage: period2Metrics.totalAttendees > 0
                            ? (((period1Metrics.totalAttendees -
                                period2Metrics.totalAttendees) /
                                period2Metrics.totalAttendees) *
                                100).toFixed(1) + "%"
                            : "N/A",
                    },
                    averageAttendanceRate: {
                        absolute: (period1Metrics.averageAttendanceRate -
                            period2Metrics.averageAttendanceRate).toFixed(2),
                        percentage: period2Metrics.averageAttendanceRate > 0
                            ? (((period1Metrics.averageAttendanceRate -
                                period2Metrics.averageAttendanceRate) /
                                period2Metrics.averageAttendanceRate) *
                                100).toFixed(1) + "%"
                            : "N/A",
                    },
                },
            };
            return {
                success: true,
                comparison,
                message: "Comparative analytics generated successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to generate comparative analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
}
exports.EventAnalytics = EventAnalytics;
//# sourceMappingURL=EventAnalytics.js.map