"use strict";
/**
 * CategoryRepository - Infrastructure Layer
 *
 * Implementación del repositorio de categorías usando Prisma ORM
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
class CategoryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async existsById(id) {
        const count = await this.prisma.categoriaEvento.count({
            where: { id_cat: id.toString() },
        });
        return count > 0;
    }
    async findById(id) {
        return await this.prisma.categoriaEvento.findUnique({
            where: { id_cat: id.toString() },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=CategoryRepository.js.map