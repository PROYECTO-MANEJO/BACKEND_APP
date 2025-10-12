import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
export interface GetMyRequestsDTO {
    userId: string;
    status?: string;
    changeType?: string;
    page?: number;
    limit?: number;
}
export declare class GetMyChangeRequestsUseCase {
    private changeRequestRepository;
    constructor(changeRequestRepository: ChangeRequestRepository);
    execute(data: GetMyRequestsDTO): Promise<{
        items: ChangeRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    private validateInput;
}
//# sourceMappingURL=GetMyChangeRequestsUseCase.d.ts.map