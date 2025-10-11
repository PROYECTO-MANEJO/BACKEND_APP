import { PrismaClient } from "@prisma/client";
import { ICareerRepository } from "@domain/repositories/IUserRepository";
import { Career } from "@domain/entities/User";

/**
 * Implementación del repositorio de carreras usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de carreras
 * - DIP: Implementa la interfaz ICareerRepository
 */
export class CareerRepository implements ICareerRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Career | null> {
    try {
      const career = await this.prisma.carrera.findUnique({
        where: { id_car: id.toString() },
      });

      return career ? this.mapToEntity(career) : null;
    } catch (error) {
      console.error("Error finding career by ID:", error);
      throw new Error("Failed to find career");
    }
  }

  async findAll(): Promise<Career[]> {
    try {
      const careers = await this.prisma.carrera.findMany({
        orderBy: {
          nom_car: 'asc'
        }
      });

      return careers.map((career) => this.mapToEntity(career));
    } catch (error) {
      console.error("Error finding all careers:", error);
      throw new Error("Failed to find careers");
    }
  }

  async create(entity: Omit<Career, "id" | "createdAt" | "updatedAt">): Promise<Career> {
    try {
      const career = await this.prisma.carrera.create({
        data: {
          nom_car: entity.name,
          des_car: entity.code,
          nom_fac_per: entity.faculty,
        },
      });

      return this.mapToEntity(career);
    } catch (error) {
      console.error("Error creating career:", error);
      throw new Error("Failed to create career");
    }
  }

  async update(id: number, entity: Partial<Career>): Promise<Career | null> {
    try {
      const updateData: any = {};
      
      if (entity.name) updateData.nom_car = entity.name;
      if (entity.code) updateData.des_car = entity.code;
      if (entity.faculty) updateData.nom_fac_per = entity.faculty;

      const career = await this.prisma.carrera.update({
        where: { id_car: id.toString() },
        data: updateData,
      });

      return this.mapToEntity(career);
    } catch (error) {
      console.error("Error updating career:", error);
      throw new Error("Failed to update career");
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.carrera.delete({
        where: { id_car: id.toString() },
      });
      return true;
    } catch (error) {
      console.error("Error deleting career:", error);
      return false;
    }
  }

  async findActivecareers(): Promise<Career[]> {
    try {
      // Como no hay campo isActive en el esquema actual, devolver todas
      const careers = await this.prisma.carrera.findMany({
        orderBy: {
          nom_car: 'asc'
        }
      });

      return careers.map((career) => this.mapToEntity(career));
    } catch (error) {
      console.error("Error finding active careers:", error);
      throw new Error("Failed to find active careers");
    }
  }

  async existsAndActive(careerId: number): Promise<boolean> {
    try {
      const career = await this.prisma.carrera.findUnique({
        where: { id_car: careerId.toString() },
      });

      return career !== null; // Como no hay campo isActive, solo verificar existencia
    } catch (error) {
      console.error("Error checking career existence:", error);
      return false;
    }
  }

  async findByCode(code: string): Promise<Career | null> {
    try {
      const career = await this.prisma.carrera.findFirst({
        where: { des_car: code },
      });

      return career ? this.mapToEntity(career) : null;
    } catch (error) {
      console.error("Error finding career by code:", error);
      throw new Error("Failed to find career by code");
    }
  }

  async codeExists(code: string, excludeId?: number): Promise<boolean> {
    try {
      const where: any = { des_car: code };
      
      if (excludeId) {
        where.NOT = { id_car: excludeId.toString() };
      }

      const career = await this.prisma.carrera.findFirst({ where });
      
      return career !== null;
    } catch (error) {
      console.error("Error checking code existence:", error);
      return false;
    }
  }

  async setActiveStatus(careerId: number, isActive: boolean): Promise<boolean> {
    try {
      // Como no hay campo isActive en el esquema actual, simular el comportamiento
      // En una implementación real, se agregaría el campo isActive al esquema
      const career = await this.prisma.carrera.findUnique({
        where: { id_car: careerId.toString() },
      });

      return career !== null;
    } catch (error) {
      console.error("Error setting career active status:", error);
      return false;
    }
  }

  /**
   * SRP: Solo mapea datos de Prisma a entidad de dominio
   */
  private mapToEntity(prismaCareer: any): Career {
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