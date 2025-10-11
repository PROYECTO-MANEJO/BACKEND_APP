"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const ConfigService_1 = require("@shared/config/ConfigService");
const AppConstants_1 = require("@shared/constants/AppConstants");
/**
 * Implementación del servicio JWT
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones JWT
 * - DIP: Implementa la interfaz IJWTService
 */
class JWTService {
    constructor() {
        this.configService = ConfigService_1.ConfigService.getInstance();
    }
    /**
     * SRP: Solo genera tokens estándar
     */
    async generateToken(userId) {
        try {
            const config = this.configService.getConfig();
            const payload = {
                userId,
                role: "USER",
                iat: Math.floor(Date.now() / 1000),
                iss: AppConstants_1.JWT_CONFIG.ISSUER,
            };
            return (0, jsonwebtoken_1.sign)(payload, config.jwtSecret, {
                expiresIn: "24h",
                algorithm: "HS256",
            });
        }
        catch (error) {
            console.error("Error generating token:", error);
            throw new Error("Failed to generate token");
        }
    }
    /**
     * SRP: Solo genera tokens de administrador
     */
    async generateAdminToken(userId) {
        try {
            const config = this.configService.getConfig();
            const payload = {
                userId,
                role: "ADMIN",
                iat: Math.floor(Date.now() / 1000),
                iss: AppConstants_1.JWT_CONFIG.ISSUER,
            };
            return (0, jsonwebtoken_1.sign)(payload, config.jwtSecret, {
                expiresIn: "24h",
                algorithm: "HS256",
            });
        }
        catch (error) {
            console.error("Error generating admin token:", error);
            throw new Error("Failed to generate admin token");
        }
    }
    /**
     * SRP: Solo verifica tokens
     */
    async verifyToken(token) {
        try {
            const config = this.configService.getConfig();
            const decoded = (0, jsonwebtoken_1.verify)(token, config.jwtSecret, {
                algorithms: ["HS256"],
                issuer: AppConstants_1.JWT_CONFIG.ISSUER,
            });
            return {
                userId: decoded.userId,
                role: decoded.role,
            };
        }
        catch (error) {
            console.error("Error verifying token:", error);
            return null;
        }
    }
}
exports.JWTService = JWTService;
//# sourceMappingURL=JWTService.js.map