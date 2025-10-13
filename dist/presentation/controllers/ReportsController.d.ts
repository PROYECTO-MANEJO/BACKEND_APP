import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class ReportsController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/admin/reports/financial/generate
     * Generar reporte financiero PDF
     */
    generateFinancialReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/users/generate
     * Generar reporte de usuarios PDF
     */
    generateUsersReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/events/generate
     * Generar reporte de eventos PDF
     */
    generateEventsReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/courses/generate
     * Generar reporte de cursos PDF
     */
    generateCoursesReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/change-requests/status/generate
     * Generar reporte de solicitudes por estado (Solo MASTER)
     */
    generateChangeRequestsStatusReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/change-requests/developers/generate
     * Generar reporte de solicitudes por desarrollador (Solo MASTER)
     */
    generateChangeRequestsDevelopersReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/reports/change-requests/summary/generate
     * Generar reporte ejecutivo de solicitudes (Solo MASTER)
     */
    generateChangeRequestsSummaryReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/reports
     * Listar reportes por tipo
     */
    getReports(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/reports/:id/download
     * Descargar reporte por ID
     */
    downloadReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/reports/stats
     * Obtener estadísticas de reportes generados
     */
    getReportStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    private generateFinancialPDF;
    private generateUsersPDF;
    private generateEventsPDF;
    private generateCoursesPDF;
    private generateChangeRequestsStatusPDF;
    private generateChangeRequestsDevelopersPDF;
    private generateChangeRequestsSummaryPDF;
    private getAuthenticatedUserRole;
    private translateStatus;
    private translatePriority;
    private translateChangeType;
}
//# sourceMappingURL=ReportsController.d.ts.map