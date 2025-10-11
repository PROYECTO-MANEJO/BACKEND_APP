import { CareerManagementService } from "../../domain/services/CareerManagementService";
import { Career } from "../../domain/entities/User";
export declare class GetAllCareersUseCase {
    private careerManagementService;
    constructor(careerManagementService: CareerManagementService);
    execute(activeOnly?: boolean): Promise<{
        success: boolean;
        message: string;
        data?: Career[];
    }>;
}
//# sourceMappingURL=GetAllCareersUseCase.d.ts.map