import { PrismaClient } from "@prisma/client";
import { ICareerRepository, CareerFilters, CareerRelationsCount, CareerStats } from "../../domain/repositories/ICareerRepository";
import { Career } from "../../domain/entities/Career";
/**
 * Implementación concreta del repositorio de carreras usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de carreras
 */
export declare class PrismaCareerRepository implements ICareerRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Crear una nueva carrera
     */
    create(careerData: Partial<Career>): Promise<Career>;
    /**
     * Buscar carrera por ID
     */
    findById(id: string): Promise<Career | null>;
    /**
     * Obtener todas las carreras
     */
    findAll(): Promise<Career[]>;
    /**
     * Actualizar carrera por ID
     */
    update(id: string, careerData: Partial<Career>): Promise<Career | null>;
    /**
     * Eliminar carrera por ID
     */
    delete(id: string): Promise<void>;
    /**
     * Buscar carreras con filtros
     */
    findWithFilters(filters: CareerFilters): Promise<Career[]>;
    /**
     * Verificar si existe una carrera con el ID dado
     */
    existsById(id: string): Promise<boolean>;
    /**
     * Buscar carreras por nombre
     */
    findByName(name: string): Promise<Career[]>;
    /**
     * Obtener usuarios asociados a una carrera
     */
    findUsersById(id: string): Promise<any[]>;
    /**
     * Obtener eventos asociados a una carrera
     */
    findEventsById(id: string): Promise<any[]>;
    /**
     * Obtener cursos asociados a una carrera
     */
    findCoursesById(id: string): Promise<any[]>;
    /**
     * Verificar si una carrera puede ser eliminada (no tiene usuarios/eventos/cursos)
     */
    canBeDeleted(id: string): Promise<boolean>;
    /**
     * Contar usuarios, eventos y cursos asociados a una carrera
     */
    countRelatedItems(id: string): Promise<CareerRelationsCount>;
    /**
     * Obtener estadísticas de carreras
     */
    getCareerStats(): Promise<CareerStats>;
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    private mapPrismaToEntity;
}
//# sourceMappingURL=PrismaCareerRepository.d.ts.map