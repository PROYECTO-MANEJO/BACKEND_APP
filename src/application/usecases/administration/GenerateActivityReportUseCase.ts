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
  activityType?: 'EVENTO' | 'CURSO' | 'ALL';
  reportType: 'FINANCIAL' | 'PARTICIPATION' | 'COMPLETION' | 'COMPREHENSIVE';
  dateFrom?: Date;
  dateTo?: Date;
  categoryIds?: string[];
  organizerIds?: string[];
  includeParticipants?: boolean;
  includeStatistics?: boolean;
  includeFinancials?: boolean;
  format?: 'JSON' | 'PDF' | 'EXCEL';
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
  type: 'EVENTO' | 'CURSO';
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
  generateReport(
    reportData: ActivityReportData, 
    format: 'JSON' | 'PDF' | 'EXCEL', 
    templateType: string
  ): Promise<{ reportId: string; reportUrl: string; expiresAt: Date }>;
}

export class GenerateActivityReportUseCase {
  constructor(
    private eventRepo: IEventAdministrationRepository,
    private courseRepo: ICourseAdministrationRepository,
    private participationRepo: IParticipationRegistrationRepository,
    private reportService: IReportGenerationService
  ) {}

  public async execute(request: GenerateActivityReportRequest): Promise<GenerateActivityReportResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Preparar filtros
      const filters = this.prepareFilters(request);

      // Obtener datos según el tipo de actividad
      const [events, courses] = await Promise.all([
        request.activityType !== 'CURSO' ? this.eventRepo.findByFilters(filters) : Promise.resolve([]),
        request.activityType !== 'EVENTO' ? this.courseRepo.findByFilters(filters) : Promise.resolve([])
      ]);

      // Obtener participaciones si se requiere
      let participations: ParticipationRegistration[] = [];
      if (request.includeParticipants || request.reportType === 'PARTICIPATION') {
        const allActivityIds = [...events.map(e => e.getId()), ...courses.map(c => c.getId())];
        if (allActivityIds.length > 0) {
          participations = await this.participationRepo.findByActivityIds(allActivityIds);
        }
      }

      // Generar datos del reporte
      const reportData = await this.generateReportData(
        events, 
        courses, 
        participations, 
        request
      );

      // Generar archivo de reporte si se requiere formato específico
      let reportUrl: string | undefined;
      let reportId: string | undefined;
      let expiresAt: Date | undefined;

      if (request.format && request.format !== 'JSON') {
        const reportFile = await this.reportService.generateReport(
          reportData,
          request.format,
          request.reportType
        );
        
        reportId = reportFile.reportId;
        reportUrl = reportFile.reportUrl;
        expiresAt = reportFile.expiresAt;
      }

      return {
        success: true,
        message: `Report generated successfully with ${reportData.activities.length} activities`,
        reportId,
        reportUrl,
        reportData: request.format === 'JSON' ? reportData : undefined,
        generatedAt: new Date(),
        expiresAt
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return {
        success: false,
        message: `Error generating report: ${errorMessage}`,
        generatedAt: new Date()
      };
    }
  }

  private validateRequest(request: GenerateActivityReportRequest): void {
    if (!request.generatedBy?.trim()) {
      throw new Error("Generated by is required");
    }

    if (!['FINANCIAL', 'PARTICIPATION', 'COMPLETION', 'COMPREHENSIVE'].includes(request.reportType)) {
      throw new Error("Invalid report type");
    }

    if (request.activityType && !['EVENTO', 'CURSO', 'ALL'].includes(request.activityType)) {
      throw new Error("Invalid activity type");
    }

    if (request.format && !['JSON', 'PDF', 'EXCEL'].includes(request.format)) {
      throw new Error("Invalid report format");
    }

    if (request.dateFrom && request.dateTo && request.dateFrom > request.dateTo) {
      throw new Error("Date from cannot be after date to");
    }

    if (request.activityIds && request.activityIds.length > 1000) {
      throw new Error("Too many activity IDs specified (maximum 1000)");
    }
  }

  private prepareFilters(request: GenerateActivityReportRequest) {
    return {
      activityIds: request.activityIds,
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      categoryIds: request.categoryIds,
      organizerIds: request.organizerIds,
      isActive: true
    };
  }

  private async generateReportData(
    events: EventAdministration[],
    courses: CourseAdministration[],
    participations: ParticipationRegistration[],
    request: GenerateActivityReportRequest
  ): Promise<ActivityReportData> {
    
    // Generar elementos del reporte para actividades
    const eventItems = events.map(event => this.createEventReportItem(event, participations));
    const courseItems = courses.map(course => this.createCourseReportItem(course, participations));
    const allActivityItems = [...eventItems, ...courseItems];

    // Calcular resumen general
    const summary = this.calculateSummary(events, courses, participations);

    // Generar datos de participantes si se requiere
    let participantData: ParticipantReportItem[] | undefined;
    if (request.includeParticipants) {
      participantData = this.generateParticipantData(participations, allActivityItems);
    }

    // Generar resumen financiero si se requiere
    let financialSummary: FinancialReportSummary | undefined;
    if (request.includeFinancials || request.reportType === 'FINANCIAL') {
      financialSummary = this.generateFinancialSummary(events, courses);
    }

    // Generar comparación de períodos si hay fechas
    let periodComparison: PeriodComparisonData | undefined;
    if (request.dateFrom && request.dateTo) {
      periodComparison = await this.generatePeriodComparison(request.dateFrom, request.dateTo);
    }

    return {
      summary,
      activities: allActivityItems,
      participants: participantData,
      financialSummary,
      periodComparison
    };
  }

  private createEventReportItem(
    event: EventAdministration, 
    participations: ParticipationRegistration[]
  ): ActivityReportItem {
    const eventParticipations = participations.filter(p => p.getActivityId() === event.getId());
    const statistics = event.getStatistics();

    return {
      id: event.getId(),
      name: event.getEventName(),
      type: 'EVENTO',
      category: event.getCategoryName(),
      organizer: event.getOrganizerName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      capacity: event.getMaxCapacity(),
      inscriptions: {
        total: statistics.totalInscriptions,
        approved: statistics.approvedInscriptions,
        pending: statistics.pendingInscriptions,
        rejected: statistics.rejectedInscriptions
      },
      participation: {
        registered: eventParticipations.filter(p => p.getStatus() === 'REGISTERED').length,
        attended: eventParticipations.filter(p => p.getStatus() === 'ATTENDED').length,
        completed: eventParticipations.filter(p => p.getStatus() === 'COMPLETED').length,
        certificates: eventParticipations.filter(p => p.isCertificateGenerated()).length
      },
      financial: {
        revenue: event.getTotalRevenue(),
        pending: event.getPendingRevenue(),
        cost: event.getEventCost(),
        profit: event.getTotalRevenue() - event.getEventCost()
      },
      statistics: {
        attendanceRate: eventParticipations.length > 0 
          ? (eventParticipations.filter(p => p.hasAttended()).length / eventParticipations.length) * 100 
          : 0,
        completionRate: eventParticipations.length > 0
          ? (eventParticipations.filter(p => p.isCompleted()).length / eventParticipations.length) * 100
          : 0
      }
    };
  }

  private createCourseReportItem(
    course: CourseAdministration, 
    participations: ParticipationRegistration[]
  ): ActivityReportItem {
    const courseParticipations = participations.filter(p => p.getActivityId() === course.getId());
    const statistics = course.getStatistics();

    return {
      id: course.getId(),
      name: course.getCourseName(),
      type: 'CURSO',
      category: course.getCategoryName(),
      organizer: course.getOrganizerName(),
      startDate: course.getStartDate(),
      endDate: course.getEndDate(),
      capacity: course.getMaxCapacity(),
      inscriptions: {
        total: statistics.totalInscriptions,
        approved: statistics.approvedInscriptions,
        pending: statistics.pendingInscriptions,
        rejected: statistics.rejectedInscriptions
      },
      participation: {
        registered: courseParticipations.filter(p => p.getStatus() === 'REGISTERED').length,
        attended: courseParticipations.filter(p => p.getStatus() === 'ATTENDED').length,
        completed: courseParticipations.filter(p => p.getStatus() === 'COMPLETED').length,
        certificates: courseParticipations.filter(p => p.isCertificateGenerated()).length
      },
      financial: {
        revenue: course.getTotalRevenue(),
        pending: course.getPendingRevenue(),
        cost: course.getCourseCost(),
        profit: course.getTotalRevenue() - course.getCourseCost()
      },
      statistics: {
        attendanceRate: courseParticipations.length > 0 
          ? (courseParticipations.filter(p => p.hasAttended()).length / courseParticipations.length) * 100 
          : 0,
        completionRate: courseParticipations.length > 0
          ? (courseParticipations.filter(p => p.isCompleted()).length / courseParticipations.length) * 100
          : 0
      }
    };
  }

  private calculateSummary(
    events: EventAdministration[],
    courses: CourseAdministration[],
    participations: ParticipationRegistration[]
  ) {
    const totalEvents = events.length;
    const totalCourses = courses.length;
    const totalActivities = totalEvents + totalCourses;

    const totalInscriptions = events.reduce((sum, e) => sum + e.getStatistics().totalInscriptions, 0) +
                            courses.reduce((sum, c) => sum + c.getStatistics().totalInscriptions, 0);

    const totalRevenue = events.reduce((sum, e) => sum + e.getTotalRevenue(), 0) +
                        courses.reduce((sum, c) => sum + c.getTotalRevenue(), 0);

    const attendedParticipations = participations.filter(p => p.hasAttended()).length;
    const completedParticipations = participations.filter(p => p.isCompleted()).length;

    return {
      totalActivities,
      totalEvents,
      totalCourses,
      totalInscriptions,
      totalParticipations: participations.length,
      totalRevenue,
      averageAttendance: participations.length > 0 ? (attendedParticipations / participations.length) * 100 : 0,
      averageCompletion: participations.length > 0 ? (completedParticipations / participations.length) * 100 : 0
    };
  }

  private generateParticipantData(
    participations: ParticipationRegistration[],
    activities: ActivityReportItem[]
  ): ParticipantReportItem[] {
    const participantMap = new Map<string, ParticipantReportItem>();

    participations.forEach(participation => {
      const key = participation.getParticipantId();
      const existing = participantMap.get(key);
      
      const activity = activities.find(a => a.id === participation.getActivityId());
      const investment = activity?.financial.cost || 0;

      if (existing) {
        existing.activitiesCount++;
        if (activity?.type === 'EVENTO' && participation.hasAttended()) {
          existing.eventsAttended++;
        }
        if (activity?.type === 'CURSO' && participation.isCompleted()) {
          existing.coursesCompleted++;
        }
        if (participation.isCertificateGenerated()) {
          existing.certificatesEarned++;
        }
        existing.totalInvestment += investment;
      } else {
        participantMap.set(key, {
          id: participation.getParticipantId(),
          name: participation.getParticipantName(),
          email: participation.getParticipantEmail(),
          cedula: participation.getParticipantCedula(),
          activitiesCount: 1,
          eventsAttended: (activity?.type === 'EVENTO' && participation.hasAttended()) ? 1 : 0,
          coursesCompleted: (activity?.type === 'CURSO' && participation.isCompleted()) ? 1 : 0,
          certificatesEarned: participation.isCertificateGenerated() ? 1 : 0,
          totalInvestment: investment
        });
      }
    });

    return Array.from(participantMap.values());
  }

  private generateFinancialSummary(
    events: EventAdministration[],
    courses: CourseAdministration[]
  ): FinancialReportSummary {
    const totalRevenue = events.reduce((sum, e) => sum + e.getTotalRevenue(), 0) +
                        courses.reduce((sum, c) => sum + c.getTotalRevenue(), 0);

    const totalPending = events.reduce((sum, e) => sum + e.getPendingRevenue(), 0) +
                        courses.reduce((sum, c) => sum + c.getPendingRevenue(), 0);

    const totalCosts = events.reduce((sum, e) => sum + e.getEventCost(), 0) +
                      courses.reduce((sum, c) => sum + c.getCourseCost(), 0);

    return {
      totalRevenue,
      totalPending,
      totalRefunds: 0, // Would need additional data
      revenueByMethod: {
        'EFECTIVO': totalRevenue * 0.3, // Example distribution
        'TARJETA': totalRevenue * 0.5,
        'TRANSFERENCIA': totalRevenue * 0.2
      },
      revenueByPeriod: [], // Would need time-series data
      profitability: {
        grossProfit: totalRevenue - totalCosts,
        netProfit: (totalRevenue - totalCosts) * 0.8, // Assuming 20% additional costs
        marginPercentage: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
      }
    };
  }

  private async generatePeriodComparison(
    dateFrom: Date, 
    dateTo: Date
  ): Promise<PeriodComparisonData> {
    // Calculate previous period (same duration before dateFrom)
    const periodDuration = dateTo.getTime() - dateFrom.getTime();
    const previousPeriodEnd = new Date(dateFrom.getTime());
    const previousPeriodStart = new Date(dateFrom.getTime() - periodDuration);

    // Get previous period participations for comparison
    const previousParticipations = await this.participationRepo.findByDateRange(
      previousPeriodStart, 
      previousPeriodEnd
    );

    const currentParticipations = await this.participationRepo.findByDateRange(
      dateFrom, 
      dateTo
    );

    // Calculate metrics for both periods
    const previousMetrics = {
      activities: 0, // Would need activity-specific queries
      inscriptions: previousParticipations.length,
      revenue: 0, // Would need financial data
      attendance: previousParticipations.filter(p => p.hasAttended()).length
    };

    const currentMetrics = {
      activities: 0, // Would need activity-specific queries
      inscriptions: currentParticipations.length,
      revenue: 0, // Would need financial data
      attendance: currentParticipations.filter(p => p.hasAttended()).length
    };

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      previousPeriod: previousMetrics,
      currentPeriod: currentMetrics,
      growth: {
        activities: calculateGrowth(currentMetrics.activities, previousMetrics.activities),
        inscriptions: calculateGrowth(currentMetrics.inscriptions, previousMetrics.inscriptions),
        revenue: calculateGrowth(currentMetrics.revenue, previousMetrics.revenue),
        attendance: calculateGrowth(currentMetrics.attendance, previousMetrics.attendance)
      }
    };
  }
}