import { UserManagementService } from "../../domain/services/UserManagementService";
import { UserProfileResponse } from "@shared/types/UserManagementTypes";
export declare class GetUserProfileUseCase {
    private userManagementService;
    constructor(userManagementService: UserManagementService);
    execute(userId: number): Promise<{
        success: boolean;
        message: string;
        data?: UserProfileResponse;
    }>;
}
//# sourceMappingURL=GetUserProfileUseCase.d.ts.map