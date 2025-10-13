import { BaseEntity } from "../../shared/interfaces/BaseInterfaces";
/**
 * Entidad Usuario del dominio
 * Principio SRP: Solo representa la información del usuario
 */
export interface User extends BaseEntity {
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: Date;
    phoneNumber?: string;
    password: string;
    careerId?: number;
    githubToken?: string;
    githubUsername?: string;
    account?: Account;
    career?: Career;
}
/**
 * Entidad Cuenta del dominio
 * Principio SRP: Solo representa la información de la cuenta/autenticación
 */
export interface Account extends BaseEntity {
    email: string;
    role: UserRole;
    isVerified: boolean;
    userId: number;
    user?: User;
}
/**
 * Entidad Carrera del dominio
 * Principio SRP: Solo representa la información de carreras académicas
 */
export interface Career extends BaseEntity {
    name: string;
    code: string;
    faculty: string;
    isActive: boolean;
}
/**
 * Enum para roles de usuario
 * Principio OCP: Fácil de extender con nuevos roles
 */
export declare enum UserRole {
    ESTUDIANTE = "ESTUDIANTE",
    USUARIO = "USUARIO",
    ADMINISTRADOR = "ADMINISTRADOR",
    ORGANIZADOR = "ORGANIZADOR",
    MASTER = "MASTER"
}
/**
 * Value Object para credenciales de login
 * Principio SRP: Solo encapsula datos de login
 */
export interface LoginCredentials {
    email: string;
    password: string;
}
/**
 * Value Object para datos de registro
 * Principio SRP: Solo encapsula datos de registro
 */
export interface RegisterUserData {
    email: string;
    password: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    cedula: string;
    dateOfBirth?: Date;
    careerId?: number;
}
//# sourceMappingURL=User.d.ts.map