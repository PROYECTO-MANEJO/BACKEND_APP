/**
 * CreateChangeRequestUseCase - Application Layer
 *
 * Caso de uso para crear solicitudes de cambio.
 */
import { ChangeRequestManagementService } from "../../../domain/services/ChangeRequestManagementService";
import { ChangeRequest, Priority, ChangeRequestType, Urgency } from "../../../domain/entities/ChangeRequest";
export interface CreateChangeRequestRequest {
    title: string;
    description: string;
    justification: string;
    changeType: ChangeRequestType;
    requesterId: string;
    priority?: Priority;
    urgency?: Urgency;
}
export interface CreateChangeRequestResponse {
    success: boolean;
    changeRequest?: ChangeRequest;
    message: string;
    githubIssueUrl?: string;
    errors?: string[];
}
export declare class CreateChangeRequestUseCase {
    private changeRequestManagementService;
    constructor(changeRequestManagementService: ChangeRequestManagementService);
    execute(request: CreateChangeRequestRequest): Promise<CreateChangeRequestResponse>;
    private validateRequest;
}
//# sourceMappingURL=CreateChangeRequestUseCase.d.ts.map