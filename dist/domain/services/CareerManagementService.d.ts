import { ICareerRepository } from "../repositories/IUserRepository";
import { Career } from "../entities/User";
import { CreateCareerDto, UpdateCareerDto } from "@shared/types/UserManagementTypes";
/**
 * Servicio de dominio para gestión de carreras
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de carreras
 * - DIP: Depende de abstracciones
 */
export declare class CareerManagementService {
    private careerRepository;
    constructor(careerRepository: ICareerRepository);
    getAllCareers(): Promise<Career[]>;
    getActiveCareers(): Promise<Career[]>;
    getCareerById(id: number): Promise<Career | null>;
    createCareer(careerData: CreateCareerDto): Promise<{
        success: boolean;
        message: string;
        career?: Career;
    }>;
    updateCareer(id: number, updateData: UpdateCareerDto): Promise<{
        success: boolean;
        message: string;
        career?: Career;
    }>;
    toggleCareerStatus(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteCareer(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=CareerManagementService.d.ts.map