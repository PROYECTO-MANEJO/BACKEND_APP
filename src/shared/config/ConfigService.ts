import { AppConfig } from "@shared/types/CommonTypes";

/**
 * Configuración de la aplicación
 * SRP: Solo maneja la configuración del entorno
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  /**
   * Singleton pattern para configuración
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * SRP: Solo carga variables de entorno
   */
  private loadConfig(): AppConfig {
    return {
      port: parseInt(process.env.PORT || "3000", 10),
      nodeEnv:
        (process.env.NODE_ENV as "development" | "production" | "test") ||
        "development",
      dbUrl: process.env.DATABASE_URL || "",
      jwtSecret: process.env.SECRET_KEY || "",
      jwtExpiration: process.env.JWT_EXPIRATION || "24h",
    };
  }

  /**
   * SRP: Solo valida la configuración cargada
   */
  private validateConfig(): void {
    const requiredEnvVars = ["SECRET_KEY"];
    const missingVars: string[] = [];

    requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.warn(
        `⚠️ Missing environment variables: ${missingVars.join(", ")}`
      );

      // En desarrollo, usar valores por defecto
      if (this.config.nodeEnv === "development") {
        console.log("🔧 Using default values for development");
        if (!this.config.jwtSecret) {
          this.config.jwtSecret = "dev-secret-key-change-in-production";
        }
      } else {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(", ")}`
        );
      }
    }
  }

  /**
   * SRP: Solo retorna la configuración
   */
  public getConfig(): AppConfig {
    return { ...this.config }; // Return copy to prevent mutation
  }

  /**
   * Utilidades de configuración específicas
   */
  public isDevelopment(): boolean {
    return this.config.nodeEnv === "development";
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === "production";
  }

  public isTest(): boolean {
    return this.config.nodeEnv === "test";
  }

  /**
   * Debug info para logs
   */
  public getDebugInfo(): Partial<AppConfig> {
    return {
      port: this.config.port,
      nodeEnv: this.config.nodeEnv,
      jwtExpiration: this.config.jwtExpiration,
      // Nunca loggear secrets o URLs de BD
    };
  }
}
