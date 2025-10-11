import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Middleware de logging para requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  
  // Log del tiempo de respuesta
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
  });

  next();
};

/**
 * Middleware de manejo global de errores
 */
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Global Error Handler:', error);

  // Si ya se envió la respuesta, delegar al manejador por defecto de Express
  if (res.headersSent) {
    return next(error);
  }

  // Errores de validación de Joi o express-validator
  if (error.name === 'ValidationError' || error.isJoi) {
    res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: error.details || error.message
    });
    return;
  }

  // Errores de base de datos
  if (error.code === 'P2002') { // Unique constraint violation (Prisma)
    res.status(409).json({
      success: false,
      error: 'Ya existe un registro con esa información'
    });
    return;
  }

  if (error.code === 'P2025') { // Record not found (Prisma)
    res.status(404).json({
      success: false,
      error: 'Registro no encontrado'
    });
    return;
  }

  // Errores de autenticación JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expirado'
    });
    return;
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.url} no encontrada`
  });
};

/**
 * Rate limiting para API
 */
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || 'Demasiadas solicitudes, intente más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting para rutas de salud
      return req.url === '/health' || req.url === '/api/health';
    }
  });
};

/**
 * Rate limits específicos
 */
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  'Demasiados intentos de autenticación, intente más tarde'
);

export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100 // 100 requests
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  1000 // 1000 requests para API general
);

/**
 * Configuración de seguridad con Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Configuración de CORS
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000',
      'https://localhost:5173'
    ];

    // Permitir requests sin origin (aplicaciones móviles, postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Middleware para parsear JSON con límite de tamaño
 */
export const jsonParser = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.is('application/json')) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
          next();
        } catch (error) {
          res.status(400).json({
            success: false,
            error: 'JSON inválido'
          });
        }
      });
    } else {
      next();
    }
  };
};

/**
 * Middleware de salud del sistema
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
};