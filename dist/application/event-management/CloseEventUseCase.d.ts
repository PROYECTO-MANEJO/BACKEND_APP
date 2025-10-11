/**
 * CloseEventUseCase - Application Layer
 *
 * Caso de uso para cerrar un evento y generar certificados automáticamente
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface CloseEventRequest {
    id: string;
}
export interface CloseEventResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        nom_eve: string;
        estado_eve: string;
        fecha_cierre: Date;
    };
    error?: string;
}
export declare class CloseEventUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request: CloseEventRequest): Promise<CloseEventResponse>;
}
//# sourceMappingURL=CloseEventUseCase.d.ts.map