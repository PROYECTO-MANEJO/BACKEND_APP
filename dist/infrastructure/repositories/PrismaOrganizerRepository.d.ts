import { PrismaClient } from "@prisma/client";
import { IOrganizerRepository, OrganizerFilters } from "../../domain/repositories/IOrganizerRepository";
import { Organizador } from "../../domain/entities/Organizador";
/**
 * Implementación concreta del repositorio de organizadores usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de organizadores
 */
export declare class PrismaOrganizerRepository implements IOrganizerRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Crear un nuevo organizador
     */
    create(organizadorData: Partial<Organizador>): Promise<Organizador>;
    /**
     * Buscar organizador por cédula
     */
    findByCedula(cedula: string): Promise<Organizador | null>;
    /**
     * Buscar organizador por ID (en este caso, cédula)
     */
    findById(id: string): Promise<Organizador | null>;
    /**
     * Obtener todos los organizadores
     */
    findAll(): Promise<Organizador[]>;
    /**
     * Actualizar organizador por cédula
     */
    update(cedula: string, organizadorData: Partial<Organizador>): Promise<Organizador | null>;
    /**
     * Eliminar organizador por cédula
     */
    delete(cedula: string): Promise<void>;
    /**
     * Buscar organizadores con filtros
     */
    findWithFilters(filters: OrganizerFilters): Promise<Organizador[]>;
    /**
     * Verificar si existe un organizador con la cédula dada
     */
    existsByCedula(cedula: string): Promise<boolean>;
    /**
     * Obtener eventos asociados a un organizador
     */
    findEventsByCedula(cedula: string): Promise<any[]>;
    /**
     * Obtener cursos asociados a un organizador
     */
    findCoursesByCedula(cedula: string): Promise<any[]>;
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    private mapPrismaToEntity;
}
//# sourceMappingURL=PrismaOrganizerRepository.d.ts.map