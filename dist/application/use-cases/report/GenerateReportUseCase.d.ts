/**
 * GenerateReportUseCase - Application Layer
 *
 * Caso de uso para generar reportes del sistema.
 */
import { ReportManagementService } from "../../../domain/services/ReportManagementService";
import { Report, ReportType, ReportFormat } from "../../../domain/entities/Report";
export interface GenerateReportRequest {
    type: ReportType;
    format: ReportFormat;
    filters?: {
        startDate?: Date;
        endDate?: Date;
        entityId?: string;
        userId?: string;
        status?: string;
        [key: string]: any;
    };
    requestedBy: string;
    isPublic?: boolean;
    description?: string;
}
export interface GenerateReportResponse {
    success: boolean;
    report?: Report;
    message: string;
    downloadToken?: string;
    errors?: string[];
}
export declare class GenerateReportUseCase {
    private reportManagementService;
    constructor(reportManagementService: ReportManagementService);
    execute(request: GenerateReportRequest): Promise<GenerateReportResponse>;
    private validateRequest;
}
//# sourceMappingURL=GenerateReportUseCase.d.ts.map