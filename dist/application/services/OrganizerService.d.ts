/**
 * Organizer Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para organizadores
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateOrganizerRequest {
    ced_org: string;
    nom_org1: string;
    nom_org2?: string;
    ape_org1: string;
    ape_org2?: string;
    email: string;
    tel_org?: string;
    tit_aca_org?: string;
    especialidad?: string;
    experiencia_anos?: number;
}
export interface UpdateOrganizerRequest {
    nom_org1?: string;
    nom_org2?: string;
    ape_org1?: string;
    ape_org2?: string;
    email?: string;
    tel_org?: string;
    tit_aca_org?: string;
    especialidad?: string;
    experiencia_anos?: number;
    estado?: string;
}
export declare class OrganizerService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nuevo organizador
     */
    createOrganizer(organizerRequest: CreateOrganizerRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener todos los organizadores
     */
    getAllOrganizers(): Promise<any[]>;
    /**
     * ✅ SRP: Obtener organizador por cédula
     */
    getOrganizerByCedula(cedula: string): Promise<any | null>;
    /**
     * ✅ SRP: Obtener organizadores activos
     */
    getActiveOrganizers(): Promise<any[]>;
    /**
     * ✅ SRP: Actualizar organizador
     */
    updateOrganizer(cedula: string, updateRequest: UpdateOrganizerRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener cursos por organizador
     */
    getCoursesByOrganizer(cedula: string): Promise<any[]>;
    /**
     * ✅ SRP: Obtener eventos por organizador
     */
    getEventsByOrganizer(cedula: string): Promise<any[]>;
    /**
     * ✅ SRP: Activar/Desactivar organizador
     */
    toggleOrganizerStatus(cedula: string): Promise<any>;
}
//# sourceMappingURL=OrganizerService.d.ts.map