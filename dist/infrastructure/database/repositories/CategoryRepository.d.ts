/**
 * CategoryRepository - Infrastructure Layer
 *
 * Implementación del repositorio de categorías usando Prisma ORM
 */
import { PrismaClient } from "@prisma/client";
import { ICategoryRepository } from "../../../domain/services/EventManagementService";
export declare class CategoryRepository implements ICategoryRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    existsById(id: number): Promise<boolean>;
    findById(id: number): Promise<any>;
}
//# sourceMappingURL=CategoryRepository.d.ts.map