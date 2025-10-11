/**
 * EventManagementService - Domain Layer
 *
 * Servicio de dominio que encapsula la lógica de negocio
 * para la gestión de eventos del sistema.
 */
import { Event } from "../entities/Event";
export interface IEventRepository {
    findAll(filters?: EventFilters): Promise<Event[]>;
    findById(id: string): Promise<Event | null>;
    findByOrganizer(cedOrganizador: string, filters?: EventFilters): Promise<Event[]>;
    findAvailableEvents(filters?: EventFilters): Promise<Event[]>;
    findUserEvents(cedUsuario: string, filters?: EventFilters): Promise<Event[]>;
    create(event: Event): Promise<Event>;
    update(id: string, event: Event): Promise<Event>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    existsByName(nombre: string, excludeId?: string): Promise<boolean>;
    count(filters?: EventFilters): Promise<number>;
    findPaginated(page: number, limit: number, filters?: EventFilters): Promise<{
        events: Event[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
}
export interface ICategoryRepository {
    existsById(id: number): Promise<boolean>;
    findById(id: number): Promise<any>;
}
export interface IEventUserRepository {
    existsByCedula(cedula: string): Promise<boolean>;
    findByCedula(cedula: string): Promise<any>;
    isOrganizer(cedula: string): Promise<boolean>;
}
export interface EventFilters {
    estado?: string;
    categoria?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
    esGratuito?: boolean;
    tipoAudiencia?: string;
    organizador?: string;
    busqueda?: string;
}
export interface EventCreationData {
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
    carreras?: number[];
}
export interface EventUpdateData {
    nom_eve?: string;
    des_eve?: string;
    capacidad_max_eve?: number;
    precio?: number;
    are_eve?: string;
    ubi_eve?: string;
}
export declare class EventManagementService {
    private eventRepository;
    private categoryRepository;
    private userRepository;
    constructor(eventRepository: IEventRepository, categoryRepository: ICategoryRepository, userRepository: IEventUserRepository);
    createEvent(data: EventCreationData): Promise<Event>;
    getEventById(id: string): Promise<Event | null>;
    getAllEvents(filters?: EventFilters): Promise<Event[]>;
    getEventsPaginated(page?: number, limit?: number, filters?: EventFilters): Promise<{
        events: Event[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getAvailableEvents(filters?: EventFilters): Promise<Event[]>;
    getUserEvents(cedUsuario: string, filters?: EventFilters): Promise<Event[]>;
    getOrganizerEvents(cedOrganizador: string, filters?: EventFilters): Promise<Event[]>;
    updateEvent(id: string, data: EventUpdateData): Promise<Event>;
    deleteEvent(id: string): Promise<boolean>;
    closeEvent(id: string): Promise<Event>;
    cancelEvent(id: string): Promise<Event>;
    validateOrganizerPermissions(eventId: string, cedOrganizador: string): Promise<boolean>;
    getEventStats(filters?: EventFilters): Promise<{
        total: number;
        activos: number;
        cerrados: number;
        cancelados: number;
        proximos: number;
    }>;
    searchEvents(searchTerm: string, filters?: Omit<EventFilters, "busqueda">): Promise<Event[]>;
}
//# sourceMappingURL=EventManagementService.d.ts.map