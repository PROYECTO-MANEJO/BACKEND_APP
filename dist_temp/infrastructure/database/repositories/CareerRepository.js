"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerRepository = void 0;
/**
 * Implementación del repositorio de carreras usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de carreras
 * - DIP: Implementa la interfaz ICareerRepository
 */
class CareerRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: id.toString() },
            });
            return career ? this.mapToEntity(career) : null;
        }
        catch (error) {
            console.error("Error finding career by ID:", error);
            throw new Error("Failed to find career");
        }
    }
    async findAll() {
        try {
            const careers = await this.prisma.carrera.findMany({
                orderBy: {
                    nom_car: "asc",
                },
            });
            return careers.map((career) => this.mapToEntity(career));
        }
        catch (error) {
            console.error("Error finding all careers:", error);
            throw new Error("Failed to find careers");
        }
    }
    async create(entity) {
        try {
            const career = await this.prisma.carrera.create({
                data: {
                    nom_car: entity.name,
                    des_car: entity.code,
                    nom_fac_per: entity.faculty,
                },
            });
            return this.mapToEntity(career);
        }
        catch (error) {
            console.error("Error creating career:", error);
            throw new Error("Failed to create career");
        }
    }
    async update(id, entity) {
        try {
            const updateData = {};
            if (entity.name)
                updateData.nom_car = entity.name;
            if (entity.code)
                updateData.des_car = entity.code;
            if (entity.faculty)
                updateData.nom_fac_per = entity.faculty;
            const career = await this.prisma.carrera.update({
                where: { id_car: id.toString() },
                data: updateData,
            });
            return this.mapToEntity(career);
        }
        catch (error) {
            console.error("Error updating career:", error);
            throw new Error("Failed to update career");
        }
    }
    async delete(id) {
        try {
            await this.prisma.carrera.delete({
                where: { id_car: id.toString() },
            });
            return true;
        }
        catch (error) {
            console.error("Error deleting career:", error);
            return false;
        }
    }
    async findActivecareers() {
        try {
            // Como no hay campo isActive en el esquema actual, devolver todas
            const careers = await this.prisma.carrera.findMany({
                orderBy: {
                    nom_car: "asc",
                },
            });
            return careers.map((career) => this.mapToEntity(career));
        }
        catch (error) {
            console.error("Error finding active careers:", error);
            throw new Error("Failed to find active careers");
        }
    }
    async existsAndActive(careerId) {
        try {
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: careerId.toString() },
            });
            return career !== null; // Como no hay campo isActive, solo verificar existencia
        }
        catch (error) {
            console.error("Error checking career existence:", error);
            return false;
        }
    }
    async findByCode(code) {
        try {
            const career = await this.prisma.carrera.findFirst({
                where: { des_car: code },
            });
            return career ? this.mapToEntity(career) : null;
        }
        catch (error) {
            console.error("Error finding career by code:", error);
            throw new Error("Failed to find career by code");
        }
    }
    async codeExists(code, excludeId) {
        try {
            const where = { des_car: code };
            if (excludeId) {
                where.NOT = { id_car: excludeId.toString() };
            }
            const career = await this.prisma.carrera.findFirst({ where });
            return career !== null;
        }
        catch (error) {
            console.error("Error checking code existence:", error);
            return false;
        }
    }
    async setActiveStatus(careerId, isActive) {
        try {
            // Como no hay campo isActive en el esquema actual, simular el comportamiento
            // En una implementación real, se agregaría el campo isActive al esquema
            const career = await this.prisma.carrera.findUnique({
                where: { id_car: careerId.toString() },
            });
            return career !== null;
        }
        catch (error) {
            console.error("Error setting career active status:", error);
            return false;
        }
    }
    /**
     * SRP: Solo mapea datos de Prisma a entidad de dominio
     */
    mapToEntity(prismaCareer) {
        return {
            id: parseInt(prismaCareer.id_car),
            name: prismaCareer.nom_car,
            code: prismaCareer.des_car,
            faculty: prismaCareer.nom_fac_per,
            isActive: true, // Por defecto true ya que no hay campo en el esquema
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
exports.CareerRepository = CareerRepository;
