import { PrismaClient } from "@prisma/client";
import { ChangeRequest } from "@domain/entities/ChangeRequest";
import {
  ChangeRequestRepository,
  ChangeRequestFilters,
} from "@domain/repositories/IChangeRequestRepository";

export class PrismaChangeRequestRepository implements ChangeRequestRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(changeRequest: ChangeRequest): Promise<ChangeRequest> {
    const data = this.mapToDatabase(changeRequest);

    const created = await this.prisma.solicitudCambio.create({
      data,
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
          },
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
      },
    });

    return this.mapFromDatabase(created);
  }

  public async findById(id: string): Promise<ChangeRequest | null> {
    const solicitud = await this.prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
          },
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
      },
    });

    if (!solicitud) {
      return null;
    }

    return this.mapFromDatabase(solicitud);
  }

  public async findAll(filters?: ChangeRequestFilters): Promise<{
    items: ChangeRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where = this.buildWhereClause(filters);
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 50);
    const skip = (page - 1) * limit;

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudCambio.findMany({
        where,
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true,
            },
          },
          adminResponsable: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
            },
          },
          desarrolladorAsignado: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
            },
          },
        },
        orderBy: {
          fec_creacion_sol: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.solicitudCambio.count({ where }),
    ]);

    const items = solicitudes.map((s) => this.mapFromDatabase(s));
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      totalPages,
    };
  }

  public async findByRequesterId(
    requesterId: string,
    filters?: ChangeRequestFilters
  ): Promise<{
    items: ChangeRequest[];
    total: number;
  }> {
    const where = {
      id_usuario_sol: requesterId,
      ...this.buildWhereClause(filters),
    };

    const limit = Math.min(filters?.limit || 10, 50);
    const skip = filters?.page ? (filters.page - 1) * limit : 0;

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudCambio.findMany({
        where,
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true,
            },
          },
        },
        orderBy: {
          fec_creacion_sol: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.solicitudCambio.count({ where }),
    ]);

    const items = solicitudes.map((s) => this.mapFromDatabase(s));

    return {
      items,
      total,
    };
  }

  public async findByDeveloperId(
    developerId: string,
    filters?: ChangeRequestFilters
  ): Promise<{
    items: ChangeRequest[];
    total: number;
  }> {
    const where = {
      id_desarrollador_asignado: developerId,
      ...this.buildWhereClause(filters),
    };

    const limit = Math.min(filters?.limit || 10, 50);
    const skip = filters?.page ? (filters.page - 1) * limit : 0;

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudCambio.findMany({
        where,
        include: {
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true,
            },
          },
          desarrolladorAsignado: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
            },
          },
        },
        orderBy: {
          fec_creacion_sol: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.solicitudCambio.count({ where }),
    ]);

    const items = solicitudes.map((s) => this.mapFromDatabase(s));

    return {
      items,
      total,
    };
  }

  public async update(changeRequest: ChangeRequest): Promise<ChangeRequest> {
    const data = this.mapToDatabase(changeRequest);

    const updated = await this.prisma.solicitudCambio.update({
      where: { id_sol: changeRequest.id! },
      data: {
        ...data,
        fec_ultima_actualizacion: new Date(),
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
          },
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
      },
    });

    return this.mapFromDatabase(updated);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.solicitudCambio.delete({
      where: { id_sol: id },
    });
  }

  public async getStatistics(): Promise<{
    totalRequests: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    averageResolutionTime: number;
    pendingRequests: number;
    completedThisMonth: number;
  }> {
    const [
      total,
      statusStats,
      priorityStats,
      typeStats,
      completedThisMonth,
      pendingCount,
      completedRequests,
    ] = await Promise.all([
      this.prisma.solicitudCambio.count(),

      this.prisma.solicitudCambio.groupBy({
        by: ["estado_sol"],
        _count: true,
      }),

      this.prisma.solicitudCambio.groupBy({
        by: ["prioridad_sol"],
        _count: true,
      }),

      this.prisma.solicitudCambio.groupBy({
        by: ["tipo_cambio_sol"],
        _count: true,
      }),

      this.prisma.solicitudCambio.count({
        where: {
          estado_sol: "COMPLETADA",
          fec_respuesta_sol: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      this.prisma.solicitudCambio.count({
        where: {
          estado_sol: {
            in: [
              "PENDIENTE",
              "EN_REVISION",
              "APROBADA",
              "EN_DESARROLLO",
              "EN_TESTING",
            ],
          },
        },
      }),

      this.prisma.solicitudCambio.findMany({
        where: {
          estado_sol: "COMPLETADA",
          fec_creacion_sol: { not: undefined },
          fec_respuesta_sol: { not: undefined },
        },
        select: {
          fec_creacion_sol: true,
          fec_respuesta_sol: true,
        },
      }),
    ]);

    // Calcular tiempo promedio de resolución
    let averageResolutionTime = 0;
    if (completedRequests.length > 0) {
      const totalResolutionTime = completedRequests.reduce((sum, req) => {
        if (req.fec_respuesta_sol && req.fec_creacion_sol) {
          const diff =
            req.fec_respuesta_sol.getTime() - req.fec_creacion_sol.getTime();
          return sum + diff / (1000 * 60 * 60 * 24); // días
        }
        return sum;
      }, 0);
      averageResolutionTime = totalResolutionTime / completedRequests.length;
    }

    // Convertir arrays de agrupación a objetos
    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.estado_sol] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = priorityStats.reduce((acc, item) => {
      acc[item.prioridad_sol] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const byType = typeStats.reduce((acc, item) => {
      acc[item.tipo_cambio_sol] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: total,
      byStatus,
      byPriority,
      byType,
      averageResolutionTime,
      pendingRequests: pendingCount,
      completedThisMonth,
    };
  }

  public async findPendingTechnicalPlanApproval(): Promise<ChangeRequest[]> {
    const solicitudes = await this.prisma.solicitudCambio.findMany({
      where: {
        planes_enviados_revision: true,
        planes_aprobados: null, // Pendiente de aprobación
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
          },
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
          },
        },
      },
    });

    return solicitudes.map((s) => this.mapFromDatabase(s));
  }

  public async canUserEdit(
    requestId: string,
    userId: string
  ): Promise<boolean> {
    const solicitud = await this.prisma.solicitudCambio.findUnique({
      where: { id_sol: requestId },
      select: {
        id_usuario_sol: true,
        estado_sol: true,
      },
    });

    if (!solicitud) {
      return false;
    }

    // Solo puede editar el solicitante y solo en estado BORRADOR
    return (
      solicitud.id_usuario_sol === userId && solicitud.estado_sol === "BORRADOR"
    );
  }

  public async getAvailableDevelopers(): Promise<
    Array<{
      id: string;
      name: string;
      currentWorkload: number;
      skills: string[];
    }>
  > {
    // Obtener usuarios con rol de desarrollador
    const developers = await this.prisma.usuario.findMany({
      where: {
        cuentas: {
          some: {
            rol_cue: "DESARROLLADOR",
          },
        },
      },
      select: {
        id_usu: true,
        nom_usu1: true,
        nom_usu2: true,
        ape_usu1: true,
        ape_usu2: true,
        _count: {
          select: {
            solicitudesAsignadas: {
              where: {
                estado_sol: {
                  in: ["EN_DESARROLLO", "EN_TESTING"],
                },
              },
            },
          },
        },
      },
    });

    return developers.map((dev) => ({
      id: dev.id_usu,
      name: `${dev.nom_usu1} ${dev.nom_usu2 || ""} ${dev.ape_usu1} ${
        dev.ape_usu2 || ""
      }`.trim(),
      currentWorkload: dev._count.solicitudesAsignadas,
      skills: [], // Las habilidades se pueden agregar más adelante como campo separado
    }));
  }

  public async validateStatusTransition(
    currentStatus: string,
    newStatus: string,
    userRole: string
  ): Promise<boolean> {
    // Esta validación la maneja el dominio service, aquí solo retornamos true
    // En una implementación más compleja podríamos tener reglas en BD
    return true;
  }

  public async getChangeHistory(requestId: string): Promise<
    Array<{
      timestamp: Date;
      action: string;
      user: string;
      details: string;
      oldValue?: string;
      newValue?: string;
    }>
  > {
    // Por ahora retornamos array vacío
    // En el futuro se puede implementar una tabla de audit log
    return [];
  }

  private buildWhereClause(filters?: ChangeRequestFilters): any {
    const where: any = {};

    if (filters?.status) {
      where.estado_sol = filters.status;
    }

    if (filters?.changeType) {
      where.tipo_cambio_sol = filters.changeType;
    }

    if (filters?.priority) {
      where.prioridad_sol = filters.priority;
    }

    if (filters?.urgency) {
      where.urgencia_sol = filters.urgency;
    }

    if (filters?.developerId) {
      where.id_desarrollador_asignado = filters.developerId;
    }

    if (filters?.assignedTo) {
      where.id_desarrollador_asignado = filters.assignedTo;
    }

    if (filters?.createdAfter || filters?.createdBefore) {
      where.fec_creacion_sol = {};
      if (filters.createdAfter) {
        where.fec_creacion_sol.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.fec_creacion_sol.lte = filters.createdBefore;
      }
    }

    return where;
  }

  private mapFromDatabase(dbRecord: any): ChangeRequest {
    const requesterName = dbRecord.usuario
      ? `${dbRecord.usuario.nom_usu1} ${dbRecord.usuario.nom_usu2 || ""} ${
          dbRecord.usuario.ape_usu1
        } ${dbRecord.usuario.ape_usu2 || ""}`.trim()
      : undefined;

    const developerName = dbRecord.desarrolladorAsignado
      ? `${dbRecord.desarrolladorAsignado.nom_usu1} ${
          dbRecord.desarrolladorAsignado.nom_usu2 || ""
        } ${dbRecord.desarrolladorAsignado.ape_usu1} ${
          dbRecord.desarrolladorAsignado.ape_usu2 || ""
        }`.trim()
      : undefined;

    const reviewerName = dbRecord.adminResponsable
      ? `${dbRecord.adminResponsable.nom_usu1} ${
          dbRecord.adminResponsable.nom_usu2 || ""
        } ${dbRecord.adminResponsable.ape_usu1} ${
          dbRecord.adminResponsable.ape_usu2 || ""
        }`.trim()
      : undefined;

    return ChangeRequest.fromData({
      id: dbRecord.id_sol,
      title: dbRecord.titulo_sol,
      description: dbRecord.descripcion_sol,
      justification: dbRecord.justificacion_sol,
      changeType: dbRecord.tipo_cambio_sol as any,
      priority: dbRecord.prioridad_sol as any,
      urgency: dbRecord.urgencia_sol as any,
      status: dbRecord.estado_sol as any,
      requesterId: dbRecord.id_usuario_sol,
      requesterName,
      reviewerId: dbRecord.id_admin_resp_sol || undefined,
      reviewerName,
      developerId: dbRecord.id_desarrollador_asignado || undefined,
      developerName,
      requestDate: dbRecord.fec_creacion_sol,
      reviewDate: dbRecord.fec_respuesta_sol || undefined,
      startDate: dbRecord.fecha_real_inicio_sol || undefined,
      targetDate: dbRecord.fecha_planificada_fin_sol || undefined,
      completionDate: dbRecord.fecha_real_fin_sol || undefined,
      technicalDetails: dbRecord.plan_implementacion_sol || undefined,
      comments: dbRecord.comentarios_admin_sol || undefined,
      reviewNotes: dbRecord.comentarios_tecnicos_sol || undefined,
      implementationNotes: dbRecord.comentarios_internos_sol || undefined,
      estimatedHours: dbRecord.tiempo_estimado_horas_sol || undefined,
      actualHours: dbRecord.tiempo_real_horas_sol || undefined,
      businessImpact: dbRecord.impacto_negocio_sol || undefined,
      technicalRisk: dbRecord.impacto_tecnico_sol || undefined,
      version: 1,
      createdAt: dbRecord.fec_creacion_sol,
      updatedAt: dbRecord.fec_ultima_actualizacion,
    });
  }

  private mapToDatabase(changeRequest: ChangeRequest): any {
    const data = changeRequest.toPlainObject();

    return {
      id_sol: changeRequest.id,
      titulo_sol: changeRequest.title,
      descripcion_sol: changeRequest.description,
      justificacion_sol: data.justification || "",
      tipo_cambio_sol: changeRequest.changeType,
      prioridad_sol: changeRequest.priority,
      urgencia_sol: changeRequest.urgency,
      estado_sol: changeRequest.status,
      id_usuario_sol: changeRequest.requesterId,
      id_admin_resp_sol: changeRequest.reviewerId || null,
      id_desarrollador_asignado: changeRequest.developerId || null,
      fecha_planificada_inicio_sol: data.startDate || null,
      fecha_planificada_fin_sol: changeRequest.targetDate || null,
      fecha_real_inicio_sol: data.startDate || null,
      fecha_real_fin_sol: changeRequest.completionDate || null,
      tiempo_estimado_horas_sol: changeRequest.estimatedHours || null,
      tiempo_real_horas_sol: changeRequest.actualHours || null,
      comentarios_admin_sol: data.comments || null,
      comentarios_tecnicos_sol: data.reviewNotes || null,
      comentarios_internos_sol: data.implementationNotes || null,
      plan_implementacion_sol: data.technicalDetails || null,
      impacto_negocio_sol: data.businessImpact || null,
      impacto_tecnico_sol: data.technicalRisk || null,
    };
  }
}
