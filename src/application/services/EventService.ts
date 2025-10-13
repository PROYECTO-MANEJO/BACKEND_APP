/**
 * Event Service - Application Layer
 *
 * Responsabilidad única: Operaciones de negocio para eventos
 * Aplica SRP separando la lógica de negocio del controlador
 */

import { EventData, Event } from "../../domain/entities/Event";
import { EventValidator } from "../../domain/validators/EventValidator";
import { EventBusinessRules } from "../../domain/services/EventBusinessRules";
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

export class EventService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * Crear un nuevo evento
   */
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    // ✅ SRP: Solo lógica de negocio, delegamos validaciones
    const eventDataForValidation: EventData = {
      nom_eve: eventData.nom_eve,
      des_eve: eventData.des_eve,
      id_cat_eve: eventData.id_cat_eve,
      fec_ini_eve: eventData.fec_ini_eve,
      fec_fin_eve: eventData.fec_fin_eve,
      hor_ini_eve: eventData.hor_ini_eve,
      hor_fin_eve: eventData.hor_fin_eve,
      dur_eve: eventData.dur_eve,
      are_eve: eventData.are_eve,
      ubi_eve: eventData.ubi_eve,
      ced_org_eve: eventData.ced_org_eve,
      capacidad_max_eve: eventData.capacidad_max_eve,
      tipo_audiencia_eve: eventData.tipo_audiencia_eve,
      es_gratuito: eventData.es_gratuito,
      precio: eventData.precio,
      porcentaje_asistencia_aprobacion:
        eventData.porcentaje_asistencia_aprobacion,
    };

    // Validar datos usando EventValidator
    EventValidator.validate(eventDataForValidation);

    // Crear entidad limpia
    const event = new Event(eventDataForValidation);

    // Usar repository para persistir
    const eventRepository = this.container.getEventRepository();

    // Transacción de negocio
    const prisma = this.container.getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      // Crear evento
      const savedEvent = await eventRepository.create(event.toPlainObject());

      // Asociar carreras si existen
      if (eventData.carreras && eventData.carreras.length > 0) {
        const carrerasData = eventData.carreras.map((carreraId) => ({
          id_eve_per: savedEvent.id!,
          id_car_per: carreraId,
        }));

        await tx.eventoPorCarrera.createMany({
          data: carrerasData,
        });
      }

      return savedEvent;
    });

    return new Event(result);
  }

  /**
   * Obtener evento por ID
   */
  async getEventById(id: string): Promise<Event | null> {
    const eventRepository = this.container.getEventRepository();
    const eventData = await eventRepository.findById(id);

    return eventData ? new Event(eventData) : null;
  }

  /**
   * Obtener todos los eventos
   */
  async getAllEvents(): Promise<Event[]> {
    const eventRepository = this.container.getEventRepository();
    const eventsData = await eventRepository.findAll();

    return eventsData.map((data) => new Event(data));
  }

  /**
   * Actualizar evento
   */
  async updateEvent(
    id: string,
    updateData: UpdateEventRequest
  ): Promise<Event> {
    const eventRepository = this.container.getEventRepository();

    // Obtener evento existente
    const existingEventData = await eventRepository.findById(id);
    if (!existingEventData) {
      throw new Error("Event not found");
    }

    const existingEvent = new Event(existingEventData);

    // Verificar reglas de negocio
    if (!EventBusinessRules.canBeUpdated(existingEvent.toPlainObject())) {
      throw new Error("Event cannot be updated");
    }

    // Validar campos individuales si se proporcionan
    if (updateData.nom_eve !== undefined) {
      EventValidator.validateName(updateData.nom_eve);
    }
    if (updateData.des_eve !== undefined) {
      EventValidator.validateDescription(updateData.des_eve);
    }
    if (updateData.capacidad_max_eve !== undefined) {
      EventValidator.validateCapacityValue(updateData.capacidad_max_eve);
    }
    if (updateData.precio !== undefined) {
      EventValidator.validatePriceValue(
        updateData.precio,
        existingEvent.es_gratuito
      );
    }

    // Actualizar usando método limpio de la entidad
    existingEvent.updateData(updateData);

    // Persistir cambios
    const updatedEventData = await eventRepository.update(
      id,
      existingEvent.toPlainObject()
    );
    if (!updatedEventData) {
      throw new Error("Failed to update event");
    }
    return new Event(updatedEventData);
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(id: string): Promise<void> {
    const eventRepository = this.container.getEventRepository();

    // Obtener evento existente
    const existingEventData = await eventRepository.findById(id);
    if (!existingEventData) {
      throw new Error("Event not found");
    }

    // Verificar reglas de negocio
    if (!EventBusinessRules.canBeDeleted(existingEventData)) {
      throw new Error("Event cannot be deleted");
    }

    await eventRepository.delete(id);
  }

  /**
   * Cerrar evento
   */
  async closeEvent(id: string): Promise<Event> {
    const eventRepository = this.container.getEventRepository();

    // Obtener evento existente
    const existingEventData = await eventRepository.findById(id);
    if (!existingEventData) {
      throw new Error("Event not found");
    }

    const existingEvent = new Event(existingEventData);

    // Aplicar reglas de negocio
    EventBusinessRules.closeEvent(existingEvent);

    // Cambiar estado usando método limpio
    existingEvent.changeStatus("CERRADO");

    // Persistir cambios
    const updatedEventData = await eventRepository.update(
      id,
      existingEvent.toPlainObject()
    );
    if (!updatedEventData) {
      throw new Error("Failed to close event");
    }
    return new Event(updatedEventData);
  }
}
