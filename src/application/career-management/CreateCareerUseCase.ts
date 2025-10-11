import { CareerManagementService } from '../../domain/services/CareerManagementService';
import { CreateCareerDto } from '@shared/types/UserManagementTypes';
import { Career } from '../../domain/entities/User';

export class CreateCareerUseCase {
  constructor(private careerManagementService: CareerManagementService) {}

  async execute(careerData: CreateCareerDto): Promise<{ success: boolean; message: string; data?: Career }> {
    // Validaciones de entrada
    if (!careerData.name || careerData.name.trim().length === 0) {
      return {
        success: false,
        message: 'El nombre de la carrera es requerido'
      };
    }

    if (!careerData.code || careerData.code.trim().length === 0) {
      return {
        success: false,
        message: 'El código de la carrera es requerido'
      };
    }

    if (!careerData.faculty || careerData.faculty.trim().length === 0) {
      return {
        success: false,
        message: 'La facultad es requerida'
      };
    }

    // Validar longitud
    if (careerData.name.trim().length > 100) {
      return {
        success: false,
        message: 'El nombre no puede tener más de 100 caracteres'
      };
    }

    if (careerData.code.trim().length > 10) {
      return {
        success: false,
        message: 'El código no puede tener más de 10 caracteres'
      };
    }

    try {
      const result = await this.careerManagementService.createCareer(careerData);
      
      return {
        success: result.success,
        message: result.message,
        data: result.career
      };
    } catch (error) {
      console.error('[CreateCareerUseCase] Error:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}