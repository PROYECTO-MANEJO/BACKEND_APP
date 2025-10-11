import { UserManagementService } from "../../domain/services/UserManagementService";
import { UserProfileResponse } from "@shared/types/UserManagementTypes";
export interface GetAllUsersQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    careerId?: number;
}
export declare class GetAllUsersUseCase {
    private userManagementService;
    constructor(userManagementService: UserManagementService);
    execute(query: GetAllUsersQuery): Promise<{
        success: boolean;
        message: string;
        data?: {
            users: UserProfileResponse[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                limit: number;
            };
        };
    }>;
}
//# sourceMappingURL=GetAllUsersUseCase.d.ts.map