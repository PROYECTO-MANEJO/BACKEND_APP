// Script para probar que el campo carta_motivacion funciona correctamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCartaMotivacion() {
  try {
    console.log('🧪 Iniciando pruebas de carta_motivacion...\n');

    // 1. Verificar estructura de base de datos
    console.log('1. Verificando estructura de base de datos...');
    
    // Verificar tabla Inscripcion (Eventos)
    const sampleInscripcion = await prisma.inscripcion.findFirst({
      select: {
        id_ins: true,
        carta_motivacion: true,
        fec_ins: true,
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        },
        evento: {
          select: {
            nom_eve: true
          }
        }
      }
    });

    if (sampleInscripcion) {
      console.log('✅ Tabla Inscripcion (eventos) - estructura OK');
      console.log('   - Campo carta_motivacion:', sampleInscripcion.carta_motivacion || 'null');
    } else {
      console.log('⚠️  No hay inscripciones de eventos para verificar');
    }

    // Verificar tabla InscripcionCurso
    const sampleInscripcionCurso = await prisma.inscripcionCurso.findFirst({
      select: {
        id_ins_cur: true,
        carta_motivacion: true,
        fec_ins_cur: true,
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        },
        curso: {
          select: {
            nom_cur: true
          }
        }
      }
    });

    if (sampleInscripcionCurso) {
      console.log('✅ Tabla InscripcionCurso - estructura OK');
      console.log('   - Campo carta_motivacion:', sampleInscripcionCurso.carta_motivacion || 'null');
    } else {
      console.log('⚠️  No hay inscripciones de cursos para verificar');
    }

    // 2. Verificar eventos disponibles
    console.log('\n2. Verificando eventos disponibles...');
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        es_gratuito: true,
        precio: true,
        requiere_carta_motivacion: true
      },
      take: 3
    });

    console.log(`   - Total eventos encontrados: ${eventos.length}`);
    eventos.forEach(evento => {
      console.log(`   - ${evento.nom_eve} (${evento.es_gratuito ? 'Gratuito' : `$${evento.precio}`}) - Requiere carta: ${evento.requiere_carta_motivacion}`);
    });

    // 3. Verificar cursos disponibles
    console.log('\n3. Verificando cursos disponibles...');
    const cursos = await prisma.curso.findMany({
      select: {
        id_cur: true,
        nom_cur: true,
        es_gratuito: true,
        precio: true,
        requiere_carta_motivacion: true
      },
      take: 3
    });

    console.log(`   - Total cursos encontrados: ${cursos.length}`);
    cursos.forEach(curso => {
      console.log(`   - ${curso.nom_cur} (${curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}) - Requiere carta: ${curso.requiere_carta_motivacion}`);
    });

    // 4. Verificar usuarios disponibles
    console.log('\n4. Verificando usuarios con documentos verificados...');
    const usuarios = await prisma.usuario.findMany({
      where: {
        documentos_verificados: true
      },
      select: {
        id_usu: true,
        nom_usu1: true,
        ape_usu1: true,
        ced_usu: true,
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      },
      take: 3
    });

    console.log(`   - Total usuarios verificados: ${usuarios.length}`);
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.nom_usu1} ${usuario.ape_usu1} (${usuario.ced_usu}) - Rol: ${usuario.cuentas[0]?.rol_cue}`);
    });

    // 5. Verificar inscripciones con carta de motivación
    console.log('\n5. Verificando inscripciones con carta de motivación...');
    
    const inscripcionesConCarta = await prisma.inscripcion.findMany({
      where: {
        carta_motivacion: {
          not: null
        }
      },
      select: {
        id_ins: true,
        carta_motivacion: true,
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        },
        evento: {
          select: {
            nom_eve: true
          }
        }
      },
      take: 3
    });

    console.log(`   - Inscripciones eventos con carta: ${inscripcionesConCarta.length}`);
    inscripcionesConCarta.forEach(ins => {
      console.log(`   - ${ins.usuario.nom_usu1} -> ${ins.evento.nom_eve}`);
      console.log(`     Carta: "${ins.carta_motivacion?.substring(0, 50)}..."`);
    });

    const inscripcionesCursoConCarta = await prisma.inscripcionCurso.findMany({
      where: {
        carta_motivacion: {
          not: null
        }
      },
      select: {
        id_ins_cur: true,
        carta_motivacion: true,
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        },
        curso: {
          select: {
            nom_cur: true
          }
        }
      },
      take: 3
    });

    console.log(`   - Inscripciones cursos con carta: ${inscripcionesCursoConCarta.length}`);
    inscripcionesCursoConCarta.forEach(ins => {
      console.log(`   - ${ins.usuario.nom_usu1} -> ${ins.curso.nom_cur}`);
      console.log(`     Carta: "${ins.carta_motivacion?.substring(0, 50)}..."`);
    });

    console.log('\n✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testCartaMotivacion();
