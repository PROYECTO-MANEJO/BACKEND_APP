/**
 * Inscription Management Service - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de inscripciones a eventos y cursos.
 */
import { Inscription, InscriptionType, PaymentMethod } from "../entities/Inscription";
export interface IInscriptionRepository {
    create(inscription: Inscription): Promise<Inscription>;
    findById(id: string): Promise<Inscription | null>;
    findAll(): Promise<Inscription[]>;
    update(id: string, inscription: Inscription): Promise<Inscription>;
    delete(id: string): Promise<void>;
    findByUser(userId: string): Promise<Inscription[]>;
    findByTarget(targetId: string, type: InscriptionType): Promise<Inscription[]>;
    findByUserAndTarget(userId: string, targetId: string, type: InscriptionType): Promise<Inscription | null>;
    findByPaymentStatus(status: string): Promise<Inscription[]>;
    findPendingApprovals(): Promise<Inscription[]>;
    countActiveByTarget(targetId: string, type: InscriptionType): Promise<number>;
    findWithFilters(filters: {
        userId?: string;
        targetId?: string;
        type?: InscriptionType;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Inscription[]>;
}
export interface IEventRepository {
    findById(id: string): Promise<any | null>;
    hasAvailableCapacity(eventId: string): Promise<boolean>;
}
export interface ICourseRepository {
    findById(id: string): Promise<any | null>;
    hasAvailableCapacity(courseId: string): Promise<boolean>;
}
export interface IUserRepository {
    findById(id: string): Promise<any | null>;
    exists(id: string): Promise<boolean>;
}
export declare class InscriptionManagementService {
    private inscriptionRepository;
    private eventRepository;
    private courseRepository;
    private userRepository;
    constructor(inscriptionRepository: IInscriptionRepository, eventRepository: IEventRepository, courseRepository: ICourseRepository, userRepository: IUserRepository);
    /**
     * ✅ INSCRIBIR USUARIO A EVENTO
     */
    enrollInEvent(data: {
        userId: string;
        eventId: string;
        paymentMethod?: PaymentMethod;
        motivationLetter?: string;
        paymentProofBuffer?: Buffer;
        paymentProofFilename?: string;
    }): Promise<Inscription>;
    /**
     * ✅ INSCRIBIR USUARIO A CURSO
     */
    enrollInCourse(data: {
        userId: string;
        courseId: string;
        paymentMethod?: PaymentMethod;
        motivationLetter?: string;
        paymentProofBuffer?: Buffer;
        paymentProofFilename?: string;
    }): Promise<Inscription>;
    /**
     * ✅ APROBAR INSCRIPCIÓN
     */
    approveInscription(inscriptionId: string, approverUserId: string): Promise<Inscription>;
    /**
     * ✅ RECHAZAR INSCRIPCIÓN
     */
    rejectInscription(inscriptionId: string): Promise<Inscription>;
    /**
     * ✅ CANCELAR INSCRIPCIÓN
     */
    cancelInscription(inscriptionId: string, userId: string): Promise<Inscription>;
    /**
     * ✅ ACTUALIZAR COMPROBANTE DE PAGO
     */
    updatePaymentProof(inscriptionId: string, userId: string, pdfBuffer: Buffer, filename: string): Promise<Inscription>;
    /**
     * ✅ OBTENER INSCRIPCIONES DEL USUARIO
     */
    getUserInscriptions(userId: string, filters?: {
        type?: InscriptionType;
        status?: string;
    }): Promise<Inscription[]>;
    /**
     * ✅ OBTENER INSCRIPCIONES PENDIENTES DE APROBACIÓN
     */
    getPendingInscriptions(): Promise<Inscription[]>;
    /**
     * ✅ OBTENER ESTADÍSTICAS DE INSCRIPCIONES
     */
    getInscriptionStatistics(targetId: string, type: InscriptionType): Promise<{
        totalInscriptions: number;
        approvedInscriptions: number;
        pendingInscriptions: number;
        rejectedInscriptions: number;
        cancelledInscriptions: number;
    }>;
    /**
     * ✅ VERIFICAR ELEGIBILIDAD PARA INSCRIPCIÓN
     */
    checkEnrollmentEligibility(userId: string, targetId: string, type: InscriptionType): Promise<{
        eligible: boolean;
        reason?: string;
    }>;
    /**
     * ✅ VALIDACIONES AUXILIARES
     */
    private validateUserEligibility;
    /**
     * ✅ VALIDAR ARCHIVO PDF
     */
    static validatePdfFile(buffer: Buffer, filename: string): void;
}
//# sourceMappingURL=InscriptionManagementService.d.ts.map