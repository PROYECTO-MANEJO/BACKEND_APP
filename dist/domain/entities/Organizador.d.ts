import { BaseEntity } from "../../shared/interfaces/BaseInterfaces";
/**
 * Entidad Organizador del dominio
 * Principio SRP: Solo representa la información del organizador
 */
export interface Organizador extends BaseEntity {
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    academicTitle?: string;
    events?: any[];
    courses?: any[];
}
/**
 * DTO para crear un organizador
 * Principio SRP: Solo para transferencia de datos de creación
 */
export interface CreateOrganizerDto {
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    academicTitle?: string;
}
/**
 * DTO para actualizar un organizador
 * Principio SRP: Solo para transferencia de datos de actualización
 */
export interface UpdateOrganizerDto {
    firstName?: string;
    secondName?: string;
    lastName?: string;
    secondLastName?: string;
    academicTitle?: string;
}
/**
 * Respuesta completa del organizador con relaciones
 */
export interface OrganizerWithRelations extends Organizador {
    eventsCount?: number;
    coursesCount?: number;
    events?: any[];
    courses?: any[];
}
//# sourceMappingURL=Organizador.d.ts.map