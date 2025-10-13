import { ParticipationData } from "../entities/Participation";
/**
 * Interfaz del repositorio para la gestión de participaciones
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface IParticipationRepository {
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
}
/**
 * Filtros para búsqueda de participaciones
 */
export interface ParticipationFilters {
    userId?: string;
    eventId?: string;
    approved?: boolean;
    attendanceMin?: number;
    attendanceMax?: number;
    hasCertificate?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
}
/**
 * Datos para generar certificado
 */
export interface CertificateData {
    certificatePdf: Buffer;
    filename: string;
    size: number;
}
/**
 * Estadísticas de participaciones
 */
export interface ParticipationStats {
    totalParticipations: number;
    approvedParticipations: number;
    pendingParticipations: number;
    averageAttendance: number;
    certificatesGenerated: number;
}
//# sourceMappingURL=IParticipationRepository.d.ts.map