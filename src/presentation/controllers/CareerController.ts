import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;  // Agregamos la propiedad uid
}

export class CareerController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/careers
   * Obtener todas las carreras
   */
  public async getAllCareers(req: Request, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const carreras = await prisma.carrera.findMany({
        orderBy: {
          nom_car: 'asc'
        }
      });

      res.json({
        success: true,
        data: carreras
      });
    } catch (error: any) {
      console.error('[getAllCareers] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/careers/:id
   * Obtener una carrera por ID
   */
  public async getCareerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prisma = this.container.getPrismaClient();

      const carrera = await prisma.carrera.findUnique({
        where: { id_car: id }
      });

      if (!carrera) {
        res.status(404).json({
          success: false,
          message: 'Carrera no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: carrera
      });
    } catch (error: any) {
      console.error('[getCareerById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/careers
   * Crear una nueva carrera
   */
  public async createCareer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { nom_car, des_car, nom_fac_per } = req.body;
      const usuario_id = req.usuario?.id_usu || req.uid;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar rol del usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: usuario_id },
        include: {
          cuentas: {
            select: { rol_cue: true }
          }
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const roles = usuario.cuentas.map(cuenta => cuenta.rol_cue);
      const esAdmin = roles.includes('ADMINISTRADOR') || roles.includes('MASTER');

      if (!esAdmin) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear carreras'
        });
        return;
      }

      if (!nom_car || nom_car.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El nombre de la carrera es requerido'
        });
        return;
      }

      // Verificar si ya existe una carrera con el mismo nombre
      const existingCarrera = await prisma.carrera.findFirst({
        where: {
          nom_car: {
            equals: nom_car.trim(),
            mode: 'insensitive' // Búsqueda case-insensitive
          }
        }
      });

      if (existingCarrera) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una carrera con ese nombre'
        });
        return;
      }

      // Crear la nueva carrera
      const newCarrera = await prisma.carrera.create({
        data: {
          nom_car: nom_car.trim(),
          des_car: des_car ? des_car.trim() : '',
          nom_fac_per: nom_fac_per ? nom_fac_per.trim() : ''
        }
      });

      res.status(201).json({
        success: true,
        message: 'Carrera creada exitosamente',
        data: newCarrera
      });
    } catch (error: any) {
      console.error('[createCareer] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/careers/:id
   * Actualizar una carrera
   */
  public async updateCareer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nom_car, des_car, nom_fac_per } = req.body;
      const usuario_id = req.usuario?.id_usu || req.uid;

      if (!usuario_id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar rol del usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: usuario_id },
        include: {
          cuentas: {
            select: { rol_cue: true }
          }
        }
      });

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const roles = usuario.cuentas.map(cuenta => cuenta.rol_cue);
      const esAdmin = roles.includes('ADMINISTRADOR') || roles.includes('MASTER');

      if (!esAdmin) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar carreras'
        });
        return;
      }

      if (!nom_car || nom_car.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El nombre de la carrera es requerido'
        });
        return;
      }

      // Verificar si la carrera existe
      const existingCarrera = await prisma.carrera.findUnique({
        where: { id_car: id }
      });

      if (!existingCarrera) {
        res.status(404).json({
          success: false,
          message: 'Carrera no encontrada'
        });
        return;
      }

      // Verificar si ya existe otra carrera con el mismo nombre
      const duplicateCarrera = await prisma.carrera.findFirst({
        where: {
          nom_car: {
            equals: nom_car.trim(),
            mode: 'insensitive'
          },
          id_car: {
            not: id // Excluir la carrera actual
          }
        }
      });

      if (duplicateCarrera) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otra carrera con ese nombre'
        });
        return;
      }

      // Actualizar la carrera
      const updatedCarrera = await prisma.carrera.update({
        where: { id_car: id },
        data: {
          nom_car: nom_car.trim(),
          des_car: des_car ? des_car.trim() : existingCarrera.des_car,
          nom_fac_per: nom_fac_per ? nom_fac_per.trim() : existingCarrera.nom_fac_per
        }
      });

      res.json({
        success: true,
        message: 'Carrera actualizada exitosamente',
        data: updatedCarrera
      });
    } catch (error: any) {
      console.error('[updateCareer] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/careers/:id
   * Eliminar una carrera
   */
  public async deleteCareer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = req.usuario?.rol;

      // Solo admin y master pueden eliminar carreras
      if (!userRole || !['ADMINISTRADOR', 'MASTER'].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar carreras'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar si la carrera existe
      const existingCarrera = await prisma.carrera.findUnique({
        where: { id_car: id }
      });

      if (!existingCarrera) {
        res.status(404).json({
          success: false,
          message: 'Carrera no encontrada'
        });
        return;
      }

      // Verificar si hay usuarios asociados a esta carrera
      const usersWithCarrera = await prisma.usuario.findMany({
        where: { id_car_per: id }
      });

      if (usersWithCarrera.length > 0) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar la carrera porque hay usuarios asociados a ella'
        });
        return;
      }

      // Verificar si hay eventos por carrera asociados
      const eventosWithCarrera = await prisma.eventoPorCarrera.findMany({
        where: { id_car_per: id }
      });

      if (eventosWithCarrera.length > 0) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar la carrera porque hay eventos asociados a ella'
        });
        return;
      }

      // Verificar si hay cursos por carrera asociados
      const cursosWithCarrera = await prisma.cursoPorCarrera.findMany({
        where: { id_car_per: id }
      });

      if (cursosWithCarrera.length > 0) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar la carrera porque hay cursos asociados a ella'
        });
        return;
      }

      // Eliminar la carrera
      await prisma.carrera.delete({
        where: { id_car: id }
      });

      res.json({
        success: true,
        message: 'Carrera eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('[deleteCareer] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/careers/:id/stats
   * Obtener estadísticas de una carrera (usuarios, eventos, cursos)
   */
  public async getCareerStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = req.usuario?.rol;

      // Solo admin, master y organizadores pueden ver estadísticas
      if (!userRole || !['ADMINISTRADOR', 'MASTER', 'ORGANIZADOR'].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estadísticas de carreras'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Verificar si la carrera existe
      const carrera = await prisma.carrera.findUnique({
        where: { id_car: id }
      });

      if (!carrera) {
        res.status(404).json({
          success: false,
          message: 'Carrera no encontrada'
        });
        return;
      }

      // Obtener estadísticas
      const [
        totalUsuarios,
        totalEventos,
        totalCursos,
        eventosActivos,
        cursosActivos
      ] = await Promise.all([
        prisma.usuario.count({
          where: { id_car_per: id }
        }),
        prisma.eventoPorCarrera.count({
          where: { id_car_per: id }
        }),
        prisma.cursoPorCarrera.count({
          where: { id_car_per: id }
        }),
        prisma.eventoPorCarrera.count({
          where: {
            id_car_per: id,
            evento: {
              estado: 'ACTIVO'
            }
          }
        }),
        prisma.cursoPorCarrera.count({
          where: {
            id_car_per: id,
            curso: {
              estado: 'ACTIVO'
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          carrera: {
            id_car: carrera.id_car,
            nom_car: carrera.nom_car,
            des_car: carrera.des_car,
            nom_fac_per: carrera.nom_fac_per
          },
          estadisticas: {
            total_usuarios: totalUsuarios,
            total_eventos: totalEventos,
            total_cursos: totalCursos,
            eventos_activos: eventosActivos,
            cursos_activos: cursosActivos
          }
        }
      });
    } catch (error: any) {
      console.error('[getCareerStats] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
