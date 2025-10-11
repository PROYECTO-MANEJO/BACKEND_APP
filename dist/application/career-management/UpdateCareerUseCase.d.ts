import { CareerManagementService } from "../../domain/services/CareerManagementService";
import { UpdateCareerDto } from "@shared/types/UserManagementTypes";
import { Career } from "../../domain/entities/User";
export declare class UpdateCareerUseCase {
    private careerManagementService;
    constructor(careerManagementService: CareerManagementService);
    execute(id: number, updateData: UpdateCareerDto): Promise<{
        success: boolean;
        message: string;
        data?: Career;
    }>;
}
//# sourceMappingURL=UpdateCareerUseCase.d.ts.map