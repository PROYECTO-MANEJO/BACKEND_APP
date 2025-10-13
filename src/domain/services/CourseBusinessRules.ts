/**
 * Course Business Rules - Domain Layer
 *
 * Responsabilidad única: TODAS las reglas de negocio y operaciones para cursos
 * Aplica SRP separando completamente la lógica de negocio de la entidad
 */

import { CourseData, Course } from "../entities/Course";

export class CourseBusinessRules {
  /**
   * Verificar si un curso puede ser editado
   */
  public static canBeEdited(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);

    return startDate > now;
  }

  /**
   * Verificar si un curso puede ser cancelado
   */
  public static canBeCanceled(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    const hoursUntilStart =
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilStart >= 48 && course.estado_cur !== "CANCELADO"; // 48 horas para cursos
  }

  /**
   * Verificar si un curso está activo para inscripciones
   */
  public static isOpenForRegistration(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);

    return (
      course.estado_cur === "ACTIVO" &&
      startDate > now &&
      !this.isCapacityFull(course)
    );
  }

  /**
   * Verificar si la capacidad está llena
   */
  public static isCapacityFull(course: CourseData): boolean {
    // Simulación - en implementación real consultaría la BD
    const inscripciones = course.inscripciones || [];
    return inscripciones.length >= course.capacidad_max_cur;
  }

  /**
   * Calcular prioridad del curso
   */
  public static calculatePriority(course: CourseData): number {
    let priority = 0;

    // Cursos próximos a iniciar tienen mayor prioridad
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilStart <= 7) priority += 3;
    else if (daysUntilStart <= 30) priority += 2;
    else priority += 1;

    // Cursos con verificación de documentos
    if (course.requiere_verificacion_docs) priority += 1;

    // Cursos pagos
    if (!course.es_gratuito) priority += 1;

    return priority;
  }

  /**
   * Verificar si hay conflicto de horarios
   */
  public static hasScheduleConflict(
    course: CourseData,
    otherCourses: CourseData[]
  ): boolean {
    const courseStart = new Date(course.fec_ini_cur);
    const courseEnd = new Date(course.fec_fin_cur);

    return otherCourses.some((other) => {
      if (other.id === course.id) return false;

      // Verificar conflictos por organizador o ubicación similar
      if (other.ced_org_cur === course.ced_org_cur) {
        const otherStart = new Date(other.fec_ini_cur);
        const otherEnd = new Date(other.fec_fin_cur);

        // Verificar solapamiento de fechas
        return courseStart <= otherEnd && courseEnd >= otherStart;
      }

      return false;
    });
  }

  /**
   * Verificar si un curso puede ser actualizado
   */
  public static canBeUpdated(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    return startDate > now && course.estado_cur === "ACTIVO";
  }

  /**
   * Verificar si un curso puede ser eliminado
   */
  public static canBeDeleted(course: CourseData): boolean {
    return this.canBeUpdated(course); // Mismas reglas que actualización
  }

  /**
   * Verificar si un curso puede ser cerrado
   */
  public static canBeClosed(course: CourseData): boolean {
    const now = new Date();
    const endDate = new Date(course.fec_fin_cur);
    return endDate <= now && course.estado_cur === "ACTIVO";
  }

  /**
   * Verificar si un curso está activo
   */
  public static isActive(course: CourseData): boolean {
    return course.estado_cur === "ACTIVO";
  }

  /**
   * Verificar si un curso es próximo (futuro)
   */
  public static isUpcoming(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    return startDate > now && course.estado_cur === "ACTIVO";
  }

  /**
   * Verificar si un curso está en progreso
   */
  public static isInProgress(course: CourseData): boolean {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    const endDate = new Date(course.fec_fin_cur);

    return startDate <= now && endDate >= now && course.estado_cur === "ACTIVO";
  }

  /**
   * Verificar si un curso está terminado
   */
  public static isFinished(course: CourseData): boolean {
    return (
      course.estado_cur === "CERRADO" || course.estado_cur === "FINALIZADO"
    );
  }

  /**
   * Verificar si requiere verificación de documentos
   */
  public static requiresDocumentVerification(course: CourseData): boolean {
    return course.requiere_verificacion_docs || false;
  }

  /**
   * Verificar si es para carrera específica
   */
  public static isForSpecificCareer(course: CourseData): boolean {
    return course.tipo_audiencia_cur === "CARRERA_ESPECIFICA";
  }

  /**
   * Calcular progreso del curso
   */
  public static calculateProgress(course: CourseData): number {
    const now = new Date();
    const startDate = new Date(course.fec_ini_cur);
    const endDate = new Date(course.fec_fin_cur);

    if (now < startDate) return 0; // No ha comenzado
    if (now > endDate) return 100; // Ha terminado

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  }

  /**
   * Verificar si puede generar certificados
   */
  public static canGenerateCertificates(course: CourseData): boolean {
    return this.isFinished(course) || this.calculateProgress(course) >= 80;
  }

  // ✅ OPERACIONES DE NEGOCIO (que modifican el curso)

  /**
   * Cerrar un curso
   */
  public static closeCourse(course: Course): void {
    if (!this.canBeClosed(course.toPlainObject())) {
      throw new Error("El curso no puede ser cerrado en este momento");
    }
  }

  /**
   * Cancelar un curso
   */
  public static cancelCourse(course: Course): void {
    if (!this.canBeUpdated(course.toPlainObject())) {
      throw new Error("El curso no puede ser cancelado");
    }
  }
}
