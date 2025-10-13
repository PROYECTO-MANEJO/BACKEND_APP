/**
 * Inscription Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para inscripciones
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateInscriptionRequest {
    ced_est: string;
    id_cur?: string;
    id_eve?: string;
    documento_identidad?: string;
    documento_comprobante?: string;
    carta_motivacion?: string;
}
export interface UpdateInscriptionRequest {
    estado?: string;
    observaciones?: string;
    fecha_aprobacion?: Date;
}
export declare class InscriptionService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nueva inscripción
     */
    createInscription(inscriptionRequest: CreateInscriptionRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener inscripciones por estudiante
     */
    getInscriptionsByStudent(cedula: string): Promise<any[]>;
    /**
     * ✅ SRP: Obtener inscripciones por curso
     */
    getInscriptionsByCourse(courseId: string): Promise<any[]>;
    /**
     * ✅ SRP: Aprobar inscripción
     */
    approveInscription(id: string, observaciones?: string): Promise<any>;
    /**
     * ✅ SRP: Rechazar inscripción
     */
    rejectInscription(id: string, observaciones: string): Promise<any>;
    /**
     * ✅ SRP: Cancelar inscripción
     */
    cancelInscription(id: string): Promise<void>;
}
//# sourceMappingURL=InscriptionService.d.ts.map