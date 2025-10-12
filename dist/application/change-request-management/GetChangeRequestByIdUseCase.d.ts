import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
export declare class GetChangeRequestByIdUseCase {
    private changeRequestRepository;
    constructor(changeRequestRepository: ChangeRequestRepository);
    execute(requestId: string, userId?: string): Promise<ChangeRequest | null>;
    private validateInput;
    private canUserAccessRequest;
}
//# sourceMappingURL=GetChangeRequestByIdUseCase.d.ts.map