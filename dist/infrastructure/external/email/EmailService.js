"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const tslib_1 = require("tslib");
const nodemailer_1 = tslib_1.__importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
    }
    createTransporter() {
        const requiredEnvVars = [
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASS",
            "SMTP_FROM",
            "FRONTEND_URL",
        ];
        const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
        if (missingVars.length > 0) {
            console.warn(`[EmailService] Variables de entorno faltantes: ${missingVars.join(", ")}`);
        }
        return nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendVerificationEmail(email, token) {
        try {
            if (!process.env.FRONTEND_URL || !process.env.SMTP_FROM) {
                console.error("[EmailService] Variables de entorno faltantes para verificación");
                return false;
            }
            const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: email,
                subject: "Verificación de cuenta - Sistema de Gestión Académica",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verificación de cuenta</h2>
            <p>¡Bienvenido al Sistema de Gestión Académica!</p>
            <p>Para completar el registro de tu cuenta, por favor haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verificar cuenta
              </a>
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p><small>Este enlace expirará en 24 horas por seguridad.</small></p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Si no has solicitado esta verificación, ignora este correo.
            </p>
          </div>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Correo de verificación enviado a: ${email}`);
            return true;
        }
        catch (error) {
            console.error("[EmailService] Error enviando correo de verificación:", error);
            return false;
        }
    }
    async sendPasswordResetEmail(email, token) {
        try {
            if (!process.env.FRONTEND_URL || !process.env.SMTP_FROM) {
                console.error("[EmailService] Variables de entorno faltantes para recuperación");
                return false;
            }
            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: email,
                subject: "Recuperación de contraseña - Sistema de Gestión Académica",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperación de contraseña</h2>
            <p>Has solicitado recuperar tu contraseña para acceder al Sistema de Gestión Académica.</p>
            <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p><small>Este enlace expirará en 1 hora por seguridad.</small></p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Si no has solicitado esta recuperación, ignora este correo e informa al administrador.
            </p>
          </div>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Correo de recuperación enviado a: ${email}`);
            return true;
        }
        catch (error) {
            console.error("[EmailService] Error enviando correo de recuperación:", error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map