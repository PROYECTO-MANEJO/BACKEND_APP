/**
 * UpdateEventUseCase - Application Layer
 *
 * Caso de uso para actualizar un evento existente
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface UpdateEventRequest {
    id: string;
    nom_eve?: string;
    des_eve?: string;
    capacidad_max_eve?: number;
    precio?: number;
    are_eve?: string;
    ubi_eve?: string;
}
export interface UpdateEventResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        nom_eve: string;
        estado_eve: string;
        fecha_actualizacion: Date;
    };
    error?: string;
}
export declare class UpdateEventUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request: UpdateEventRequest): Promise<UpdateEventResponse>;
    private validateRequest;
}
//# sourceMappingURL=UpdateEventUseCase.d.ts.map