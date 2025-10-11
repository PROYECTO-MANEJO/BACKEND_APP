import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { User, Account, Career } from "@domain/entities/User";
/**
 * Implementación del repositorio de usuarios usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de usuarios
 * - DIP: Implementa la interfaz IUserRepository
 */
export declare class UserRepository implements IUserRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(entity: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
    update(id: number, entity: Partial<User>): Promise<User | null>;
    delete(id: number): Promise<boolean>;
    findByCedula(cedula: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    createWithAccount(userData: Omit<User, "id" | "createdAt" | "updatedAt">, accountData: Omit<Account, "id" | "createdAt" | "updatedAt" | "userId">): Promise<{
        user: User;
        account: Account;
    }>;
    updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
    /**
     * SRP: Mapea roles de dominio a tipos de Prisma
     */
    private mapUserRoleToRolCuenta;
    /**
     * SRP: Mapea roles de Prisma a dominio
     */
    private mapRolCuentaToUserRole;
    /**
     * SRP: Solo mapea datos de Prisma a entidad de dominio
     */
    private mapToEntity;
    /**
     * Marca un usuario como verificado actualizando su cuenta
     */
    markAsVerified(userId: number): Promise<boolean>;
    /**
     * Actualizar perfil de usuario
     */
    updateProfile(userId: number, profileData: Partial<User>): Promise<boolean>;
    /**
     * Obtener perfil completo con cuenta y carrera
     */
    getCompleteProfile(userId: number): Promise<(User & {
        account: Account;
        career?: Career;
    }) | null>;
    /**
     * Buscar usuarios con paginación
     */
    findPaginated(page: number, limit: number, filters?: Partial<User>): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Eliminar usuario (soft delete)
     */
    softDelete(userId: number): Promise<boolean>;
    /**
     * Mapear usuario completo incluyendo campos de GitHub
     */
    private mapToEntityComplete;
    /**
     * Mapear carrera de Prisma a entidad
     */
    private mapCareerToEntity;
    /**
     * SRP: Solo mapea datos de cuenta de Prisma a entidad de dominio
     */
    private mapAccountToEntity;
}
//# sourceMappingURL=UserRepository.d.ts.map