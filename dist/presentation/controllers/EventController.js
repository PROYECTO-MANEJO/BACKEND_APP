"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const BaseController_1 = require("./BaseController");
/**
 * Controlador para gestión de eventos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con eventos
 */
class EventController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/events
     * Get all events (based on original obtenerEventos function)
     */
    async getEvents(req, res) {
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
    async getEventById(req, res) {
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
        }
        catch (error) {
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
    async createEvent(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            const { nom_eve, des_eve, id_cat_eve, fec_ini_eve, fec_fin_eve, hor_ini_eve, hor_fin_eve, dur_eve, are_eve, ubi_eve, ced_org_eve, capacidad_max_eve, tipo_audiencia_eve, es_gratuito, precio, porcentaje_asistencia_aprobacion, carreras } = req.body;
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
            const convertirHoraADate = (horaString) => {
                if (!horaString)
                    return null;
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
            }
            catch (error) {
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
                        hor_ini_eve: horaInicio,
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
                    const carrerasData = carreras.map((carreraId) => ({
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
        }
        catch (error) {
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
                }
                else if (error.meta?.constraint === 'EVENTOS_CED_ORG_EVE_fkey') {
                    res.status(400).json({
                        success: false,
                        error: 'Organizer ID does not exist'
                    });
                    return;
                }
                else {
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
    /**
     * GET /api/eventos (Legacy route for frontend compatibility)
     * Get all events with admin details
     */
    async getEventosAdmin(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            const eventos = await prisma.evento.findMany({
                include: {
                    categoria: {
                        select: { nom_cat: true }
                    },
                    organizador: {
                        select: { nom_org1: true, nom_org2: true, ape_org1: true, ape_org2: true }
                    },
                    _count: {
                        select: {
                            inscripciones: true
                        }
                    }
                },
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
                requiere_carta_motivacion: evento.requiere_carta_motivacion,
                estado: evento.estado,
                id_cat_eve: evento.id_cat_eve,
                ced_org_eve: evento.ced_org_eve,
                categoria_nombre: evento.categoria.nom_cat,
                organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
                total_inscripciones: evento._count.inscripciones
            }));
            res.json({
                success: true,
                eventos: eventosFormateados,
                total: eventosFormateados.length
            });
        }
        catch (error) {
            console.error('[getEventosAdmin] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/eventos/:id
     * Update existing event (Admin only)
     */
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const prisma = this.container.getPrismaClient();
            // Verificar que el evento existe
            const eventoExistente = await prisma.evento.findUnique({
                where: { id_eve: id }
            });
            if (!eventoExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            // Preparar datos de actualización
            const { nom_eve, des_eve, id_cat_eve, fec_ini_eve, fec_fin_eve, hor_ini_eve, hor_fin_eve, dur_eve, are_eve, ubi_eve, ced_org_eve, capacidad_max_eve, tipo_audiencia_eve, es_gratuito, precio, porcentaje_asistencia_aprobacion, carreras } = req.body;
            // Helper function to convert time string to Date (igual que en createEvent)
            const convertirHoraADate = (horaString) => {
                if (!horaString)
                    return null;
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
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message
                });
                return;
            }
            const datosActualizacion = {
                nom_eve,
                des_eve,
                id_cat_eve,
                fec_ini_eve: new Date(fec_ini_eve),
                fec_fin_eve: fec_fin_eve ? new Date(fec_fin_eve) : null,
                hor_ini_eve: horaInicio,
                hor_fin_eve: horaFin,
                dur_eve: parseInt(dur_eve),
                are_eve,
                ubi_eve,
                ced_org_eve,
                capacidad_max_eve: parseInt(capacidad_max_eve),
                tipo_audiencia_eve,
                es_gratuito: Boolean(es_gratuito),
                precio: es_gratuito ? null : (precio ? parseFloat(precio) : null),
                porcentaje_asistencia_aprobacion: parseInt(porcentaje_asistencia_aprobacion)
            };
            console.log('Datos de actualización recibidos:', req.body);
            console.log('Carreras recibidas:', carreras);
            const eventoActualizado = await prisma.evento.update({
                where: { id_eve: id },
                data: datosActualizacion
            });
            // Manejar asociaciones con carreras
            if (carreras && Array.isArray(carreras)) {
                // Eliminar asociaciones existentes
                await prisma.eventoPorCarrera.deleteMany({
                    where: { id_eve_per: id }
                });
                // Crear nuevas asociaciones si hay carreras
                if (carreras.length > 0) {
                    const asociaciones = carreras.map((carreraId) => ({
                        id_eve_per: id, // Asegurar que id es string
                        id_car_per: carreraId
                    }));
                    await prisma.eventoPorCarrera.createMany({
                        data: asociaciones,
                        skipDuplicates: true
                    });
                    console.log(`Asociaciones creadas: ${carreras.length} carreras`);
                }
            }
            // Obtener el evento actualizado con sus carreras
            const eventoConCarreras = await prisma.evento.findUnique({
                where: { id_eve: id },
                include: {
                    eventosPorCarrera: {
                        include: {
                            carrera: {
                                select: {
                                    id_car: true,
                                    nom_car: true
                                }
                            }
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Evento actualizado exitosamente',
                evento: {
                    ...eventoActualizado,
                    carreras: eventoConCarreras?.eventosPorCarrera?.map(epc => ({
                        id: epc.carrera.id_car,
                        nombre: epc.carrera.nom_car
                    })) || []
                }
            });
        }
        catch (error) {
            console.error('[updateEvent] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * DELETE /api/eventos/:id
     * Delete event (Admin only)
     */
    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const prisma = this.container.getPrismaClient();
            // Verificar que el evento existe
            const evento = await prisma.evento.findUnique({
                where: { id_eve: id },
                include: {
                    _count: {
                        select: {
                            inscripciones: true
                        }
                    }
                }
            });
            if (!evento) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            // Verificar si tiene inscripciones
            if (evento._count.inscripciones > 0) {
                res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar un evento que tiene inscripciones'
                });
                return;
            }
            await prisma.evento.delete({
                where: { id_eve: id }
            });
            res.json({
                success: true,
                message: 'Evento eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('[deleteEvent] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/eventos/:id/cerrar
     * Close event (Admin only)
     */
    async closeEvent(req, res) {
        try {
            const { id } = req.params;
            const prisma = this.container.getPrismaClient();
            // Verificar que el evento existe
            const evento = await prisma.evento.findUnique({
                where: { id_eve: id }
            });
            if (!evento) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            if (evento.estado === 'CERRADO') {
                res.status(400).json({
                    success: false,
                    message: 'El evento ya está cerrado'
                });
                return;
            }
            // Cerrar el evento
            await prisma.evento.update({
                where: { id_eve: id },
                data: { estado: 'CERRADO' }
            });
            res.json({
                success: true,
                message: 'Evento cerrado exitosamente'
            });
        }
        catch (error) {
            console.error('[closeEvent] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=EventController.js.map