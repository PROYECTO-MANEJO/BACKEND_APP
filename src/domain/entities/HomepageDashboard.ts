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
  type:
    | "INSCRIPTION"
    | "PAYMENT"
    | "COMPLETION"
    | "CERTIFICATE"
    | "USER_REGISTRATION"
    | "ACTIVITY_CREATED";
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

  // Summary Statistics
  userStats: UserStatistics;
  activityStats: ActivityStatistics;
  financialStats: FinancialStatistics;

  // Recent Information
  recentActivities: RecentActivity[];
  upcomingActivities: ActivitySummary[];
  popularActivities: ActivitySummary[];

  // System Information
  systemAlerts: SystemAlerts[];

  // Performance Metrics
  performanceMetrics: {
    avgResponseTime: number;
    systemUptime: number;
    databaseHealth: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
    activeConnections: number;
  };

  // Metadata
  generatedAt: Date;
  generatedBy?: string;
  refreshInterval: number; // minutes
  nextRefreshAt: Date;
  cacheExpiry: Date;
}

export class HomepageDashboard {
  constructor(private data: HomepageDashboardData) {
    this.validateData();
  }

  public static create(
    userStats: UserStatistics,
    activityStats: ActivityStatistics,
    financialStats: FinancialStatistics,
    generatedBy?: string
  ): HomepageDashboard {
    const now = new Date();
    const refreshInterval = 15; // 15 minutes

    const dashboardData: HomepageDashboardData = {
      id: `dashboard-${Date.now()}`,
      userStats,
      activityStats,
      financialStats,
      recentActivities: [],
      upcomingActivities: [],
      popularActivities: [],
      systemAlerts: [],
      performanceMetrics: {
        avgResponseTime: 0,
        systemUptime: 99.9,
        databaseHealth: "GOOD",
        activeConnections: 0,
      },
      generatedAt: now,
      generatedBy,
      refreshInterval,
      nextRefreshAt: new Date(now.getTime() + refreshInterval * 60000),
      cacheExpiry: new Date(now.getTime() + refreshInterval * 60000),
    };

    return new HomepageDashboard(dashboardData);
  }

  public static fromCalculatedData(
    userData: any[],
    eventData: any[],
    courseData: any[],
    inscriptionData: any[],
    paymentData: any[],
    generatedBy?: string
  ): HomepageDashboard {
    // Calculate user statistics
    const userStats = HomepageDashboard.calculateUserStatistics(userData);

    // Calculate activity statistics
    const activityStats = HomepageDashboard.calculateActivityStatistics(
      eventData,
      courseData,
      inscriptionData
    );

    // Calculate financial statistics
    const financialStats = HomepageDashboard.calculateFinancialStatistics(
      paymentData,
      eventData,
      courseData
    );

    const dashboard = HomepageDashboard.create(
      userStats,
      activityStats,
      financialStats,
      generatedBy
    );

    // Add recent activities
    const recentActivities = HomepageDashboard.generateRecentActivities(
      inscriptionData,
      paymentData,
      userData
    );

    // Add upcoming activities
    const upcomingActivities = HomepageDashboard.generateUpcomingActivities(
      eventData,
      courseData
    );

    // Add popular activities
    const popularActivities = HomepageDashboard.generatePopularActivities(
      eventData,
      courseData,
      inscriptionData
    );

    return dashboard.updateRecentData(
      recentActivities,
      upcomingActivities,
      popularActivities
    );
  }

  private static calculateUserStatistics(userData: any[]): UserStatistics {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = userData.length;
    const activeUsers = userData.filter(
      (u) => u.estado_usu === "ACTIVO"
    ).length;
    const newUsersThisMonth = userData.filter(
      (u) => new Date(u.fec_cre_usu) >= thisMonth
    ).length;

    // Count by roles
    const usersByRole = userData.reduce(
      (acc, user) => {
        const role = user.id_tip_usu;
        switch (role) {
          case 1:
            acc.students++;
            break;
          case 2:
            acc.teachers++;
            break;
          case 3:
            acc.administrators++;
            break;
          default:
            acc.externals++;
            break;
        }
        return acc;
      },
      { students: 0, teachers: 0, administrators: 0, externals: 0 }
    );

    // Generate registration trend (last 6 months)
    const registrationTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthCount = userData.filter((u) => {
        const createdDate = new Date(u.fec_cre_usu);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      registrationTrend.push({
        month: monthStart.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        }),
        count: monthCount,
      });
    }

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      registrationTrend,
    };
  }

  private static calculateActivityStatistics(
    eventData: any[],
    courseData: any[],
    inscriptionData: any[]
  ): ActivityStatistics {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalEvents = eventData.length;
    const totalCourses = courseData.length;
    const activeEvents = eventData.filter((e) => e.estado === "ACTIVO").length;
    const activeCourses = courseData.filter(
      (c) => c.estado === "ACTIVO"
    ).length;

    const upcomingActivities = [
      ...eventData.filter((e) => new Date(e.fec_ini_eve) > now),
      ...courseData.filter((c) => new Date(c.fec_ini_cur) > now),
    ].length;

    const completedActivitiesThisMonth = [
      ...eventData.filter(
        (e) => e.estado === "COMPLETADO" && new Date(e.fec_fin_eve) >= thisMonth
      ),
      ...courseData.filter(
        (c) => c.estado === "COMPLETADO" && new Date(c.fec_fin_cur) >= thisMonth
      ),
    ].length;

    const totalInscriptions = inscriptionData.length;
    const pendingInscriptions = inscriptionData.filter(
      (i) => i.estado_pago === "PENDIENTE" || i.estado_pago_cur === "PENDIENTE"
    ).length;

    // Calculate capacity utilization
    const activitiesWithCapacity = [...eventData, ...courseData].filter(
      (a) => (a.capacidad_max_eve || a.capacidad_max_cur) > 0
    );

    const averageCapacityUtilization =
      activitiesWithCapacity.length > 0
        ? activitiesWithCapacity.reduce((acc, activity) => {
            const capacity =
              activity.capacidad_max_eve || activity.capacidad_max_cur;
            const inscriptions = inscriptionData.filter(
              (i) =>
                i.id_eve === activity.id_eve || i.id_cur === activity.id_cur
            ).length;
            return acc + (inscriptions / capacity) * 100;
          }, 0) / activitiesWithCapacity.length
        : 0;

    // Generate popular categories
    const categoryCounts = new Map();
    [...eventData, ...courseData].forEach((activity) => {
      const categoryName = activity.categoria?.nom_cat || "Sin categoría";
      categoryCounts.set(
        categoryName,
        (categoryCounts.get(categoryName) || 0) + 1
      );
    });

    const popularCategories = Array.from(categoryCounts.entries())
      .map(([categoryName, count]) => ({ categoryName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents,
      totalCourses,
      activeEvents,
      activeCourses,
      upcomingActivities,
      completedActivitiesThisMonth,
      totalInscriptions,
      pendingInscriptions,
      averageCapacityUtilization,
      popularCategories,
    };
  }

  private static calculateFinancialStatistics(
    paymentData: any[],
    eventData: any[],
    courseData: any[]
  ): FinancialStatistics {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate total revenue from approved payments
    const approvedPayments = paymentData.filter(
      (p) => p.estado_pago === "APROBADO" || p.estado_pago_cur === "APROBADO"
    );

    const totalRevenue = approvedPayments.reduce(
      (sum, payment) => sum + (payment.precio || 0),
      0
    );

    const revenueThisMonth = approvedPayments
      .filter((p) => new Date(p.fec_ins || p.fec_ins_cur) >= thisMonth)
      .reduce((sum, payment) => sum + (payment.precio || 0), 0);

    const pendingPayments = paymentData
      .filter(
        (p) =>
          p.estado_pago === "PENDIENTE" || p.estado_pago_cur === "PENDIENTE"
      )
      .reduce((sum, payment) => sum + (payment.precio || 0), 0);

    // Calculate average activity price
    const activitiesWithPrice = [...eventData, ...courseData].filter(
      (a) => !a.es_gratuito && (a.precio || 0) > 0
    );

    const averageActivityPrice =
      activitiesWithPrice.length > 0
        ? activitiesWithPrice.reduce((sum, a) => sum + (a.precio || 0), 0) /
          activitiesWithPrice.length
        : 0;

    // Revenue by category
    const categoryRevenue = new Map();
    approvedPayments.forEach((payment) => {
      const activity =
        eventData.find((e) => e.id_eve === payment.id_eve) ||
        courseData.find((c) => c.id_cur === payment.id_cur);

      if (activity) {
        const categoryName = activity.categoria?.nom_cat || "Sin categoría";
        categoryRevenue.set(
          categoryName,
          (categoryRevenue.get(categoryName) || 0) + (payment.precio || 0)
        );
      }
    });

    const revenueByCategory = Array.from(categoryRevenue.entries())
      .map(([categoryName, amount]) => ({ categoryName, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly revenue trend (last 6 months)
    const monthlyRevenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthRevenue = approvedPayments
        .filter((p) => {
          const paymentDate = new Date(p.fec_ins || p.fec_ins_cur);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        })
        .reduce((sum, p) => sum + (p.precio || 0), 0);

      monthlyRevenueTrend.push({
        month: monthStart.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        }),
        amount: monthRevenue,
      });
    }

    return {
      totalRevenue,
      revenueThisMonth,
      pendingPayments,
      averageActivityPrice,
      revenueByCategory,
      monthlyRevenueTrend,
    };
  }

  private static generateRecentActivities(
    inscriptionData: any[],
    paymentData: any[],
    userData: any[]
  ): RecentActivity[] {
    const recentActivities: RecentActivity[] = [];

    // Recent inscriptions
    inscriptionData.slice(-10).forEach((inscription) => {
      const user = userData.find((u) => u.id_usu === inscription.id_usu);

      recentActivities.push({
        id: `inscription-${inscription.id_ins || inscription.id_ins_cur}`,
        type: "INSCRIPTION",
        title: "Nueva inscripción",
        description: `${
          user?.nombre_completo_usu || "Usuario"
        } se inscribió en una actividad`,
        userId: inscription.id_usu?.toString(),
        userName: user?.nombre_completo_usu,
        activityId:
          inscription.id_eve?.toString() || inscription.id_cur?.toString(),
        timestamp: new Date(inscription.fec_ins || inscription.fec_ins_cur),
        status:
          inscription.estado_pago === "APROBADO" ||
          inscription.estado_pago_cur === "APROBADO"
            ? "SUCCESS"
            : "PENDING",
      });
    });

    return recentActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  private static generateUpcomingActivities(
    eventData: any[],
    courseData: any[]
  ): ActivitySummary[] {
    const now = new Date();
    const upcoming: ActivitySummary[] = [];

    // Upcoming events
    eventData
      .filter((e) => new Date(e.fec_ini_eve) > now && e.estado === "ACTIVO")
      .forEach((event) => {
        upcoming.push({
          id: event.id_eve.toString(),
          type: "EVENT" as const,
          title: event.nom_eve,
          category: event.categoria?.nom_cat || "Sin categoría",
          startDate: new Date(event.fec_ini_eve),
          endDate: new Date(event.fec_fin_eve),
          isActive: event.estado === "ACTIVO",
          inscriptionsCount: 0, // Would need inscription count
          capacity: event.capacidad_max_eve || 0,
          utilizationPercentage: 0,
        });
      });

    // Upcoming courses
    courseData
      .filter((c) => new Date(c.fec_ini_cur) > now && c.estado === "ACTIVO")
      .forEach((course) => {
        upcoming.push({
          id: course.id_cur.toString(),
          type: "COURSE" as const,
          title: course.nom_cur,
          category: course.categoria?.nom_cat || "Sin categoría",
          startDate: new Date(course.fec_ini_cur),
          endDate: new Date(course.fec_fin_cur),
          isActive: course.estado === "ACTIVO",
          inscriptionsCount: 0, // Would need inscription count
          capacity: course.capacidad_max_cur || 0,
          utilizationPercentage: 0,
        });
      });

    return upcoming
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
  }

  private static generatePopularActivities(
    eventData: any[],
    courseData: any[],
    inscriptionData: any[]
  ): ActivitySummary[] {
    const activities: ActivitySummary[] = [];

    // Process events
    eventData.forEach((event) => {
      const inscriptionsCount = inscriptionData.filter(
        (i) => i.id_eve === event.id_eve
      ).length;
      const capacity = event.capacidad_max_eve || 1;

      activities.push({
        id: event.id_eve.toString(),
        type: "EVENT" as const,
        title: event.nom_eve,
        category: event.categoria?.nom_cat || "Sin categoría",
        startDate: new Date(event.fec_ini_eve),
        endDate: new Date(event.fec_fin_eve),
        isActive: event.estado === "ACTIVO",
        inscriptionsCount,
        capacity,
        utilizationPercentage: (inscriptionsCount / capacity) * 100,
      });
    });

    // Process courses
    courseData.forEach((course) => {
      const inscriptionsCount = inscriptionData.filter(
        (i) => i.id_cur === course.id_cur
      ).length;
      const capacity = course.capacidad_max_cur || 1;

      activities.push({
        id: course.id_cur.toString(),
        type: "COURSE" as const,
        title: course.nom_cur,
        category: course.categoria?.nom_cat || "Sin categoría",
        startDate: new Date(course.fec_ini_cur),
        endDate: new Date(course.fec_fin_cur),
        isActive: course.estado === "ACTIVO",
        inscriptionsCount,
        capacity,
        utilizationPercentage: (inscriptionsCount / capacity) * 100,
      });
    });

    return activities
      .sort((a, b) => b.inscriptionsCount - a.inscriptionsCount)
      .slice(0, 8);
  }

  private validateData(): void {
    if (!this.data.userStats) {
      throw new Error("User statistics are required");
    }

    if (!this.data.activityStats) {
      throw new Error("Activity statistics are required");
    }

    if (!this.data.financialStats) {
      throw new Error("Financial statistics are required");
    }

    if (this.data.refreshInterval < 1 || this.data.refreshInterval > 60) {
      throw new Error("Refresh interval must be between 1 and 60 minutes");
    }

    if (this.data.generatedAt > new Date()) {
      throw new Error("Generated date cannot be in the future");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getUserStatistics(): UserStatistics {
    return { ...this.data.userStats };
  }

  public getActivityStatistics(): ActivityStatistics {
    return { ...this.data.activityStats };
  }

  public getFinancialStatistics(): FinancialStatistics {
    return { ...this.data.financialStats };
  }

  public getRecentActivities(): RecentActivity[] {
    return [...this.data.recentActivities];
  }

  public getUpcomingActivities(): ActivitySummary[] {
    return [...this.data.upcomingActivities];
  }

  public getPopularActivities(): ActivitySummary[] {
    return [...this.data.popularActivities];
  }

  public getSystemAlerts(): SystemAlerts[] {
    return [...this.data.systemAlerts];
  }

  public getPerformanceMetrics() {
    return { ...this.data.performanceMetrics };
  }

  public getGeneratedAt(): Date {
    return this.data.generatedAt;
  }

  public getGeneratedBy(): string | undefined {
    return this.data.generatedBy;
  }

  public getRefreshInterval(): number {
    return this.data.refreshInterval;
  }

  public getNextRefreshAt(): Date {
    return this.data.nextRefreshAt;
  }

  public getCacheExpiry(): Date {
    return this.data.cacheExpiry;
  }

  // Status checks
  public isExpired(): boolean {
    return new Date() > this.data.cacheExpiry;
  }

  public needsRefresh(): boolean {
    return new Date() > this.data.nextRefreshAt;
  }

  public hasAlerts(): boolean {
    return this.data.systemAlerts.length > 0;
  }

  public hasCriticalAlerts(): boolean {
    return this.data.systemAlerts.some(
      (alert) => alert.priority === "CRITICAL"
    );
  }

  public getAlertsByPriority(
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ): SystemAlerts[] {
    return this.data.systemAlerts.filter(
      (alert) => alert.priority === priority
    );
  }

  // Actions
  public updateRecentData(
    recentActivities: RecentActivity[],
    upcomingActivities: ActivitySummary[],
    popularActivities: ActivitySummary[]
  ): HomepageDashboard {
    const updatedData = {
      ...this.data,
      recentActivities: recentActivities.slice(0, 20),
      upcomingActivities: upcomingActivities.slice(0, 10),
      popularActivities: popularActivities.slice(0, 10),
      generatedAt: new Date(),
    };

    return new HomepageDashboard(updatedData);
  }

  public addSystemAlert(
    alert: Omit<SystemAlerts, "createdAt">
  ): HomepageDashboard {
    const newAlert: SystemAlerts = {
      ...alert,
      createdAt: new Date(),
    };

    const updatedAlerts = [newAlert, ...this.data.systemAlerts].slice(0, 50);

    const updatedData = {
      ...this.data,
      systemAlerts: updatedAlerts,
    };

    return new HomepageDashboard(updatedData);
  }

  public clearAlert(alertTitle: string): HomepageDashboard {
    const updatedAlerts = this.data.systemAlerts.filter(
      (alert) => alert.title !== alertTitle
    );

    const updatedData = {
      ...this.data,
      systemAlerts: updatedAlerts,
    };

    return new HomepageDashboard(updatedData);
  }

  public updatePerformanceMetrics(
    metrics: Partial<typeof this.data.performanceMetrics>
  ): HomepageDashboard {
    const updatedData = {
      ...this.data,
      performanceMetrics: {
        ...this.data.performanceMetrics,
        ...metrics,
      },
    };

    return new HomepageDashboard(updatedData);
  }

  public refresh(refreshInterval?: number): HomepageDashboard {
    const now = new Date();
    const interval = refreshInterval || this.data.refreshInterval;

    const updatedData = {
      ...this.data,
      refreshInterval: interval,
      nextRefreshAt: new Date(now.getTime() + interval * 60000),
      cacheExpiry: new Date(now.getTime() + interval * 60000),
      generatedAt: now,
    };

    return new HomepageDashboard(updatedData);
  }

  // Analysis methods
  public getOverallHealthScore(): number {
    let score = 100;

    // Performance metrics impact
    const perfMetrics = this.data.performanceMetrics;
    if (perfMetrics.databaseHealth === "POOR") score -= 20;
    else if (perfMetrics.databaseHealth === "FAIR") score -= 10;
    else if (perfMetrics.databaseHealth === "GOOD") score -= 5;

    if (perfMetrics.systemUptime < 99) score -= 15;
    else if (perfMetrics.systemUptime < 99.5) score -= 10;

    if (perfMetrics.avgResponseTime > 2000) score -= 15;
    else if (perfMetrics.avgResponseTime > 1000) score -= 10;
    else if (perfMetrics.avgResponseTime > 500) score -= 5;

    // System alerts impact
    const criticalAlerts = this.getAlertsByPriority("CRITICAL").length;
    const highAlerts = this.getAlertsByPriority("HIGH").length;

    score -= criticalAlerts * 10;
    score -= highAlerts * 5;

    return Math.max(0, Math.min(100, score));
  }

  public getSummary() {
    return {
      totalUsers: this.data.userStats.totalUsers,
      activeUsers: this.data.userStats.activeUsers,
      totalActivities:
        this.data.activityStats.totalEvents +
        this.data.activityStats.totalCourses,
      totalRevenue: this.data.financialStats.totalRevenue,
      pendingInscriptions: this.data.activityStats.pendingInscriptions,
      systemHealth: this.getOverallHealthScore(),
      alertsCount: this.data.systemAlerts.length,
      criticalAlertsCount: this.getAlertsByPriority("CRITICAL").length,
      lastUpdate: this.data.generatedAt,
      needsRefresh: this.needsRefresh(),
    };
  }
}
