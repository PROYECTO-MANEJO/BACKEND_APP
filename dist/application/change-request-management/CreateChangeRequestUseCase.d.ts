import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
export interface CreateChangeRequestDTO {
    title: string;
    description: string;
    justification: string;
    changeType: string;
    priority?: string;
    urgency?: string;
    requesterId: string;
}
export declare class CreateChangeRequestUseCase {
    private changeRequestRepository;
    constructor(changeRequestRepository: ChangeRequestRepository);
    execute(data: CreateChangeRequestDTO): Promise<ChangeRequest>;
    private validateInput;
}
//# sourceMappingURL=CreateChangeRequestUseCase.d.ts.map