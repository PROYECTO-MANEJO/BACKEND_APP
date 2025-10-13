/**
 * Certificate Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de certificados
 * Separado de CertificateService para cumplir Single Responsibility Principle
 */
export interface CertificateValidationData {
    ced_est?: string;
    id_cur?: string;
    id_eve?: string;
    tipo_certificado?: string;
    fecha_emision?: Date;
    nota_final?: number;
    porcentaje_asistencia?: number;
}
export declare class CertificateValidator {
    /**
     * ✅ SRP: Solo validación de datos de certificado
     */
    static validate(data: CertificateValidationData): void;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<CertificateValidationData>): void;
    /**
     * ✅ SRP: Solo validación de requisitos de aprobación
     */
    static validateApprovalRequirements(nota: number, asistencia: number, notaMinima: number, asistenciaMinima: number): void;
}
//# sourceMappingURL=CertificateValidator.d.ts.map