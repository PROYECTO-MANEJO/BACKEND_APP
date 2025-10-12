/**
 * Application Layer - Index
 *
 * Exporta todas las interfaces y casos de uso de la capa de aplicación
 */

// Use Cases
export * from "./usecases";

// Services (Application Services)
// export * from './services';

// Common Application Interfaces
export interface ApplicationService<TRequest = any, TResponse = any> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface ApplicationServiceResponse {
  success: boolean;
  message: string;
  timestamp: Date;
}

export interface ApplicationError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}
