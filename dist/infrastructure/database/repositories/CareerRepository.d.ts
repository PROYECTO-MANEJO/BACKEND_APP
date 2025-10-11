import { PrismaClient } from "@prisma/client";
import { ICareerRepository } from "@domain/repositories/IUserRepository";
import { Career } from "@domain/entities/User";
/**
 * Implementación del repositorio de carreras usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de carreras
 * - DIP: Implementa la interfaz ICareerRepository
 */
export declare class CareerRepository implements ICareerRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<Career | null>;
    findAll(): Promise<Career[]>;
    create(entity: Omit<Career, "id" | "createdAt" | "updatedAt">): Promise<Career>;
    update(id: number, entity: Partial<Career>): Promise<Career | null>;
    delete(id: number): Promise<boolean>;
    findActivecareers(): Promise<Career[]>;
    existsAndActive(careerId: number): Promise<boolean>;
    findByCode(code: string): Promise<Career | null>;
    codeExists(code: string, excludeId?: number): Promise<boolean>;
    setActiveStatus(careerId: number, isActive: boolean): Promise<boolean>;
    /**
     * SRP: Solo mapea datos de Prisma a entidad de dominio
     */
    private mapToEntity;
}
//# sourceMappingURL=CareerRepository.d.ts.map