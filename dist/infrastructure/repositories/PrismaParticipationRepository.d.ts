import { PrismaClient } from "@prisma/client";
import { IParticipationRepository, ParticipationFilters, CertificateData, ParticipationStats } from "../../domain/repositories/IParticipationRepository";
import { ParticipationData } from "../../domain/entities/Participation";
/**
 * Implementación concreta del repositorio de participaciones usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de participaciones
 */
export declare class PrismaParticipationRepository implements IParticipationRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Crear una nueva participación
     */
    create(participationData: Partial<ParticipationData>): Promise<ParticipationData>;
    /**
     * Buscar participación por ID
     */
    findById(id: string): Promise<ParticipationData | null>;
    /**
     * Buscar participación por inscripción ID
     */
    findByInscriptionId(inscriptionId: string): Promise<ParticipationData | null>;
    /**
     * Obtener todas las participaciones
     */
    findAll(): Promise<ParticipationData[]>;
    /**
     * Actualizar participación por ID
     */
    update(id: string, participationData: Partial<ParticipationData>): Promise<ParticipationData | null>;
    /**
     * Eliminar participación por ID
     */
    delete(id: string): Promise<void>;
    /**
     * Buscar participaciones con filtros
     */
    findWithFilters(filters: ParticipationFilters): Promise<ParticipationData[]>;
    /**
     * Verificar si existe una participación
     */
    existsById(id: string): Promise<boolean>;
    /**
     * Obtener participaciones por usuario ID
     */
    findByUserId(userId: string): Promise<ParticipationData[]>;
    /**
     * Obtener participaciones por evento ID
     */
    findByEventId(eventId: string): Promise<ParticipationData[]>;
    /**
     * Obtener participaciones aprobadas
     */
    findApproved(): Promise<ParticipationData[]>;
    /**
     * Obtener participaciones pendientes de evaluación
     */
    findPending(): Promise<ParticipationData[]>;
    /**
     * Actualizar asistencia de una participación
     */
    updateAttendance(id: string, attendancePercentage: number): Promise<ParticipationData | null>;
    /**
     * Generar certificado para una participación
     */
    generateCertificate(id: string, certificateData: CertificateData): Promise<ParticipationData | null>;
    /**
     * Obtener estadísticas de participaciones
     */
    getParticipationStats(): Promise<ParticipationStats>;
    /**
     * Evaluar automáticamente aprobación basada en asistencia
     */
    evaluateApproval(id: string): Promise<ParticipationData | null>;
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    private mapPrismaToEntity;
}
//# sourceMappingURL=PrismaParticipationRepository.d.ts.map