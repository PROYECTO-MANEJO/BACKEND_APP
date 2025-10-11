/**
 * CourseRepository - Infrastructure Layer
 *
 * Implementación concreta del repositorio de cursos usando Prisma.
 */

import { PrismaClient } from "@prisma/client";
import { Course, CourseData } from "../../domain/entities/Course";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";

export class CourseRepository implements ICourseRepository {
  constructor(private prisma: PrismaClient) {}

  // ✅ CRUD BÁSICO
  async create(course: Course): Promise<Course> {
    const courseData = course.toPlainObject();

    const created = await this.prisma.curso.create({
      data: {
        nom_cur: courseData.nom_cur,
        des_cur: courseData.des_cur,
        dur_cur: courseData.dur_cur,
        fec_ini_cur: courseData.fec_ini_cur,
        fec_fin_cur: courseData.fec_fin_cur,
        id_cat_cur: courseData.id_cat_cur.toString(), // Convertir a UUID string
        ced_org_cur: courseData.ced_org_cur,
        capacidad_max_cur: courseData.capacidad_max_cur,
        tipo_audiencia_cur: courseData.tipo_audiencia_cur as any,
        requiere_verificacion_docs: courseData.requiere_verificacion_docs,
        es_gratuito: courseData.es_gratuito,
        precio: courseData.precio
          ? parseFloat(courseData.precio.toString())
          : null,
        porcentaje_asistencia_aprobacion:
          courseData.porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion: parseFloat(
          courseData.nota_minima_aprobacion.toString()
        ),
        estado: courseData.estado_cur || "ACTIVO",
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<Course | null> {
    const curso = await this.prisma.curso.findUnique({
      where: { id_cur: id },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
        inscripcionesCurso: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return curso ? this.toDomainEntity(curso) : null;
  }

  async findAll(): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async update(id: string, course: Course): Promise<Course> {
    const courseData = course.toPlainObject();

    const updated = await this.prisma.curso.update({
      where: { id_cur: id },
      data: {
        nom_cur: courseData.nom_cur,
        des_cur: courseData.des_cur,
        dur_cur: courseData.dur_cur,
        fec_ini_cur: courseData.fec_ini_cur,
        fec_fin_cur: courseData.fec_fin_cur,
        id_cat_cur: courseData.id_cat_cur.toString(),
        capacidad_max_cur: courseData.capacidad_max_cur,
        requiere_verificacion_docs: courseData.requiere_verificacion_docs,
        es_gratuito: courseData.es_gratuito,
        precio: courseData.precio
          ? parseFloat(courseData.precio.toString())
          : null,
        porcentaje_asistencia_aprobacion:
          courseData.porcentaje_asistencia_aprobacion,
        nota_minima_aprobacion: parseFloat(
          courseData.nota_minima_aprobacion.toString()
        ),
        estado: courseData.estado_cur,
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Eliminar relaciones primero
      await tx.cursoPorCarrera.deleteMany({
        where: { id_cur_per: id },
      });

      // Eliminar inscripciones
      await tx.inscripcionCurso.deleteMany({
        where: { id_cur_ins: id },
      });

      // Eliminar el curso
      await tx.curso.delete({
        where: { id_cur: id },
      });
    });
  }

  // ✅ CONSULTAS POR FILTROS BÁSICOS
  async findByOrganizer(organizerId: string): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: { ced_org_cur: organizerId },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findByCategory(categoryId: number): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: { id_cat_cur: categoryId.toString() },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findByStatus(status: string): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: { estado: status },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: {
        AND: [
          { fec_ini_cur: { gte: startDate } },
          { fec_fin_cur: { lte: endDate } },
        ],
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  // ✅ CONSULTAS ESPECIALIZADAS
  async findAvailableCourses(userId?: string): Promise<Course[]> {
    const now = new Date();

    let whereClause: any = {
      AND: [
        { estado: "ACTIVO" },
        { fec_ini_cur: { gt: now } }, // Solo cursos futuros
      ],
    };

    // Si hay usuario, filtrar por eligibilidad
    if (userId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: { id_car_per: true },
      });

      if (usuario?.id_car_per) {
        whereClause.OR = [
          { tipo_audiencia_cur: "PUBLICO_GENERAL" },
          { tipo_audiencia_cur: "TODAS_CARRERAS" },
          {
            AND: [
              { tipo_audiencia_cur: "CARRERA_ESPECIFICA" },
              {
                cursosPorCarrera: {
                  some: { id_car_per: usuario.id_car_per },
                },
              },
            ],
          },
        ];
      } else {
        // Usuario sin carrera solo puede ver cursos públicos
        whereClause.OR = [{ tipo_audiencia_cur: "PUBLICO_GENERAL" }];
      }
    } else {
      // Sin usuario solo cursos públicos
      whereClause.tipo_audiencia_cur = "PUBLICO_GENERAL";
    }

    const cursos = await this.prisma.curso.findMany({
      where: whereClause,
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findUserCourses(userId: string): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: {
        inscripcionesCurso: {
          some: {
            id_usu_ins_cur: userId,
            estado_pago_cur: "APROBADO",
          },
        },
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findActiveByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: {
        AND: [
          { estado: "ACTIVO" },
          { fec_ini_cur: { gte: startDate } },
          { fec_fin_cur: { lte: endDate } },
        ],
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findUpcomingCourses(): Promise<Course[]> {
    const now = new Date();

    const cursos = await this.prisma.curso.findMany({
      where: {
        AND: [{ estado: "ACTIVO" }, { fec_ini_cur: { gt: now } }],
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findInProgressCourses(): Promise<Course[]> {
    const now = new Date();

    const cursos = await this.prisma.curso.findMany({
      where: {
        AND: [
          { estado: "ACTIVO" },
          { fec_ini_cur: { lte: now } },
          { fec_fin_cur: { gte: now } },
        ],
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async findFinishedCourses(): Promise<Course[]> {
    const cursos = await this.prisma.curso.findMany({
      where: {
        OR: [{ estado: "CERRADO" }, { estado: "FINALIZADO" }],
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_fin_cur: "desc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  // ✅ CONSULTAS DE INSCRIPCIONES Y CAPACIDAD
  async getEnrolledCount(courseId: string): Promise<number> {
    const count = await this.prisma.inscripcionCurso.count({
      where: {
        id_cur_ins: courseId,
        estado_pago_cur: "APROBADO",
      },
    });

    return count;
  }

  async isUserEnrolled(courseId: string, userId: string): Promise<boolean> {
    const inscription = await this.prisma.inscripcionCurso.findFirst({
      where: {
        id_cur_ins: courseId,
        id_usu_ins_cur: userId,
        estado_pago_cur: "APROBADO",
      },
    });

    return !!inscription;
  }

  async hasAvailableCapacity(courseId: string): Promise<boolean> {
    const course = await this.prisma.curso.findUnique({
      where: { id_cur: courseId },
      select: { capacidad_max_cur: true },
    });

    if (!course) return false;

    const enrolledCount = await this.getEnrolledCount(courseId);
    return enrolledCount < course.capacidad_max_cur;
  }

  async getEnrolledUsers(courseId: string): Promise<any[]> {
    const inscripciones = await this.prisma.inscripcionCurso.findMany({
      where: {
        id_cur_ins: courseId,
        estado_pago_cur: "APROBADO",
      },
      include: {
        usuario: true,
      },
    });

    return inscripciones.map((ins) => ins.usuario);
  }

  // ✅ GESTIÓN DE CARRERAS
  async getCourseCareerIds(courseId: string): Promise<number[]> {
    const cursoCarreras = await this.prisma.cursoPorCarrera.findMany({
      where: { id_cur_per: courseId },
      include: { carrera: true },
    });

    // Nota: Aquí asumo que la carrera tiene un campo numérico id_carrera
    // Si no existe, necesitaríamos ajustar el esquema
    return cursoCarreras.map((cc) => parseInt(cc.carrera.id_car) || 0);
  }

  async updateCourseCareerIds(
    courseId: string,
    careerIds: number[]
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Eliminar carreras existentes
      await tx.cursoPorCarrera.deleteMany({
        where: { id_cur_per: courseId },
      });

      // Agregar nuevas carreras
      if (careerIds.length > 0) {
        await tx.cursoPorCarrera.createMany({
          data: careerIds.map((careerId) => ({
            id_cur_per: courseId,
            id_car_per: careerId.toString(), // Convertir a UUID string
          })),
        });
      }
    });
  }

  async findByCareerIds(careerIds: number[]): Promise<Course[]> {
    const careerUuids = careerIds.map((id) => id.toString());

    const cursos = await this.prisma.curso.findMany({
      where: {
        cursosPorCarrera: {
          some: {
            id_car_per: { in: careerUuids },
          },
        },
      },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  // ✅ VALIDACIONES DE NEGOCIO
  async findConflictingCourses(
    organizerId: string,
    startDate: Date,
    endDate: Date,
    excludeCourseId?: string
  ): Promise<Course[]> {
    const whereClause: any = {
      AND: [
        { ced_org_cur: organizerId },
        { estado: "ACTIVO" },
        {
          OR: [
            // Curso que inicia durante el rango
            {
              AND: [
                { fec_ini_cur: { gte: startDate } },
                { fec_ini_cur: { lte: endDate } },
              ],
            },
            // Curso que termina durante el rango
            {
              AND: [
                { fec_fin_cur: { gte: startDate } },
                { fec_fin_cur: { lte: endDate } },
              ],
            },
            // Curso que abarca todo el rango
            {
              AND: [
                { fec_ini_cur: { lte: startDate } },
                { fec_fin_cur: { gte: endDate } },
              ],
            },
          ],
        },
      ],
    };

    if (excludeCourseId) {
      whereClause.AND.push({ id_cur: { not: excludeCourseId } });
    }

    const cursos = await this.prisma.curso.findMany({
      where: whereClause,
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  async existsById(id: string): Promise<boolean> {
    const curso = await this.prisma.curso.findUnique({
      where: { id_cur: id },
      select: { id_cur: true },
    });

    return !!curso;
  }

  async countByOrganizer(organizerId: string): Promise<number> {
    return await this.prisma.curso.count({
      where: { ced_org_cur: organizerId },
    });
  }

  async countByCategory(categoryId: number): Promise<number> {
    return await this.prisma.curso.count({
      where: { id_cat_cur: categoryId.toString() },
    });
  }

  // ✅ CONSULTAS CON PAGINACIÓN
  async findAllPaginated(
    page: number,
    limit: number
  ): Promise<{
    courses: Course[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip: offset,
        take: limit,
        include: {
          categoria: true,
          organizador: true,
          cursosPorCarrera: {
            include: {
              carrera: true,
            },
          },
        },
        orderBy: { fec_ini_cur: "asc" },
      }),
      this.prisma.curso.count(),
    ]);

    return {
      courses: cursos.map((curso) => this.toDomainEntity(curso)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findByOrganizerPaginated(
    organizerId: string,
    page: number,
    limit: number
  ): Promise<{
    courses: Course[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        where: { ced_org_cur: organizerId },
        skip: offset,
        take: limit,
        include: {
          categoria: true,
          organizador: true,
          cursosPorCarrera: {
            include: {
              carrera: true,
            },
          },
        },
        orderBy: { fec_ini_cur: "asc" },
      }),
      this.prisma.curso.count({
        where: { ced_org_cur: organizerId },
      }),
    ]);

    return {
      courses: cursos.map((curso) => this.toDomainEntity(curso)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // ✅ CONSULTAS CON FILTROS AVANZADOS
  async findWithFilters(filters: {
    organizerId?: string;
    categoryId?: number;
    status?: string;
    audienceType?: string;
    isFree?: boolean;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
  }): Promise<Course[]> {
    const whereClause: any = {};

    if (filters.organizerId) {
      whereClause.ced_org_cur = filters.organizerId;
    }

    if (filters.categoryId) {
      whereClause.id_cat_cur = filters.categoryId.toString();
    }

    if (filters.status) {
      whereClause.estado = filters.status;
    }

    if (filters.audienceType) {
      whereClause.tipo_audiencia_cur = filters.audienceType;
    }

    if (filters.isFree !== undefined) {
      whereClause.es_gratuito = filters.isFree;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.AND = [];
      if (filters.startDate) {
        whereClause.AND.push({ fec_ini_cur: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        whereClause.AND.push({ fec_fin_cur: { lte: filters.endDate } });
      }
    }

    if (filters.searchTerm) {
      whereClause.OR = [
        { nom_cur: { contains: filters.searchTerm, mode: "insensitive" } },
        { des_cur: { contains: filters.searchTerm, mode: "insensitive" } },
      ];
    }

    const cursos = await this.prisma.curso.findMany({
      where: whereClause,
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { fec_ini_cur: "asc" },
    });

    return cursos.map((curso) => this.toDomainEntity(curso));
  }

  // ✅ ESTADÍSTICAS Y REPORTES
  async getStatistics(): Promise<{
    totalCourses: number;
    activeCourses: number;
    finishedCourses: number;
    totalEnrollments: number;
    averageCapacityUsage: number;
  }> {
    const [
      totalCourses,
      activeCourses,
      finishedCourses,
      totalEnrollments,
      capacityData,
    ] = await Promise.all([
      this.prisma.curso.count(),
      this.prisma.curso.count({ where: { estado: "ACTIVO" } }),
      this.prisma.curso.count({
        where: {
          OR: [{ estado: "CERRADO" }, { estado: "FINALIZADO" }],
        },
      }),
      this.prisma.inscripcionCurso.count({
        where: { estado_pago_cur: "APROBADO" },
      }),
      this.prisma.curso.findMany({
        select: {
          id_cur: true,
          capacidad_max_cur: true,
          _count: {
            select: {
              inscripcionesCurso: {
                where: { estado_pago_cur: "APROBADO" },
              },
            },
          },
        },
      }),
    ]);

    let totalCapacity = 0;
    let totalUsed = 0;

    capacityData.forEach((course) => {
      totalCapacity += course.capacidad_max_cur;
      totalUsed += course._count.inscripcionesCurso;
    });

    const averageCapacityUsage =
      totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

    return {
      totalCourses,
      activeCourses,
      finishedCourses,
      totalEnrollments,
      averageCapacityUsage: Math.round(averageCapacityUsage * 100) / 100,
    };
  }

  async getCourseStatistics(courseId: string): Promise<{
    enrolledCount: number;
    completedCount?: number;
    averageAttendance?: number;
    averageGrade?: number;
  }> {
    const enrolledCount = await this.getEnrolledCount(courseId);

    // Placeholder para estadísticas avanzadas que se implementarán en futuras fases
    return {
      enrolledCount,
      completedCount: 0, // TODO: Implementar cuando se gestionen certificados
      averageAttendance: 0, // TODO: Implementar cuando se gestione asistencia
      averageGrade: 0, // TODO: Implementar cuando se gestionen calificaciones
    };
  }

  // ✅ MÉTODO AUXILIAR PARA CONVERTIR A ENTIDAD DE DOMINIO
  private toDomainEntity(prismaEntity: any): Course {
    const courseData: CourseData = {
      id: prismaEntity.id_cur,
      nom_cur: prismaEntity.nom_cur,
      des_cur: prismaEntity.des_cur,
      dur_cur: prismaEntity.dur_cur,
      fec_ini_cur: prismaEntity.fec_ini_cur,
      fec_fin_cur: prismaEntity.fec_fin_cur,
      id_cat_cur: parseInt(prismaEntity.id_cat_cur) || 0, // Convertir UUID a número para compatibilidad
      ced_org_cur: prismaEntity.ced_org_cur,
      capacidad_max_cur: prismaEntity.capacidad_max_cur,
      tipo_audiencia_cur: prismaEntity.tipo_audiencia_cur,
      requiere_verificacion_docs: prismaEntity.requiere_verificacion_docs,
      es_gratuito: prismaEntity.es_gratuito,
      precio: prismaEntity.precio
        ? parseFloat(prismaEntity.precio.toString())
        : null,
      porcentaje_asistencia_aprobacion:
        prismaEntity.porcentaje_asistencia_aprobacion,
      nota_minima_aprobacion: parseFloat(
        prismaEntity.nota_minima_aprobacion.toString()
      ),
      estado_cur: prismaEntity.estado,
      fecha_creacion: prismaEntity.fec_creacion,
      fecha_actualizacion: prismaEntity.fec_actualizacion,
      categoria: prismaEntity.categoria,
      organizador: prismaEntity.organizador,
      inscripciones: prismaEntity.inscripcionesCurso,
      carreras: prismaEntity.cursosPorCarrera?.map(
        (cc: any) => parseInt(cc.carrera.id_car) || 0
      ),
    };

    return new Course(courseData);
  }
}
