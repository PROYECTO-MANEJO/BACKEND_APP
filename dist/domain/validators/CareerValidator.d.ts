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
export declare class CareerValidator {
    /**
     * ✅ SRP: Solo validación de datos de carrera
     */
    static validate(data: CareerValidationData): void;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<CareerValidationData>): void;
    /**
     * ✅ SRP: Solo validación de nombre único
     */
    static validateUniqueName(name: string, existingNames: string[]): void;
}
//# sourceMappingURL=CareerValidator.d.ts.map