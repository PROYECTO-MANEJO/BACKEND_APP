"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateRoutes = void 0;
const express_1 = require("express");
const CertificateController_1 = require("../controllers/CertificateController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
class CertificateRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.certificateController = new CertificateController_1.CertificateController();
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * GET /api/certificates
         * Obtener lista de certificados (solo administradores)
         */
        this.router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)("administrador"), validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.certificateController.getCertificates.bind(this.certificateController));
        /**
         * GET /api/certificates/my-certificates
         * Obtener mis certificados
         */
        this.router.get("/my-certificates", authMiddleware_1.authenticateToken, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.certificateController.getUserCertificates.bind(this.certificateController));
        /**
         * GET /api/certificates/statistics
         * Obtener estadísticas de certificados (solo administradores)
         */
        this.router.get("/statistics", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)("administrador"), this.certificateController.getCertificateStatistics.bind(this.certificateController));
        /**
         * GET /api/certificates/pending
         * Obtener certificados pendientes (solo administradores y organizadores)
         */
        this.router.get("/pending", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)("administrador", "organizador"), validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.certificateController.getPendingCertificates.bind(this.certificateController));
        /**
         * GET /api/certificates/:id
         * Obtener certificado por ID
         */
        this.router.get("/:id", authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.certificateController.getCertificateById.bind(this.certificateController));
        /**
         * POST /api/certificates/generate
         * Generar nuevo certificado
         */
        this.router.post("/generate", authMiddleware_1.authenticateToken, 
        // TODO: Agregar validación específica
        this.certificateController.generateCertificate.bind(this.certificateController));
        /**
         * PUT /api/certificates/:id/approve
         * Aprobar o rechazar certificado (solo administradores y organizadores)
         */
        this.router.put("/:id/approve", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)("administrador", "organizador"), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.certificateController.approveCertificate.bind(this.certificateController));
        /**
         * GET /api/certificates/:id/download
         * Descargar certificado en PDF
         */
        this.router.get("/:id/download", authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.certificateController.downloadCertificate.bind(this.certificateController));
        /**
         * POST /api/certificates/bulk-approve
         * Aprobar múltiples certificados (solo administradores)
         */
        this.router.post("/bulk-approve", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)("administrador"), 
        // TODO: Agregar validación específica
        this.certificateController.bulkApproveCertificates.bind(this.certificateController));
    }
    getRouter() {
        return this.router;
    }
}
exports.CertificateRoutes = CertificateRoutes;
//# sourceMappingURL=certificateRoutes.js.map