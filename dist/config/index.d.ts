/**
 * Configuración centralizada de variables de entorno
 * Valida y tipifica todas las variables de configuración
 */
export interface AppConfig {
    port: number;
    nodeEnv: "development" | "production" | "test";
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    bcryptSaltRounds: number;
    corsOrigin: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    email: {
        service: string;
        user: string;
        password: string;
        from: string;
    };
    github: {
        token: string;
        repoOwner: string;
        repoName: string;
    };
    pdfService: {
        url: string;
        apiKey: string;
    };
    notificationService: {
        url: string;
        apiKey: string;
    };
    logging: {
        level: string;
        filePath: string;
        enableRequestLogging: boolean;
    };
    development: {
        enableSwagger: boolean;
        enableDebugRoutes: boolean;
        mockExternalServices: boolean;
    };
}
/**
 * Cargar y validar configuración desde variables de entorno
 */
export declare function loadConfig(): AppConfig;
export declare const config: AppConfig;
//# sourceMappingURL=index.d.ts.map