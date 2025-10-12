// Exportar middlewares principales

export {
  authenticateToken,
  authorize,
  optionalAuth,
  authorizeOwnerOrAdmin,
  type JWTPayload,
} from "./authMiddleware";

export {
  handleValidationErrors,
  validateUserCreation,
  validateUserUpdate,
  validateLogin,
  validateChangePassword,
  validateCourseCreation,
  validateEventCreation,
  validatePagination,
  validateIdParam,
} from "./validationMiddleware";

export {
  requestLogger,
  globalErrorHandler,
  notFoundHandler,
  healthCheck,
} from "./securityMiddleware";
