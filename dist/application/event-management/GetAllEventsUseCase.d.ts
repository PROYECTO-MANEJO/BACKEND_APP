/**
 * GetAllEventsUseCase - Application Layer
 *
 * Caso de uso para obtener todos los eventos con filtros opcionales
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface GetAllEventsRequest {
    estado?: string;
    categoria?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    esGratuito?: boolean;
    tipoAudiencia?: string;
    organizador?: string;
    busqueda?: string;
    page?: number;
    limit?: number;
}
export interface GetAllEventsResponse {
    success: boolean;
    message: string;
    data?: {
        events: any[];
        pagination?: {
            total: number;
            totalPages: number;
            currentPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
    error?: string;
}
export declare class GetAllEventsUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request?: GetAllEventsRequest): Promise<GetAllEventsResponse>;
    private formatEventForResponse;
    private formatTimeFromDate;
}
//# sourceMappingURL=GetAllEventsUseCase.d.ts.map