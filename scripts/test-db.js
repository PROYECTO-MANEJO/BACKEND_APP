// Simple test para verificar conexión a la base de datos
const { Client } = require("pg");

async function testConnection() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "backend_app",
    user: "postgres",
    password: "password",
  });

  try {
    console.log("🔄 Intentando conectar a PostgreSQL...");
    await client.connect();

    console.log("✅ Conexión exitosa a PostgreSQL!");

    const result = await client.query(
      "SELECT NOW() as current_time, version()"
    );
    console.log("⏰ Tiempo actual:", result.rows[0].current_time);
    console.log("🐘 Versión PostgreSQL:", result.rows[0].version);

    // Verificar si existen tablas
    const tables = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `);

    console.log("📋 Tablas existentes:", tables.rows.length);
    if (tables.rows.length > 0) {
      tables.rows.forEach((row) => console.log("  - " + row.tablename));
    } else {
      console.log("  (No hay tablas aún)");
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
