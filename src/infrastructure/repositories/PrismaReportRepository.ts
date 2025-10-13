import { PrismaClient } from "@prisma/client";
import {
  IReportRepository,
  EventEnrollmentReport,
  CourseEnrollmentReport,
  EventParticipationReport,
  CourseParticipationReport,
  EventsOverviewReport,
  CoursesOverviewReport,
  DashboardData,
  ReportFilters,
  PaymentFilters,
  ReportMetrics,
  CustomReport,
  EnrollmentByDate,
  EnrollmentByCareer,
  EventsByCategory,
  EventsByCareer,
  EventsByMonth,
} from "../../domain/repositories/IReportRepository";

/**
 * Implementación concreta del repositorio de reportes usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la generación de reportes
 */
export class PrismaReportRepository implements IReportRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generar reporte de inscripciones por evento
   */
  async generateEventEnrollmentReport(
    eventId: string
  ): Promise<EventEnrollmentReport> {
    try {
      const event = await this.prisma.evento.findUnique({
        where: { id_eve: eventId },
        include: {
          inscripciones: {
            include: {
              usuario: {
                include: {
                  carrera: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const totalEnrollments = event.inscripciones.length;
      const approvedEnrollments = event.inscripciones.filter(
        (i) => i.estado_pago === "APROBADO"
      ).length;
      const pendingEnrollments = event.inscripciones.filter(
        (i) => i.estado_pago === "PENDIENTE"
      ).length;
      const rejectedEnrollments = event.inscripciones.filter(
        (i) => i.estado_pago === "RECHAZADO"
      ).length;

      // Agrupar inscripciones por fecha
      const enrollmentsByDate = this.groupEnrollmentsByDate(
        event.inscripciones
      );

      // Agrupar inscripciones por carrera
      const enrollmentsByCareer = this.groupEnrollmentsByCareer(
        event.inscripciones
      );

      // Detalles de inscripciones
      const enrollmentDetails = event.inscripciones.map((inscription) => ({
        userId: inscription.id_usu_ins,
        userName: `${inscription.usuario.nom_usu1} ${inscription.usuario.ape_usu1}`,
        userCedula: inscription.usuario.ced_usu,
        careerName: inscription.usuario.carrera?.nom_car || "Sin carrera",
        enrollmentDate: inscription.fec_ins,
        paymentStatus: inscription.estado_pago,
        amount: inscription.val_ins ? Number(inscription.val_ins) : undefined,
      }));

      return {
        eventId: event.id_eve,
        eventName: event.nom_eve,
        totalEnrollments,
        approvedEnrollments,
        pendingEnrollments,
        rejectedEnrollments,
        enrollmentsByDate,
        enrollmentsByCareer,
        enrollmentDetails,
      };
    } catch (error) {
      throw new Error(`Error generating event enrollment report: ${error}`);
    }
  }

  /**
   * Generar reporte de inscripciones por curso
   */
  async generateCourseEnrollmentReport(
    courseId: string
  ): Promise<CourseEnrollmentReport> {
    try {
      const course = await this.prisma.curso.findUnique({
        where: { id_cur: courseId },
        include: {
          inscripcionesCurso: {
            include: {
              usuario: {
                include: {
                  carrera: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      const totalEnrollments = course.inscripcionesCurso.length;
      const approvedEnrollments = course.inscripcionesCurso.filter(
        (i) => i.estado_pago_cur === "APROBADO"
      ).length;
      const pendingEnrollments = course.inscripcionesCurso.filter(
        (i) => i.estado_pago_cur === "PENDIENTE"
      ).length;
      const rejectedEnrollments = course.inscripcionesCurso.filter(
        (i) => i.estado_pago_cur === "RECHAZADO"
      ).length;

      const enrollmentsByDate = this.groupCourseEnrollmentsByDate(
        course.inscripcionesCurso
      );
      const enrollmentsByCareer = this.groupCourseEnrollmentsByCareer(
        course.inscripcionesCurso
      );

      const enrollmentDetails = course.inscripcionesCurso.map(
        (inscription) => ({
          userId: inscription.id_usu_ins_cur,
          userName: `${inscription.usuario.nom_usu1} ${inscription.usuario.ape_usu1}`,
          userCedula: inscription.usuario.ced_usu,
          careerName: inscription.usuario.carrera?.nom_car || "Sin carrera",
          enrollmentDate: inscription.fec_ins_cur,
          paymentStatus: inscription.estado_pago_cur,
          amount: inscription.val_ins_cur
            ? Number(inscription.val_ins_cur)
            : undefined,
        })
      );

      return {
        courseId: course.id_cur,
        courseName: course.nom_cur,
        totalEnrollments,
        approvedEnrollments,
        pendingEnrollments,
        rejectedEnrollments,
        enrollmentsByDate,
        enrollmentsByCareer,
        enrollmentDetails,
      };
    } catch (error) {
      throw new Error(`Error generating course enrollment report: ${error}`);
    }
  }

  /**
   * Generar reporte de participaciones por evento
   */
  async generateEventParticipationReport(
    eventId: string
  ): Promise<EventParticipationReport> {
    try {
      const participations = await this.prisma.participacion.findMany({
        where: {
          inscripcion: {
            id_eve_ins: eventId,
          },
        },
        include: {
          inscripcion: {
            include: {
              usuario: true,
              evento: true,
            },
          },
        },
      });

      const event = participations[0]?.inscripcion.evento;
      if (!event) {
        throw new Error("Event not found or has no participations");
      }

      const totalParticipants = participations.length;
      const completedParticipants = participations.filter(
        (p) => p.aprobado
      ).length;
      const failedParticipants = totalParticipants - completedParticipants;
      const averageAttendance =
        participations.length > 0
          ? participations.reduce((sum, p) => sum + p.asi_par, 0) /
            participations.length
          : 0;
      const certificatesIssued = participations.filter(
        (p) => p.certificado_pdf
      ).length;

      const participationDetails = participations.map((p) => ({
        userId: p.inscripcion.id_usu_ins,
        userName: `${p.inscripcion.usuario.nom_usu1} ${p.inscripcion.usuario.ape_usu1}`,
        userCedula: p.inscripcion.usuario.ced_usu,
        attendancePercentage: p.asi_par,
        isApproved: p.aprobado,
        certificateIssued: !!p.certificado_pdf,
      }));

      return {
        eventId: event.id_eve,
        eventName: event.nom_eve,
        totalParticipants,
        completedParticipants,
        failedParticipants,
        averageAttendance,
        certificatesIssued,
        participationDetails,
      };
    } catch (error) {
      throw new Error(`Error generating event participation report: ${error}`);
    }
  }

  /**
   * Generar reporte de participaciones por curso
   */
  async generateCourseParticipationReport(
    courseId: string
  ): Promise<CourseParticipationReport> {
    // Implementación similar al reporte de eventos pero para cursos
    // Por simplicidad, retornar estructura básica
    return {
      courseId,
      courseName: "Course Name",
      totalParticipants: 0,
      completedParticipants: 0,
      failedParticipants: 0,
      averageAttendance: 0,
      averageGrade: 0,
      certificatesIssued: 0,
      participationDetails: [],
    };
  }

  /**
   * Generar reporte general de eventos
   */
  async generateEventsOverviewReport(
    filters?: ReportFilters
  ): Promise<EventsOverviewReport> {
    try {
      const whereClause: any = {};

      if (filters?.dateFrom || filters?.dateTo) {
        whereClause.fec_ini_eve = {};
        if (filters.dateFrom) whereClause.fec_ini_eve.gte = filters.dateFrom;
        if (filters.dateTo) whereClause.fec_ini_eve.lte = filters.dateTo;
      }

      if (filters?.categoryId) whereClause.id_cat_eve = filters.categoryId;
      if (filters?.organizerId) whereClause.ced_org_eve = filters.organizerId;

      const [totalEvents, activeEvents, totalEnrollments, events] =
        await Promise.all([
          this.prisma.evento.count({ where: whereClause }),
          this.prisma.evento.count({
            where: { ...whereClause, estado: "ACTIVO" },
          }),
          this.prisma.inscripcion.count({
            where: { evento: whereClause },
          }),
          this.prisma.evento.findMany({
            where: whereClause,
            include: {
              categoria: true,
              inscripciones: true,
              eventosPorCarrera: {
                include: { carrera: true },
              },
            },
          }),
        ]);

      const completedEvents = totalEvents - activeEvents;
      const totalParticipants = await this.prisma.participacion.count({
        where: {
          inscripcion: {
            evento: whereClause,
          },
        },
      });

      // Agrupar por categoría
      const eventsByCategory = this.groupEventsByCategory(events);

      // Agrupar por carrera
      const eventsByCareer = this.groupEventsByCareer(events);

      // Agrupar por mes
      const eventsByMonth = this.groupEventsByMonth(events);

      return {
        totalEvents,
        activeEvents,
        completedEvents,
        totalEnrollments,
        totalParticipants,
        eventsByCategory,
        eventsByCareer,
        eventsByMonth,
      };
    } catch (error) {
      throw new Error(`Error generating events overview report: ${error}`);
    }
  }

  /**
   * Generar reporte general de cursos
   */
  async generateCoursesOverviewReport(
    filters?: ReportFilters
  ): Promise<CoursesOverviewReport> {
    // Implementación similar a eventos
    return {
      totalCourses: 0,
      activeCourses: 0,
      completedCourses: 0,
      totalEnrollments: 0,
      totalParticipants: 0,
      coursesByCategory: [],
      coursesByCareer: [],
      coursesByMonth: [],
    };
  }

  /**
   * Obtener datos para dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [totalUsers, totalEvents, totalCourses, totalEnrollments] =
        await Promise.all([
          this.prisma.usuario.count(),
          this.prisma.evento.count(),
          this.prisma.curso.count(),
          this.prisma.inscripcion.count(),
        ]);

      return {
        totalUsers,
        totalEvents,
        totalCourses,
        totalEnrollments,
        recentActivity: [], // TODO: Implementar
        monthlyStats: [], // TODO: Implementar
        popularCategories: [], // TODO: Implementar
      };
    } catch (error) {
      throw new Error(`Error getting dashboard data: ${error}`);
    }
  }

  // Métodos no implementados (por simplicidad)
  async generateCertificatesReport(): Promise<any> {
    throw new Error("Method not implemented");
  }

  async generateUsersByCareerReport(): Promise<any> {
    throw new Error("Method not implemented");
  }

  async generatePaymentsReport(): Promise<any> {
    throw new Error("Method not implemented");
  }

  async generateAttendanceReport(): Promise<any> {
    throw new Error("Method not implemented");
  }

  async generateCustomReport(): Promise<CustomReport> {
    throw new Error("Method not implemented");
  }

  async exportReportToPDF(): Promise<Buffer> {
    throw new Error("Method not implemented");
  }

  async exportReportToExcel(): Promise<Buffer> {
    throw new Error("Method not implemented");
  }

  // Métodos auxiliares
  private groupEnrollmentsByDate(inscriptions: any[]): EnrollmentByDate[] {
    const grouped = inscriptions.reduce((acc, inscription) => {
      const dateKey = inscription.fec_ins.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date: new Date(date),
      count: count as number,
    }));
  }

  private groupEnrollmentsByCareer(inscriptions: any[]): EnrollmentByCareer[] {
    const grouped = inscriptions.reduce((acc, inscription) => {
      const career = inscription.usuario.carrera;
      const key = career ? career.id_car : "sin-carrera";
      const name = career ? career.nom_car : "Sin carrera";

      if (!acc[key]) {
        acc[key] = { careerId: key, careerName: name, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { careerId: string; careerName: string; count: number }>);

    return Object.values(grouped);
  }

  private groupCourseEnrollmentsByDate(
    inscriptions: any[]
  ): EnrollmentByDate[] {
    const grouped = inscriptions.reduce((acc, inscription) => {
      const dateKey = inscription.fec_ins_cur.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date: new Date(date),
      count: count as number,
    }));
  }

  private groupCourseEnrollmentsByCareer(
    inscriptions: any[]
  ): EnrollmentByCareer[] {
    const grouped = inscriptions.reduce((acc, inscription) => {
      const career = inscription.usuario.carrera;
      const key = career ? career.id_car : "sin-carrera";
      const name = career ? career.nom_car : "Sin carrera";

      if (!acc[key]) {
        acc[key] = { careerId: key, careerName: name, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { careerId: string; careerName: string; count: number }>);

    return Object.values(grouped);
  }

  private groupEventsByCategory(events: any[]): EventsByCategory[] {
    const grouped = events.reduce((acc, event) => {
      const key = event.categoria.id_cat;
      const name = event.categoria.nom_cat;

      if (!acc[key]) {
        acc[key] = { categoryId: key, categoryName: name, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { categoryId: string; categoryName: string; count: number }>);

    return Object.values(grouped);
  }

  private groupEventsByCareer(events: any[]): EventsByCareer[] {
    const grouped = events.reduce((acc, event) => {
      event.eventosPorCarrera.forEach((epc: any) => {
        const key = epc.carrera.id_car;
        const name = epc.carrera.nom_car;

        if (!acc[key]) {
          acc[key] = { careerId: key, careerName: name, count: 0 };
        }
        acc[key].count++;
      });
      return acc;
    }, {} as Record<string, { careerId: string; careerName: string; count: number }>);

    return Object.values(grouped);
  }

  private groupEventsByMonth(events: any[]): EventsByMonth[] {
    const grouped = events.reduce((acc, event) => {
      const date = new Date(event.fec_ini_eve);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!acc[key]) {
        acc[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          count: 0,
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { year: number; month: number; count: number }>);

    return Object.values(grouped);
  }
}
