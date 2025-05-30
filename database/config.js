const { Client } = require('pg');

// Crear un cliente único de conexión en lugar de un pool
let client;

// Inicializar la conexión
const initConnection = async () => {
  try {
    // Crear un cliente de conexión única y persistente
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

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
    throw new Error('La conexión a la base de datos no está inicializada');
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
