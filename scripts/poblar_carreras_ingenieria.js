const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api';

// Datos de carreras específicas para ingeniería en software, TI y áreas relacionadas
const carrerasIngenieria = [
  {
    nom_car: 'Ingeniería de Software',
    des_car: 'Carrera especializada en el desarrollo de software, metodologías ágiles, arquitectura de sistemas y gestión de proyectos de software.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Sistemas de Información',
    des_car: 'Carrera enfocada en el análisis, diseño e implementación de sistemas de información empresariales y tecnologías de la información.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Tecnologías de la Información',
    des_car: 'Carrera especializada en infraestructura tecnológica, redes, ciberseguridad, administración de sistemas y tecnologías emergentes.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería Industrial',
    des_car: 'Carrera dedicada a la optimización de procesos productivos, gestión de operaciones, mejora continua y sistemas de calidad.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería Mecánica',
    des_car: 'Carrera enfocada en el diseño, manufactura y mantenimiento de sistemas mecánicos, termomecánica y automatización industrial.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Computación',
    des_car: 'Carrera que combina hardware y software, sistemas embebidos, arquitectura de computadores y desarrollo de sistemas computacionales.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Automatización Industrial',
    des_car: 'Carrera especializada en control automático de procesos, robótica industrial, sistemas SCADA y Internet de las Cosas (IoT).',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería Electrónica',
    des_car: 'Carrera enfocada en sistemas electrónicos, telecomunicaciones, microcontroladores y dispositivos semiconductores.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Ciencias de Datos',
    des_car: 'Carrera moderna enfocada en análisis de big data, machine learning, inteligencia artificial y estadística aplicada.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Ciberseguridad',
    des_car: 'Carrera especializada en seguridad informática, protección de datos, ethical hacking y gestión de riesgos tecnológicos.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería Mecatrónica',
    des_car: 'Carrera multidisciplinaria que integra mecánica, electrónica, control automático y sistemas computacionales.',
    nom_fac_per: 'Facultad de Ingeniería'
  },
  {
    nom_car: 'Ingeniería en Redes y Comunicaciones',
    des_car: 'Carrera especializada en infraestructura de redes, protocolos de comunicación, telecomunicaciones y tecnologías de conectividad.',
    nom_fac_per: 'Facultad de Ingeniería'
  }
];

// Configuración de credenciales de administrador (editar según sea necesario)
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com', // Cambiar por el email real del administrador
  password: 'admin123' // Cambiar por la contraseña real del administrador
};

// Función para intentar login como administrador
const intentarLoginAdmin = async () => {
  try {
    console.log('🔐 Intentando hacer login como administrador...');
    const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    console.log('✅ Login exitoso como administrador');
    return response.data.token;
  } catch (error) {
    console.log('❌ No se pudo hacer login como administrador');
    console.log('💡 Esto puede ser normal si no tienes credenciales configuradas');
    return null;
  }
};

// Función para crear carreras sin autenticación (intentar primero)
const crearCarrerasSinAuth = async () => {
  console.log('🔓 Intentando crear carreras sin autenticación...');
  
  let exitosas = 0;
  let fallidas = 0;
  
  for (const carrera of carrerasIngenieria) {
    try {
      const response = await axios.post(`${BASE_URL}/carreras`, carrera);
      console.log(`✅ Carrera creada: ${carrera.nom_car}`);
      exitosas++;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`🔒 ${carrera.nom_car}: Requiere autenticación`);
        fallidas++;
      } else if (error.response?.status === 400) {
        console.log(`⚠️ ${carrera.nom_car}: Posiblemente ya existe`);
        exitosas++; // Contar como exitosa si ya existe
      } else {
        console.log(`❌ ${carrera.nom_car}: Error ${error.response?.status || 'desconocido'}`);
        fallidas++;
      }
    }
  }
  
  return { exitosas, fallidas };
};

// Función para crear carreras con autenticación
const crearCarrerasConAuth = async (token) => {
  console.log('\n🔐 Creando carreras con autenticación...');
  
  let exitosas = 0;
  let fallidas = 0;
  
  for (const carrera of carrerasIngenieria) {
    try {
      const response = await axios.post(`${BASE_URL}/carreras`, carrera, {
        headers: {
          'x-token': token,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Carrera creada: ${carrera.nom_car}`);
      exitosas++;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️ ${carrera.nom_car}: Posiblemente ya existe`);
        exitosas++; // Contar como exitosa si ya existe
      } else {
        console.log(`❌ ${carrera.nom_car}: Error ${error.response?.status || 'desconocido'}`);
        fallidas++;
      }
    }
  }
  
  return { exitosas, fallidas };
};

// Función principal
const main = async () => {
  console.log('🚀 Creando carreras de Ingeniería en Software y TI');
  console.log('🔗 Conectando a:', BASE_URL);
  console.log(`📊 Total de carreras a crear: ${carrerasIngenieria.length}\n`);
  
  // Listar las carreras que se van a crear
  console.log('📋 Carreras de ingeniería a crear:');
  carrerasIngenieria.forEach((carrera, index) => {
    console.log(`   ${index + 1}. ${carrera.nom_car}`);
  });
  
  try {
    // Paso 1: Intentar crear sin autenticación
    console.log('\n📝 PASO 1: Intentando crear carreras sin autenticación...');
    const resultado1 = await crearCarrerasSinAuth();
    
    if (resultado1.fallidas > 0) {
      console.log(`\n🔑 ${resultado1.fallidas} carreras requieren autenticación. Intentando con login...`);
      
      // Paso 2: Intentar login y crear con autenticación
      const token = await intentarLoginAdmin();
      
      if (token) {
        const resultado2 = await crearCarrerasConAuth(token);
        console.log('\n🎉 ¡Proceso completado con autenticación!');
        console.log(`✅ Total exitosas: ${resultado1.exitosas + resultado2.exitosas}`);
        console.log(`❌ Total fallidas: ${resultado2.fallidas}`);
      } else {
        console.log('\n⚙️ CONFIGURACIÓN REQUERIDA:');
        console.log('Para crear todas las carreras, necesitas configurar las credenciales de administrador:');
        console.log('\n1. Edita este archivo (poblar_carreras_ingenieria.js)');
        console.log('2. Actualiza las credenciales en ADMIN_CREDENTIALS:');
        console.log('   email: "tu_email_admin@dominio.com"');
        console.log('   password: "tu_contraseña_admin"');
        console.log('3. Vuelve a ejecutar el script');
        console.log(`\n📊 Resumen actual:`);
        console.log(`   ✅ Carreras creadas: ${resultado1.exitosas}`);
        console.log(`   ⏳ Pendientes (requieren auth): ${resultado1.fallidas}`);
      }
    } else {
      console.log('\n🎉 ¡Todas las carreras fueron creadas exitosamente!');
      console.log(`✅ Total de carreras creadas: ${resultado1.exitosas}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
  }
};

// Función para mostrar ayuda sobre configuración
const mostrarAyuda = () => {
  console.log('📖 AYUDA - Configuración de Credenciales\n');
  console.log('Para usar este script con autenticación completa:');
  console.log('\n1. 🔍 Encuentra un usuario administrador en tu sistema');
  console.log('2. ✏️ Edita las credenciales en este archivo:');
  console.log('   - Busca la sección ADMIN_CREDENTIALS');
  console.log('   - Actualiza email y password');
  console.log('3. 🚀 Ejecuta el script nuevamente');
  console.log('\n🔧 Verificación del servidor:');
  console.log('   node scripts/verificar_servidor.js');
  console.log('\n🏃 Ejecutar este script:');
  console.log('   node scripts/poblar_carreras_ingenieria.js');
};

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  mostrarAyuda();
  process.exit(0);
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  main, 
  crearCarrerasSinAuth, 
  crearCarrerasConAuth, 
  intentarLoginAdmin,
  carrerasIngenieria 
};
