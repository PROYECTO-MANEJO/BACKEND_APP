/**
 * DeleteEventUseCase - Application Layer
 *
 * Caso de uso para eliminar un evento del sistema
 */
import { EventManagementService } from "../../domain/services/EventManagementService";
export interface DeleteEventRequest {
    id: string;
}
export interface DeleteEventResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        deleted: boolean;
    };
    error?: string;
}
export declare class DeleteEventUseCase {
    private eventManagementService;
    constructor(eventManagementService: EventManagementService);
    execute(request: DeleteEventRequest): Promise<DeleteEventResponse>;
}
//# sourceMappingURL=DeleteEventUseCase.d.ts.map