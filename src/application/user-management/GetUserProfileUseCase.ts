import { UserManagementService } from "../../domain/services/UserManagementService";
import { UserProfileResponse } from "@shared/types/UserManagementTypes";

export class GetUserProfileUseCase {
  constructor(private userManagementService: UserManagementService) {}

  async execute(
    userId: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserProfileResponse;
  }> {
    try {
      const profile = await this.userManagementService.getUserProfile(userId);

      if (!profile) {
        return {
          success: false,
          message: "Usuario no encontrado",
        };
      }

      return {
        success: true,
        message: "Perfil obtenido exitosamente",
        data: profile,
      };
    } catch (error) {
      console.error("[GetUserProfileUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
