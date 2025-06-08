// index.js
const express = require('express');
const cors = require('cors');
// Cargar variables de entorno
require('dotenv').config();

console.log('🔍 Variables de entorno cargadas:');
console.log('SECRET_JWT_SEED existe:', !!process.env.SECRET_JWT_SEED);
console.log('PORT:', process.env.PORT);

const app = express();

// Importar configuración de la base de datos PostgreSQL
const db = require('./database/config');

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());
app.use(cors());

// Configurar rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/solicitudes-cambio', require('./routes/solicitudesCambio'));
app.use('/api/recovery', require('./routes/passwordRecoveryRoutes'));
app.use('/api/organizadores', require('./routes/organizadores'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/cursos', require('./routes/cursos'));
app.use('/api/users', require('./routes/users')); // Nueva ruta
app.use('/api/carreras', require('./routes/carreras')); // Nueva ruta
app.use('/api/inscripciones', require('./routes/inscripciones'));
app.use('/api/eventosPorCarrera', require('./routes/eventosPorCarrera')); // Nueva ruta

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar conexión persistente a PostgreSQL
    const connected = await db.initConnection();
    
    if (connected) {
      console.log('Base de datos PostgreSQL conectada y lista');
    } else {
      console.error('No se pudo establecer la conexión a PostgreSQL');
      console.log('El servidor iniciará de todos modos, pero algunas funciones pueden no estar disponibles');
    }
    
    // Puerto de escucha
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('Servidor conectado y funcionando correctamente');
});

// Iniciar servidor
startServer();

