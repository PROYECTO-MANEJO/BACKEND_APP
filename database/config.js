const { Client } = require('pg');

// Crear un cliente único de conexión en lugar de un pool
let client;

// Inicializar la conexión
const initConnection = async () => {
  try {
    // Verificar si tenemos DATABASE_URL (para producción) o variables individuales (para desarrollo)
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      // Configuración para producción o desarrollo con DATABASE_URL
      // Verificar si es un entorno local (localhost) para deshabilitar SSL
      const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
      
      client = new Client({
        connectionString: connectionString,
        ssl: isLocal ? false : {
          rejectUnauthorized: false
        }
      });
    } else {
      // Configuración para desarrollo local (usando variables individuales)
      const dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        // No SSL para desarrollo local
        ssl: false
      };

      // Verificar que tengamos las variables necesarias
      if (!dbConfig.user || !dbConfig.host || !dbConfig.database || !dbConfig.password) {
        console.error('❌ Variables de entorno de base de datos faltantes.');
        console.log('Necesitas: DB_USER, DB_HOST, DB_NAME, DB_PASSWORD');
        return false;
      }

      client = new Client(dbConfig);
    }

    // Conectar al iniciar la aplicación
    await client.connect();
    console.log('✅ Conexión persistente a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    return false;
  }
};

// Función para consultas
const query = async (text, params) => {
  if (!client) {
    throw new Error('La conexión a la base de datos no está inicializada. Intenta llamar a initConnection() primero.');
  }
  return client.query(text, params);
};

// Función para cerrar la conexión (solo se usaría al cerrar la aplicación)
const closeConnection = async () => {
  if (client) {
    try {
      await client.end();
      console.log('Conexión a PostgreSQL cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar la conexión a PostgreSQL:', error);
    }
  }
};

// Manejar el cierre de la aplicación para cerrar correctamente la conexión
process.on('SIGINT', async () => {
  console.log('\nCerrando la aplicación...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nAplicación terminada');
  await closeConnection();
  process.exit(0);
});

module.exports = {
  initConnection,
  query,
  closeConnection
};