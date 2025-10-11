/**
 * GetEventByIdUseCase - Application Layer
 *
 * Caso de uso para obtener un evento específico por su ID
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface GetEventByIdRequest {
    id: string;
}
export interface GetEventByIdResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}
export declare class GetEventByIdUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request: GetEventByIdRequest): Promise<GetEventByIdResponse>;
    private formatEventForResponse;
    private formatTimeFromDate;
}
//# sourceMappingURL=GetEventByIdUseCase.d.ts.map