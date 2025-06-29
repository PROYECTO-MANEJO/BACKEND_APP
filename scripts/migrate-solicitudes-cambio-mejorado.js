const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function migrateSolicitudesCambio() {
  console.log('🚀 Iniciando migración de Solicitudes de Cambio Mejorado...');

  try {
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');

    // Esta migración se aplicará a través de Prisma Migrate
    // Este script servirá para verificar que todo funcione después de la migración
    
    console.log('📊 Verificando estructura actual...');
    
    const solicitudesCount = await prisma.solicitudCambio.count();
    console.log(`📋 Solicitudes existentes: ${solicitudesCount}`);

    if (solicitudesCount > 0) {
      console.log('📝 Verificando solicitudes existentes...');
      
      const primerasSolicitudes = await prisma.solicitudCambio.findMany({
        take: 3,
        select: {
          id_sol: true,
          titulo_sol: true,
          estado_sol: true,
          tipo_cambio_sol: true,
          fec_creacion_sol: true
        }
      });

      console.log('📋 Primeras solicitudes:');
      primerasSolicitudes.forEach((sol, index) => {
        console.log(`  ${index + 1}. ${sol.titulo_sol} - Estado: ${sol.estado_sol}`);
      });
    }

    console.log('✅ Migración completada exitosamente');
    console.log('');
    console.log('📌 NUEVOS CAMPOS DISPONIBLES:');
    console.log('   👤 Campos del Solicitante:');
    console.log('      - impacto_negocio_sol');
    console.log('      - urgencia_sol');
    console.log('      - beneficios_esperados_sol');
    console.log('      - recursos_necesarios_sol');
    console.log('      - fecha_limite_deseada');
    console.log('      - usuarios_afectados_sol');
    console.log('');
    console.log('   🔧 Campos del Administrador:');
    console.log('      - riesgo_cambio');
    console.log('      - categoria_cambio');
    console.log('      - plan_implementacion');
    console.log('      - plan_rollback');
    console.log('      - plan_testing');
    console.log('      - fechas de planificación');
    console.log('      - ventanas de mantenimiento');
    console.log('      - aprobaciones adicionales');
    console.log('      - métricas y resultados');
    console.log('');
    console.log('📋 NUEVOS ESTADOS DISPONIBLES:');
    console.log('   - PENDIENTE_APROBACION_TECNICA');
    console.log('   - PENDIENTE_APROBACION_NEGOCIO');
    console.log('   - EN_TESTING');
    console.log('   - EN_DESPLIEGUE');
    console.log('   - FALLIDA');
    console.log('   - CANCELADA');
    console.log('   - EN_PAUSA');
    console.log('   - ESPERANDO_INFORMACION');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para actualizar solicitudes existentes con valores por defecto
async function actualizarSolicitudesExistentes() {
  console.log('🔄 Actualizando solicitudes existentes con valores por defecto...');

  try {
    const resultado = await prisma.solicitudCambio.updateMany({
      where: {
        urgencia_sol: null
      },
      data: {
        urgencia_sol: 'NORMAL',
        riesgo_cambio: 'BAJO',
        categoria_cambio: 'NORMAL',
        fec_ultima_actualizacion: new Date(),
        numero_revision: 1
      }
    });

    console.log(`✅ Actualizadas ${resultado.count} solicitudes existentes`);
  } catch (error) {
    console.error('❌ Error actualizando solicitudes existentes:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateSolicitudesCambio()
    .then(() => actualizarSolicitudesExistentes())
    .then(() => {
      console.log('🎉 Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateSolicitudesCambio, actualizarSolicitudesExistentes }; 