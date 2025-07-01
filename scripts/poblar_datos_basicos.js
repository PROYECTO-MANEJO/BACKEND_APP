const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api';

// Datos de categorías (estos no requieren autenticación)
const categorias = [
  { nom_cat: 'TECNOLOGÍA', des_cat: 'Eventos y cursos relacionados con tecnología, programación, desarrollo de software, inteligencia artificial, etc.' },
  { nom_cat: 'CIENCIAS', des_cat: 'Eventos y cursos de ciencias exactas, naturales, física, química, matemáticas, biología, etc.' },
  { nom_cat: 'INVESTIGACIÓN', des_cat: 'Actividades de investigación científica, metodología de investigación, proyectos de investigación.' },
  { nom_cat: 'DESARROLLO PROFESIONAL', des_cat: 'Cursos de desarrollo de habilidades profesionales, liderazgo, gestión de proyectos, comunicación.' },
  { nom_cat: 'INNOVACIÓN', des_cat: 'Eventos sobre innovación, emprendimiento, startups, nuevas tecnologías emergentes.' },
  { nom_cat: 'EDUCACIÓN', des_cat: 'Metodologías educativas, pedagogía, didáctica, tecnología educativa.' },
  { nom_cat: 'SALUD', des_cat: 'Eventos y cursos relacionados con ciencias de la salud, medicina, enfermería, nutrición.' },
  { nom_cat: 'INGENIERÍA', des_cat: 'Actividades específicas de ingeniería civil, mecánica, eléctrica, industrial, sistemas.' }
];

// Datos de organizadores (estos no requieren autenticación)
const organizadores = [
  { ced_org: '1234567890', nom_org1: 'María', nom_org2: 'Elena', ape_org1: 'González', ape_org2: 'Rodríguez', tit_aca_org: 'PhD en Ciencias de la Computación' },
  { ced_org: '0987654321', nom_org1: 'Carlos', nom_org2: 'Andrés', ape_org1: 'Martínez', ape_org2: 'López', tit_aca_org: 'Magíster en Ingeniería de Software' },
  { ced_org: '1122334455', nom_org1: 'Ana', nom_org2: 'Sofía', ape_org1: 'Hernández', ape_org2: 'Vargas', tit_aca_org: 'PhD en Investigación Educativa' },
  { ced_org: '5566778899', nom_org1: 'Roberto', nom_org2: null, ape_org1: 'Silva', ape_org2: 'Montenegro', tit_aca_org: 'Especialista en Gestión de Proyectos' },
  { ced_org: '2233445566', nom_org1: 'Diana', nom_org2: 'Patricia', ape_org1: 'Morales', ape_org2: 'Jiménez', tit_aca_org: 'Magíster en Innovación y Emprendimiento' }
];

// Función para crear categorías
const crearCategorias = async () => {
  console.log('\n🏷️ Creando categorías...');
  
  for (const categoria of categorias) {
    try {
      await axios.post(`${BASE_URL}/categorias`, categoria);
      console.log(`✅ Categoría creada: ${categoria.nom_cat}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️ Categoría posiblemente ya existe: ${categoria.nom_cat}`);
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
      await axios.post(`${BASE_URL}/organizadores`, organizador);
      console.log(`✅ Organizador creado: ${organizador.nom_org1} ${organizador.ape_org1}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️ Organizador posiblemente ya existe: ${organizador.nom_org1} ${organizador.ape_org1}`);
      } else {
        console.error(`❌ Error creando organizador ${organizador.nom_org1} ${organizador.ape_org1}:`, error.response?.data?.message || error.message);
      }
    }
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando población de datos básicos...');
  console.log('🔗 Conectando a:', BASE_URL);
  
  try {
    await crearCategorias();
    await crearOrganizadores();
    
    console.log('\n🎉 ¡Población de datos básicos completada!');
    console.log('\n📊 Datos creados:');
    console.log(`   • ${categorias.length} categorías`);
    console.log(`   • ${organizadores.length} organizadores`);
    console.log('\n💡 Para crear carreras, necesitas ejecutar el script completo con autenticación de administrador.');
    
  } catch (error) {
    console.error('\n❌ Error durante la población:', error.message);
  }
};

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, crearCategorias, crearOrganizadores };
