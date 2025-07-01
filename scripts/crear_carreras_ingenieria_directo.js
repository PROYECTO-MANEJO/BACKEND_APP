const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Función para crear carreras directamente en la base de datos
const crearCarrerasDirectas = async () => {
  console.log('🎓 Creando carreras de ingeniería directamente en la base de datos...\n');
  
  let exitosas = 0;
  let yaExisten = 0;
  let errores = 0;
  
  for (const carrera of carrerasIngenieria) {
    try {
      // Verificar si la carrera ya existe
      const carreraExistente = await prisma.carrera.findFirst({
        where: {
          nom_car: carrera.nom_car
        }
      });
      
      if (carreraExistente) {
        console.log(`⚠️ ${carrera.nom_car}: Ya existe (ID: ${carreraExistente.id_car})`);
        yaExisten++;
        continue;
      }
      
      // Crear la carrera
      const nuevaCarrera = await prisma.carrera.create({
        data: {
          nom_car: carrera.nom_car,
          des_car: carrera.des_car,
          nom_fac_per: carrera.nom_fac_per
        }
      });
      
      console.log(`✅ ${carrera.nom_car}: Creada exitosamente (ID: ${nuevaCarrera.id_car})`);
      exitosas++;
      
    } catch (error) {
      console.error(`❌ Error creando ${carrera.nom_car}:`, error.message);
      errores++;
    }
  }
  
  return { exitosas, yaExisten, errores };
};

// Función para listar todas las carreras existentes
const listarCarreras = async () => {
  try {
    const carreras = await prisma.carrera.findMany({
      orderBy: {
        nom_car: 'asc'
      }
    });
    
    console.log('\n📋 Carreras existentes en la base de datos:');
    if (carreras.length === 0) {
      console.log('   (No hay carreras registradas)');
    } else {
      carreras.forEach((carrera, index) => {
        console.log(`   ${index + 1}. ${carrera.nom_car} (${carrera.nom_fac_per})`);
      });
    }
    
    return carreras;
  } catch (error) {
    console.error('❌ Error al listar carreras:', error.message);
    return [];
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Script de Creación de Carreras de Ingeniería');
  console.log('🔧 Método: Acceso directo a base de datos (sin autenticación HTTP)');
  console.log(`📊 Total de carreras a crear: ${carrerasIngenieria.length}\n`);
  
  try {
    // Mostrar las carreras que se van a crear
    console.log('📝 Carreras de ingeniería a procesar:');
    carrerasIngenieria.forEach((carrera, index) => {
      console.log(`   ${index + 1}. ${carrera.nom_car}`);
    });
    console.log('');
    
    // Crear las carreras
    const resultado = await crearCarrerasDirectas();
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN DEL PROCESO:');
    console.log(`✅ Carreras creadas exitosamente: ${resultado.exitosas}`);
    console.log(`⚠️ Carreras que ya existían: ${resultado.yaExisten}`);
    console.log(`❌ Errores encontrados: ${resultado.errores}`);
    console.log(`📈 Total procesadas: ${resultado.exitosas + resultado.yaExisten + resultado.errores}`);
    
    // Listar todas las carreras
    await listarCarreras();
    
    console.log('\n🎉 ¡Proceso completado!');
    
    if (resultado.exitosas > 0) {
      console.log('\n💡 Las nuevas carreras ya están disponibles para:');
      console.log('   • Asignar a estudiantes');
      console.log('   • Crear eventos específicos por carrera');
      console.log('   • Configurar cursos dirigidos');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

// Función para mostrar ayuda
const mostrarAyuda = () => {
  console.log('📖 AYUDA - Script de Carreras de Ingeniería\n');
  console.log('Este script crea carreras relacionadas con:');
  console.log('• Ingeniería de Software y Desarrollo');
  console.log('• Tecnologías de la Información');
  console.log('• Ingeniería Industrial y Mecánica');
  console.log('• Especialidades modernas (Ciencias de Datos, Ciberseguridad)');
  console.log('\n🚀 Uso:');
  console.log('   node scripts/crear_carreras_ingenieria_directo.js');
  console.log('\n✨ Ventajas:');
  console.log('• No requiere autenticación');
  console.log('• Acceso directo a la base de datos');
  console.log('• Manejo inteligente de duplicados');
  console.log('• Reporte detallado del proceso');
};

// Manejo de argumentos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  mostrarAyuda();
  process.exit(0);
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, crearCarrerasDirectas, listarCarreras, carrerasIngenieria };
