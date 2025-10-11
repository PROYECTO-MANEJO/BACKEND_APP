import { IUserRepository, ICareerRepository } from "../repositories/IUserRepository";
import { User } from "../entities/User";
import { UpdateUserProfileDto, UserProfileResponse } from "@shared/types/UserManagementTypes";
/**
 * Servicio de dominio para gestión de usuarios
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de usuarios
 * - DIP: Depende de abstracciones
 */
export declare class UserManagementService {
    private userRepository;
    private careerRepository;
    constructor(userRepository: IUserRepository, careerRepository: ICareerRepository);
    getUserProfile(userId: number): Promise<UserProfileResponse | null>;
    updateUserProfile(userId: number, updateData: UpdateUserProfileDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllUsers(page?: number, limit?: number, filters?: Partial<User>): Promise<{
        users: UserProfileResponse[];
        total: number;
        totalPages: number;
    }>;
    deleteUser(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=UserManagementService.d.ts.map