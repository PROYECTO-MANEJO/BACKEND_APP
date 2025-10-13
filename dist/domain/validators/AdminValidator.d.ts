/**
 * Admin Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de datos de administración
 * Separado de AdminService para cumplir Single Responsibility Principle
 */
export interface AdminValidationData {
    ced_usu?: string;
    nom_usu1?: string;
    nom_usu2?: string;
    ape_usu1?: string;
    ape_usu2?: string;
    email?: string;
    password?: string;
    rol?: string;
}
export declare class AdminValidator {
    /**
     * ✅ SRP: Solo validación de datos de administrador
     */
    static validate(data: AdminValidationData): void;
    /**
     * ✅ SRP: Solo validación de email
     */
    private static isValidEmail;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<AdminValidationData>): void;
}
//# sourceMappingURL=AdminValidator.d.ts.map