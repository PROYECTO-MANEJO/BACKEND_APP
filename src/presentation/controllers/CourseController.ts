export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;  // ID del usuario desde JWT middleware
}

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
      // ✅ SOLID: Usar repository en lugar de Prisma directo
      const courseRepository = this.container.getCourseRepository();

      const cursos = await courseRepository.findAll();

      const cursosFormateados = cursos.map((curso: any) => ({
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
      if (!id) throw new Error('ID is required');
      
      // ✅ SOLID: Usar repository en lugar de Prisma directo
      const courseRepository = this.container.getCourseRepository();

      const curso = await courseRepository.findById(id);

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
      // ✅ SOLID: Usar repository en lugar de Prisma directo
      const courseRepository = this.container.getCourseRepository();
      const prisma = this.container.getPrismaClient(); // Solo para validaciones y transacciones complejas
      
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

  /**
   * PUT /api/courses/:id
   * Update existing course (Admin only)
   */
  public async updateCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID is required');
      
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
        nota_minima_aprobacion
      } = req.body;

      // ✅ SOLID: Usar repository en lugar de Prisma directo
      const courseRepository = this.container.getCourseRepository();

      // Verificar que el curso existe
      const cursoExistente = await courseRepository.findById(id);

      if (!cursoExistente) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Validaciones básicas
      if (fec_ini_cur && fec_fin_cur) {
        const fechaInicio = new Date(fec_ini_cur);
        const fechaFin = new Date(fec_fin_cur);
        
        if (fechaFin <= fechaInicio) {
          res.status(400).json({
            success: false,
            message: 'La fecha de fin debe ser posterior a la fecha de inicio'
          });
          return;
        }
      }

      // Preparar datos de actualización
      const datosActualizacion: any = {};
      
      if (nom_cur !== undefined) datosActualizacion.nom_cur = nom_cur;
      if (des_cur !== undefined) datosActualizacion.des_cur = des_cur;
      if (dur_cur !== undefined) datosActualizacion.dur_cur = parseInt(dur_cur);
      if (fec_ini_cur !== undefined) datosActualizacion.fec_ini_cur = new Date(fec_ini_cur);
      if (fec_fin_cur !== undefined) datosActualizacion.fec_fin_cur = new Date(fec_fin_cur);
      if (id_cat_cur !== undefined) datosActualizacion.id_cat_cur = id_cat_cur;
      if (ced_org_cur !== undefined) datosActualizacion.ced_org_cur = ced_org_cur;
      if (capacidad_max_cur !== undefined) datosActualizacion.capacidad_max_cur = parseInt(capacidad_max_cur);
      if (tipo_audiencia_cur !== undefined) datosActualizacion.tipo_audiencia_cur = tipo_audiencia_cur;
      if (requiere_verificacion_docs !== undefined) datosActualizacion.requiere_verificacion_docs = requiere_verificacion_docs;
      if (es_gratuito !== undefined) {
        datosActualizacion.es_gratuito = es_gratuito;
        datosActualizacion.precio = es_gratuito ? null : (precio ? parseFloat(precio) : null);
      }
      if (porcentaje_asistencia_aprobacion !== undefined) datosActualizacion.porcentaje_asistencia_aprobacion = parseFloat(porcentaje_asistencia_aprobacion);
      if (nota_minima_aprobacion !== undefined) datosActualizacion.nota_minima_aprobacion = parseFloat(nota_minima_aprobacion);

      // Actualizar curso
      const cursoActualizado = await prisma.curso.update({
        where: { id_cur: id },
        data: datosActualizacion,
        include: {
          categoria: {
            select: { nom_cat: true }
          },
          organizador: {
            select: { nom_org1: true, nom_org2: true, ape_org1: true, ape_org2: true }
          }
        }
      });

      res.json({
        success: true,
        message: 'Curso actualizado exitosamente',
        curso: cursoActualizado
      });

    } catch (error: any) {
      console.error('[updateCourse] Error:', error);
      
      if (error.code === 'P2003') {
        res.status(400).json({
          success: false,
          message: 'Error de referencia: Verifique que la categoría y organizador existan'
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/courses/:id
   * Delete course (Admin only) - Soft delete
   */
  public async deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID is required');
      
      // ✅ SOLID: Usar repository en lugar de Prisma directo
      const courseRepository = this.container.getCourseRepository();
      const prismaForComplex = this.container.getPrismaClient(); // Solo para queries complejas con count

      // Verificar que el curso existe
      const curso = await prismaForComplex.curso.findUnique({
        where: { id_cur: id },
        include: {
          _count: {
            select: {
              inscripcionesCurso: true
            }
          }
        }
      });

      if (!curso) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si tiene inscripciones
      if (curso._count.inscripcionesCurso > 0) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar un curso que tiene inscripciones. Considere cancelarlo en su lugar.'
        });
        return;
      }

      // Eliminar curso (hard delete si no tiene inscripciones)
      // ✅ SOLID: Eliminar curso usando repository
      await courseRepository.delete(id);

      res.json({
        success: true,
        message: 'Curso eliminado exitosamente'
      });

    } catch (error: any) {
      console.error('[deleteCourse] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/courses/:id/cerrar
   * Close course and generate certificates (Admin only)
   */
  public async closeCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      // Verificar que el curso existe
      const curso = await prisma.curso.findUnique({
        where: { id_cur: id },
        include: {
          inscripcionesCurso: {
            include: {
              participacionesCurso: true,
              usuario: {
                select: {
                  nom_usu1: true,
                  ape_usu1: true,
                  ced_usu: true
                }
              }
            }
          }
        }
      });

      if (!curso) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      if (curso.estado === 'CERRADO') {
        res.status(400).json({
          success: false,
          message: 'El curso ya está cerrado'
        });
        return;
      }

      // Cerrar el curso
      await prisma.curso.update({
        where: { id_cur: id },
        data: { estado: 'CERRADO' }
      });

      // Calcular estadísticas
      const participacionesAprobadas: any[] = [];
      let totalParticipaciones = 0;
      
      for (const inscripcion of curso.inscripcionesCurso) {
        if (inscripcion.participacionesCurso && inscripcion.participacionesCurso.length > 0) {
          totalParticipaciones += inscripcion.participacionesCurso.length;
          for (const participacion of inscripcion.participacionesCurso) {
            if (participacion.aprobado) {
              participacionesAprobadas.push(participacion);
            }
          }
        }
      }
      
      const participantesAprobados = participacionesAprobadas.length;
      let certificadosGenerados = 0;

      // Generar certificados para participantes aprobados que no los tengan
      for (const participacion of participacionesAprobadas) {
        if (participacion.aprobado && !participacion.certificado_pdf) {
          try {
            // Aquí iría la lógica de generación de certificado PDF
            // Por ahora solo marcamos que se generó
            await prisma.participacionCurso.update({
              where: { id_par_cur: participacion.id_par_cur },
              data: {
                fec_cer_par_cur: new Date(),
                certificado_filename: `certificado_${participacion.id_par_cur}.pdf`
              }
            });
            certificadosGenerados++;
          } catch (error) {
            console.error(`Error generando certificado para participación ${participacion.id_par_cur}:`, error);
          }
        }
      }

      res.json({
        success: true,
        message: 'Curso cerrado exitosamente',
        estadisticas: {
          totalParticipaciones,
          participantesAprobados,
          certificadosGenerados
        }
      });

    } catch (error: any) {
      console.error('[closeCourse] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/cursos (Legacy route for frontend compatibility)
   * Get all courses with admin details
   */
  public async getCursosAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const cursos = await prisma.curso.findMany({
        include: {
          categoria: {
            select: { nom_cat: true }
          },
          organizador: {
            select: { nom_org1: true, nom_org2: true, ape_org1: true, ape_org2: true }
          },
          _count: {
            select: {
              inscripcionesCurso: true
            }
          }
        },
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
        estado: curso.estado,
        id_cat_cur: curso.id_cat_cur,
        ced_org_cur: curso.ced_org_cur,
        categoria_nombre: curso.categoria.nom_cat,
        organizador_nombre: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
        total_inscripciones: curso._count.inscripcionesCurso
      }));

      res.json({
        success: true,
        cursos: cursosFormateados,
        total: cursosFormateados.length
      });

    } catch (error: any) {
      console.error('[getCursosAdmin] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
