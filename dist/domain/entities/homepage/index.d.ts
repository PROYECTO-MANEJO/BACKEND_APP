/**
 * Homepage Domain Entities - Index
 *
 * Exporta todas las entidades del dominio de homepage
 */
export { HomepageContent } from "./HomepageContent";
export type { HomepageContentData, ImageSection, ContentSection, } from "./HomepageContent";
export { HomepageDashboard } from "./HomepageDashboard";
export type { HomepageDashboardData, ActivitySummary, UserStatistics, ActivityStatistics, FinancialStatistics, SystemAlerts, RecentActivity, } from "./HomepageDashboard";
export interface HomepageSettings {
    enableAutoRefresh: boolean;
    refreshIntervalMinutes: number;
    maxRecentActivities: number;
    showSystemAlerts: boolean;
    enableAnalytics: boolean;
}
export interface ImageUploadOptions {
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    compressionQuality: number;
    generateThumbnails: boolean;
}
export interface DashboardFilters {
    dateRange?: {
        from: Date;
        to: Date;
    };
    includeStatistics?: boolean;
    includeRecentActivities?: boolean;
    includeUpcoming?: boolean;
    includePopular?: boolean;
    includeAlerts?: boolean;
    maxItems?: number;
}
export interface ContentValidationRules {
    minTitleLength: number;
    maxTitleLength: number;
    minDescriptionLength: number;
    maxDescriptionLength: number;
    requiredSections: string[];
    allowedImageTypes: string[];
}
export interface ContentAnalytics {
    pageViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
    mostViewedSections: Array<{
        sectionId: string;
        views: number;
    }>;
    deviceBreakdown: {
        desktop: number;
        tablet: number;
        mobile: number;
    };
    trafficSources: Array<{
        source: string;
        visits: number;
        percentage: number;
    }>;
}
export interface DashboardAnalytics {
    totalLogins: number;
    activeUsers: number;
    peakUsageHours: number[];
    mostUsedFeatures: Array<{
        feature: string;
        usage: number;
    }>;
    userEngagement: {
        averageSessionDuration: number;
        actionsPerSession: number;
        returnVisitorRate: number;
    };
}
export interface CacheStrategy {
    contentCacheDuration: number;
    dashboardCacheDuration: number;
    imageCacheDuration: number;
    enableBrowserCache: boolean;
    enableCDN: boolean;
}
export interface PerformanceThresholds {
    maxResponseTime: number;
    minUptime: number;
    maxMemoryUsage: number;
    maxDatabaseConnections: number;
    alertThresholds: {
        warning: number;
        critical: number;
    };
}
//# sourceMappingURL=index.d.ts.map