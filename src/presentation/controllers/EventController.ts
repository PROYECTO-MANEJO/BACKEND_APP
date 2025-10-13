export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string; // ID del usuario desde JWT middleware
}

import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { EventService } from "../../application/services/EventService";
import { EventDTOTransformer, CreateEventDTO } from "../dto/EventDTO";

/**
 * Event Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para eventos
 * - Delega validaciones a EventValidator
 * - Delega lógica de negocio a EventService
 * - Delega transformaciones a EventDTOTransformer
 */
export class EventController extends BaseController {
  private eventService: EventService;

  constructor(container: DIContainer) {
    super();
    this.eventService = new EventService(container);
  }

  /**
   * GET /api/events
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getEvents(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const events = await this.eventService.getAllEvents();

      // ✅ SRP: Delegar transformación al DTOTransformer
      const eventosFormateados = EventDTOTransformer.toResponseDTOList(events);

      return {
        eventos: eventosFormateados,
        total: eventosFormateados.length,
      };
    });
  }

  /**
   * GET /api/events/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getEventById(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const event = await this.eventService.getEventById(id);

      if (!event) {
        throw new Error("Event not found");
      }

      // ✅ SRP: Delegar transformación al DTOTransformer
      const eventoFormateado = EventDTOTransformer.toResponseDTO(event);

      return {
        evento: eventoFormateado,
      };
    });
  }

  /**
   * POST /api/events
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async createEvent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Validar estructura básica del request (responsabilidad del controlador)
      const requiredFields = [
        "nom_eve",
        "des_eve",
        "id_cat_eve",
        "fec_ini_eve",
        "hor_ini_eve",
        "dur_eve",
        "are_eve",
        "ubi_eve",
        "ced_org_eve",
        "capacidad_max_eve",
        "porcentaje_asistencia_aprobacion",
      ];

      for (const field of requiredFields) {
        if (req.body[field] == null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // ✅ SRP: Delegar transformación al DTOTransformer
      const createEventDTO: CreateEventDTO = req.body;

      // ✅ SRP: Validar tipos básicos (responsabilidad del DTOTransformer)
      EventDTOTransformer.validateBasicTypes(createEventDTO);

      // ✅ SRP: Convertir DTO a datos del dominio (responsabilidad del DTOTransformer)
      const eventData = EventDTOTransformer.fromCreateDTO(createEventDTO);

      // ✅ SRP: Delegar lógica de negocio al servicio
      const createdEvent = await this.eventService.createEvent(eventData);

      // ✅ SRP: Delegar transformación de respuesta al DTOTransformer
      const eventoResponse = EventDTOTransformer.toResponseDTO(createdEvent);

      return {
        message: "Event created successfully",
        evento: eventoResponse,
      };
    });
  }

  /**
   * PUT /api/events/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async updateEvent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const updatedEvent = await this.eventService.updateEvent(id, req.body);

      // ✅ SRP: Delegar transformación al DTOTransformer
      const eventoResponse = EventDTOTransformer.toResponseDTO(updatedEvent);

      return {
        message: "Event updated successfully",
        evento: eventoResponse,
      };
    });
  }

  /**
   * DELETE /api/events/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async deleteEvent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      await this.eventService.deleteEvent(id);

      return {
        message: "Event deleted successfully",
      };
    });
  }

  /**
   * POST /api/events/:id/close
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async closeEvent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const closedEvent = await this.eventService.closeEvent(id);

      // ✅ SRP: Delegar transformación al DTOTransformer
      const eventoResponse = EventDTOTransformer.toResponseDTO(closedEvent);

      return {
        message: "Event closed successfully",
        evento: eventoResponse,
      };
    });
  }

  /**
   * GET /api/eventos (Admin)
   * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
   */
  public async getEventosAdmin(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const events = await this.eventService.getAllEvents();

      // ✅ SRP: Delegar transformación al DTOTransformer
      const eventosFormateados = EventDTOTransformer.toResponseDTOList(events);

      return {
        eventos: eventosFormateados,
        total: eventosFormateados.length,
      };
    });
  }

  /**
   * GET /api/events/available
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getAvailableEvents(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // TODO: Implementar lógica para obtener eventos disponibles
      // Por ahora, devolver todos los eventos activos
      const events = await this.eventService.getAllEvents();

      // Filtrar eventos activos y futuros
      const now = new Date();
      const availableEvents = events.filter((event) => {
        const eventData = event.toPlainObject();
        return (
          eventData.estado_eve === "ACTIVO" &&
          new Date(eventData.fec_ini_eve) >= now
        );
      });

      const eventosFormateados =
        EventDTOTransformer.toResponseDTOList(availableEvents);

      return {
        eventos: eventosFormateados,
        total: eventosFormateados.length,
      };
    });
  }

  /**
   * GET /api/events/my-events
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getMyEvents(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      // TODO: Implementar lógica para obtener eventos del usuario
      // Por ahora, devolver array vacío hasta implementar inscripciones
      return {
        eventos: [],
        total: 0,
      };
    });
  }
}
