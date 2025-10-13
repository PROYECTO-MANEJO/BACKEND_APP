/**
 * Inscription Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de inscripciones
 * Separado de InscriptionService para cumplir Single Responsibility Principle
 */
export interface InscriptionValidationData {
    ced_est?: string;
    id_cur?: string;
    id_eve?: string;
    fecha_inscripcion?: Date;
    estado?: string;
    documento_identidad?: string;
    documento_comprobante?: string;
    carta_motivacion?: string;
}
export declare class InscriptionValidator {
    /**
     * ✅ SRP: Solo validación de datos de inscripción
     */
    static validate(data: InscriptionValidationData): void;
    /**
     * ✅ SRP: Solo validación de documentos requeridos
     */
    static validateRequiredDocuments(data: InscriptionValidationData, requiresDocuments: boolean, requiresMotivationLetter: boolean): void;
    /**
     * ✅ SRP: Solo validación de cupos disponibles
     */
    static validateCapacity(currentInscriptions: number, maxCapacity: number): void;
    /**
     * ✅ SRP: Solo validación de fechas de inscripción
     */
    static validateInscriptionPeriod(startDate: Date, endDate: Date): void;
}
//# sourceMappingURL=InscriptionValidator.d.ts.map