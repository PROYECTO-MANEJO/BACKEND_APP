/**
 * Interfaz del repositorio para la gestión de reportes
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface IReportRepository {
    /**
     * Generar reporte de inscripciones por evento
     */
    generateEventEnrollmentReport(eventId: string): Promise<EventEnrollmentReport>;
    /**
     * Generar reporte de inscripciones por curso
     */
    generateCourseEnrollmentReport(courseId: string): Promise<CourseEnrollmentReport>;
    /**
     * Generar reporte de participaciones por evento
     */
    generateEventParticipationReport(eventId: string): Promise<EventParticipationReport>;
    /**
     * Generar reporte de participaciones por curso
     */
    generateCourseParticipationReport(courseId: string): Promise<CourseParticipationReport>;
    /**
     * Generar reporte general de eventos
     */
    generateEventsOverviewReport(filters?: ReportFilters): Promise<EventsOverviewReport>;
    /**
     * Generar reporte general de cursos
     */
    generateCoursesOverviewReport(filters?: ReportFilters): Promise<CoursesOverviewReport>;
    /**
     * Generar reporte de certificados emitidos
     */
    generateCertificatesReport(filters?: ReportFilters): Promise<CertificatesReport>;
    /**
     * Generar reporte de usuarios por carrera
     */
    generateUsersByCareerReport(): Promise<UsersByCareerReport>;
    /**
     * Generar reporte de pagos y transacciones
     */
    generatePaymentsReport(filters?: PaymentFilters): Promise<PaymentsReport>;
    /**
     * Generar reporte de asistencias
     */
    generateAttendanceReport(activityId: string, activityType: "EVENT" | "COURSE"): Promise<AttendanceReport>;
    /**
     * Generar reporte personalizado con métricas específicas
     */
    generateCustomReport(metrics: ReportMetrics): Promise<CustomReport>;
    /**
     * Obtener datos para gráficos de dashboard
     */
    getDashboardData(): Promise<DashboardData>;
    /**
     * Exportar reporte a PDF
     */
    exportReportToPDF(reportType: string, reportData: any): Promise<Buffer>;
    /**
     * Exportar reporte a Excel
     */
    exportReportToExcel(reportType: string, reportData: any): Promise<Buffer>;
}
/**
 * Filtros base para reportes
 */
export interface ReportFilters {
    dateFrom?: Date;
    dateTo?: Date;
    careerId?: string;
    organizerId?: string;
    categoryId?: string;
    status?: string;
}
/**
 * Filtros específicos para reportes de pagos
 */
export interface PaymentFilters extends ReportFilters {
    paymentStatus?: "APPROVED" | "PENDING" | "REJECTED";
    paymentMethod?: string;
    amountFrom?: number;
    amountTo?: number;
}
/**
 * Métricas personalizadas para reportes
 */
export interface ReportMetrics {
    includeEnrollments?: boolean;
    includeParticipations?: boolean;
    includePayments?: boolean;
    includeCertificates?: boolean;
    includeAttendance?: boolean;
    groupBy?: "DATE" | "CAREER" | "CATEGORY" | "ORGANIZER";
    aggregationType?: "COUNT" | "SUM" | "AVG" | "PERCENTAGE";
}
/**
 * Reporte de inscripciones por evento
 */
export interface EventEnrollmentReport {
    eventId: string;
    eventName: string;
    totalEnrollments: number;
    approvedEnrollments: number;
    pendingEnrollments: number;
    rejectedEnrollments: number;
    enrollmentsByDate: EnrollmentByDate[];
    enrollmentsByCareer: EnrollmentByCareer[];
    enrollmentDetails: EnrollmentDetail[];
}
/**
 * Reporte de inscripciones por curso
 */
export interface CourseEnrollmentReport {
    courseId: string;
    courseName: string;
    totalEnrollments: number;
    approvedEnrollments: number;
    pendingEnrollments: number;
    rejectedEnrollments: number;
    enrollmentsByDate: EnrollmentByDate[];
    enrollmentsByCareer: EnrollmentByCareer[];
    enrollmentDetails: EnrollmentDetail[];
}
/**
 * Reporte de participaciones por evento
 */
export interface EventParticipationReport {
    eventId: string;
    eventName: string;
    totalParticipants: number;
    completedParticipants: number;
    failedParticipants: number;
    averageAttendance: number;
    certificatesIssued: number;
    participationDetails: ParticipationDetail[];
}
/**
 * Reporte de participaciones por curso
 */
export interface CourseParticipationReport {
    courseId: string;
    courseName: string;
    totalParticipants: number;
    completedParticipants: number;
    failedParticipants: number;
    averageAttendance: number;
    averageGrade: number;
    certificatesIssued: number;
    participationDetails: ParticipationDetail[];
}
/**
 * Reporte general de eventos
 */
export interface EventsOverviewReport {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalEnrollments: number;
    totalParticipants: number;
    eventsByCategory: EventsByCategory[];
    eventsByCareer: EventsByCareer[];
    eventsByMonth: EventsByMonth[];
}
/**
 * Reporte general de cursos
 */
export interface CoursesOverviewReport {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    totalEnrollments: number;
    totalParticipants: number;
    coursesByCategory: CoursesByCategory[];
    coursesByCareer: CoursesByCareer[];
    coursesByMonth: CoursesByMonth[];
}
/**
 * Reporte de certificados
 */
export interface CertificatesReport {
    totalCertificatesIssued: number;
    certificatesByType: CertificatesByType[];
    certificatesByMonth: CertificatesByMonth[];
    certificatesByCareer: CertificatesByCareer[];
}
/**
 * Reporte de usuarios por carrera
 */
export interface UsersByCareerReport {
    totalUsers: number;
    usersByCareer: UsersByCareer[];
    usersWithDocuments: number;
    usersWithApprovedDocuments: number;
}
/**
 * Reporte de pagos
 */
export interface PaymentsReport {
    totalPayments: number;
    approvedPayments: number;
    pendingPayments: number;
    rejectedPayments: number;
    totalAmount: number;
    paymentsByMethod: PaymentsByMethod[];
    paymentsByMonth: PaymentsByMonth[];
}
/**
 * Reporte de asistencias
 */
export interface AttendanceReport {
    activityId: string;
    activityName: string;
    activityType: "EVENT" | "COURSE";
    totalSessions: number;
    averageAttendance: number;
    attendanceBySession: AttendanceBySession[];
    participantAttendance: ParticipantAttendance[];
}
/**
 * Reporte personalizado
 */
export interface CustomReport {
    reportName: string;
    generatedAt: Date;
    filters: ReportFilters;
    metrics: ReportMetrics;
    data: any;
    summary: ReportSummary;
}
/**
 * Datos para dashboard
 */
export interface DashboardData {
    totalUsers: number;
    totalEvents: number;
    totalCourses: number;
    totalEnrollments: number;
    recentActivity: RecentActivity[];
    monthlyStats: MonthlyStats[];
    popularCategories: PopularCategory[];
}
export interface EnrollmentByDate {
    date: Date;
    count: number;
}
export interface EnrollmentByCareer {
    careerId: string;
    careerName: string;
    count: number;
}
export interface EnrollmentDetail {
    userId: string;
    userName: string;
    userCedula: string;
    careerName: string;
    enrollmentDate: Date;
    paymentStatus: string;
    amount?: number;
}
export interface ParticipationDetail {
    userId: string;
    userName: string;
    userCedula: string;
    attendancePercentage: number;
    finalGrade?: number;
    isApproved: boolean;
    certificateIssued: boolean;
}
export interface EventsByCategory {
    categoryId: string;
    categoryName: string;
    count: number;
}
export interface EventsByCareer {
    careerId: string;
    careerName: string;
    count: number;
}
export interface EventsByMonth {
    year: number;
    month: number;
    count: number;
}
export interface CoursesByCategory {
    categoryId: string;
    categoryName: string;
    count: number;
}
export interface CoursesByCareer {
    careerId: string;
    careerName: string;
    count: number;
}
export interface CoursesByMonth {
    year: number;
    month: number;
    count: number;
}
export interface CertificatesByType {
    type: "EVENT" | "COURSE";
    count: number;
}
export interface CertificatesByMonth {
    year: number;
    month: number;
    count: number;
}
export interface CertificatesByCareer {
    careerId: string;
    careerName: string;
    count: number;
}
export interface UsersByCareer {
    careerId: string;
    careerName: string;
    count: number;
}
export interface PaymentsByMethod {
    method: string;
    count: number;
    amount: number;
}
export interface PaymentsByMonth {
    year: number;
    month: number;
    count: number;
    amount: number;
}
export interface AttendanceBySession {
    sessionNumber: number;
    date: Date;
    attendees: number;
    percentage: number;
}
export interface ParticipantAttendance {
    userId: string;
    userName: string;
    sessionsAttended: number;
    attendancePercentage: number;
}
export interface ReportSummary {
    totalRecords: number;
    averages: Record<string, number>;
    totals: Record<string, number>;
    percentages: Record<string, number>;
}
export interface RecentActivity {
    type: "ENROLLMENT" | "PARTICIPATION" | "CERTIFICATE" | "PAYMENT";
    description: string;
    date: Date;
    userId?: string;
    activityId?: string;
}
export interface MonthlyStats {
    year: number;
    month: number;
    enrollments: number;
    participations: number;
    certificates: number;
    payments: number;
}
export interface PopularCategory {
    categoryId: string;
    categoryName: string;
    eventCount: number;
    courseCount: number;
    totalEnrollments: number;
}
//# sourceMappingURL=IReportRepository.d.ts.map