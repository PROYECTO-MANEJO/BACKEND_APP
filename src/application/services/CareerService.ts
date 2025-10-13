/**
 * Career Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para carreras
 * Separado del controlador para cumplir Single Responsibility Principle
 */

import { DIContainer } from "../../infrastructure/DIContainer";
import { CareerValidator } from "../../domain/validators/CareerValidator";

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

export class CareerService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * ✅ SRP: Crear nueva carrera
   */
  async createCareer(careerRequest: CreateCareerRequest): Promise<any> {
    // ✅ SRP: Delegar validación al CareerValidator
    CareerValidator.validate({
      nom_car: careerRequest.nom_car,
      des_car: careerRequest.des_car,
      duracion_semestres: careerRequest.duracion_semestres,
      modalidad: careerRequest.modalidad,
    });

    // ✅ SRP: Validar nombre único (simulado)
    const existingNames: string[] = []; // Simulado
    CareerValidator.validateUniqueName(careerRequest.nom_car, existingNames);

    // ✅ SRP: Lógica de creación de carrera
    // NOTA: Este es un archivo de demostración - no conectado al sistema real
    console.log("CareerService.createCareer - Archivo de demostración SRP");

    return {
      message: "Career creation logic would go here",
      data: careerRequest,
    };
  }

  /**
   * ✅ SRP: Obtener todas las carreras
   */
  async getAllCareers(): Promise<any[]> {
    // ✅ SRP: Lógica de obtención de carreras
    console.log("CareerService.getAllCareers - Archivo de demostración SRP");

    return [{ message: "Career fetching logic would go here" }];
  }

  /**
   * ✅ SRP: Obtener carrera por ID
   */
  async getCareerById(id: string): Promise<any | null> {
    // ✅ SRP: Lógica de obtención por ID
    console.log(
      "CareerService.getCareerById - Archivo de demostración SRP",
      id
    );

    return {
      message: "Career by ID fetching logic would go here",
      id,
    };
  }

  /**
   * ✅ SRP: Actualizar carrera
   */
  async updateCareer(
    id: string,
    updateRequest: UpdateCareerRequest
  ): Promise<any> {
    // ✅ SRP: Delegar validación al CareerValidator
    CareerValidator.validateUpdate(updateRequest);

    // ✅ SRP: Lógica de actualización
    console.log(
      "CareerService.updateCareer - Archivo de demostración SRP",
      id,
      updateRequest
    );

    return {
      message: "Career update logic would go here",
      id,
      data: updateRequest,
    };
  }

  /**
   * ✅ SRP: Eliminar carrera
   */
  async deleteCareer(id: string): Promise<void> {
    // ✅ SRP: Lógica de eliminación
    console.log("CareerService.deleteCareer - Archivo de demostración SRP", id);
  }

  /**
   * ✅ SRP: Obtener carreras activas
   */
  async getActiveCareers(): Promise<any[]> {
    // ✅ SRP: Lógica de carreras activas
    console.log("CareerService.getActiveCareers - Archivo de demostración SRP");

    return [{ message: "Active careers fetching logic would go here" }];
  }
}
