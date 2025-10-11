/**
 * Interfaces base para SOLID principles
 * ISP: Interfaces pequeñas y específicas
 */

/**
 * Base para entidades del dominio
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ISP: Interface pequeña para repositorios base
 */
export interface BaseRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

/**
 * ISP: Interface para casos de uso (Application layer)
 */
export interface UseCase<TRequest = any, TResponse = any> {
  execute(request?: TRequest): Promise<TResponse>;
}

/**
 * ISP: Interface para servicios de dominio
 */
export interface DomainService {
  // Marcador para servicios de dominio
}

/**
 * ISP: Interface para validadores
 */
export interface Validator<T> {
  validate(data: T): ValidationResult;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Error de validación específico
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * ISP: Interface para transformadores de respuesta
 */
export interface ResponseTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
}

/**
 * ISP: Interface para servicios externos
 */
export interface ExternalService {
  isAvailable(): Promise<boolean>;
}

/**
 * Base para respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  timestamp: Date;
}
