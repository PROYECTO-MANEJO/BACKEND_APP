/**
 * Auth Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de autenticación
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
import { LoginValidationData, RegisterValidationData, CreateAdminValidationData } from "../../domain/validators/AuthValidator";
export interface LoginRequest extends LoginValidationData {
}
export interface RegisterRequest extends RegisterValidationData {
}
export interface CreateAdminRequest extends CreateAdminValidationData {
}
export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
}
export declare class AuthService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Autenticar usuario
     */
    login(loginRequest: LoginRequest): Promise<AuthResponse>;
    /**
     * ✅ SRP: Registrar nuevo usuario
     */
    register(registerRequest: RegisterRequest): Promise<AuthResponse>;
    /**
     * ✅ SRP: Crear administrador
     */
    createAdmin(adminRequest: CreateAdminRequest): Promise<AuthResponse>;
    /**
     * ✅ SRP: Logout del usuario
     */
    logout(): Promise<AuthResponse>;
}
//# sourceMappingURL=AuthService.d.ts.map