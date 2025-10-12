import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

/**
 * Controlador para gestión de cursos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con cursos
 */
export class CourseController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/courses
   * Get all courses (based on original obtenerCursos function)
   */
  public async getCourses(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const prisma = this.container.getPrismaClient();

      const cursos = await prisma.curso.findMany({
        orderBy: { fec_ini_cur: 'desc' }
      });

      const cursosFormateados = cursos.map(curso => ({
        id_cur: curso.id_cur,
        nom_cur: curso.nom_cur,
        des_cur: curso.des_cur,
        dur_cur: curso.dur_cur,
        fec_ini_cur: curso.fec_ini_cur,
        fec_fin_cur: curso.fec_fin_cur,
        capacidad_max_cur: curso.capacidad_max_cur,
        precio: curso.precio,
        es_gratuito: curso.es_gratuito,
        tipo_audiencia_cur: curso.tipo_audiencia_cur,
        requiere_verificacion_docs: curso.requiere_verificacion_docs,
        porcentaje_asistencia_aprobacion: curso.porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion: curso.nota_minima_aprobacion,
        estado: curso.estado
      }));

      return {
        success: true,
        cursos: cursosFormateados,
        total: cursosFormateados.length
      };
    });
  }

  /**
   * GET /api/courses/:id
   * Get course by ID (based on original obtenerCursoPorId function)
   */
  public async getCourseById(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      const curso = await prisma.curso.findUnique({
        where: { id_cur: id }
      });

      if (!curso) {
        return {
          success: false,
          message: 'Course not found',
          curso: null
        };
      }

      const cursoFormateado = {
        id_cur: curso.id_cur,
        nom_cur: curso.nom_cur,
        des_cur: curso.des_cur,
        dur_cur: curso.dur_cur,
        fec_ini_cur: curso.fec_ini_cur,
        fec_fin_cur: curso.fec_fin_cur,
        capacidad_max_cur: curso.capacidad_max_cur,
        precio: curso.precio,
        es_gratuito: curso.es_gratuito,
        tipo_audiencia_cur: curso.tipo_audiencia_cur,
        requiere_verificacion_docs: curso.requiere_verificacion_docs,
        porcentaje_asistencia_aprobacion: curso.porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion: curso.nota_minima_aprobacion,
        estado: curso.estado
      };

      return {
        success: true,
        curso: cursoFormateado
      };
    });
  }

  /**
   * POST /api/courses
   * Create new course (based on original crearCurso function)
   */
  public async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();
      
      const {
        nom_cur,
        des_cur,
        dur_cur,
        fec_ini_cur,
        fec_fin_cur,
        id_cat_cur,
        ced_org_cur,
        capacidad_max_cur,
        tipo_audiencia_cur,
        requiere_verificacion_docs,
        es_gratuito,
        precio,
        porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion,
        carreras // Array opcional de IDs de carreras
      } = req.body;

      // Basic validations
      if (!nom_cur || !des_cur || !dur_cur || !fec_ini_cur || !fec_fin_cur || 
          !id_cat_cur || !ced_org_cur || !capacidad_max_cur || 
          porcentaje_asistencia_aprobacion == null || 
          nota_minima_aprobacion == null) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: nom_cur, des_cur, dur_cur, fec_ini_cur, fec_fin_cur, id_cat_cur, ced_org_cur, capacidad_max_cur, porcentaje_asistencia_aprobacion, nota_minima_aprobacion'
        });
        return;
      }

      // Validate approval fields
      const porcentajeAsistencia = parseFloat(porcentaje_asistencia_aprobacion);
      const notaMinima = parseFloat(nota_minima_aprobacion);
      
      if (isNaN(porcentajeAsistencia) || porcentajeAsistencia < 0 || porcentajeAsistencia > 100) {
        res.status(400).json({
          success: false,
          error: 'Attendance percentage must be a number between 0 and 100'
        });
        return;
      }
      
      if (isNaN(notaMinima) || notaMinima < 0 || notaMinima > 10) {
        res.status(400).json({
          success: false,
          error: 'Minimum grade must be a number between 0 and 10'
        });
        return;
      }

      // Validate dates
      const fechaInicio = new Date(fec_ini_cur);
      const fechaFin = new Date(fec_fin_cur);
      
      if (isNaN(fechaInicio.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid start date. Use YYYY-MM-DD format'
        });
        return;
      }
      
      if (isNaN(fechaFin.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid end date. Use YYYY-MM-DD format'
        });
        return;
      }
      
      if (fechaFin <= fechaInicio) {
        res.status(400).json({
          success: false,
          error: 'End date must be after start date'
        });
        return;
      }

      // Validate numbers
      const duracion = parseInt(dur_cur);
      const capacidad = parseInt(capacidad_max_cur);
      
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

      // Create course in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the course
        const nuevoCurso = await tx.curso.create({
          data: {
            nom_cur,
            des_cur,
            dur_cur: duracion,
            fec_ini_cur: fechaInicio,
            fec_fin_cur: fechaFin,
            id_cat_cur,
            ced_org_cur,
            capacidad_max_cur: capacidad,
            tipo_audiencia_cur: tipo_audiencia_cur || 'PUBLICO_GENERAL',
            requiere_verificacion_docs: requiere_verificacion_docs || false,
            es_gratuito: es_gratuito || false,
            precio: es_gratuito ? 0 : (precio || 0),
            porcentaje_asistencia_aprobacion: porcentajeAsistencia,
            nota_minima_aprobacion: notaMinima,
            estado: 'ACTIVO'
          }
        });

        // If careers are provided, create the relationships
        if (carreras && Array.isArray(carreras) && carreras.length > 0) {
          const carrerasData = carreras.map((carreraId: string) => ({
            id_cur_per: nuevoCurso.id_cur,
            id_car_per: carreraId
          }));

          await tx.cursoPorCarrera.createMany({
            data: carrerasData
          });
        }

        return nuevoCurso;
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        curso: {
          id_cur: result.id_cur,
          nom_cur: result.nom_cur,
          des_cur: result.des_cur,
          fec_ini_cur: result.fec_ini_cur,
          fec_fin_cur: result.fec_fin_cur,
          capacidad_max_cur: result.capacidad_max_cur,
          estado: result.estado
        }
      });

    } catch (error: any) {
      console.error('Error creating course:', error);
      
      // Handle Prisma specific errors
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        if (error.meta?.constraint === 'CURSOS_ID_CAT_CUR_fkey') {
          res.status(400).json({
            success: false,
            error: 'Category ID does not exist'
          });
          return;
        } else if (error.meta?.constraint === 'CURSOS_CED_ORG_CUR_fkey') {
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
