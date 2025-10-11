/**
 * Application Use Cases - Index
 *
 * Exporta todos los casos de uso de la aplicación
 */

// GitHub Use Cases
export * from './github';

// Administration Use Cases  
export * from './administration';

// Common Use Case Interfaces
export interface BaseUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface UseCaseResponse {
  success: boolean;
  message: string;
}

export interface PaginatedUseCaseResponse<T> extends UseCaseResponse {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UseCaseError extends Error {
  code: string;
  validationErrors?: ValidationError[];
}