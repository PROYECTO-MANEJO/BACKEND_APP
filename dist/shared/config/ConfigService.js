"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
/**
 * Configuración de la aplicación
 * SRP: Solo maneja la configuración del entorno
 */
class ConfigService {
    constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }
    /**
     * Singleton pattern para configuración
     */
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
    /**
     * SRP: Solo carga variables de entorno
     */
    loadConfig() {
        return {
            port: parseInt(process.env.PORT || "3000", 10),
            nodeEnv: process.env.NODE_ENV ||
                "development",
            dbUrl: process.env.DATABASE_URL || "",
            jwtSecret: process.env.SECRET_KEY || "",
            jwtExpiration: process.env.JWT_EXPIRATION || "24h",
        };
    }
    /**
     * SRP: Solo valida la configuración cargada
     */
    validateConfig() {
        const requiredEnvVars = ["SECRET_KEY"];
        const missingVars = [];
        requiredEnvVars.forEach((varName) => {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        });
        if (missingVars.length > 0) {
            console.warn(`⚠️ Missing environment variables: ${missingVars.join(", ")}`);
            // En desarrollo, usar valores por defecto
            if (this.config.nodeEnv === "development") {
                console.log("🔧 Using default values for development");
                if (!this.config.jwtSecret) {
                    this.config.jwtSecret = "dev-secret-key-change-in-production";
                }
            }
            else {
                throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
            }
        }
    }
    /**
     * SRP: Solo retorna la configuración
     */
    getConfig() {
        return { ...this.config }; // Return copy to prevent mutation
    }
    /**
     * Utilidades de configuración específicas
     */
    isDevelopment() {
        return this.config.nodeEnv === "development";
    }
    isProduction() {
        return this.config.nodeEnv === "production";
    }
    isTest() {
        return this.config.nodeEnv === "test";
    }
    /**
     * Debug info para logs
     */
    getDebugInfo() {
        return {
            port: this.config.port,
            nodeEnv: this.config.nodeEnv,
            jwtExpiration: this.config.jwtExpiration,
            // Nunca loggear secrets o URLs de BD
        };
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=ConfigService.js.map