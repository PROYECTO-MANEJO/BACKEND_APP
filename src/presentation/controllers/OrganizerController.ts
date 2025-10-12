import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/DIContainer';

interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
  };
  uid?: string;
  userRole?: string;
}

export class OrganizerController {
  constructor(private container: DIContainer) {}

  /**
   * GET /api/organizadores
   * Obtener todos los organizadores
   */
  public async getOrganizadores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      const organizadores = await prisma.organizador.findMany({
        orderBy: [
          { ape_org1: 'asc' },
          { nom_org1: 'asc' }
        ]
      });

      res.json({
        success: true,
        organizadores: organizadores.map(org => ({
          ced_org: org.ced_org,
          nom_org1: org.nom_org1,
          nom_org2: org.nom_org2,
          ape_org1: org.ape_org1,
          ape_org2: org.ape_org2,
          tit_aca_org: org.tit_aca_org,
          nombre_completo: `${org.nom_org1} ${org.nom_org2 || ''} ${org.ape_org1} ${org.ape_org2 || ''}`.trim()
        }))
      });

    } catch (error: any) {
      console.error('[getOrganizadores] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/organizadores
   * Crear nuevo organizador (Admin only)
   */
  public async createOrganizador(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { 
        ced_org, 
        nom_org1, 
        nom_org2, 
        ape_org1, 
        ape_org2, 
        tit_aca_org 
      } = req.body;
      const prisma = this.container.getPrismaClient();

      // Validaciones básicas
      if (!ced_org || !nom_org1 || !ape_org1) {
        res.status(400).json({
          success: false,
          message: 'Cédula, primer nombre y primer apellido son obligatorios'
        });
        return;
      }

      const nuevoOrganizador = await prisma.organizador.create({
        data: {
          ced_org: ced_org.trim(),
          nom_org1: nom_org1.trim(),
          nom_org2: nom_org2?.trim() || '',
          ape_org1: ape_org1.trim(),
          ape_org2: ape_org2?.trim() || '',
          tit_aca_org: tit_aca_org?.trim() || null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Organizador creado exitosamente',
        organizador: nuevoOrganizador
      });

    } catch (error: any) {
      console.error('[createOrganizador] Error:', error);
      
      if (error.code === 'P2002') {
        res.status(400).json({
          success: false,
          message: 'Ya existe un organizador con esa cédula'
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
