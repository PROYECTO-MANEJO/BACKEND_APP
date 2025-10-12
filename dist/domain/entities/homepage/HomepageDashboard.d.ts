/**
 * Homepage Dashboard Entity - Domain Layer
 *
 * Representa las estadísticas y métricas del dashboard de la página principal
 */
export interface ActivitySummary {
    id: string;
    type: "EVENT" | "COURSE";
    title: string;
    category: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    inscriptionsCount: number;
    capacity: number;
    utilizationPercentage: number;
}
export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: {
        students: number;
        teachers: number;
        administrators: number;
        externals: number;
    };
    registrationTrend: Array<{
        month: string;
        count: number;
    }>;
}
export interface ActivityStatistics {
    totalEvents: number;
    totalCourses: number;
    activeEvents: number;
    activeCourses: number;
    upcomingActivities: number;
    completedActivitiesThisMonth: number;
    totalInscriptions: number;
    pendingInscriptions: number;
    averageCapacityUtilization: number;
    popularCategories: Array<{
        categoryName: string;
        count: number;
    }>;
}
export interface FinancialStatistics {
    totalRevenue: number;
    revenueThisMonth: number;
    pendingPayments: number;
    averageActivityPrice: number;
    revenueByCategory: Array<{
        categoryName: string;
        amount: number;
    }>;
    monthlyRevenueTrend: Array<{
        month: string;
        amount: number;
    }>;
}
export interface SystemAlerts {
    type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    title: string;
    message: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    createdAt: Date;
    actionRequired: boolean;
    actionUrl?: string;
}
export interface RecentActivity {
    id: string;
    type: "INSCRIPTION" | "PAYMENT" | "COMPLETION" | "CERTIFICATE" | "USER_REGISTRATION" | "ACTIVITY_CREATED";
    title: string;
    description: string;
    userId?: string;
    userName?: string;
    activityId?: string;
    activityName?: string;
    timestamp: Date;
    status: "SUCCESS" | "PENDING" | "FAILED";
}
export interface HomepageDashboardData {
    id: string;
    userStats: UserStatistics;
    activityStats: ActivityStatistics;
    financialStats: FinancialStatistics;
    recentActivities: RecentActivity[];
    upcomingActivities: ActivitySummary[];
    popularActivities: ActivitySummary[];
    systemAlerts: SystemAlerts[];
    performanceMetrics: {
        avgResponseTime: number;
        systemUptime: number;
        databaseHealth: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
        activeConnections: number;
    };
    generatedAt: Date;
    generatedBy?: string;
    refreshInterval: number;
    nextRefreshAt: Date;
    cacheExpiry: Date;
}
export declare class HomepageDashboard {
    private data;
    constructor(data: HomepageDashboardData);
    static create(userStats: UserStatistics, activityStats: ActivityStatistics, financialStats: FinancialStatistics, generatedBy?: string): HomepageDashboard;
    static fromCalculatedData(userData: any[], eventData: any[], courseData: any[], inscriptionData: any[], paymentData: any[], generatedBy?: string): HomepageDashboard;
    private static calculateUserStatistics;
    private static calculateActivityStatistics;
    private static calculateFinancialStatistics;
    private static generateRecentActivities;
    private static generateUpcomingActivities;
    private static generatePopularActivities;
    private validateData;
    getId(): string;
    getUserStatistics(): UserStatistics;
    getActivityStatistics(): ActivityStatistics;
    getFinancialStatistics(): FinancialStatistics;
    getRecentActivities(): RecentActivity[];
    getUpcomingActivities(): ActivitySummary[];
    getPopularActivities(): ActivitySummary[];
    getSystemAlerts(): SystemAlerts[];
    getPerformanceMetrics(): {
        avgResponseTime: number;
        systemUptime: number;
        databaseHealth: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
        activeConnections: number;
    };
    getGeneratedAt(): Date;
    getGeneratedBy(): string | undefined;
    getRefreshInterval(): number;
    getNextRefreshAt(): Date;
    getCacheExpiry(): Date;
    isExpired(): boolean;
    needsRefresh(): boolean;
    hasAlerts(): boolean;
    hasCriticalAlerts(): boolean;
    getAlertsByPriority(priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): SystemAlerts[];
    updateRecentData(recentActivities: RecentActivity[], upcomingActivities: ActivitySummary[], popularActivities: ActivitySummary[]): HomepageDashboard;
    addSystemAlert(alert: Omit<SystemAlerts, "createdAt">): HomepageDashboard;
    clearAlert(alertTitle: string): HomepageDashboard;
    updatePerformanceMetrics(metrics: Partial<typeof this.data.performanceMetrics>): HomepageDashboard;
    refresh(refreshInterval?: number): HomepageDashboard;
    getOverallHealthScore(): number;
    getSummary(): {
        totalUsers: number;
        activeUsers: number;
        totalActivities: number;
        totalRevenue: number;
        pendingInscriptions: number;
        systemHealth: number;
        alertsCount: number;
        criticalAlertsCount: number;
        lastUpdate: Date;
        needsRefresh: boolean;
    };
}
//# sourceMappingURL=HomepageDashboard.d.ts.map