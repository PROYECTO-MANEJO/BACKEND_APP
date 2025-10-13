/**
 * User Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para usuarios
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateUserRequest {
    ced_usu: string;
    nom_usu1: string;
    nom_usu2?: string;
    ape_usu1: string;
    ape_usu2?: string;
    email: string;
    password: string;
    tel_usu?: string;
    dir_usu?: string;
    fec_nac_usu?: Date;
    rol: string;
}
export interface UpdateUserRequest {
    nom_usu1?: string;
    nom_usu2?: string;
    ape_usu1?: string;
    ape_usu2?: string;
    email?: string;
    tel_usu?: string;
    dir_usu?: string;
    fec_nac_usu?: Date;
    estado?: string;
}
export declare class UserService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nuevo usuario
     */
    createUser(userRequest: CreateUserRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener todos los usuarios
     */
    getAllUsers(): Promise<any[]>;
    /**
     * ✅ SRP: Obtener usuario por cédula
     */
    getUserByCedula(cedula: string): Promise<any | null>;
    /**
     * ✅ SRP: Obtener usuario por email
     */
    getUserByEmail(email: string): Promise<any | null>;
    /**
     * ✅ SRP: Actualizar usuario
     */
    updateUser(cedula: string, updateRequest: UpdateUserRequest): Promise<any>;
    /**
     * ✅ SRP: Cambiar contraseña
     */
    changePassword(cedula: string, currentPassword: string, newPassword: string): Promise<void>;
    /**
     * ✅ SRP: Activar/Desactivar usuario
     */
    toggleUserStatus(cedula: string): Promise<any>;
}
//# sourceMappingURL=UserService.d.ts.map