"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
/**
 * Servicio de base de datos PostgreSQL
 */
class DatabaseService {
    constructor() {
        // Configuración de la conexión a PostgreSQL
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            database: process.env.DB_NAME || "backend_app",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "password",
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        // Configurar eventos de la pool
        this.pool.on("connect", (client) => {
            console.log("✅ Nueva conexión establecida a PostgreSQL");
        });
        this.pool.on("error", (err) => {
            console.error("❌ Error inesperado en PostgreSQL:", err);
        });
    }
    /**
     * Obtener instancia singleton
     */
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    /**
     * Ejecutar una consulta SQL
     */
    async query(text, params) {
        const client = await this.pool.connect();
        try {
            console.log("🔍 Ejecutando query:", text.substring(0, 100) + "...");
            const result = await client.query(text, params);
            console.log("✅ Query ejecutada exitosamente");
            return result;
        }
        catch (error) {
            console.error("❌ Error en query:", error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Ejecutar transacción
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            console.log("🔄 Transacción iniciada");
            const result = await callback(client);
            await client.query("COMMIT");
            console.log("✅ Transacción completada");
            return result;
        }
        catch (error) {
            await client.query("ROLLBACK");
            console.error("❌ Transacción revertida:", error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Verificar conexión a la base de datos
     */
    async testConnection() {
        try {
            const result = await this.query("SELECT NOW() as current_time, version()");
            console.log("🐘 PostgreSQL conectado:", result.rows[0].version);
            return true;
        }
        catch (error) {
            console.error("❌ Error de conexión a PostgreSQL:", error);
            return false;
        }
    }
    /**
     * Cerrar todas las conexiones
     */
    async close() {
        await this.pool.end();
        console.log("🔒 Pool de conexiones cerrado");
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map