import { DomainService, ValidationResult } from "@shared/interfaces/BaseInterfaces";
import { User, Account, LoginCredentials, RegisterUserData, UserRole } from "@domain/entities/User";
/**
 * Servicio de dominio para autenticación
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de autenticación
 * - DIP: Depende de abstracciones (interfaces)
 */
export declare class AuthenticationService implements DomainService {
    /**
     * SRP: Solo validación de credenciales de login
     */
    validateLoginCredentials(credentials: LoginCredentials): ValidationResult;
    /**
     * SRP: Solo validación de datos de registro
     */
    validateRegistrationData(data: RegisterUserData): ValidationResult;
    /**
     * SRP: Solo determinación de rol basado en email
     */
    determineUserRole(email: string): UserRole;
    /**
     * SRP: Solo verificar si carrera es requerida
     */
    isCareerRequired(email: string): boolean;
    /**
     * SRP: Solo validar fortaleza de contraseña con regex personalizado
     */
    validatePasswordStrength(password: string): ValidationResult;
    /**
     * SRP: Solo preparar datos del usuario para persistencia
     */
    prepareUserDataForCreation(data: RegisterUserData, hashedPassword: string): Omit<User, "id" | "createdAt" | "updatedAt">;
    /**
     * SRP: Solo preparar datos de cuenta para persistencia
     */
    prepareAccountDataForCreation(email: string, role: UserRole): Omit<Account, "id" | "createdAt" | "updatedAt" | "userId">;
    /**
     * SRP: Solo verificar si el usuario es administrador
     */
    isAdminUser(account: Account): boolean;
}
//# sourceMappingURL=AuthenticationService.d.ts.map