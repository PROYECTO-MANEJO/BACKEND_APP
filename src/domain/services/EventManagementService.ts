/**
 * EventManagementService - Domain Layer
 *
 * Servicio de dominio que encapsula la lógica de negocio
 * para la gestión de eventos del sistema.
 */

import { Event, EventData } from "../entities/Event";

export interface IEventRepository {
  findAll(filters?: EventFilters): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  findByOrganizer(
    cedOrganizador: string,
    filters?: EventFilters
  ): Promise<Event[]>;
  findAvailableEvents(filters?: EventFilters): Promise<Event[]>;
  findUserEvents(cedUsuario: string, filters?: EventFilters): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  update(id: string, event: Event): Promise<Event>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  existsByName(nombre: string, excludeId?: string): Promise<boolean>;
  count(filters?: EventFilters): Promise<number>;
  findPaginated(
    page: number,
    limit: number,
    filters?: EventFilters
  ): Promise<{
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
  busqueda?: string; // Para búsqueda por nombre o descripción
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

export class EventManagementService {
  constructor(
    private eventRepository: IEventRepository,
    private categoryRepository: ICategoryRepository,
    private userRepository: IEventUserRepository
  ) {}

  // ✅ CREAR EVENTO
  async createEvent(data: EventCreationData): Promise<Event> {
    // Validar que la categoría exista
    const categoryExists = await this.categoryRepository.existsById(
      data.id_cat_eve
    );
    if (!categoryExists) {
      throw new Error("La categoría del evento no existe");
    }

    // Validar que el organizador exista y sea válido
    const organizerExists = await this.userRepository.existsByCedula(
      data.ced_org_eve
    );
    if (!organizerExists) {
      throw new Error("El organizador no existe en el sistema");
    }

    // Validar que el organizador tenga permisos (opcional según business rules)
    const isValidOrganizer = await this.userRepository.isOrganizer(
      data.ced_org_eve
    );
    if (!isValidOrganizer) {
      throw new Error("El usuario no tiene permisos para organizar eventos");
    }

    // Validar que no exista un evento con el mismo nombre
    const existingEvent = await this.eventRepository.existsByName(data.nom_eve);
    if (existingEvent) {
      throw new Error("Ya existe un evento con ese nombre");
    }

    // Crear la entidad Event (con validaciones de dominio)
    const event = new Event(data);

    // Persistir en la base de datos
    return await this.eventRepository.create(event);
  }

  // ✅ OBTENER EVENTO POR ID
  async getEventById(id: string): Promise<Event | null> {
    if (!id || !id.trim()) {
      throw new Error("ID de evento inválido");
    }

    return await this.eventRepository.findById(id);
  }

  // ✅ OBTENER TODOS LOS EVENTOS
  async getAllEvents(filters?: EventFilters): Promise<Event[]> {
    return await this.eventRepository.findAll(filters);
  }

  // ✅ OBTENER EVENTOS PAGINADOS
  async getEventsPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: EventFilters
  ): Promise<{
    events: Event[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Límite máximo de seguridad

    return await this.eventRepository.findPaginated(page, limit, filters);
  }

  // ✅ OBTENER EVENTOS DISPONIBLES PARA INSCRIPCIÓN
  async getAvailableEvents(filters?: EventFilters): Promise<Event[]> {
    const baseFilters = {
      ...filters,
      estado: "ACTIVO",
    };

    return await this.eventRepository.findAvailableEvents(baseFilters);
  }

  // ✅ OBTENER EVENTOS DE UN USUARIO
  async getUserEvents(
    cedUsuario: string,
    filters?: EventFilters
  ): Promise<Event[]> {
    if (!cedUsuario?.trim()) {
      throw new Error("Cédula de usuario requerida");
    }

    const userExists = await this.userRepository.existsByCedula(cedUsuario);
    if (!userExists) {
      throw new Error("El usuario no existe");
    }

    return await this.eventRepository.findUserEvents(cedUsuario, filters);
  }

  // ✅ OBTENER EVENTOS DE UN ORGANIZADOR
  async getOrganizerEvents(
    cedOrganizador: string,
    filters?: EventFilters
  ): Promise<Event[]> {
    if (!cedOrganizador?.trim()) {
      throw new Error("Cédula de organizador requerida");
    }

    const organizerExists = await this.userRepository.existsByCedula(
      cedOrganizador
    );
    if (!organizerExists) {
      throw new Error("El organizador no existe");
    }

    return await this.eventRepository.findByOrganizer(cedOrganizador, filters);
  }

  // ✅ ACTUALIZAR EVENTO
  async updateEvent(id: string, data: EventUpdateData): Promise<Event> {
    if (!id || !id.trim()) {
      throw new Error("ID de evento inválido");
    }

    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error("Evento no encontrado");
    }

    // Validar que el evento pueda ser actualizado
    if (!existingEvent.canBeUpdated()) {
      throw new Error("El evento no puede ser actualizado en su estado actual");
    }

    // Validar nombre único si se está actualizando
    if (data.nom_eve) {
      const nameExists = await this.eventRepository.existsByName(
        data.nom_eve,
        id
      );
      if (nameExists) {
        throw new Error("Ya existe un evento con ese nombre");
      }
    }

    // Aplicar las actualizaciones usando el método de la entidad
    existingEvent.updateBasicInfo(data);

    // Persistir los cambios
    return await this.eventRepository.update(id, existingEvent);
  }

  // ✅ ELIMINAR EVENTO
  async deleteEvent(id: string): Promise<boolean> {
    if (!id || !id.trim()) {
      throw new Error("ID de evento inválido");
    }

    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error("Evento no encontrado");
    }

    // Validar que el evento pueda ser eliminado
    if (!existingEvent.canBeDeleted()) {
      throw new Error("El evento no puede ser eliminado en su estado actual");
    }

    return await this.eventRepository.delete(id);
  }

  // ✅ CERRAR EVENTO
  async closeEvent(id: string): Promise<Event> {
    if (!id || !id.trim()) {
      throw new Error("ID de evento inválido");
    }

    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error("Evento no encontrado");
    }

    // Validar que el evento pueda ser cerrado
    if (!existingEvent.canBeClosed()) {
      throw new Error("El evento no puede ser cerrado en este momento");
    }

    // Aplicar el cierre usando el método de la entidad
    existingEvent.close();

    // Persistir los cambios
    return await this.eventRepository.update(id, existingEvent);
  }

  // ✅ CANCELAR EVENTO
  async cancelEvent(id: string): Promise<Event> {
    if (!id || !id.trim()) {
      throw new Error("ID de evento inválido");
    }

    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error("Evento no encontrado");
    }

    // Aplicar la cancelación usando el método de la entidad
    existingEvent.cancel();

    // Persistir los cambios
    return await this.eventRepository.update(id, existingEvent);
  }

  // ✅ VALIDAR PERMISOS DE ORGANIZADOR
  async validateOrganizerPermissions(
    eventId: string,
    cedOrganizador: string
  ): Promise<boolean> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error("Evento no encontrado");
    }

    return event.ced_org_eve === cedOrganizador;
  }

  // ✅ OBTENER ESTADÍSTICAS DE EVENTOS
  async getEventStats(filters?: EventFilters): Promise<{
    total: number;
    activos: number;
    cerrados: number;
    cancelados: number;
    proximos: number;
  }> {
    const total = await this.eventRepository.count(filters);

    const activos = await this.eventRepository.count({
      ...filters,
      estado: "ACTIVO",
    });

    const cerrados = await this.eventRepository.count({
      ...filters,
      estado: "CERRADO",
    });

    const cancelados = await this.eventRepository.count({
      ...filters,
      estado: "CANCELADO",
    });

    const fechaActual = new Date();
    const proximos = await this.eventRepository.count({
      ...filters,
      estado: "ACTIVO",
      fechaDesde: fechaActual,
    });

    return {
      total,
      activos,
      cerrados,
      cancelados,
      proximos,
    };
  }

  // ✅ BUSCAR EVENTOS
  async searchEvents(
    searchTerm: string,
    filters?: Omit<EventFilters, "busqueda">
  ): Promise<Event[]> {
    if (!searchTerm?.trim()) {
      return this.getAllEvents(filters);
    }

    return await this.eventRepository.findAll({
      ...filters,
      busqueda: searchTerm.trim(),
    });
  }
}
