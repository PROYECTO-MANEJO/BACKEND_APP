/**
 * Generate Activity Report Use Case
 *
 * Caso de uso para generar reportes de actividades (eventos y cursos)
 */
import { EventAdministration } from "../../../domain/entities/administration/EventAdministration";
import { CourseAdministration } from "../../../domain/entities/administration/CourseAdministration";
import { ParticipationRegistration } from "../../../domain/entities/administration/ParticipationRegistration";
export interface GenerateActivityReportRequest {
    activityIds?: string[];
    activityType?: "EVENTO" | "CURSO" | "ALL";
    reportType: "FINANCIAL" | "PARTICIPATION" | "COMPLETION" | "COMPREHENSIVE";
    dateFrom?: Date;
    dateTo?: Date;
    categoryIds?: string[];
    organizerIds?: string[];
    includeParticipants?: boolean;
    includeStatistics?: boolean;
    includeFinancials?: boolean;
    format?: "JSON" | "PDF" | "EXCEL";
    generatedBy: string;
}
export interface GenerateActivityReportResponse {
    success: boolean;
    message: string;
    reportId?: string;
    reportUrl?: string;
    reportData?: ActivityReportData;
    generatedAt: Date;
    expiresAt?: Date;
}
export interface ActivityReportData {
    summary: {
        totalActivities: number;
        totalEvents: number;
        totalCourses: number;
        totalInscriptions: number;
        totalParticipations: number;
        totalRevenue: number;
        averageAttendance: number;
        averageCompletion: number;
    };
    activities: ActivityReportItem[];
    participants?: ParticipantReportItem[];
    financialSummary?: FinancialReportSummary;
    periodComparison?: PeriodComparisonData;
}
export interface ActivityReportItem {
    id: string;
    name: string;
    type: "EVENTO" | "CURSO";
    category: string;
    organizer: string;
    startDate: Date;
    endDate: Date;
    capacity: number;
    inscriptions: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    participation: {
        registered: number;
        attended: number;
        completed: number;
        certificates: number;
    };
    financial: {
        revenue: number;
        pending: number;
        cost: number;
        profit: number;
    };
    statistics: {
        attendanceRate: number;
        completionRate: number;
        satisfactionScore?: number;
    };
}
export interface ParticipantReportItem {
    id: string;
    name: string;
    email: string;
    cedula: string;
    activitiesCount: number;
    eventsAttended: number;
    coursesCompleted: number;
    certificatesEarned: number;
    totalInvestment: number;
}
export interface FinancialReportSummary {
    totalRevenue: number;
    totalPending: number;
    totalRefunds: number;
    revenueByMethod: Record<string, number>;
    revenueByPeriod: Array<{
        period: string;
        revenue: number;
        inscriptions: number;
    }>;
    profitability: {
        grossProfit: number;
        netProfit: number;
        marginPercentage: number;
    };
}
export interface PeriodComparisonData {
    previousPeriod: {
        activities: number;
        inscriptions: number;
        revenue: number;
        attendance: number;
    };
    currentPeriod: {
        activities: number;
        inscriptions: number;
        revenue: number;
        attendance: number;
    };
    growth: {
        activities: number;
        inscriptions: number;
        revenue: number;
        attendance: number;
    };
}
export interface IEventAdministrationRepository {
    findByFilters(filters: any): Promise<EventAdministration[]>;
    countByFilters(filters: any): Promise<number>;
}
export interface ICourseAdministrationRepository {
    findByFilters(filters: any): Promise<CourseAdministration[]>;
    countByFilters(filters: any): Promise<number>;
}
export interface IParticipationRegistrationRepository {
    findByActivityIds(activityIds: string[]): Promise<ParticipationRegistration[]>;
    findByDateRange(dateFrom: Date, dateTo: Date): Promise<ParticipationRegistration[]>;
}
export interface IReportGenerationService {
    generateReport(reportData: ActivityReportData, format: "JSON" | "PDF" | "EXCEL", templateType: string): Promise<{
        reportId: string;
        reportUrl: string;
        expiresAt: Date;
    }>;
}
export declare class GenerateActivityReportUseCase {
    private eventRepo;
    private courseRepo;
    private participationRepo;
    private reportService;
    constructor(eventRepo: IEventAdministrationRepository, courseRepo: ICourseAdministrationRepository, participationRepo: IParticipationRegistrationRepository, reportService: IReportGenerationService);
    execute(request: GenerateActivityReportRequest): Promise<GenerateActivityReportResponse>;
    private validateRequest;
    private prepareFilters;
    private generateReportData;
    private createEventReportItem;
    private createCourseReportItem;
    private calculateSummary;
    private generateParticipantData;
    private generateFinancialSummary;
    private generatePeriodComparison;
}
//# sourceMappingURL=GenerateActivityReportUseCase.d.ts.map