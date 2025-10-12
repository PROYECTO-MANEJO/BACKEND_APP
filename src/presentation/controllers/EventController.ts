import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

/**
 * Controlador para gestión de eventos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con eventos
 */
export class EventController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/events
   * Get all events (based on original obtenerEventos function)
   */
  public async getEvents(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const prisma = this.container.getPrismaClient();

      const eventos = await prisma.evento.findMany({
        orderBy: { fec_ini_eve: 'desc' }
      });

      const eventosFormateados = eventos.map(evento => ({
        id_eve: evento.id_eve,
        nom_eve: evento.nom_eve,
        des_eve: evento.des_eve,
        fec_ini_eve: evento.fec_ini_eve,
        fec_fin_eve: evento.fec_fin_eve,
        hor_ini_eve: evento.hor_ini_eve,
        hor_fin_eve: evento.hor_fin_eve,
        dur_eve: evento.dur_eve,
        are_eve: evento.are_eve,
        ubi_eve: evento.ubi_eve,
        capacidad_max_eve: evento.capacidad_max_eve,
        precio: evento.precio,
        es_gratuito: evento.es_gratuito,
        tipo_audiencia_eve: evento.tipo_audiencia_eve,
        porcentaje_asistencia_aprobacion: evento.porcentaje_asistencia_aprobacion,
        estado: evento.estado
      }));

      return {
        success: true,
        eventos: eventosFormateados,
        total: eventosFormateados.length
      };
    });
  }

  /**
   * GET /api/events/:id
   * Get event by ID (based on original obtenerEventoPorId function)
   */
  public async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      const evento = await prisma.evento.findUnique({
        where: { id_eve: id }
      });

      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
          evento: null
        });
        return;
      }

      const eventoFormateado = {
        id_eve: evento.id_eve,
        nom_eve: evento.nom_eve,
        des_eve: evento.des_eve,
        fec_ini_eve: evento.fec_ini_eve,
        fec_fin_eve: evento.fec_fin_eve,
        hor_ini_eve: evento.hor_ini_eve,
        hor_fin_eve: evento.hor_fin_eve,
        dur_eve: evento.dur_eve,
        are_eve: evento.are_eve,
        ubi_eve: evento.ubi_eve,
        capacidad_max_eve: evento.capacidad_max_eve,
        precio: evento.precio,
        es_gratuito: evento.es_gratuito,
        tipo_audiencia_eve: evento.tipo_audiencia_eve,
        porcentaje_asistencia_aprobacion: evento.porcentaje_asistencia_aprobacion,
        estado: evento.estado
      };

      res.status(200).json({
        success: true,
        evento: eventoFormateado
      });
    } catch (error) {
      console.error('Error in getEventById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/events
   * Create new event (based on original crearEvento function)
   */
  public async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();
      
      const {
        nom_eve,
        des_eve,
        id_cat_eve,
        fec_ini_eve,
        fec_fin_eve,
        hor_ini_eve,
        hor_fin_eve,
        dur_eve,
        are_eve,
        ubi_eve,
        ced_org_eve,
        capacidad_max_eve,
        tipo_audiencia_eve,
        es_gratuito,
        precio,
        porcentaje_asistencia_aprobacion,
        carreras
      } = req.body;

      // Basic validations
      if (!nom_eve || !des_eve || !id_cat_eve || !fec_ini_eve || !hor_ini_eve || 
          !dur_eve || !are_eve || !ubi_eve || !ced_org_eve || !capacidad_max_eve ||
          porcentaje_asistencia_aprobacion == null) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: nom_eve, des_eve, id_cat_eve, fec_ini_eve, hor_ini_eve, dur_eve, are_eve, ubi_eve, ced_org_eve, capacidad_max_eve, porcentaje_asistencia_aprobacion'
        });
        return;
      }

      // Validate attendance percentage
      const porcentajeAsistencia = parseFloat(porcentaje_asistencia_aprobacion);
      
      if (isNaN(porcentajeAsistencia) || porcentajeAsistencia < 0 || porcentajeAsistencia > 100) {
        res.status(400).json({
          success: false,
          error: 'Attendance percentage must be a number between 0 and 100'
        });
        return;
      }

      // Validate dates
      const fechaInicio = new Date(fec_ini_eve);
      const fechaFin = fec_fin_eve ? new Date(fec_fin_eve) : null;
      
      if (isNaN(fechaInicio.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid start date. Use YYYY-MM-DD format'
        });
        return;
      }
      
      if (fechaFin && isNaN(fechaFin.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid end date. Use YYYY-MM-DD format'
        });
        return;
      }

      // Validate numbers
      const duracion = parseInt(dur_eve);
      const capacidad = parseInt(capacidad_max_eve);
      
      if (isNaN(duracion) || duracion <= 0) {
        res.status(400).json({
          success: false,
          error: 'Duration must be a positive number'
        });
        return;
      }
      
      if (isNaN(capacidad) || capacidad <= 0) {
        res.status(400).json({
          success: false,
          error: 'Maximum capacity must be a positive number'
        });
        return;
      }

      // Helper function to convert time string to Date
      const convertirHoraADate = (horaString: string) => {
        if (!horaString) return null;
        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
        
        if (!timeRegex.test(horaString)) {
          throw new Error('Invalid time format. Use HH:MM:SS or HH:MM');
        }
        
        const parts = horaString.split(':').map(Number);
        const horas = parts[0] ?? 0;
        const minutos = parts[1] ?? 0;
        const segundos = parts[2] ?? 0;
        
        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
          throw new Error('Invalid time format');
        }
        
        const fecha = new Date('1970-01-01T00:00:00.000Z');
        fecha.setUTCHours(horas, minutos, segundos, 0);
        return fecha;
      };

      // Convert time strings to Date objects
      let horaInicio, horaFin;
      try {
        horaInicio = convertirHoraADate(hor_ini_eve);
        horaFin = hor_fin_eve ? convertirHoraADate(hor_fin_eve) : null;
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      // Create event in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the event
        const nuevoEvento = await tx.evento.create({
          data: {
            nom_eve,
            des_eve,
            id_cat_eve,
            fec_ini_eve: fechaInicio,
            fec_fin_eve: fechaFin || undefined,
            hor_ini_eve: horaInicio!,
            hor_fin_eve: horaFin || undefined,
            dur_eve: duracion,
            are_eve,
            ubi_eve,
            ced_org_eve,
            capacidad_max_eve: capacidad,
            tipo_audiencia_eve: tipo_audiencia_eve || 'PUBLICO_GENERAL',
            es_gratuito: es_gratuito || false,
            precio: es_gratuito ? 0 : (precio || 0),
            porcentaje_asistencia_aprobacion: porcentajeAsistencia,
            estado: 'ACTIVO'
          }
        });

        // If careers are provided, create the relationships
        if (carreras && Array.isArray(carreras) && carreras.length > 0) {
          const carrerasData = carreras.map((carreraId: string) => ({
            id_eve_per: nuevoEvento.id_eve,
            id_car_per: carreraId
          }));

          await tx.eventoPorCarrera.createMany({
            data: carrerasData
          });
        }

        return nuevoEvento;
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        evento: {
          id_eve: result.id_eve,
          nom_eve: result.nom_eve,
          des_eve: result.des_eve,
          fec_ini_eve: result.fec_ini_eve,
          fec_fin_eve: result.fec_fin_eve,
          capacidad_max_eve: result.capacidad_max_eve,
          estado: result.estado
        }
      });

    } catch (error: any) {
      console.error('Error creating event:', error);
      
      // Handle Prisma specific errors
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        if (error.meta?.constraint === 'EVENTOS_ID_CAT_EVE_fkey') {
          res.status(400).json({
            success: false,
            error: 'Category ID does not exist'
          });
          return;
        } else if (error.meta?.constraint === 'EVENTOS_CED_ORG_EVE_fkey') {
          res.status(400).json({
            success: false,
            error: 'Organizer ID does not exist'
          });
          return;
        } else {
          res.status(400).json({
            success: false,
            error: 'Referenced record does not exist'
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
