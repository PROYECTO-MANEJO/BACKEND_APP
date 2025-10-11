"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const tslib_1 = require("tslib");
const VerificationToken_1 = require("../entities/VerificationToken");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class VerificationService {
    constructor(userRepository, tokenRepository, emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }
    async sendEmailVerification(userId) {
        try {
            // Obtener usuario con cuenta
            const user = await this.userRepository.findById(userId);
            if (!user || !user.account) {
                throw new Error("Usuario o cuenta no encontrado");
            }
            // Generar token único
            const tokenValue = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
            // Crear token de verificación
            const verificationToken = new VerificationToken_1.VerificationToken({
                id: crypto_1.default.randomUUID(),
                userId: user.id.toString(),
                token: tokenValue,
                type: "EMAIL_VERIFICATION",
                expiresAt,
                isUsed: false,
                createdAt: new Date(),
            });
            // Guardar token
            await this.tokenRepository.create(verificationToken);
            // Enviar email
            return await this.emailService.sendVerificationEmail(user.account.email, tokenValue);
        }
        catch (error) {
            console.error("[VerificationService] Error enviando verificación:", error);
            return false;
        }
    }
    async verifyEmail(token) {
        try {
            // Buscar token
            const verificationToken = await this.tokenRepository.findByToken(token);
            if (!verificationToken) {
                return { success: false, message: "Token inválido" };
            }
            // Validar token
            if (!verificationToken.canBeUsed()) {
                return { success: false, message: "Token expirado o ya usado" };
            }
            // Obtener usuario
            const user = await this.userRepository.findById(Number(verificationToken.userId));
            if (!user) {
                return { success: false, message: "Usuario no encontrado" };
            }
            // Verificar usuario
            await this.userRepository.markAsVerified(user.id);
            // Marcar token como usado
            await this.tokenRepository.markAsUsed(verificationToken.id);
            return { success: true, message: "Cuenta verificada exitosamente" };
        }
        catch (error) {
            console.error("[VerificationService] Error verificando email:", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
    generateSecureToken() {
        return crypto_1.default.randomBytes(32).toString("hex");
    }
}
exports.VerificationService = VerificationService;
//# sourceMappingURL=VerificationService.js.map