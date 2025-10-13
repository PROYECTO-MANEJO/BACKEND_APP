/**
 * Admin Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para administración
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateAdminRequest {
    ced_usu: string;
    nom_usu1: string;
    nom_usu2?: string;
    ape_usu1: string;
    ape_usu2?: string;
    email: string;
    password: string;
    rol: string;
}
export interface UpdateAdminRequest {
    nom_usu1?: string;
    nom_usu2?: string;
    ape_usu1?: string;
    ape_usu2?: string;
    email?: string;
    rol?: string;
}
export declare class AdminService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nuevo administrador
     */
    createAdmin(adminRequest: CreateAdminRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener todos los administradores
     */
    getAllAdmins(): Promise<any[]>;
    /**
     * ✅ SRP: Obtener administrador por ID
     */
    getAdminById(id: string): Promise<any | null>;
    /**
     * ✅ SRP: Actualizar administrador
     */
    updateAdmin(id: string, updateRequest: UpdateAdminRequest): Promise<any>;
    /**
     * ✅ SRP: Eliminar administrador
     */
    deleteAdmin(id: string): Promise<void>;
}
//# sourceMappingURL=AdminService.d.ts.map