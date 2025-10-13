/**
 * Career Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para carreras
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateCareerRequest {
    nom_car: string;
    des_car: string;
    duracion_semestres: number;
    modalidad: string;
}
export interface UpdateCareerRequest {
    nom_car?: string;
    des_car?: string;
    duracion_semestres?: number;
    modalidad?: string;
    estado?: string;
}
export declare class CareerService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nueva carrera
     */
    createCareer(careerRequest: CreateCareerRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener todas las carreras
     */
    getAllCareers(): Promise<any[]>;
    /**
     * ✅ SRP: Obtener carrera por ID
     */
    getCareerById(id: string): Promise<any | null>;
    /**
     * ✅ SRP: Actualizar carrera
     */
    updateCareer(id: string, updateRequest: UpdateCareerRequest): Promise<any>;
    /**
     * ✅ SRP: Eliminar carrera
     */
    deleteCareer(id: string): Promise<void>;
    /**
     * ✅ SRP: Obtener carreras activas
     */
    getActiveCareers(): Promise<any[]>;
}
//# sourceMappingURL=CareerService.d.ts.map