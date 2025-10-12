import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
import { CertificateController } from '../controllers/CertificateController';
import {
  authenticateToken,
  authorize
} from '../middleware/authMiddleware';
import {
  handleValidationErrors,
  validatePagination,
  validateIdParam
} from '../middleware/validationMiddleware';

export class CertificateRoutes {
  private router: Router;
  private certificateController: CertificateController;

  constructor(container: DIContainer) {
    this.router = Router();
    this.certificateController = new CertificateController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * GET /api/certificates
     * Obtener lista de certificados (solo administradores)
     */
    this.router.get(
      '/',
      authenticateToken,
      authorize('administrador'),
      validatePagination,
      handleValidationErrors,
      this.certificateController.getCertificates.bind(this.certificateController)
    );

    /**
     * GET /api/certificates/my-certificates
     * Obtener mis certificados
     */
    this.router.get(
      '/my-certificates',
      authenticateToken,
      validatePagination,
      handleValidationErrors,
      this.certificateController.getMyCertificates.bind(this.certificateController)
    );

    /**
     * GET /api/certificates/statistics
     * Obtener estadísticas de certificados (solo administradores)
     */
    this.router.get(
      '/statistics',
      authenticateToken,
      authorize('administrador'),
      this.certificateController.getCertificateStatistics.bind(this.certificateController)
    );

    /**
     * GET /api/certificates/pending
     * Obtener certificados pendientes (solo administradores y organizadores)
     */
    this.router.get(
      '/pending',
      authenticateToken,
      authorize('administrador', 'organizador'),
      validatePagination,
      handleValidationErrors,
      this.certificateController.getPendingCertificates.bind(this.certificateController)
    );

    /**
     * GET /api/certificates/:id
     * Obtener certificado por ID
     */
    this.router.get(
      '/:id',
      authenticateToken,
      validateIdParam,
      handleValidationErrors,
      this.certificateController.getCertificateById.bind(this.certificateController)
    );

    /**
     * POST /api/certificates/generate
     * Generar nuevo certificado
     */
    this.router.post(
      '/generate',
      authenticateToken,
      // TODO: Agregar validación específica
      this.certificateController.generateCertificate.bind(this.certificateController)
    );

    /**
     * PUT /api/certificates/:id/approve
     * Aprobar o rechazar certificado (solo administradores y organizadores)
     */
    this.router.put(
      '/:id/approve',
      authenticateToken,
      authorize('administrador', 'organizador'),
      validateIdParam,
      handleValidationErrors,
      this.certificateController.approveCertificate.bind(this.certificateController)
    );

    /**
     * GET /api/certificates/:id/download
     * Descargar certificado en PDF
     */
    this.router.get(
      '/:id/download',
      authenticateToken,
      validateIdParam,
      handleValidationErrors,
      this.certificateController.downloadCertificate.bind(this.certificateController)
    );

    /**
     * POST /api/certificates/bulk-approve
     * Aprobar múltiples certificados (solo administradores)
     */
    this.router.post(
      '/bulk-approve',
      authenticateToken,
      authorize('administrador'),
      // TODO: Agregar validación específica
      this.certificateController.bulkApproveCertificates.bind(this.certificateController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}