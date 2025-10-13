import { PrismaClient } from "@prisma/client";
import { IReportRepository, EventEnrollmentReport, CourseEnrollmentReport, EventParticipationReport, CourseParticipationReport, EventsOverviewReport, CoursesOverviewReport, DashboardData, ReportFilters, CustomReport } from "../../domain/repositories/IReportRepository";
/**
 * Implementación concreta del repositorio de reportes usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la generación de reportes
 */
export declare class PrismaReportRepository implements IReportRepository {
    private prisma;
    constructor(prisma: PrismaClient);
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
     * Obtener datos para dashboard
     */
    getDashboardData(): Promise<DashboardData>;
    generateCertificatesReport(): Promise<any>;
    generateUsersByCareerReport(): Promise<any>;
    generatePaymentsReport(): Promise<any>;
    generateAttendanceReport(): Promise<any>;
    generateCustomReport(): Promise<CustomReport>;
    exportReportToPDF(): Promise<Buffer>;
    exportReportToExcel(): Promise<Buffer>;
    private groupEnrollmentsByDate;
    private groupEnrollmentsByCareer;
    private groupCourseEnrollmentsByDate;
    private groupCourseEnrollmentsByCareer;
    private groupEventsByCategory;
    private groupEventsByCareer;
    private groupEventsByMonth;
}
//# sourceMappingURL=PrismaReportRepository.d.ts.map