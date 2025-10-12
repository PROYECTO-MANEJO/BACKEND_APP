/**
 * Configuración centralizada de variables de entorno
 * Valida y tipifica todas las variables de configuración
 */

export interface AppConfig {
  // Servidor
  port: number;
  nodeEnv: "development" | "production" | "test";

  // Base de datos
  databaseUrl: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Seguridad
  bcryptSaltRounds: number;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // Email
  email: {
    service: string;
    user: string;
    password: string;
    from: string;
  };

  // Servicios externos
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

  // Logging
  logging: {
    level: string;
    filePath: string;
    enableRequestLogging: boolean;
  };

  // Desarrollo
  development: {
    enableSwagger: boolean;
    enableDebugRoutes: boolean;
    mockExternalServices: boolean;
  };
}

/**
 * Cargar y validar configuración desde variables de entorno
 */
export function loadConfig(): AppConfig {
  // Validar variables requeridas
  const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno faltantes: ${missingVars.join(", ")}`
    );
  }

  return {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: (process.env.NODE_ENV as any) || "development",

    databaseUrl: process.env.DATABASE_URL!,

    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
    corsOrigin: process.env.CORS_ORIGIN || "*",
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "900000",
      10
    ),
    rateLimitMaxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || "100",
      10
    ),

    email: {
      service: process.env.EMAIL_SERVICE || "gmail",
      user: process.env.EMAIL_USER || "",
      password: process.env.EMAIL_PASSWORD || "",
      from: process.env.EMAIL_FROM || "noreply@app.com",
    },

    github: {
      token: process.env.GITHUB_TOKEN || "",
      repoOwner: process.env.GITHUB_REPO_OWNER || "",
      repoName: process.env.GITHUB_REPO_NAME || "",
    },

    pdfService: {
      url: process.env.PDF_SERVICE_URL || "http://localhost:3001",
      apiKey: process.env.PDF_SERVICE_API_KEY || "",
    },

    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3002",
      apiKey: process.env.NOTIFICATION_API_KEY || "",
    },

    logging: {
      level: process.env.LOG_LEVEL || "info",
      filePath: process.env.LOG_FILE_PATH || "./logs/app.log",
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === "true",
    },

    development: {
      enableSwagger: process.env.ENABLE_SWAGGER === "true",
      enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === "true",
      mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === "true",
    },
  };
}

// Exportar configuración global
export const config = loadConfig();
