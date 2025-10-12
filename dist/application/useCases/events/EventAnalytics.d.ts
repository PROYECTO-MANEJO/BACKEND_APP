/**
 * Event Analytics Use Case - Application Layer
 *
 * Handles analytics, reporting, and dashboard data for events and categories
 */
import { EventFilters, EventCategoryStatistics } from "../../../domain/entities/events";
export interface AnalyticsRepository {
    getEventMetrics(filters?: EventFilters): Promise<{
        totalEvents: number;
        publishedEvents: number;
        draftEvents: number;
        cancelledEvents: number;
        completedEvents: number;
        averageCapacity: number;
        totalAttendees: number;
        averageAttendanceRate: number;
    }>;
    getEventTrends(startDate: Date, endDate: Date, granularity: "day" | "week" | "month"): Promise<{
        date: string;
        eventsCreated: number;
        eventsPublished: number;
        eventsCancelled: number;
        totalAttendees: number;
        averageOccupancy: number;
    }[]>;
    getCategoryMetrics(): Promise<{
        categoryId: string;
        categoryName: string;
        totalEvents: number;
        activeEvents: number;
        totalAttendees: number;
        averageEventCapacity: number;
        averageOccupancyRate: number;
        lastEventDate?: Date;
    }[]>;
    getCategoryStatistics(categoryId?: string): Promise<EventCategoryStatistics>;
    getOrganizerMetrics(organizerId?: string): Promise<{
        organizerId: string;
        organizerName: string;
        totalEvents: number;
        publishedEvents: number;
        totalAttendees: number;
        averageEventRating?: number;
        averageCapacityUtilization: number;
        totalRevenue?: number;
    }[]>;
    getAttendanceAnalytics(filters?: EventFilters): Promise<{
        totalRegistrations: number;
        confirmedAttendances: number;
        averageAttendanceRate: number;
        noShowRate: number;
        waitlistConversions: number;
        topPerformingEvents: {
            eventId: string;
            eventName: string;
            attendanceRate: number;
            totalAttendees: number;
        }[];
    }>;
    getPopularityMetrics(): Promise<{
        popularEvents: {
            eventId: string;
            eventName: string;
            views: number;
            registrations: number;
            rating?: number;
            category: string;
        }[];
        popularCategories: {
            categoryId: string;
            categoryName: string;
            totalEvents: number;
            totalViews: number;
            averageOccupancy: number;
        }[];
        trendingTags: {
            tag: string;
            eventCount: number;
            totalViews: number;
        }[];
    }>;
    getRevenueAnalytics(filters?: EventFilters): Promise<{
        totalRevenue: number;
        averageTicketPrice: number;
        paidEventsCount: number;
        freeEventsCount: number;
        revenueByCategory: {
            categoryId: string;
            categoryName: string;
            revenue: number;
            eventCount: number;
        }[];
        monthlyRevenue: {
            month: string;
            revenue: number;
            eventCount: number;
        }[];
    }>;
    getLocationAnalytics(): Promise<{
        venueUtilization: {
            venue: string;
            eventCount: number;
            totalCapacity: number;
            averageOccupancy: number;
        }[];
        areaDistribution: {
            area: string;
            eventCount: number;
            percentage: number;
        }[];
    }>;
    getPerformanceMetrics(): Promise<{
        eventCreationRate: number;
        publishingRate: number;
        cancellationRate: number;
        averageLeadTime: number;
        capacityUtilization: number;
        userEngagement: {
            totalViews: number;
            uniqueViewers: number;
            averageViewsPerEvent: number;
            conversionRate: number;
        };
    }>;
}
export interface DashboardDataService {
    generateExecutiveSummary(): Promise<{
        totalEvents: number;
        totalAttendees: number;
        activeCategories: number;
        monthlyGrowthRate: number;
        keyMetrics: {
            label: string;
            value: number;
            change: number;
            trend: "up" | "down" | "stable";
        }[];
    }>;
    generateEventManagerDashboard(organizerId: string): Promise<{
        myEvents: {
            total: number;
            published: number;
            draft: number;
            upcoming: number;
        };
        recentActivity: {
            eventId: string;
            eventName: string;
            action: string;
            timestamp: Date;
        }[];
        upcomingDeadlines: {
            eventId: string;
            eventName: string;
            deadline: Date;
            type: "publication" | "event_date" | "registration_close";
        }[];
        performanceMetrics: {
            averageAttendanceRate: number;
            totalRevenue: number;
            averageRating: number;
        };
    }>;
}
export interface ReportService {
    generateEventReport(eventId: string, includeAttendees?: boolean): Promise<{
        success: boolean;
        reportData?: any;
        downloadUrl?: string;
        message: string;
    }>;
    generateCategoryReport(categoryId: string, startDate?: Date, endDate?: Date): Promise<{
        success: boolean;
        reportData?: any;
        downloadUrl?: string;
        message: string;
    }>;
    generateAttendanceReport(filters: EventFilters): Promise<{
        success: boolean;
        reportData?: any;
        downloadUrl?: string;
        message: string;
    }>;
    generateRevenueReport(startDate: Date, endDate: Date): Promise<{
        success: boolean;
        reportData?: any;
        downloadUrl?: string;
        message: string;
    }>;
}
export interface AnalyticsFilters {
    startDate?: Date;
    endDate?: Date;
    categoryIds?: string[];
    organizerIds?: string[];
    areas?: string[];
    statuses?: string[];
    includeDeleted?: boolean;
}
export interface AnalyticsDateRange {
    startDate: Date;
    endDate: Date;
}
export interface EventMetrics {
    totalEvents: number;
    publishedEvents: number;
    cancelledEvents: number;
    completedEvents: number;
    totalRegistrations: number;
    averageAttendance: number;
    popularCategories: Array<{
        categoryId: string;
        categoryName: string;
        eventCount: number;
    }>;
}
export interface CategoryAnalytics {
    categoryId: string;
    categoryName: string;
    totalEvents: number;
    avgCapacity: number;
    avgAttendance: number;
    registrationRate: number;
}
export interface TrendAnalysis {
    period: string;
    eventsCreated: number;
    registrations: number;
    completions: number;
    trend: "up" | "down" | "stable";
    changePercentage: number;
}
export interface PerformanceReport {
    period: AnalyticsDateRange;
    metrics: EventMetrics;
    categoryBreakdown: CategoryAnalytics[];
    trends: TrendAnalysis[];
    insights: string[];
}
export declare class EventAnalytics {
    private analyticsRepository;
    private dashboardService;
    private reportService;
    constructor(analyticsRepository: AnalyticsRepository, dashboardService: DashboardDataService, reportService: ReportService);
    /**
     * Get comprehensive event analytics
     */
    getEventAnalytics(filters?: AnalyticsFilters): Promise<{
        success: boolean;
        analytics?: any;
        message: string;
    }>;
    /**
     * Get event trends over time
     */
    getEventTrends(startDate: Date, endDate: Date, granularity?: "day" | "week" | "month"): Promise<{
        success: boolean;
        trends?: any[];
        message: string;
    }>;
    /**
     * Get category performance analytics
     */
    getCategoryAnalytics(): Promise<{
        success: boolean;
        analytics?: any[];
        message: string;
    }>;
    /**
     * Get organizer performance analytics
     */
    getOrganizerAnalytics(organizerId?: string): Promise<{
        success: boolean;
        analytics?: any[];
        message: string;
    }>;
    /**
     * Get revenue analytics for paid events
     */
    getRevenueAnalytics(filters?: AnalyticsFilters): Promise<{
        success: boolean;
        analytics?: any;
        message: string;
    }>;
    /**
     * Get location and venue analytics
     */
    getLocationAnalytics(): Promise<{
        success: boolean;
        analytics?: any;
        message: string;
    }>;
    /**
     * Get executive dashboard summary
     */
    getExecutiveDashboard(): Promise<{
        success: boolean;
        dashboard?: any;
        message: string;
    }>;
    /**
     * Get event manager dashboard
     */
    getEventManagerDashboard(organizerId: string): Promise<{
        success: boolean;
        dashboard?: any;
        message: string;
    }>;
    /**
     * Generate comprehensive event report
     */
    generateEventReport(eventId: string, includeAttendees?: boolean): Promise<{
        success: boolean;
        reportUrl?: string;
        message: string;
    }>;
    /**
     * Generate category performance report
     */
    generateCategoryReport(categoryId: string, startDate?: Date, endDate?: Date): Promise<{
        success: boolean;
        reportUrl?: string;
        message: string;
    }>;
    /**
     * Generate attendance report
     */
    generateAttendanceReport(filters: AnalyticsFilters): Promise<{
        success: boolean;
        reportUrl?: string;
        message: string;
    }>;
    /**
     * Generate revenue report
     */
    generateRevenueReport(startDate: Date, endDate: Date): Promise<{
        success: boolean;
        reportUrl?: string;
        message: string;
    }>;
    /**
     * Get real-time analytics summary
     */
    getRealTimeAnalytics(): Promise<{
        success: boolean;
        analytics?: any;
        message: string;
    }>;
    /**
     * Get comparative analytics between two time periods
     */
    getComparativeAnalytics(period1Start: Date, period1End: Date, period2Start: Date, period2End: Date): Promise<{
        success: boolean;
        comparison?: any;
        message: string;
    }>;
}
//# sourceMappingURL=EventAnalytics.d.ts.map