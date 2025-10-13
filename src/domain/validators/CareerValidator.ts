/**
 * Career Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de carreras
 * Separado de CareerService para cumplir Single Responsibility Principle
 */

export interface CareerValidationData {
  nom_car?: string;
  des_car?: string;
  duracion_semestres?: number;
  modalidad?: string;
  estado?: string;
}

export class CareerValidator {
  /**
   * ✅ SRP: Solo validación de datos de carrera
   */
  public static validate(data: CareerValidationData): void {
    if (!data.nom_car || data.nom_car.trim().length === 0) {
      throw new Error("El nombre de la carrera es requerido");
    }

    if (data.nom_car.length > 100) {
      throw new Error(
        "El nombre de la carrera no puede exceder 100 caracteres"
      );
    }

    if (!data.des_car || data.des_car.trim().length === 0) {
      throw new Error("La descripción de la carrera es requerida");
    }

    if (
      !data.duracion_semestres ||
      data.duracion_semestres < 1 ||
      data.duracion_semestres > 20
    ) {
      throw new Error("La duración debe ser entre 1 y 20 semestres");
    }

    if (
      !data.modalidad ||
      !["PRESENCIAL", "VIRTUAL", "MIXTA"].includes(data.modalidad)
    ) {
      throw new Error("La modalidad debe ser PRESENCIAL, VIRTUAL o MIXTA");
    }
  }

  /**
   * ✅ SRP: Solo validación de actualización
   */
  public static validateUpdate(data: Partial<CareerValidationData>): void {
    if (data.nom_car !== undefined && data.nom_car.trim().length === 0) {
      throw new Error("El nombre de la carrera no puede estar vacío");
    }

    if (data.nom_car && data.nom_car.length > 100) {
      throw new Error(
        "El nombre de la carrera no puede exceder 100 caracteres"
      );
    }

    if (
      data.duracion_semestres !== undefined &&
      (data.duracion_semestres < 1 || data.duracion_semestres > 20)
    ) {
      throw new Error("La duración debe ser entre 1 y 20 semestres");
    }

    if (
      data.modalidad &&
      !["PRESENCIAL", "VIRTUAL", "MIXTA"].includes(data.modalidad)
    ) {
      throw new Error("La modalidad debe ser PRESENCIAL, VIRTUAL o MIXTA");
    }

    if (
      data.estado &&
      !["ACTIVA", "INACTIVA", "SUSPENDIDA"].includes(data.estado)
    ) {
      throw new Error("El estado debe ser ACTIVA, INACTIVA o SUSPENDIDA");
    }
  }

  /**
   * ✅ SRP: Solo validación de nombre único
   */
  public static validateUniqueName(
    name: string,
    existingNames: string[]
  ): void {
    if (existingNames.includes(name.toLowerCase())) {
      throw new Error("Ya existe una carrera con este nombre");
    }
  }
}
