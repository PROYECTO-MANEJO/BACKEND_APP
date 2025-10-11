/**
 * CreateEventUseCase - Application Layer
 *
 * Caso de uso para crear un nuevo evento en el sistema
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface CreateEventRequest {
    nom_eve: string;
    des_eve: string;
    id_cat_eve: number;
    fec_ini_eve: string;
    fec_fin_eve?: string;
    hor_ini_eve: string;
    hor_fin_eve?: string;
    dur_eve: number;
    are_eve: string;
    ubi_eve: string;
    ced_org_eve: string;
    capacidad_max_eve: number;
    tipo_audiencia_eve: string;
    es_gratuito: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion: number;
    carreras?: number[];
}
export interface CreateEventResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        nom_eve: string;
        estado_eve: string;
        fecha_creacion: Date;
    };
    error?: string;
}
export declare class CreateEventUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request: CreateEventRequest): Promise<CreateEventResponse>;
    private validateRequest;
    private validateTimeFormat;
    private parseTimeToDate;
}
//# sourceMappingURL=CreateEventUseCase.d.ts.map