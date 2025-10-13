"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaOrganizerRepository = void 0;
/**
 * Implementación concreta del repositorio de organizadores usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de organizadores
 */
class PrismaOrganizerRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Crear un nuevo organizador
     */
    async create(organizadorData) {
        try {
            const newOrganizer = await this.prisma.organizador.create({
                data: {
                    ced_org: organizadorData.cedula,
                    nom_org1: organizadorData.firstName,
                    nom_org2: organizadorData.secondName || "",
                    ape_org1: organizadorData.lastName,
                    ape_org2: organizadorData.secondLastName,
                    tit_aca_org: organizadorData.academicTitle || null,
                },
            });
            return this.mapPrismaToEntity(newOrganizer);
        }
        catch (error) {
            throw new Error(`Error creating organizer: ${error}`);
        }
    }
    /**
     * Buscar organizador por cédula
     */
    async findByCedula(cedula) {
        try {
            const organizer = await this.prisma.organizador.findUnique({
                where: { ced_org: cedula },
                include: {
                    eventos: true,
                    cursos: true,
                },
            });
            return organizer ? this.mapPrismaToEntity(organizer) : null;
        }
        catch (error) {
            throw new Error(`Error finding organizer by cedula: ${error}`);
        }
    }
    /**
     * Buscar organizador por ID (en este caso, cédula)
     */
    async findById(id) {
        return this.findByCedula(id);
    }
    /**
     * Obtener todos los organizadores
     */
    async findAll() {
        try {
            const organizers = await this.prisma.organizador.findMany({
                include: {
                    eventos: true,
                    cursos: true,
                },
                orderBy: {
                    nom_org1: "asc",
                },
            });
            return organizers.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding all organizers: ${error}`);
        }
    }
    /**
     * Actualizar organizador por cédula
     */
    async update(cedula, organizadorData) {
        try {
            const updatedOrganizer = await this.prisma.organizador.update({
                where: { ced_org: cedula },
                data: {
                    nom_org1: organizadorData.firstName,
                    nom_org2: organizadorData.secondName,
                    ape_org1: organizadorData.lastName,
                    ape_org2: organizadorData.secondLastName,
                    tit_aca_org: organizadorData.academicTitle,
                },
                include: {
                    eventos: true,
                    cursos: true,
                },
            });
            return this.mapPrismaToEntity(updatedOrganizer);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null; // Organizador no encontrado
            }
            throw new Error(`Error updating organizer: ${error}`);
        }
    }
    /**
     * Eliminar organizador por cédula
     */
    async delete(cedula) {
        try {
            await this.prisma.organizador.delete({
                where: { ced_org: cedula },
            });
        }
        catch (error) {
            if (error.code === "P2025") {
                throw new Error("Organizer not found");
            }
            throw new Error(`Error deleting organizer: ${error}`);
        }
    }
    /**
     * Buscar organizadores con filtros
     */
    async findWithFilters(filters) {
        try {
            const whereClause = {};
            // Filtro por nombre
            if (filters.name) {
                whereClause.OR = [
                    { nom_org1: { contains: filters.name, mode: "insensitive" } },
                    { nom_org2: { contains: filters.name, mode: "insensitive" } },
                    { ape_org1: { contains: filters.name, mode: "insensitive" } },
                    { ape_org2: { contains: filters.name, mode: "insensitive" } },
                ];
            }
            // Filtro por título académico
            if (filters.academicTitle) {
                whereClause.tit_aca_org = {
                    contains: filters.academicTitle,
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
                    { nom_org1: { contains: filters.search, mode: "insensitive" } },
                    { nom_org2: { contains: filters.search, mode: "insensitive" } },
                    { ape_org1: { contains: filters.search, mode: "insensitive" } },
                    { ape_org2: { contains: filters.search, mode: "insensitive" } },
                    { ced_org: { contains: filters.search, mode: "insensitive" } },
                    { tit_aca_org: { contains: filters.search, mode: "insensitive" } },
                ];
            }
            const organizers = await this.prisma.organizador.findMany({
                where: whereClause,
                include: {
                    eventos: true,
                    cursos: true,
                },
                orderBy: {
                    nom_org1: "asc",
                },
            });
            return organizers.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding organizers with filters: ${error}`);
        }
    }
    /**
     * Verificar si existe un organizador con la cédula dada
     */
    async existsByCedula(cedula) {
        try {
            const count = await this.prisma.organizador.count({
                where: { ced_org: cedula },
            });
            return count > 0;
        }
        catch (error) {
            throw new Error(`Error checking organizer existence: ${error}`);
        }
    }
    /**
     * Obtener eventos asociados a un organizador
     */
    async findEventsByCedula(cedula) {
        try {
            const organizer = await this.prisma.organizador.findUnique({
                where: { ced_org: cedula },
                include: {
                    eventos: {
                        include: {
                            categoria: true,
                            eventosPorCarrera: {
                                include: {
                                    carrera: true,
                                },
                            },
                        },
                    },
                },
            });
            return organizer?.eventos || [];
        }
        catch (error) {
            throw new Error(`Error finding events by organizer cedula: ${error}`);
        }
    }
    /**
     * Obtener cursos asociados a un organizador
     */
    async findCoursesByCedula(cedula) {
        try {
            const organizer = await this.prisma.organizador.findUnique({
                where: { ced_org: cedula },
                include: {
                    cursos: {
                        include: {
                            categoria: true,
                            cursosPorCarrera: {
                                include: {
                                    carrera: true,
                                },
                            },
                        },
                    },
                },
            });
            return organizer?.cursos || [];
        }
        catch (error) {
            throw new Error(`Error finding courses by organizer cedula: ${error}`);
        }
    }
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    mapPrismaToEntity(prismaOrganizer) {
        return {
            id: prismaOrganizer.ced_org, // Usando cédula como ID
            cedula: prismaOrganizer.ced_org,
            firstName: prismaOrganizer.nom_org1,
            secondName: prismaOrganizer.nom_org2 || undefined,
            lastName: prismaOrganizer.ape_org1,
            secondLastName: prismaOrganizer.ape_org2,
            academicTitle: prismaOrganizer.tit_aca_org || undefined,
            events: prismaOrganizer.eventos || undefined,
            courses: prismaOrganizer.cursos || undefined,
            createdAt: prismaOrganizer.createdAt || new Date(),
            updatedAt: prismaOrganizer.updatedAt || new Date(),
        };
    }
}
exports.PrismaOrganizerRepository = PrismaOrganizerRepository;
//# sourceMappingURL=PrismaOrganizerRepository.js.map