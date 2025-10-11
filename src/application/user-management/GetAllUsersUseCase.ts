import { UserManagementService } from "../../domain/services/UserManagementService";
import { UserProfileResponse } from "@shared/types/UserManagementTypes";

export interface GetAllUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  careerId?: number;
}

export class GetAllUsersUseCase {
  constructor(private userManagementService: UserManagementService) {}

  async execute(query: GetAllUsersQuery): Promise<{
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
  }> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(50, Math.max(1, query.limit || 10)); // Limitar entre 1 y 50

      // Preparar filtros
      const filters: any = {};
      if (query.careerId) filters.careerId = query.careerId;

      const result = await this.userManagementService.getAllUsers(
        page,
        limit,
        filters
      );

      return {
        success: true,
        message: "Usuarios obtenidos exitosamente",
        data: {
          users: result.users,
          pagination: {
            currentPage: page,
            totalPages: result.totalPages,
            totalItems: result.total,
            limit,
          },
        },
      };
    } catch (error) {
      console.error("[GetAllUsersUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
