"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const BaseController_1 = require("./BaseController");
const jwtHelper_1 = require("../../infrastructure/helpers/jwtHelper");
class VerificationController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * POST /api/verification/send
     * Enviar token de verificación por email
     */
    async sendVerification(req, res) {
        try {
            const { userId, email } = req.body;
            if (!userId || !email) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario y email son requeridos'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const emailService = this.container.getEmailService();
            // Verificar que el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: userId }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Verificar que la cuenta existe
            const cuenta = await prisma.cuenta.findFirst({
                where: { id_usu_per: userId, cor_cue: email }
            });
            if (!cuenta) {
                res.status(404).json({
                    success: false,
                    message: 'Cuenta no encontrada'
                });
                return;
            }
            if (cuenta.isVerified) {
                res.status(200).json({
                    success: true,
                    message: 'La cuenta ya está verificada'
                });
                return;
            }
            // Generar token de verificación
            const token = await (0, jwtHelper_1.generateVerificationJWT)(userId);
            // Enviar correo de verificación
            await emailService.sendVerificationEmail(email, token);
            res.json({
                success: true,
                message: 'Correo de verificación enviado exitosamente'
            });
        }
        catch (error) {
            console.error('[sendVerification] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar el correo de verificación'
            });
        }
    }
    /**
     * GET /api/verification/verify
     * Verificar email con token
     */
    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Token es requerido'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Decodificar token
            const decoded = await (0, jwtHelper_1.verifyVerificationJWT)(token);
            console.log('[verifyEmail] Decoded token:', decoded);
            // Buscar usuario
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: decoded.id }
            });
            if (!usuario) {
                res.status(400).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Buscar cuenta asociada
            const cuenta = await prisma.cuenta.findFirst({
                where: { id_usu_per: usuario.id_usu }
            });
            if (!cuenta) {
                res.status(400).json({
                    success: false,
                    message: 'Cuenta no encontrada'
                });
                return;
            }
            if (cuenta.isVerified) {
                res.status(200).json({
                    success: true,
                    message: 'La cuenta ya está verificada'
                });
                return;
            }
            console.log("👉 Cuenta encontrada:", cuenta);
            console.log("👉 ID_CUE que se actualizará:", cuenta.id_cue);
            // Actualizar cuenta a verificada
            const updated = await prisma.cuenta.update({
                where: { id_cue: cuenta.id_cue },
                data: {
                    isVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpiry: null
                }
            });
            console.log("✅ Cuenta actualizada:", updated);
            res.status(200).json({
                success: true,
                message: 'Cuenta verificada exitosamente'
            });
        }
        catch (error) {
            console.error('[verificationController] Error al verificar el token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar la cuenta'
            });
        }
    }
    /**
     * POST /api/verification/resend
     * Reenviar token de verificación
     */
    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email es requerido'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const emailService = this.container.getEmailService();
            // Buscar cuenta por email
            const cuenta = await prisma.cuenta.findFirst({
                where: { cor_cue: email },
                include: { usuario: true }
            });
            if (!cuenta || !cuenta.usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Cuenta no encontrada'
                });
                return;
            }
            if (cuenta.isVerified) {
                res.status(200).json({
                    success: true,
                    message: 'La cuenta ya está verificada'
                });
                return;
            }
            // Generar nuevo token de verificación
            const token = await (0, jwtHelper_1.generateVerificationJWT)(cuenta.usuario.id_usu);
            // Enviar correo de verificación
            await emailService.sendVerificationEmail(email, token);
            res.json({
                success: true,
                message: 'Correo de verificación reenviado exitosamente'
            });
        }
        catch (error) {
            console.error('[resendVerification] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error al reenviar el correo de verificación'
            });
        }
    }
}
exports.VerificationController = VerificationController;
//# sourceMappingURL=VerificationController.js.map