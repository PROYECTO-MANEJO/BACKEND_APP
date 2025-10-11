"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const tslib_1 = require("tslib");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
/**
 * Implementación del servicio de criptografía usando bcrypt
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones criptográficas
 * - DIP: Implementa la interfaz ICryptoService
 */
class CryptoService {
    constructor() {
        this.saltRounds = 10;
    }
    /**
     * SRP: Solo hashea contraseñas
     */
    async hashPassword(password) {
        try {
            const salt = await bcrypt_1.default.genSalt(this.saltRounds);
            return await bcrypt_1.default.hash(password, salt);
        }
        catch (error) {
            console.error("Error hashing password:", error);
            throw new Error("Failed to hash password");
        }
    }
    /**
     * SRP: Solo compara contraseñas
     */
    async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt_1.default.compare(password, hashedPassword);
        }
        catch (error) {
            console.error("Error comparing password:", error);
            throw new Error("Failed to compare password");
        }
    }
    /**
     * SRP: Solo genera salts
     */
    async generateSalt() {
        try {
            return await bcrypt_1.default.genSalt(this.saltRounds);
        }
        catch (error) {
            console.error("Error generating salt:", error);
            throw new Error("Failed to generate salt");
        }
    }
}
exports.CryptoService = CryptoService;
//# sourceMappingURL=CryptoService.js.map