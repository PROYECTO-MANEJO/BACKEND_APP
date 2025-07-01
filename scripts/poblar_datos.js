const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api';

// Token de administrador (necesario para crear carreras)
// Debes obtener este token haciendo login como administrador
let ADMIN_TOKEN = '';

// Función para hacer login como administrador
const loginAdmin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'master@example.com', // Cambia por el email del administrador
      password: 'password123' // Cambia por la contraseña del administrador
    });
    
    ADMIN_TOKEN = response.data.token;
    console.log('✅ Login exitoso como administrador');
    return true;
  } catch (error) {
    console.error('❌ Error al hacer login:', error.response?.data?.message || error.message);
    return false;
  }
};

// Datos de categorías
const categorias = [
  {
    nom_cat: 'TECNOLOGÍA',
    des_cat: 'Eventos y cursos relacionados con tecnología, programación, desarrollo de software, inteligencia artificial, etc.'
  },
  {
    nom_cat: 'CIENCIAS',
    des_cat: 'Eventos y cursos de ciencias exactas, naturales, física, química, matemáticas, biología, etc.'
  },
  {
    nom_cat: 'INVESTIGACIÓN',
    des_cat: 'Actividades de investigación científica, metodología de investigación, proyectos de investigación.'
  },
  {
    nom_cat: 'DESARROLLO PROFESIONAL',
    des_cat: 'Cursos de desarrollo de habilidades profesionales, liderazgo, gestión de proyectos, comunicación.'
  },
  {
    nom_cat: 'INNOVACIÓN',
    des_cat: 'Eventos sobre innovación, emprendimiento, startups, nuevas tecnologías emergentes.'
  },
  {
    nom_cat: 'EDUCACIÓN',
    des_cat: 'Metodologías educativas, pedagogía, didáctica, tecnología educativa.'
  },
  {
    nom_cat: 'SALUD',
    des_cat: 'Eventos y cursos relacionados con ciencias de la salud, medicina, enfermería, nutrición.'
  },
  {
    nom_cat: 'INGENIERÍA',
    des_cat: 'Actividades específicas de ingeniería civil, mecánica, eléctrica, industrial, sistemas.'
  }
];

// Datos de organizadores
const organizadores = [
  {
    ced_org: '1234567890',
    nom_org1: 'María',
    nom_org2: 'Elena',
    ape_org1: 'González',
    ape_org2: 'Rodríguez',
    tit_aca_org: 'PhD en Ciencias de la Computación'
  },
  {
    ced_org: '0987654321',
    nom_org1: 'Carlos',
    nom_org2: 'Andrés',
    ape_org1: 'Martínez',
    ape_org2: 'López',
    tit_aca_org: 'Magíster en Ingeniería de Software'
  },
  {
    ced_org: '1122334455',
    nom_org1: 'Ana',
    nom_org2: 'Sofía',
    ape_org1: 'Hernández',
    ape_org2: 'Vargas',
    tit_aca_org: 'PhD en Investigación Educativa'
  },
  {
    ced_org: '5566778899',
    nom_org1: 'Roberto',
    nom_org2: null,
    ape_org1: 'Silva',
    ape_org2: 'Montenegro',
    tit_aca_org: 'Especialista en Gestión de Proyectos'
  },
  {
    ced_org: '2233445566',
    nom_org1: 'Diana',
    nom_org2: 'Patricia',
    ape_org1: 'Morales',
    ape_org2: 'Jiménez',
    tit_aca_org: 'Magíster en Innovación y Emprendimiento'
  }
];

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

// Función para crear categorías
const crearCategorias = async () => {
  console.log('\n🏷️ Creando categorías...');
  
  for (const categoria of categorias) {
    try {
      const response = await axios.post(`${BASE_URL}/categorias`, categoria);
      console.log(`✅ Categoría creada: ${categoria.nom_cat}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('ya existe')) {
        console.log(`⚠️ Categoría ya existe: ${categoria.nom_cat}`);
      } else {
        console.error(`❌ Error creando categoría ${categoria.nom_cat}:`, error.response?.data?.message || error.message);
      }
    }
  }
};

// Función para crear organizadores
const crearOrganizadores = async () => {
  console.log('\n👥 Creando organizadores...');
  
  for (const organizador of organizadores) {
    try {
      const response = await axios.post(`${BASE_URL}/organizadores`, organizador);
      console.log(`✅ Organizador creado: ${organizador.nom_org1} ${organizador.ape_org1}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('ya existe')) {
        console.log(`⚠️ Organizador ya existe: ${organizador.nom_org1} ${organizador.ape_org1}`);
      } else {
        console.error(`❌ Error creando organizador ${organizador.nom_org1} ${organizador.ape_org1}:`, error.response?.data?.message || error.message);
      }
    }
  }
};

// Función para crear carreras
const crearCarreras = async () => {
  console.log('\n🎓 Creando carreras...');
  
  for (const carrera of carreras) {
    try {
      const response = await axios.post(`${BASE_URL}/carreras`, carrera, {
        headers: {
          'x-token': ADMIN_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Carrera creada: ${carrera.nom_car}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('ya existe')) {
        console.log(`⚠️ Carrera ya existe: ${carrera.nom_car}`);
      } else {
        console.error(`❌ Error creando carrera ${carrera.nom_car}:`, error.response?.data?.message || error.message);
      }
    }
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando población de datos...');
  console.log('🔗 Conectando a:', BASE_URL);
  
  // Hacer login como administrador
  const loginExitoso = await loginAdmin();
  if (!loginExitoso) {
    console.log('\n❌ No se pudo hacer login. Asegúrate de que:');
    console.log('   1. El servidor backend esté ejecutándose en http://localhost:5000');
    console.log('   2. Exista un usuario administrador con las credenciales correctas');
    console.log('   3. Las credenciales en este script sean correctas');
    return;
  }
  
  try {
    // Crear datos en orden (las categorías y organizadores no requieren autenticación)
    await crearCategorias();
    await crearOrganizadores();
    await crearCarreras();
    
    console.log('\n🎉 ¡Población de datos completada!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`   • ${categorias.length} categorías`);
    console.log(`   • ${organizadores.length} organizadores`);
    console.log(`   • ${carreras.length} carreras`);
    
  } catch (error) {
    console.error('\n❌ Error durante la población:', error.message);
  }
};

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, crearCategorias, crearOrganizadores, crearCarreras };
