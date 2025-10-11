import { PrismaClient } from "@prisma/client";
import { Developer } from "@domain/entities/Developer";
import {
  DeveloperRepository,
  DeveloperFilters,
} from "@domain/repositories/IDeveloperRepository";

export class PrismaDeveloperRepository implements DeveloperRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Developer | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usu: id },
      include: {
        cuentas: {
          where: {
            rol_cue: "DESARROLLADOR",
          },
        },
        solicitudesAsignadas: {
          where: {
            estado_sol: {
              in: ["EN_DESARROLLO", "EN_TESTING"],
            },
          },
          select: {
            id_sol: true,
            titulo_sol: true,
            estado_sol: true,
            prioridad_sol: true,
          },
        },
      },
    });

    if (!usuario || usuario.cuentas.length === 0) {
      return null;
    }

    return this.mapFromDatabase(usuario);
  }

  public async findByUserId(userId: string): Promise<Developer | null> {
    return this.findById(userId);
  }

  public async findByEmail(email: string): Promise<Developer | null> {
    const cuenta = await this.prisma.cuenta.findFirst({
      where: {
        cor_cue: email,
        rol_cue: "DESARROLLADOR",
      },
      include: {
        usuario: {
          include: {
            cuentas: {
              where: {
                rol_cue: "DESARROLLADOR",
              },
            },
            solicitudesAsignadas: {
              where: {
                estado_sol: {
                  in: ["EN_DESARROLLO", "EN_TESTING"],
                },
              },
              select: {
                id_sol: true,
                titulo_sol: true,
                estado_sol: true,
                prioridad_sol: true,
              },
            },
          },
        },
      },
    });

    if (!cuenta || !cuenta.usuario) {
      return null;
    }

    return this.mapFromDatabase(cuenta.usuario);
  }

  public async findAll(filters?: DeveloperFilters): Promise<Developer[]> {
    const whereClause: any = {
      cuentas: {
        some: {
          rol_cue: "DESARROLLADOR",
        },
      },
    };

    const usuarios = await this.prisma.usuario.findMany({
      where: whereClause,
      include: {
        cuentas: {
          where: {
            rol_cue: "DESARROLLADOR",
          },
        },
        solicitudesAsignadas: {
          where: {
            estado_sol: {
              in: ["EN_DESARROLLO", "EN_TESTING"],
            },
          },
          select: {
            id_sol: true,
            titulo_sol: true,
            estado_sol: true,
            prioridad_sol: true,
          },
        },
      },
      orderBy: {
        nom_usu1: "asc",
      },
    });

    let developers = usuarios
      .filter((u) => u.cuentas.length > 0)
      .map((u) => this.mapFromDatabase(u));

    // Aplicar filtros adicionales en memoria
    if (filters?.maxWorkload !== undefined) {
      developers = developers.filter(
        (dev) => dev.getCurrentWorkload() <= filters.maxWorkload!
      );
    }

    if (filters?.available) {
      developers = developers.filter(
        (dev) => dev.getCurrentWorkload() < dev.getMaxWorkload()
      );
    }

    return developers;
  }

  public async findAvailable(): Promise<Developer[]> {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        cuentas: {
          some: {
            rol_cue: "DESARROLLADOR",
          },
        },
      },
      include: {
        cuentas: {
          where: {
            rol_cue: "DESARROLLADOR",
          },
        },
        solicitudesAsignadas: {
          where: {
            estado_sol: {
              in: ["EN_DESARROLLO", "EN_TESTING"],
            },
          },
          select: {
            id_sol: true,
            titulo_sol: true,
            estado_sol: true,
            prioridad_sol: true,
          },
        },
      },
    });

    return usuarios
      .filter((u) => u.cuentas.length > 0)
      .map((u) => this.mapFromDatabase(u))
      .filter((dev) => dev.getCurrentWorkload() < dev.getMaxWorkload())
      .sort((a, b) => a.getCurrentWorkload() - b.getCurrentWorkload());
  }

  public async findBySkill(skill: string): Promise<Developer[]> {
    // Por ahora retornamos todos los desarrolladores disponibles
    // En el futuro se puede implementar un sistema de habilidades
    return this.findAvailable();
  }

  public async getDeveloperWorkloadStats(): Promise<
    Array<{
      developerId: string;
      developerName: string;
      totalAssigned: number;
      inDevelopment: number;
      inTesting: number;
      averageCompletionTime: number;
    }>
  > {
    const developers = await this.prisma.usuario.findMany({
      where: {
        cuentas: {
          some: {
            rol_cue: "DESARROLLADOR",
          },
        },
      },
      include: {
        solicitudesAsignadas: {
          select: {
            estado_sol: true,
            fec_creacion_sol: true,
            fec_respuesta_sol: true,
          },
        },
      },
    });

    return developers.map((dev) => {
      const totalAssigned = dev.solicitudesAsignadas.length;
      const inDevelopment = dev.solicitudesAsignadas.filter(
        (s) => s.estado_sol === "EN_DESARROLLO"
      ).length;
      const inTesting = dev.solicitudesAsignadas.filter(
        (s) => s.estado_sol === "EN_TESTING"
      ).length;

      // Calcular tiempo promedio de completación
      const completedRequests = dev.solicitudesAsignadas.filter(
        (s) =>
          s.estado_sol === "COMPLETADA" &&
          s.fec_creacion_sol &&
          s.fec_respuesta_sol
      );

      let averageCompletionTime = 0;
      if (completedRequests.length > 0) {
        const totalTime = completedRequests.reduce((sum, req) => {
          const diff =
            req.fec_respuesta_sol!.getTime() - req.fec_creacion_sol!.getTime();
          return sum + diff / (1000 * 60 * 60 * 24); // días
        }, 0);
        averageCompletionTime = totalTime / completedRequests.length;
      }

      return {
        developerId: dev.id_usu,
        developerName: `${dev.nom_usu1} ${dev.nom_usu2 || ""} ${dev.ape_usu1} ${
          dev.ape_usu2 || ""
        }`.trim(),
        totalAssigned,
        inDevelopment,
        inTesting,
        averageCompletionTime,
      };
    });
  }

  public async create(developer: Developer): Promise<Developer> {
    // En este sistema, los desarrolladores son usuarios con cuentas específicas
    // Este método podría no ser necesario si los desarrolladores se crean como usuarios normales
    throw new Error(
      "Los desarrolladores se crean como usuarios con roles específicos"
    );
  }

  public async update(developer: Developer): Promise<Developer> {
    const developerId = developer.getId();

    // Por ahora solo actualizamos los campos específicos del developer
    // Los datos del usuario (nombre, email) se manejan por separado

    // Retornar developer actualizado
    return (await this.findById(developerId))!;
  }

  public async delete(id: string): Promise<void> {
    // En este sistema no eliminamos desarrolladores,
    // solo los mantenemos como usuarios regulares
    // La lógica de negocio se maneja en el dominio
  }

  public async findByGitHubUsername(
    githubUsername: string
  ): Promise<Developer | null> {
    // Por ahora no hay campo específico para GitHub en la BD
    // Buscar por el campo github_username si existe
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        github_username: githubUsername,
        cuentas: {
          some: {
            rol_cue: "DESARROLLADOR",
          },
        },
      },
      include: {
        cuentas: {
          where: {
            rol_cue: "DESARROLLADOR",
          },
        },
        solicitudesAsignadas: {
          where: {
            estado_sol: {
              in: ["EN_DESARROLLO", "EN_TESTING"],
            },
          },
          select: {
            id_sol: true,
            titulo_sol: true,
            estado_sol: true,
            prioridad_sol: true,
          },
        },
      },
    });

    if (!usuario) {
      return null;
    }

    return this.mapFromDatabase(usuario);
  }

  private mapFromDatabase(dbRecord: any): Developer {
    const cuenta = dbRecord.cuentas?.[0] || {};
    const currentWorkload = dbRecord.solicitudesAsignadas?.length || 0;

    return Developer.create(
      dbRecord.id_usu,
      dbRecord.id_usu, // userId es el mismo que id en este caso
      dbRecord.github_username || undefined,
      [] // skills por defecto vacío
    );
  }

  public async getMaxWorkload(developerId: string): Promise<number> {
    // Retorna el máximo de solicitudes que puede manejar un desarrollador
    // Por ahora es un valor fijo, en el futuro puede ser configurable
    return 5;
  }

  // Métodos adicionales requeridos por la interfaz
  public async getStatistics(): Promise<{
    totalDevelopers: number;
    availableDevelopers: number;
    averageWorkload: number;
    developersWithGithub: number;
    topSkills: Array<{ skill: string; count: number }>;
  }> {
    const [total, withGithub] = await Promise.all([
      this.prisma.usuario.count({
        where: {
          cuentas: {
            some: {
              rol_cue: "DESARROLLADOR",
            },
          },
        },
      }),
      this.prisma.usuario.count({
        where: {
          github_username: { not: null },
          cuentas: {
            some: {
              rol_cue: "DESARROLLADOR",
            },
          },
        },
      }),
    ]);

    return {
      totalDevelopers: total,
      availableDevelopers: total, // Por simplicidad
      averageWorkload: 2.5, // Valor estimado
      developersWithGithub: withGithub,
      topSkills: [], // Por implementar
    };
  }

  public async existsByGithubUsername(
    githubUsername: string
  ): Promise<boolean> {
    const count = await this.prisma.usuario.count({
      where: {
        github_username: githubUsername,
        cuentas: {
          some: {
            rol_cue: "DESARROLLADOR",
          },
        },
      },
    });

    return count > 0;
  }

  public async findWithMinimumWorkload(): Promise<Developer | null> {
    const developers = await this.findAvailable();
    if (developers.length === 0) {
      return null;
    }

    // Retornar el desarrollador con menor carga de trabajo
    return developers.reduce((min, current) =>
      current.getCurrentWorkload() < min.getCurrentWorkload() ? current : min
    );
  }

  public async findRecommendedForRequest(
    requestType: string,
    skills?: string[]
  ): Promise<Developer[]> {
    // Por ahora retorna desarrolladores disponibles
    // En el futuro se puede implementar lógica más sofisticada basada en skills
    return this.findAvailable();
  }
}
