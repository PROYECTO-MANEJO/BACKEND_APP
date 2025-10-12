"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurityMiddlewares = exports.globalErrorHandler = exports.healthCheck = exports.notFoundHandler = exports.antiCSRF = exports.sanitizeInputs = exports.requireJsonContentType = exports.strictRateLimit = exports.apiRateLimit = exports.authRateLimit = exports.basicSecurityHeaders = exports.corsMiddleware = exports.errorHandler = exports.requestLogger = void 0;
/**
 * Middleware de logging para requests
 */
const requestLogger = (req, res, next) => {
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
exports.requestLogger = requestLogger;
/**
 * Middleware de manejo global de errores
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error capturado por errorHandler:', err);
    // Si ya se envió una respuesta, delegar al handler de errores por defecto de Express
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message;
    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
/**
 * Middleware simple de CORS
 */
const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // Responder a preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
};
exports.corsMiddleware = corsMiddleware;
/**
 * Middleware básico de seguridad (simplificado sin helmet)
 */
const basicSecurityHeaders = (req, res, next) => {
    // Headers de seguridad básicos
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};
exports.basicSecurityHeaders = basicSecurityHeaders;
class SimpleRateLimit {
    constructor(options) {
        this.options = options;
        this.requests = new Map();
        this.middleware = (req, res, next) => {
            const key = req.ip || 'unknown';
            const now = Date.now();
            const windowStart = now - this.options.windowMs;
            // Obtener requests del cliente
            const clientRequests = this.requests.get(key) || [];
            // Filtrar requests dentro de la ventana de tiempo
            const recentRequests = clientRequests.filter(time => time > windowStart);
            // Verificar si excede el límite
            if (recentRequests.length >= this.options.max) {
                res.status(429).json({
                    error: true,
                    message: this.options.message || 'Demasiadas peticiones, intenta más tarde'
                });
                return;
            }
            // Agregar request actual
            recentRequests.push(now);
            this.requests.set(key, recentRequests);
            // Limpiar entradas antiguas periódicamente
            if (Math.random() < 0.01) { // 1% de probabilidad
                this.cleanup();
            }
            next();
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const recentRequests = requests.filter(time => time > now - this.options.windowMs);
            if (recentRequests.length === 0) {
                this.requests.delete(key);
            }
            else {
                this.requests.set(key, recentRequests);
            }
        }
    }
}
/**
 * Rate limiter para autenticación (más estricto)
 */
exports.authRateLimit = new SimpleRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    message: 'Demasiados intentos de autenticación, intenta en 15 minutos'
}).middleware;
/**
 * Rate limiter general para API
 */
exports.apiRateLimit = new SimpleRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: 'Demasiadas peticiones, intenta más tarde'
}).middleware;
/**
 * Rate limiter específico para ciertos endpoints sensibles
 */
exports.strictRateLimit = new SimpleRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 requests por ventana
    message: 'Límite de peticiones excedido para este endpoint'
}).middleware;
/**
 * Middleware de validación de Content-Type para endpoints que requieren JSON
 */
const requireJsonContentType = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            res.status(400).json({
                error: true,
                message: 'Content-Type debe ser application/json'
            });
            return;
        }
    }
    next();
};
exports.requireJsonContentType = requireJsonContentType;
/**
 * Middleware de sanitización de inputs básica
 */
const sanitizeInputs = (req, res, next) => {
    // Función recursiva para sanitizar objetos
    const sanitize = (obj) => {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj === 'string') {
            // Remover caracteres potencialmente peligrosos
            return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };
    // Sanitizar body, query y params
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }
    next();
};
exports.sanitizeInputs = sanitizeInputs;
/**
 * Middleware anti-CSRF básico
 */
const antiCSRF = (req, res, next) => {
    // Para métodos seguros, no es necesario verificar
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Verificar que tenga un header personalizado o referer válido
    const customHeader = req.get('X-Requested-With');
    const referer = req.get('Referer');
    const origin = req.get('Origin');
    if (!customHeader && !referer && !origin) {
        res.status(403).json({
            error: true,
            message: 'Posible ataque CSRF detectado'
        });
        return;
    }
    next();
};
exports.antiCSRF = antiCSRF;
/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: true,
        message: `Ruta ${req.method} ${req.path} no encontrada`,
        timestamp: new Date().toISOString()
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Middleware de health check
 */
const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
};
exports.healthCheck = healthCheck;
/**
 * Alias para errorHandler para mantener compatibilidad
 */
exports.globalErrorHandler = exports.errorHandler;
/**
 * Configuración completa de middlewares de seguridad
 */
const setupSecurityMiddlewares = () => {
    return [
        exports.corsMiddleware,
        exports.basicSecurityHeaders,
        exports.requestLogger,
        exports.sanitizeInputs,
        exports.apiRateLimit
    ];
};
exports.setupSecurityMiddlewares = setupSecurityMiddlewares;
//# sourceMappingURL=securityMiddleware.js.map