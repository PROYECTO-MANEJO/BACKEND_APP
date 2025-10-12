import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
import { ChangeRequestWorkflowService } from "@domain/services/ChangeRequestWorkflowService";
export interface UpdateChangeRequestStatusDTO {
    requestId: string;
    newStatus: string;
    userId: string;
    userRole: string;
    comments?: string;
}
export declare class UpdateChangeRequestStatusUseCase {
    private changeRequestRepository;
    private workflowService;
    constructor(changeRequestRepository: ChangeRequestRepository, workflowService: ChangeRequestWorkflowService);
    execute(data: UpdateChangeRequestStatusDTO): Promise<ChangeRequest>;
    private validateInput;
    private validateUserPermissions;
}
//# sourceMappingURL=UpdateChangeRequestStatusUseCase.d.ts.map