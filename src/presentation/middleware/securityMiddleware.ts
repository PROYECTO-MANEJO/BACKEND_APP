import { Request, Response, NextFunction } from "express";

/**
 * Middleware de logging para requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress || "Unknown";

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);

  // Log del tiempo de respuesta
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
  });

  next();
};

/**
 * Middleware de manejo global de errores
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error capturado por errorHandler:", err);

  // Si ya se envió una respuesta, delegar al handler de errores por defecto de Express
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message;

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Middleware simple de CORS
 */
export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  // Responder a preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Middleware básico de seguridad (simplificado sin helmet)
 */
export const basicSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Headers de seguridad básicos
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
};

/**
 * Rate limiting simple (sin express-rate-limit)
 */
interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

class SimpleRateLimit {
  private requests: Map<string, number[]> = new Map();

  constructor(private options: RateLimitOptions) {}

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Obtener requests del cliente
    const clientRequests = this.requests.get(key) || [];

    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = clientRequests.filter((time) => time > windowStart);

    // Verificar si excede el límite
    if (recentRequests.length >= this.options.max) {
      res.status(429).json({
        error: true,
        message:
          this.options.message || "Demasiadas peticiones, intenta más tarde",
      });
      return;
    }

    // Agregar request actual
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    // Limpiar entradas antiguas periódicamente
    if (Math.random() < 0.01) {
      // 1% de probabilidad
      this.cleanup();
    }

    next();
  };

  private cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(
        (time) => time > now - this.options.windowMs
      );
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

/**
 * Rate limiter para autenticación (más estricto)
 */
export const authRateLimit = new SimpleRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: "Demasiados intentos de autenticación, intenta en 15 minutos",
}).middleware;

/**
 * Rate limiter general para API
 */
export const apiRateLimit = new SimpleRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: "Demasiadas peticiones, intenta más tarde",
}).middleware;

/**
 * Rate limiter específico para ciertos endpoints sensibles
 */
export const strictRateLimit = new SimpleRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requests por ventana
  message: "Límite de peticiones excedido para este endpoint",
}).middleware;

/**
 * Middleware de validación de Content-Type para endpoints que requieren JSON
 */
export const requireJsonContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      res.status(400).json({
        error: true,
        message: "Content-Type debe ser application/json",
      });
      return;
    }
  }
  next();
};

/**
 * Middleware de sanitización de inputs básica
 */
export const sanitizeInputs = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Solo sanitizar el body si existe y es un objeto
  if (req.body && typeof req.body === 'object') {
    try {
      // Sanitización básica solo para strings en el body
      const sanitizeString = (str: string): string => {
        return str
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      };

      // Procesar solo propiedades string del body
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    } catch (error) {
      // Si hay algún error, simplemente continuar
      console.warn('Warning: Error en sanitización:', error);
    }
  }

  next();
};

/**
 * Middleware anti-CSRF básico
 */
export const antiCSRF = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Para métodos seguros, no es necesario verificar
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Verificar que tenga un header personalizado o referer válido
  const customHeader = req.get("X-Requested-With");
  const referer = req.get("Referer");
  const origin = req.get("Origin");

  if (!customHeader && !referer && !origin) {
    res.status(403).json({
      error: true,
      message: "Posible ataque CSRF detectado",
    });
    return;
  }

  next();
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: true,
    message: `Ruta ${req.method} ${req.path} no encontrada`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware de health check
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
};

/**
 * Alias para errorHandler para mantener compatibilidad
 */
export const globalErrorHandler = errorHandler;

/**
 * Configuración completa de middlewares de seguridad
 */
export const setupSecurityMiddlewares = () => {
  return [
    corsMiddleware,
    basicSecurityHeaders,
    requestLogger,
    sanitizeInputs,
    apiRateLimit,
  ];
};
