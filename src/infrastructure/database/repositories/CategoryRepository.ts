/**
 * CategoryRepository - Infrastructure Layer
 *
 * Implementación del repositorio de categorías usando Prisma ORM
 */

import { PrismaClient } from "@prisma/client";
import { ICategoryRepository } from "../../../domain/services/EventManagementService";

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.categoriaEvento.count({
      where: { id_cat: id.toString() },
    });
    return count > 0;
  }

  async findById(id: number): Promise<any> {
    return await this.prisma.categoriaEvento.findUnique({
      where: { id_cat: id.toString() },
    });
  }
}
