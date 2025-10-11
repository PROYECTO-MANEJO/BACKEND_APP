import { CareerManagementService } from "../../domain/services/CareerManagementService";
import { CreateCareerDto } from "@shared/types/UserManagementTypes";
import { Career } from "../../domain/entities/User";
export declare class CreateCareerUseCase {
    private careerManagementService;
    constructor(careerManagementService: CareerManagementService);
    execute(careerData: CreateCareerDto): Promise<{
        success: boolean;
        message: string;
        data?: Career;
    }>;
}
//# sourceMappingURL=CreateCareerUseCase.d.ts.map