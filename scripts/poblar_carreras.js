const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api';

// Configuración de credenciales de administrador
const ADMIN_CREDENTIALS = {
  email: 'master@example.com', // Cambia por el email real del administrador
  password: 'password123' // Cambia por la contraseña real del administrador
};

// Datos de carreras
const carreras = [
  {
    nom_car: 'Ingeniería de Sistemas',
    des_car: 'Carrera enfocada en el desarrollo de software, sistemas de información y tecnologías de la información.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería Civil',
    des_car: 'Carrera dedicada al diseño, construcción y mantenimiento de infraestructura civil.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Medicina',
    des_car: 'Carrera de ciencias de la salud enfocada en el diagnóstico, tratamiento y prevención de enfermedades.',
    nom_fac_per: 'Facultad de Medicina'
  },
  {
    nom_car: 'Administración de Empresas',
    des_car: 'Carrera enfocada en la gestión y dirección de organizaciones empresariales.',
    nom_fac_per: 'Facultad de Ciencias Económicas'
  },
  {
    nom_car: 'Psicología',
    des_car: 'Carrera dedicada al estudio del comportamiento humano y los procesos mentales.',
    nom_fac_per: 'Facultad de Ciencias Sociales'
  },
  {
    nom_car: 'Ingeniería Industrial',
    des_car: 'Carrera enfocada en la optimización de procesos, sistemas y recursos industriales.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Derecho',
    des_car: 'Carrera dedicada al estudio del sistema jurídico y la aplicación de la ley.',
    nom_fac_per: 'Facultad de Derecho'
  },
  {
    nom_car: 'Enfermería',
    des_car: 'Carrera de ciencias de la salud enfocada en el cuidado integral del paciente.',
    nom_fac_per: 'Facultad de Medicina'
  },
  {
    nom_car: 'Arquitectura',
    des_car: 'Carrera dedicada al diseño y planificación de espacios habitables y construcciones.',
    nom_fac_per: 'Facultad de Arquitectura'
  },
  {
    nom_car: 'Comunicación Social',
    des_car: 'Carrera enfocada en los medios de comunicación, periodismo y relaciones públicas.',
    nom_fac_per: 'Facultad de Comunicación'
  }
];

// Función para hacer login como administrador
const loginAdmin = async () => {
  try {
    console.log('🔐 Intentando hacer login como administrador...');
    const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    console.log('✅ Login exitoso como administrador');
    return response.data.token;
  } catch (error) {
    console.error('❌ Error al hacer login:', error.response?.data?.message || error.message);
    console.log('\n💡 Verifica que:');
    console.log('   1. El servidor backend esté ejecutándose');
    console.log('   2. Las credenciales de administrador sean correctas');
    console.log('   3. Exista un usuario con rol MASTER o ADMINISTRADOR');
    return null;
  }
};

// Función para crear carreras
const crearCarreras = async (token) => {
  console.log('\n🎓 Creando carreras...');
  
  for (const carrera of carreras) {
    try {
      const response = await axios.post(`${BASE_URL}/carreras`, carrera, {
        headers: {
          'x-token': token,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Carrera creada: ${carrera.nom_car}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️ Carrera posiblemente ya existe: ${carrera.nom_car}`);
      } else {
        console.error(`❌ Error creando carrera ${carrera.nom_car}:`, error.response?.data?.message || error.message);
      }
    }
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando creación de carreras...');
  console.log('🔗 Conectando a:', BASE_URL);
  
  // Hacer login como administrador
  const token = await loginAdmin();
  if (!token) {
    console.log('\n❌ No se pudo obtener el token de administrador. Proceso cancelado.');
    return;
  }
  
  try {
    await crearCarreras(token);
    
    console.log('\n🎉 ¡Creación de carreras completada!');
    console.log(`\n📊 ${carreras.length} carreras procesadas`);
    
  } catch (error) {
    console.error('\n❌ Error durante la creación:', error.message);
  }
};

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, crearCarreras, loginAdmin };
