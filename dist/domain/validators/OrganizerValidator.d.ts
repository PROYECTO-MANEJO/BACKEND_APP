/**
 * Organizer Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de organizadores
 * Separado de OrganizerService para cumplir Single Responsibility Principle
 */
export interface OrganizerValidationData {
    ced_org?: string;
    nom_org1?: string;
    nom_org2?: string;
    ape_org1?: string;
    ape_org2?: string;
    email?: string;
    tel_org?: string;
    tit_aca_org?: string;
    especialidad?: string;
    experiencia_anos?: number;
    estado?: string;
}
export declare class OrganizerValidator {
    /**
     * ✅ SRP: Solo validación de datos de organizador
     */
    static validate(data: OrganizerValidationData): void;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<OrganizerValidationData>): void;
    /**
     * ✅ SRP: Solo validación de email
     */
    private static isValidEmail;
    /**
     * ✅ SRP: Solo validación de teléfono
     */
    private static isValidPhone;
    /**
     * ✅ SRP: Solo validación de capacitación requerida
     */
    static validateRequiredTraining(tituloAcademico?: string, experiencia?: number, especialidad?: string): void;
}
//# sourceMappingURL=OrganizerValidator.d.ts.map