import { PoolClient } from "pg";
/**
 * Servicio de base de datos PostgreSQL
 */
export declare class DatabaseService {
    private static instance;
    private pool;
    private constructor();
    /**
     * Obtener instancia singleton
     */
    static getInstance(): DatabaseService;
    /**
     * Ejecutar una consulta SQL
     */
    query(text: string, params?: any[]): Promise<any>;
    /**
     * Ejecutar transacción
     */
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    /**
     * Verificar conexión a la base de datos
     */
    testConnection(): Promise<boolean>;
    /**
     * Cerrar todas las conexiones
     */
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseService.d.ts.map