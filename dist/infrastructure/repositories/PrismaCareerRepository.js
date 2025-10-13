"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCareerRepository = void 0;
/**
 * Implementación concreta del repositorio de carreras usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de carreras
 */
class PrismaCareerRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Crear una nueva carrera
     */
    async create(careerData) {
        try {
            const newCareer = await this.prisma.carrera.create({
                data: {
                    nom_car: careerData.name,
                    des_car: careerData.code || "DEFAULT_DESC", // Usando code o valor por defecto
                    nom_fac_per: careerData.faculty,
                },
            });
            return this.mapPrismaToEntity(newCareer);
        }
        catch (error) {
            throw new Error(`Error creating career: ${error}`);
        }
    }
    /**
     * Buscar carrera por ID
     */
    async findById(id) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: id },
                include: {
                    usuarios: true,
                    eventosPorCarrera: {
                        include: {
                            evento: true,
                        },
                    },
                    cursosPorCarrera: {
                        include: {
                            curso: true,
                        },
                    },
                },
            });
            return career ? this.mapPrismaToEntity(career) : null;
        }
        catch (error) {
            throw new Error(`Error finding career by id: ${error}`);
        }
    }
    /**
     * Obtener todas las carreras
     */
    async findAll() {
        try {
            const careers = await this.prisma.carrera.findMany({
                include: {
                    usuarios: true,
                    eventosPorCarrera: {
                        include: {
                            evento: true,
                        },
                    },
                    cursosPorCarrera: {
                        include: {
                            curso: true,
                        },
                    },
                },
                orderBy: {
                    nom_car: "asc",
                },
            });
            return careers.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding all careers: ${error}`);
        }
    }
    /**
     * Actualizar carrera por ID
     */
    async update(id, careerData) {
        try {
            const updatedCareer = await this.prisma.carrera.update({
                where: { id_car: id },
                data: {
                    nom_car: careerData.name,
                    des_car: careerData.code,
                    nom_fac_per: careerData.faculty,
                },
                include: {
                    usuarios: true,
                    eventosPorCarrera: {
                        include: {
                            evento: true,
                        },
                    },
                    cursosPorCarrera: {
                        include: {
                            curso: true,
                        },
                    },
                },
            });
            return this.mapPrismaToEntity(updatedCareer);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null; // Carrera no encontrada
            }
            throw new Error(`Error updating career: ${error}`);
        }
    }
    /**
     * Eliminar carrera por ID
     */
    async delete(id) {
        try {
            await this.prisma.carrera.delete({
                where: { id_car: id },
            });
        }
        catch (error) {
            if (error.code === "P2025") {
                throw new Error("Career not found");
            }
            throw new Error(`Error deleting career: ${error}`);
        }
    }
    /**
     * Buscar carreras con filtros
     */
    async findWithFilters(filters) {
        try {
            const whereClause = {};
            // Filtro por nombre
            if (filters.name) {
                whereClause.nom_car = {
                    contains: filters.name,
                    mode: "insensitive",
                };
            }
            // Filtro por facultad
            if (filters.faculty) {
                whereClause.nom_fac_per = {
                    contains: filters.faculty,
                    mode: "insensitive",
                };
            }
            // Filtro por tener usuarios
            if (filters.hasUsers !== undefined) {
                if (filters.hasUsers) {
                    whereClause.usuarios = { some: {} };
                }
                else {
                    whereClause.usuarios = { none: {} };
                }
            }
            // Filtro por tener eventos
            if (filters.hasEvents !== undefined) {
                if (filters.hasEvents) {
                    whereClause.eventosPorCarrera = { some: {} };
                }
                else {
                    whereClause.eventosPorCarrera = { none: {} };
                }
            }
            // Filtro por tener cursos
            if (filters.hasCourses !== undefined) {
                if (filters.hasCourses) {
                    whereClause.cursosPorCarrera = { some: {} };
                }
                else {
                    whereClause.cursosPorCarrera = { none: {} };
                }
            }
            // Búsqueda general
            if (filters.search) {
                whereClause.OR = [
                    { nom_car: { contains: filters.search, mode: "insensitive" } },
                    { des_car: { contains: filters.search, mode: "insensitive" } },
                    { nom_fac_per: { contains: filters.search, mode: "insensitive" } },
                ];
            }
            const careers = await this.prisma.carrera.findMany({
                where: whereClause,
                include: {
                    usuarios: true,
                    eventosPorCarrera: {
                        include: {
                            evento: true,
                        },
                    },
                    cursosPorCarrera: {
                        include: {
                            curso: true,
                        },
                    },
                },
                orderBy: {
                    nom_car: "asc",
                },
            });
            return careers.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding careers with filters: ${error}`);
        }
    }
    /**
     * Verificar si existe una carrera con el ID dado
     */
    async existsById(id) {
        try {
            const count = await this.prisma.carrera.count({
                where: { id_car: id },
            });
            return count > 0;
        }
        catch (error) {
            throw new Error(`Error checking career existence: ${error}`);
        }
    }
    /**
     * Buscar carreras por nombre
     */
    async findByName(name) {
        try {
            const careers = await this.prisma.carrera.findMany({
                where: {
                    nom_car: {
                        contains: name,
                        mode: "insensitive",
                    },
                },
                include: {
                    usuarios: true,
                    eventosPorCarrera: {
                        include: {
                            evento: true,
                        },
                    },
                    cursosPorCarrera: {
                        include: {
                            curso: true,
                        },
                    },
                },
            });
            return careers.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding careers by name: ${error}`);
        }
    }
    /**
     * Obtener usuarios asociados a una carrera
     */
    async findUsersById(id) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: id },
                include: {
                    usuarios: {
                        include: {
                            cuentas: true,
                        },
                    },
                },
            });
            return career?.usuarios || [];
        }
        catch (error) {
            throw new Error(`Error finding users by career id: ${error}`);
        }
    }
    /**
     * Obtener eventos asociados a una carrera
     */
    async findEventsById(id) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: id },
                include: {
                    eventosPorCarrera: {
                        include: {
                            evento: {
                                include: {
                                    categoria: true,
                                    organizador: true,
                                },
                            },
                        },
                    },
                },
            });
            return career?.eventosPorCarrera.map((epc) => epc.evento) || [];
        }
        catch (error) {
            throw new Error(`Error finding events by career id: ${error}`);
        }
    }
    /**
     * Obtener cursos asociados a una carrera
     */
    async findCoursesById(id) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: id },
                include: {
                    cursosPorCarrera: {
                        include: {
                            curso: {
                                include: {
                                    categoria: true,
                                    organizador: true,
                                },
                            },
                        },
                    },
                },
            });
            return career?.cursosPorCarrera.map((cpc) => cpc.curso) || [];
        }
        catch (error) {
            throw new Error(`Error finding courses by career id: ${error}`);
        }
    }
    /**
     * Verificar si una carrera puede ser eliminada (no tiene usuarios/eventos/cursos)
     */
    async canBeDeleted(id) {
        try {
            const counts = await this.countRelatedItems(id);
            return counts.totalCount === 0;
        }
        catch (error) {
            throw new Error(`Error checking if career can be deleted: ${error}`);
        }
    }
    /**
     * Contar usuarios, eventos y cursos asociados a una carrera
     */
    async countRelatedItems(id) {
        try {
            const [usersCount, eventsCount, coursesCount] = await Promise.all([
                this.prisma.usuario.count({
                    where: { id_car_per: id },
                }),
                this.prisma.eventoPorCarrera.count({
                    where: { id_car_per: id },
                }),
                this.prisma.cursoPorCarrera.count({
                    where: { id_car_per: id },
                }),
            ]);
            return {
                usersCount,
                eventsCount,
                coursesCount,
                totalCount: usersCount + eventsCount + coursesCount,
            };
        }
        catch (error) {
            throw new Error(`Error counting related items: ${error}`);
        }
    }
    /**
     * Obtener estadísticas de carreras
     */
    async getCareerStats() {
        try {
            const [totalCareers, careersWithUsers, careersWithEvents, careersWithCourses,] = await Promise.all([
                this.prisma.carrera.count(),
                this.prisma.carrera.count({
                    where: {
                        usuarios: { some: {} },
                    },
                }),
                this.prisma.carrera.count({
                    where: {
                        eventosPorCarrera: { some: {} },
                    },
                }),
                this.prisma.carrera.count({
                    where: {
                        cursosPorCarrera: { some: {} },
                    },
                }),
            ]);
            // Promedios
            const totalUsers = await this.prisma.usuario.count();
            const totalEvents = await this.prisma.eventoPorCarrera.count();
            const totalCourses = await this.prisma.cursoPorCarrera.count();
            return {
                totalCareers,
                careersWithUsers,
                careersWithEvents,
                careersWithCourses,
                averageUsersPerCareer: totalCareers > 0 ? totalUsers / totalCareers : 0,
                averageEventsPerCareer: totalCareers > 0 ? totalEvents / totalCareers : 0,
                averageCoursesPerCareer: totalCareers > 0 ? totalCourses / totalCareers : 0,
            };
        }
        catch (error) {
            throw new Error(`Error getting career stats: ${error}`);
        }
    }
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    mapPrismaToEntity(prismaCareer) {
        return {
            id: prismaCareer.id_car,
            name: prismaCareer.nom_car,
            code: prismaCareer.des_car, // Mapeando description a code
            faculty: prismaCareer.nom_fac_per,
            isActive: true, // Por defecto activo
            createdAt: prismaCareer.createdAt || new Date(),
            updatedAt: prismaCareer.updatedAt || new Date(),
        };
    }
}
exports.PrismaCareerRepository = PrismaCareerRepository;
//# sourceMappingURL=PrismaCareerRepository.js.map