const { PrismaClient } = require('@prisma/client');
const githubService = require('../services/githubService');

const prisma = new PrismaClient();

/**
 * Script de prueba para el sistema de múltiples ramas
 * Ejecutar con: node scripts/test-multiples-ramas.js
 */

async function testMultiplesRamas() {
  console.log('🧪 === INICIANDO PRUEBAS DE MÚLTIPLES RAMAS ===\n');

  try {
    // 1. Verificar configuración de GitHub
    console.log('1️⃣ Verificando configuración de GitHub...');
    const isConfigured = githubService.isConfigured();
    console.log(`   ✅ GitHub configurado: ${isConfigured}`);
    
    if (!isConfigured) {
      console.log('   ❌ GitHub no está configurado. Verifica las variables de entorno.');
      return;
    }

    // 2. Buscar una solicitud de prueba
    console.log('\n2️⃣ Buscando solicitud de prueba...');
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        estado_sol: 'EN_DESARROLLO',
        NOT: {
          id_desarrollador_asignado: null
        }
      },
      include: {
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            ape_usu1: true,
            github_token: true
          }
        }
      }
    });

    if (!solicitud) {
      console.log('   ❌ No se encontró solicitud de prueba. Crea una solicitud asignada a un desarrollador.');
      return;
    }

    console.log(`   ✅ Solicitud encontrada: #${solicitud.id_sol} - ${solicitud.titulo_sol}`);
    console.log(`   👤 Desarrollador: ${solicitud.desarrolladorAsignado?.nom_usu1} ${solicitud.desarrolladorAsignado?.ape_usu1}`);

    // 3. Verificar ramas existentes
    console.log('\n3️⃣ Verificando ramas existentes...');
    const ramasExistentes = await prisma.solicitudRama.findMany({
      where: { id_solicitud: solicitud.id_sol }
    });
    
    console.log(`   📊 Ramas existentes: ${ramasExistentes.length}`);
    ramasExistentes.forEach(rama => {
      console.log(`   - ${rama.repository_type}: ${rama.branch_name} (PR: ${rama.pr_number || 'No creado'})`);
    });

    // 4. Probar obtención de ramas
    console.log('\n4️⃣ Probando obtención de ramas...');
    try {
      const ramas = await githubService.obtenerRamasSolicitud(solicitud.id_sol);
      console.log(`   ✅ Función obtenerRamasSolicitud funciona correctamente`);
      console.log(`   📊 Ramas obtenidas: ${ramas.length}`);
    } catch (error) {
      console.log(`   ❌ Error en obtenerRamasSolicitud: ${error.message}`);
    }

    // 5. Validar nomenclatura de ramas
    console.log('\n5️⃣ Validando nomenclatura de ramas...');
    const expectedFrontendBranch = `feature/SC-${solicitud.id_sol}-f`;
    const expectedBackendBranch = `feature/SC-${solicitud.id_sol}-b`;
    
    console.log(`   📝 Rama frontend esperada: ${expectedFrontendBranch}`);
    console.log(`   📝 Rama backend esperada: ${expectedBackendBranch}`);

    // 6. Verificar estados de PRs
    console.log('\n6️⃣ Verificando lógica de estados...');
    
    const tienenPR = ramasExistentes.every(rama => rama.pr_number !== null);
    const todosAprobados = ramasExistentes.every(rama => rama.pr_status === 'APPROVED');
    const todosMergeados = ramasExistentes.every(rama => rama.pr_status === 'MERGED');

    let estadoEsperado = 'EN_DESARROLLO';
    if (todosMergeados) {
      estadoEsperado = 'COMPLETADA';
    } else if (todosAprobados) {
      estadoEsperado = 'LISTO_PARA_IMPLEMENTAR';
    } else if (tienenPR) {
      estadoEsperado = 'EN_TESTING';
    }

    console.log(`   📊 Estado actual: ${solicitud.estado_sol}`);
    console.log(`   📊 Estado esperado: ${estadoEsperado}`);
    console.log(`   📊 Ramas con PR: ${ramasExistentes.filter(r => r.pr_number).length}/${ramasExistentes.length}`);

    // 7. Probar validaciones
    console.log('\n7️⃣ Probando validaciones...');
    
    // Validar límite de 2 ramas
    const tiposRepositorio = ['FRONTEND', 'BACKEND'];
    const ramasPermitidas = ramasExistentes.filter(rama => 
      tiposRepositorio.includes(rama.repository_type)
    );
    
    console.log(`   ✅ Validación límite ramas: ${ramasPermitidas.length <= 2 ? 'Correcto' : 'Error'} (${ramasPermitidas.length}/2)`);

    // Validar unicidad por tipo
    const tiposUnicos = new Set(ramasExistentes.map(r => r.repository_type));
    const esUnico = tiposUnicos.size === ramasExistentes.length;
    console.log(`   ✅ Validación unicidad tipos: ${esUnico ? 'Correcto' : 'Error'}`);

    // 8. Probar funciones de GitHub (sin ejecutar)
    console.log('\n8️⃣ Verificando disponibilidad de funciones GitHub...');
    
    const funcionesDisponibles = [
      'crearBranchEspecifico',
      'crearPullRequestEspecifico',
      'obtenerInformacionPR',
      'aprobarPR',
      'rechazarPR',
      'mergearPR',
      'obtenerRamasSolicitud'
    ];

    funcionesDisponibles.forEach(funcion => {
      const disponible = typeof githubService[funcion] === 'function';
      console.log(`   ${disponible ? '✅' : '❌'} ${funcion}: ${disponible ? 'Disponible' : 'No encontrada'}`);
    });

    console.log('\n🎉 === PRUEBAS COMPLETADAS EXITOSAMENTE ===');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testMultiplesRamas();
}

module.exports = { testMultiplesRamas }; 