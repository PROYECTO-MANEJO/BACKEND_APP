import { BaseEntity } from "../../shared/interfaces/BaseInterfaces";
/**
 * Entidad Career del dominio
 * Principio SRP: Solo representa la información de una carrera
 */
export interface Career extends BaseEntity {
    name: string;
    code: string;
    faculty: string;
    isActive: boolean;
}
/**
 * Clase Career con métodos de dominio
 */
export declare class CareerEntity implements Career {
    readonly id: number;
    readonly name: string;
    readonly code: string;
    readonly faculty: string;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(data: Career);
    /**
     * Valida si la carrera está activa
     */
    canAcceptStudents(): boolean;
    /**
     * Obtiene nombre completo de la carrera
     */
    getFullName(): string;
    /**
     * Valida si el código de carrera es válido
     */
    static isValidCode(code: string): boolean;
}
//# sourceMappingURL=Career.d.ts.map