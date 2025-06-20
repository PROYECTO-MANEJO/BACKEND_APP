// index.js
const express = require('express');
const cors = require('cors');
// Cargar variables de entorno
require('dotenv').config(); // Asegúrate de que esto no esté cargando un .env local en Render

console.log('🔍 Variables de entorno cargadas:');
console.log('SECRET_KEY existe:', !!process.env.SECRET_KEY);
console.log('PORT:', process.env.PORT);
// Añade esta línea para ver si FRONTEND_URL se carga
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);


const app = express();

// Importar configuración de la base de datos PostgreSQL
const db = require('./database/config');

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());

// ***************************************************************
// *** CAMBIO CLAVE AQUÍ: Configuración de CORS ***
// ***************************************************************

// Define los orígenes permitidos
const allowedOrigins = [
  'https://frontend-rkqe3156f-adrianmora8s-projects.vercel.app', // <-- ¡TU URL EXACTA DE VERCEL AQUÍ!
  'http://localhost:5173', // Para desarrollo local de tu frontend con Vite
  'http://localhost:3000'  // Si tu frontend corre en 3000 en desarrollo (ej. Create React App)
  // Si tienes otras URLs de desarrollo o staging, añádelas aquí
];

// Opcional: Usar una variable de entorno para el origen del frontend en producción
// const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000']; // Para desarrollo
// Si usas múltiples, puedes hacer:
// const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');


const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones sin origen (ej., Postman, CURL, o solicitudes internas de Render)
    if (!origin) return callback(null, true);

    // Si el origen de la petición está en nuestra lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `La política CORS para este sitio no permite acceso desde el origen especificado: ${origin}`;
      console.error(msg); // Esto aparecerá en los logs de Render si hay un error de CORS
      callback(new Error(msg), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Asegúrate de que todos los métodos HTTP que usas estén aquí
  credentials: true, // Si usas cookies o tokens de autorización personalizados (como 'x-token')
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
};

app.use(cors(corsOptions));

// ***************************************************************
// *** FIN DEL CAMBIO DE CORS ***
// ***************************************************************


// Configurar rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/solicitudes-cambio', require('./routes/solicitudesCambio'));
app.use('/api/recovery', require('./routes/passwordRecoveryRoutes'));
app.use('/api/organizadores', require('./routes/organizadores'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/cursos', require('./routes/cursos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/carreras', require('./routes/carreras'));
app.use('/api/inscripciones', require('./routes/inscripciones'));
app.use('/api/eventosPorCarrera', require('./routes/eventosPorCarrera'));
app.use('/api/cursosPorCarrera', require('./routes/cursoPorCarrera'));
app.use('/api/inscripcionesCursos', require('./routes/inscripcionesCursos'));


app.use('/api/admin/inscripciones', require('./routes/inscripciones'));
app.use('/api/admin/inscripciones', require('./routes/inscripcionesCursos'));
app.use('/api/administracion', require('./routes/administracion'));

app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/certificados', require('./routes/certificados'));

app.use('/api/verification', require('./routes/verificationRoutes')); // Ruta para verificación de cuenta


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
      console.log(process.env.SMTP_HOST);
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