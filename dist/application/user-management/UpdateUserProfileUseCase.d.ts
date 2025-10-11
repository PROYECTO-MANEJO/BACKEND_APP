import { UserManagementService } from "../../domain/services/UserManagementService";
import { UpdateUserProfileDto } from "@shared/types/UserManagementTypes";
export declare class UpdateUserProfileUseCase {
    private userManagementService;
    constructor(userManagementService: UserManagementService);
    execute(userId: number, updateData: UpdateUserProfileDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=UpdateUserProfileUseCase.d.ts.map