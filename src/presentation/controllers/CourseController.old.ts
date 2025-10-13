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
import { CourseService } from "../../application/services/CourseService";
import { CourseDTOTransformer, CreateCourseDTO } from "../dto/CourseDTO";

/**
 * Course Controller - Presentation Layer
 * 
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para cursos
 * - Delega validaciones a CourseValidator
 * - Delega lógica de negocio a CourseService  
 * - Delega transformaciones a CourseDTOTransformer
 */
export class CourseController extends BaseController {
  private courseService: CourseService;

  constructor(container: DIContainer) {
    super();
    this.courseService = new CourseService(container);
  }

  /**
   * GET /api/courses
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getCourses(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const courses = await this.courseService.getAllCourses();

      // ✅ SRP: Delegar transformación al DTOTransformer
      const cursosFormateados = CourseDTOTransformer.toResponseDTOList(courses);

      return {
        cursos: cursosFormateados,
        total: cursosFormateados.length,
      };
    });
  }

  /**
   * GET /api/courses/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getCourseById(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const course = await this.courseService.getCourseById(id);

      if (!course) {
        throw new Error("Course not found");
      }

      // ✅ SRP: Delegar transformación al DTOTransformer
      const cursoFormateado = CourseDTOTransformer.toResponseDTO(course);

      return {
        curso: cursoFormateado,
      };
    });
  }

  /**
   * POST /api/courses
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async createCourse(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Validar estructura básica del request (responsabilidad del controlador)
      const requiredFields = [
        "nom_cur",
        "des_cur", 
        "dur_cur",
        "fec_ini_cur",
        "fec_fin_cur",
        "id_cat_cur",
        "ced_org_cur",
        "capacidad_max_cur",
        "tipo_audiencia_cur",
        "porcentaje_asistencia_aprobacion",
        "nota_minima_aprobacion"
      ];

      for (const field of requiredFields) {
        if (req.body[field] == null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // ✅ SRP: Delegar transformación al DTOTransformer
      const createCourseDTO: CreateCourseDTO = req.body;

      // ✅ SRP: Validar tipos básicos (responsabilidad del DTOTransformer)
      CourseDTOTransformer.validateBasicTypes(createCourseDTO);

      // ✅ SRP: Convertir DTO a datos del dominio (responsabilidad del DTOTransformer)
      const courseData = CourseDTOTransformer.fromCreateDTO(createCourseDTO);

      // ✅ SRP: Delegar lógica de negocio al servicio
      const createdCourse = await this.courseService.createCourse({
        ...courseData,
        carreras: createCourseDTO.carreras_seleccionadas
      });

      // ✅ SRP: Delegar transformación de respuesta al DTOTransformer
      const cursoResponse = CourseDTOTransformer.toResponseDTO(createdCourse);

      return {
        message: "Course created successfully",
        curso: cursoResponse,
      };
    });
  }

  /**
   * PUT /api/courses/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async updateCourse(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const updatedCourse = await this.courseService.updateCourse(id, req.body);

      // ✅ SRP: Delegar transformación al DTOTransformer
      const cursoResponse = CourseDTOTransformer.toResponseDTO(updatedCourse);

      return {
        message: "Course updated successfully",
        curso: cursoResponse,
      };
    });
  }

  /**
   * DELETE /api/courses/:id
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async deleteCourse(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      await this.courseService.deleteCourse(id);

      return {
        message: "Course deleted successfully",
      };
    });
  }

  /**
   * POST /api/courses/:id/close
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async closeCourse(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      // ✅ SRP: Delegar lógica de negocio al servicio
      const closedCourse = await this.courseService.closeCourse(id);

      // ✅ SRP: Delegar transformación al DTOTransformer
      const cursoResponse = CourseDTOTransformer.toResponseDTO(closedCourse);

      return {
        message: "Course closed successfully",
        curso: cursoResponse,
      };
    });
  }

  /**
   * GET /api/cursos (Admin)
   * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
   */
  public async getCursosAdmin(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const courses = await this.courseService.getAllCourses();

      // ✅ SRP: Delegar transformación al DTOTransformer
      const cursosFormateados = CourseDTOTransformer.toResponseDTOList(courses);

      return {
        cursos: cursosFormateados,
        total: cursosFormateados.length,
      };
    });
  }

  /**
   * GET /api/courses/available
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getAvailableCourses(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // TODO: Implementar lógica para obtener cursos disponibles
      // Por ahora, devolver todos los cursos activos
      const courses = await this.courseService.getAllCourses();
      
      // Filtrar cursos activos y futuros
      const now = new Date();
      const availableCourses = courses.filter(course => {
        const courseData = course.toPlainObject();
        return courseData.estado_cur === 'ACTIVO' && 
               new Date(courseData.fec_ini_cur) >= now;
      });

      const cursosFormateados = CourseDTOTransformer.toResponseDTOList(availableCourses);

      return {
        cursos: cursosFormateados,
        total: cursosFormateados.length,
      };
    });
  }

  /**
   * GET /api/courses/my-courses
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getMyCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // TODO: Implementar lógica para obtener cursos del usuario
      // Por ahora, devolver array vacío hasta implementar inscripciones
      return {
        cursos: [],
        total: 0,
      };
    });
  }
}