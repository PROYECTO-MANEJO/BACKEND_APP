/**
 * User Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de usuarios
 * Separado de UserService para cumplir Single Responsibility Principle
 */
export interface UserValidationData {
    ced_usu?: string;
    nom_usu1?: string;
    nom_usu2?: string;
    ape_usu1?: string;
    ape_usu2?: string;
    email?: string;
    password?: string;
    tel_usu?: string;
    dir_usu?: string;
    fec_nac_usu?: Date;
    rol?: string;
    estado?: string;
}
export declare class UserValidator {
    /**
     * ✅ SRP: Solo validación de datos de usuario
     */
    static validate(data: UserValidationData): void;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<UserValidationData>): void;
    /**
     * ✅ SRP: Solo validación de email
     */
    private static isValidEmail;
    /**
     * ✅ SRP: Solo validación de teléfono
     */
    private static isValidPhone;
    /**
     * ✅ SRP: Solo validación de edad mínima
     */
    static validateMinimumAge(birthDate: Date, minimumAge?: number): void;
}
//# sourceMappingURL=UserValidator.d.ts.map