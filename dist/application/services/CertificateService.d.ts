/**
 * Certificate Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para certificados
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateCertificateRequest {
    ced_est: string;
    id_cur?: string;
    id_eve?: string;
    tipo_certificado: string;
    fecha_emision: Date;
    nota_final?: number;
    porcentaje_asistencia?: number;
}
export interface UpdateCertificateRequest {
    nota_final?: number;
    porcentaje_asistencia?: number;
    fecha_emision?: Date;
    observaciones?: string;
}
export declare class CertificateService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nuevo certificado
     */
    createCertificate(certificateRequest: CreateCertificateRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener certificados por estudiante
     */
    getCertificatesByStudent(cedula: string): Promise<any[]>;
    /**
     * ✅ SRP: Obtener certificados por curso
     */
    getCertificatesByCourse(courseId: string): Promise<any[]>;
    /**
     * ✅ SRP: Obtener certificados por evento
     */
    getCertificatesByEvent(eventId: string): Promise<any[]>;
    /**
     * ✅ SRP: Actualizar certificado
     */
    updateCertificate(id: string, updateRequest: UpdateCertificateRequest): Promise<any>;
    /**
     * ✅ SRP: Generar PDF del certificado
     */
    generateCertificatePDF(id: string): Promise<Buffer>;
}
//# sourceMappingURL=CertificateService.d.ts.map