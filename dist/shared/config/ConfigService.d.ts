import { AppConfig } from "@shared/types/CommonTypes";
/**
 * Configuración de la aplicación
 * SRP: Solo maneja la configuración del entorno
 */
export declare class ConfigService {
    private static instance;
    private config;
    private constructor();
    /**
     * Singleton pattern para configuración
     */
    static getInstance(): ConfigService;
    /**
     * SRP: Solo carga variables de entorno
     */
    private loadConfig;
    /**
     * SRP: Solo valida la configuración cargada
     */
    private validateConfig;
    /**
     * SRP: Solo retorna la configuración
     */
    getConfig(): AppConfig;
    /**
     * Utilidades de configuración específicas
     */
    isDevelopment(): boolean;
    isProduction(): boolean;
    isTest(): boolean;
    /**
     * Debug info para logs
     */
    getDebugInfo(): Partial<AppConfig>;
}
//# sourceMappingURL=ConfigService.d.ts.map