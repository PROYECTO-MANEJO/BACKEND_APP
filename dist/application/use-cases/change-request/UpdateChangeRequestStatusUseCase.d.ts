/**
 * UpdateChangeRequestStatusUseCase - Application Layer
 *
 * Caso de uso para actualizar el estado de una solicitud de cambio.
 */
import { ChangeRequestManagementService } from "../../../domain/services/ChangeRequestManagementService";
import { ChangeRequest, ChangeRequestStatus } from "../../../domain/entities/ChangeRequest";
export interface UpdateChangeRequestStatusRequest {
    changeRequestId: string;
    newStatus: ChangeRequestStatus;
    updatedBy: string;
    comment?: string;
    githubBranch?: string;
    githubPrUrl?: string;
}
export interface UpdateChangeRequestStatusResponse {
    success: boolean;
    changeRequest?: ChangeRequest;
    message: string;
    statusChanged: boolean;
    errors?: string[];
}
export declare class UpdateChangeRequestStatusUseCase {
    private changeRequestManagementService;
    constructor(changeRequestManagementService: ChangeRequestManagementService);
    execute(request: UpdateChangeRequestStatusRequest): Promise<UpdateChangeRequestStatusResponse>;
    private validateRequest;
}
//# sourceMappingURL=UpdateChangeRequestStatusUseCase.d.ts.map