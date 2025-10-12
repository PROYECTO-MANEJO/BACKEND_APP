import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
import { DeveloperRepository } from "@domain/repositories/IDeveloperRepository";
import { ChangeRequestWorkflowService } from "@domain/services/ChangeRequestWorkflowService";
export interface AssignDeveloperDTO {
    requestId: string;
    developerId: string;
    assignedBy: string;
    estimatedHours?: number;
    targetDate?: Date;
}
export declare class AssignDeveloperUseCase {
    private changeRequestRepository;
    private developerRepository;
    private workflowService;
    constructor(changeRequestRepository: ChangeRequestRepository, developerRepository: DeveloperRepository, workflowService: ChangeRequestWorkflowService);
    execute(data: AssignDeveloperDTO): Promise<ChangeRequest>;
    private validateInput;
}
//# sourceMappingURL=AssignDeveloperUseCase.d.ts.map