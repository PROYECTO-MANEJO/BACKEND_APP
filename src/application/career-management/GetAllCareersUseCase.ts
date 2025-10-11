import { CareerManagementService } from '../../domain/services/CareerManagementService';
import { Career } from '../../domain/entities/User';

export class GetAllCareersUseCase {
  constructor(private careerManagementService: CareerManagementService) {}

  async execute(activeOnly: boolean = false): Promise<{ success: boolean; message: string; data?: Career[] }> {
    try {
      const careers = activeOnly 
        ? await this.careerManagementService.getActiveCareers()
        : await this.careerManagementService.getAllCareers();

      return {
        success: true,
        message: 'Carreras obtenidas exitosamente',
        data: careers
      };
    } catch (error) {
      console.error('[GetAllCareersUseCase] Error:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}