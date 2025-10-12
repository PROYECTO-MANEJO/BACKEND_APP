/**
 * Application Layer - Index
 *
 * Exporta todas las interfaces y casos de uso de la capa de aplicación
 */
export * from "./usecases";
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
//# sourceMappingURL=index.d.ts.map