"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCategoryRepository = void 0;
/**
 * Implementación concreta del repositorio de categorías usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de categorías
 */
class PrismaCategoryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Crear una nueva categoría
     */
    async create(categoryData) {
        try {
            const newCategory = await this.prisma.categoriaEvento.create({
                data: {
                    nom_cat: categoryData.name,
                    des_cat: categoryData.description,
                },
            });
            return this.mapPrismaToEntity(newCategory);
        }
        catch (error) {
            throw new Error(`Error creating category: ${error}`);
        }
    }
    /**
     * Buscar categoría por ID
     */
    async findById(id) {
        try {
            const category = await this.prisma.categoriaEvento.findUnique({
                where: { id_cat: id },
                include: {
                    eventos: true,
                    cursos: true,
                },
            });
            return category ? this.mapPrismaToEntity(category) : null;
        }
        catch (error) {
            throw new Error(`Error finding category by id: ${error}`);
        }
    }
    /**
     * Obtener todas las categorías
     */
    async findAll() {
        try {
            const categories = await this.prisma.categoriaEvento.findMany({
                include: {
                    eventos: true,
                    cursos: true,
                },
                orderBy: {
                    nom_cat: "asc",
                },
            });
            return categories.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding all categories: ${error}`);
        }
    }
    /**
     * Actualizar categoría por ID
     */
    async update(id, categoryData) {
        try {
            const updatedCategory = await this.prisma.categoriaEvento.update({
                where: { id_cat: id },
                data: {
                    nom_cat: categoryData.name,
                    des_cat: categoryData.description,
                },
                include: {
                    eventos: true,
                    cursos: true,
                },
            });
            return this.mapPrismaToEntity(updatedCategory);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null; // Categoría no encontrada
            }
            throw new Error(`Error updating category: ${error}`);
        }
    }
    /**
     * Eliminar categoría por ID
     */
    async delete(id) {
        try {
            await this.prisma.categoriaEvento.delete({
                where: { id_cat: id },
            });
        }
        catch (error) {
            if (error.code === "P2025") {
                throw new Error("Category not found");
            }
            throw new Error(`Error deleting category: ${error}`);
        }
    }
    /**
     * Buscar categorías con filtros
     */
    async findWithFilters(filters) {
        try {
            const whereClause = {};
            // Filtro por nombre
            if (filters.name) {
                whereClause.nom_cat = {
                    contains: filters.name,
                    mode: "insensitive",
                };
            }
            // Filtro por descripción
            if (filters.description) {
                whereClause.des_cat = {
                    contains: filters.description,
                    mode: "insensitive",
                };
            }
            // Filtro por tener eventos
            if (filters.hasEvents !== undefined) {
                if (filters.hasEvents) {
                    whereClause.eventos = { some: {} };
                }
                else {
                    whereClause.eventos = { none: {} };
                }
            }
            // Filtro por tener cursos
            if (filters.hasCourses !== undefined) {
                if (filters.hasCourses) {
                    whereClause.cursos = { some: {} };
                }
                else {
                    whereClause.cursos = { none: {} };
                }
            }
            // Búsqueda general
            if (filters.search) {
                whereClause.OR = [
                    { nom_cat: { contains: filters.search, mode: "insensitive" } },
                    { des_cat: { contains: filters.search, mode: "insensitive" } },
                ];
            }
            const categories = await this.prisma.categoriaEvento.findMany({
                where: whereClause,
                include: {
                    eventos: true,
                    cursos: true,
                },
                orderBy: {
                    nom_cat: "asc",
                },
            });
            return categories.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding categories with filters: ${error}`);
        }
    }
    /**
     * Verificar si existe una categoría con el ID dado
     */
    async existsById(id) {
        try {
            const count = await this.prisma.categoriaEvento.count({
                where: { id_cat: id },
            });
            return count > 0;
        }
        catch (error) {
            throw new Error(`Error checking category existence: ${error}`);
        }
    }
    /**
     * Buscar categorías por nombre
     */
    async findByName(name) {
        try {
            const categories = await this.prisma.categoriaEvento.findMany({
                where: {
                    nom_cat: {
                        contains: name,
                        mode: "insensitive",
                    },
                },
                include: {
                    eventos: true,
                    cursos: true,
                },
            });
            return categories.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding categories by name: ${error}`);
        }
    }
    /**
     * Obtener eventos asociados a una categoría
     */
    async findEventsById(id) {
        try {
            const category = await this.prisma.categoriaEvento.findUnique({
                where: { id_cat: id },
                include: {
                    eventos: {
                        include: {
                            organizador: true,
                            eventosPorCarrera: {
                                include: {
                                    carrera: true,
                                },
                            },
                        },
                    },
                },
            });
            return category?.eventos || [];
        }
        catch (error) {
            throw new Error(`Error finding events by category id: ${error}`);
        }
    }
    /**
     * Obtener cursos asociados a una categoría
     */
    async findCoursesById(id) {
        try {
            const category = await this.prisma.categoriaEvento.findUnique({
                where: { id_cat: id },
                include: {
                    cursos: {
                        include: {
                            organizador: true,
                            cursosPorCarrera: {
                                include: {
                                    carrera: true,
                                },
                            },
                        },
                    },
                },
            });
            return category?.cursos || [];
        }
        catch (error) {
            throw new Error(`Error finding courses by category id: ${error}`);
        }
    }
    /**
     * Verificar si una categoría puede ser eliminada (no tiene eventos/cursos)
     */
    async canBeDeleted(id) {
        try {
            const counts = await this.countRelatedItems(id);
            return counts.totalCount === 0;
        }
        catch (error) {
            throw new Error(`Error checking if category can be deleted: ${error}`);
        }
    }
    /**
     * Contar eventos y cursos asociados a una categoría
     */
    async countRelatedItems(id) {
        try {
            const [eventsCount, coursesCount] = await Promise.all([
                this.prisma.evento.count({
                    where: { id_cat_eve: id },
                }),
                this.prisma.curso.count({
                    where: { id_cat_cur: id },
                }),
            ]);
            return {
                eventsCount,
                coursesCount,
                totalCount: eventsCount + coursesCount,
            };
        }
        catch (error) {
            throw new Error(`Error counting related items: ${error}`);
        }
    }
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    mapPrismaToEntity(prismaCategory) {
        return {
            id: prismaCategory.id_cat,
            name: prismaCategory.nom_cat,
            description: prismaCategory.des_cat,
            events: prismaCategory.eventos || undefined,
            courses: prismaCategory.cursos || undefined,
            createdAt: prismaCategory.createdAt || new Date(),
            updatedAt: prismaCategory.updatedAt || new Date(),
        };
    }
}
exports.PrismaCategoryRepository = PrismaCategoryRepository;
//# sourceMappingURL=PrismaCategoryRepository.js.map