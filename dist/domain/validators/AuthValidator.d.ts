/**
 * Auth Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de autenticación
 * Separado de AuthService para cumplir Single Responsibility Principle
 */
export interface LoginValidationData {
    email: string;
    password: string;
}
export interface RegisterValidationData {
    email: string;
    password: string;
    nombre: string;
    nombre2?: string;
    apellido: string;
    apellido2?: string;
    ced_usu: string;
    fec_nac_usu?: Date;
    carrera?: string;
}
export interface CreateAdminValidationData {
    ced_usu: string;
    nom_usu1: string;
    nom_usu2?: string;
    ape_usu1: string;
    ape_usu2?: string;
    cor_cue: string;
    pas_usu: string;
    fec_nac_usu?: Date;
    num_tel_usu?: string;
}
export declare class AuthValidator {
    /**
     * ✅ SRP: Solo validación de login
     */
    static validateLogin(data: LoginValidationData): void;
    /**
     * ✅ SRP: Solo validación de registro
     */
    static validateRegister(data: RegisterValidationData): void;
    /**
     * ✅ SRP: Solo validación de creación de admin
     */
    static validateCreateAdmin(data: CreateAdminValidationData): void;
    /**
     * ✅ SRP: Solo validación de fortaleza de contraseña
     */
    private static isValidPassword;
    /**
     * ✅ SRP: Solo validación de token
     */
    static validateToken(token: string): void;
    /**
     * ✅ SRP: Solo validación de email
     */
    private static isValidEmail;
    /**
     * ✅ SRP: Solo validación de password reset
     */
    static validatePasswordReset(data: {
        email: string;
    }): void;
}
//# sourceMappingURL=AuthValidator.d.ts.map