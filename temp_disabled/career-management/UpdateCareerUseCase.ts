import { CareerManagementService } from "../../domain/services/CareerManagementService";
import { UpdateCareerDto } from "@shared/types/UserManagementTypes";
import { Career } from "../../domain/entities/User";

export class UpdateCareerUseCase {
  constructor(private careerManagementService: CareerManagementService) {}

  async execute(
    id: number,
    updateData: UpdateCareerDto
  ): Promise<{ success: boolean; message: string; data?: Career }> {
    // Validar que se proporciona al menos un campo para actualizar
    if (
      !updateData.name &&
      !updateData.code &&
      !updateData.faculty &&
      updateData.isActive === undefined
    ) {
      return {
        success: false,
        message: "Debe proporcionar al menos un campo para actualizar",
      };
    }

    // Validaciones de campos específicos
    if (updateData.name !== undefined) {
      if (updateData.name.trim().length === 0) {
        return {
          success: false,
          message: "El nombre no puede estar vacío",
        };
      }
      if (updateData.name.trim().length > 100) {
        return {
          success: false,
          message: "El nombre no puede tener más de 100 caracteres",
        };
      }
    }

    if (updateData.code !== undefined) {
      if (updateData.code.trim().length === 0) {
        return {
          success: false,
          message: "El código no puede estar vacío",
        };
      }
      if (updateData.code.trim().length > 10) {
        return {
          success: false,
          message: "El código no puede tener más de 10 caracteres",
        };
      }
    }

    if (updateData.faculty !== undefined) {
      if (updateData.faculty.trim().length === 0) {
        return {
          success: false,
          message: "La facultad no puede estar vacía",
        };
      }
    }

    try {
      const result = await this.careerManagementService.updateCareer(
        id,
        updateData
      );

      return {
        success: result.success,
        message: result.message,
        data: result.career,
      };
    } catch (error) {
      console.error("[UpdateCareerUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
