"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailServiceImpl = void 0;
const emailService_1 = require("./emailService");
class EmailServiceImpl {
    async sendVerificationEmail(email, token) {
        try {
            await (0, emailService_1.sendVerificationEmail)(email, token);
            return true;
        }
        catch (error) {
            console.error('[EmailServiceImpl] Error enviando email de verificación:', error);
            return false;
        }
    }
    async sendPasswordResetEmail(email, token) {
        try {
            await (0, emailService_1.sendRecoveryEmail)(email, token);
            return true;
        }
        catch (error) {
            console.error('[EmailServiceImpl] Error enviando email de recuperación:', error);
            return false;
        }
    }
    async testConnection() {
        try {
            return await (0, emailService_1.testEmailConnection)();
        }
        catch (error) {
            console.error('[EmailServiceImpl] Error probando conexión de email:', error);
            return false;
        }
    }
}
exports.EmailServiceImpl = EmailServiceImpl;
//# sourceMappingURL=EmailServiceImpl.js.map