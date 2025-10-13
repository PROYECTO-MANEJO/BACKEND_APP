/**
 * Event Service - Application Layer
 *
 * Responsabilidad única: Operaciones de negocio para eventos
 * Aplica SRP separando la lógica de negocio del controlador
 */
import { Event } from "../../domain/entities/Event";
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateEventRequest {
    nom_eve: string;
    des_eve: string;
    id_cat_eve: number;
    fec_ini_eve: Date;
    fec_fin_eve?: Date;
    hor_ini_eve: Date;
    hor_fin_eve?: Date;
    dur_eve: number;
    are_eve: string;
    ubi_eve: string;
    ced_org_eve: string;
    capacidad_max_eve: number;
    tipo_audiencia_eve: string;
    es_gratuito: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion: number;
    carreras?: string[];
}
export interface UpdateEventRequest {
    nom_eve?: string;
    des_eve?: string;
    capacidad_max_eve?: number;
    precio?: number;
    estado_eve?: string;
}
export declare class EventService {
    private container;
    constructor(container: DIContainer);
    /**
     * Crear un nuevo evento
     */
    createEvent(eventData: CreateEventRequest): Promise<Event>;
    /**
     * Obtener evento por ID
     */
    getEventById(id: string): Promise<Event | null>;
    /**
     * Obtener todos los eventos
     */
    getAllEvents(): Promise<Event[]>;
    /**
     * Actualizar evento
     */
    updateEvent(id: string, updateData: UpdateEventRequest): Promise<Event>;
    /**
     * Eliminar evento
     */
    deleteEvent(id: string): Promise<void>;
    /**
     * Cerrar evento
     */
    closeEvent(id: string): Promise<Event>;
}
//# sourceMappingURL=EventService.d.ts.map