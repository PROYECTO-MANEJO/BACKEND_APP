/**
 * Course Service - Application Layer
 *
 * Responsabilidad única: Operaciones de negocio para cursos
 * Aplica SRP separando la lógica de negocio del controlador
 */

import {
  CourseData as CourseEntityData,
  Course,
} from "../../domain/entities/Course";
import { CourseData } from "../../infrastructure/repositories/PrismaCourseRepository";
import { CourseValidator } from "../../domain/validators/CourseValidator";
import { CourseBusinessRules } from "../../domain/services/CourseBusinessRules";
import { DIContainer } from "../../infrastructure/DIContainer";

export interface CreateCourseRequest {
  nom_cur: string;
  des_cur: string;
  dur_cur: number;
  fec_ini_cur: Date;
  fec_fin_cur: Date;
  id_cat_cur: number;
  ced_org_cur: string;
  capacidad_max_cur: number;
  tipo_audiencia_cur: string;
  requiere_verificacion_docs?: boolean;
  es_gratuito: boolean;
  precio?: number | null;
  porcentaje_asistencia_aprobacion: number;
  nota_minima_aprobacion: number;
  carreras?: string[];
}

export interface UpdateCourseRequest {
  nom_cur?: string;
  des_cur?: string;
  capacidad_max_cur?: number;
  precio?: number;
  estado_cur?: string;
}

export class CourseService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * Helper para mapear CourseData del repositorio a CourseEntityData
   */
  private mapToEntityData(courseData: CourseData): CourseEntityData {
    return {
      id: courseData.id,
      nom_cur: courseData.name,
      des_cur: courseData.description,
      dur_cur: courseData.duration,
      fec_ini_cur: courseData.startDate,
      fec_fin_cur: courseData.endDate,
      id_cat_cur: parseInt(courseData.categoryId),
      ced_org_cur: courseData.organizerId,
      capacidad_max_cur: courseData.maxCapacity,
      tipo_audiencia_cur: courseData.audienceType,
      requiere_verificacion_docs: courseData.requiresDocumentVerification,
      es_gratuito: courseData.isFree,
      precio: courseData.price,
      porcentaje_asistencia_aprobacion: courseData.attendanceApprovalPercentage,
      nota_minima_aprobacion: courseData.minimumGradeApproval,
      estado_cur: courseData.status,
    };
  }

  /**
   * Crear un nuevo curso
   */
  async createCourse(courseRequest: CreateCourseRequest): Promise<Course> {
    const courseRepository = this.container.getCourseRepository();

    // ✅ SRP: Delegar validación al CourseValidator
    CourseValidator.validate({
      nom_cur: courseRequest.nom_cur,
      des_cur: courseRequest.des_cur,
      dur_cur: courseRequest.dur_cur,
      fec_ini_cur: courseRequest.fec_ini_cur,
      fec_fin_cur: courseRequest.fec_fin_cur,
      id_cat_cur: courseRequest.id_cat_cur,
      ced_org_cur: courseRequest.ced_org_cur,
      capacidad_max_cur: courseRequest.capacidad_max_cur,
      tipo_audiencia_cur: courseRequest.tipo_audiencia_cur,
      requiere_verificacion_docs:
        courseRequest.requiere_verificacion_docs || false,
      es_gratuito: courseRequest.es_gratuito,
      precio: courseRequest.precio,
      porcentaje_asistencia_aprobacion:
        courseRequest.porcentaje_asistencia_aprobacion,
      nota_minima_aprobacion: courseRequest.nota_minima_aprobacion,
      estado_cur: "ACTIVO",
    });

    // ✅ SRP: Crear el curso - mapear datos del formato DB al formato del dominio
    const savedCourseData = await courseRepository.create({
      name: courseRequest.nom_cur,
      description: courseRequest.des_cur,
      duration: courseRequest.dur_cur,
      startDate: courseRequest.fec_ini_cur,
      endDate: courseRequest.fec_fin_cur,
      categoryId: courseRequest.id_cat_cur,
      organizerId: courseRequest.ced_org_cur,
      maxCapacity: courseRequest.capacidad_max_cur,
      audienceType: courseRequest.tipo_audiencia_cur,
      requiresDocumentVerification:
        courseRequest.requiere_verificacion_docs || false,
      isFree: courseRequest.es_gratuito,
      price: courseRequest.precio,
      attendanceApprovalPercentage:
        courseRequest.porcentaje_asistencia_aprobacion,
      minimumGradeApproval: courseRequest.nota_minima_aprobacion,
      status: "ACTIVO",
      requiresMotivationLetter: false,
      associatedCareers: courseRequest.carreras || [],
    });

    return new Course(this.mapToEntityData(savedCourseData));
  }

  /**
   * Obtener curso por ID
   */
  async getCourseById(id: string): Promise<Course | null> {
    const courseRepository = this.container.getCourseRepository();
    const courseData = await courseRepository.findById(id);

    if (!courseData) return null;

    return new Course(this.mapToEntityData(courseData));
  }

  /**
   * Obtener todos los cursos
   */
  async getAllCourses(): Promise<Course[]> {
    const courseRepository = this.container.getCourseRepository();
    const coursesData = await courseRepository.findAll();

    return coursesData.map(
      (courseData) => new Course(this.mapToEntityData(courseData))
    );
  }

  /**
   * Actualizar curso
   */
  async updateCourse(
    id: string,
    updateData: UpdateCourseRequest
  ): Promise<Course> {
    const courseRepository = this.container.getCourseRepository();

    // Obtener curso existente
    const existingCourseData = await courseRepository.findById(id);
    if (!existingCourseData) {
      throw new Error("Course not found");
    }

    // ✅ SRP: Delegar validaciones al CourseValidator para cada campo
    if (updateData.nom_cur !== undefined) {
      CourseValidator.validateName(updateData.nom_cur);
    }
    if (updateData.des_cur !== undefined) {
      CourseValidator.validateDescription(updateData.des_cur);
    }
    if (updateData.capacidad_max_cur !== undefined) {
      CourseValidator.validateCapacityValue(updateData.capacidad_max_cur);
    }

    // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
    if (!CourseBusinessRules.canBeEdited(existingCourseData)) {
      throw new Error("Course cannot be updated in its current state");
    }

    // Actualizar el curso
    const updatedCourseData = await courseRepository.update(id, updateData);
    if (!updatedCourseData) {
      throw new Error("Failed to update course");
    }

    return new Course(updatedCourseData);
  }

  /**
   * Eliminar curso
   */
  async deleteCourse(id: string): Promise<void> {
    const courseRepository = this.container.getCourseRepository();

    // Verificar que el curso existe
    const existingCourseData = await courseRepository.findById(id);
    if (!existingCourseData) {
      throw new Error("Course not found");
    }

    // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
    if (!CourseBusinessRules.canBeDeleted(existingCourseData)) {
      throw new Error("Course cannot be deleted due to existing registrations");
    }

    await courseRepository.delete(id);
  }

  /**
   * Cerrar curso
   */
  async closeCourse(id: string): Promise<Course> {
    const courseRepository = this.container.getCourseRepository();

    // Obtener curso existente
    const existingCourseData = await courseRepository.findById(id);
    if (!existingCourseData) {
      throw new Error("Course not found");
    }

    // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
    const existingCourse = new Course(existingCourseData);
    CourseBusinessRules.closeCourse(existingCourse);

    // Actualizar estado
    const updatedData = existingCourse.toPlainObject();
    const updatedCourseData = await courseRepository.update(id, {
      estado_cur: updatedData.estado_cur,
    });

    if (!updatedCourseData) {
      throw new Error("Failed to close course");
    }

    return new Course(updatedCourseData);
  }
}
