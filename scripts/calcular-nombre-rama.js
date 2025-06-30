const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para calcular el nombre de rama que usaría la app
 * Uso: node scripts/calcular-nombre-rama.js [id_solicitud] [tipo_repo]
 */

// Función para mapear tipo de solicitud a prefijo de rama
function mapTipoSolicitud(tipo) {
    const tipos = {
        'NUEVA_FUNCIONALIDAD': 'feature',
        'MEJORA_EXISTENTE': 'feature',
        'CORRECCION_ERROR': 'bugfix',
        'CAMBIO_INTERFAZ': 'feature',
        'OPTIMIZACION': 'feature',
        'ACTUALIZACION_DATOS': 'feature',
        'CAMBIO_SEGURIDAD': 'hotfix',
        'MIGRACION_DATOS': 'feature',
        'INTEGRACION_EXTERNA': 'feature',
        'OTRO': 'feature'
    };
    return tipos[tipo] || 'feature';
}

// Función para generar nombre de rama
function generateBranchName(solicitud, repoType) {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const tipo = mapTipoSolicitud(solicitud.tipo_cambio_sol);
    const solicitudId = solicitud.id_sol.slice(-8); // Últimos 8 caracteres del UUID
    return `${tipo}/SOL-${solicitudId}_${repoType.toLowerCase()}_${timestamp}`;
}

// Función principal
async function calcularNombreRama() {
    try {
        // Obtener argumentos de línea de comandos
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            console.log('📋 USO DEL SCRIPT:');
            console.log('node scripts/calcular-nombre-rama.js [id_solicitud] [tipo_repo]');
            console.log('');
            console.log('📌 EJEMPLOS:');
            console.log('node scripts/calcular-nombre-rama.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 frontend');
            console.log('node scripts/calcular-nombre-rama.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 backend');
            console.log('');
            console.log('📌 TIPOS DE REPO: frontend, backend');
            console.log('');
            
            // Mostrar solicitudes disponibles
            console.log('📋 SOLICITUDES DISPONIBLES:');
            const solicitudes = await prisma.solicitudCambio.findMany({
                select: {
                    id_sol: true,
                    titulo_sol: true,
                    tipo_cambio_sol: true,
                    estado_sol: true
                },
                orderBy: {
                    fec_creacion_sol: 'desc'
                },
                take: 10
            });
            
            solicitudes.forEach(s => {
                console.log(`• ${s.id_sol} - ${s.titulo_sol} (${s.tipo_cambio_sol}) [${s.estado_sol}]`);
            });
            
            return;
        }

        const [idSolicitud, tipoRepo] = args;

        // Validar tipo de repo
        if (!['frontend', 'backend'].includes(tipoRepo?.toLowerCase())) {
            console.error('❌ Error: Tipo de repositorio debe ser "frontend" o "backend"');
            return;
        }

        // Buscar la solicitud
        const solicitud = await prisma.solicitudCambio.findUnique({
            where: { id_sol: idSolicitud }
        });

        if (!solicitud) {
            console.error(`❌ Error: No se encontró solicitud con ID: ${idSolicitud}`);
            return;
        }

        // Generar nombre de rama
        const nombreRama = generateBranchName(solicitud, tipoRepo);

        // Mostrar resultados
        console.log('');
        console.log('🎯 RESULTADO:');
        console.log('═══════════════════════════════════════════════');
        console.log(`📋 Solicitud: ${solicitud.titulo_sol}`);
        console.log(`🔖 ID: ${solicitud.id_sol}`);
        console.log(`📝 Tipo: ${solicitud.tipo_cambio_sol}`);
        console.log(`📁 Repositorio: ${tipoRepo.toUpperCase()}`);
        console.log('');
        console.log(`🌿 NOMBRE DE RAMA:`);
        console.log(`   ${nombreRama}`);
        console.log('');
        console.log('📋 COMANDOS PARA TU COMPAÑERO:');
        console.log('═══════════════════════════════════════════════');
        console.log(`git branch -m su-rama-actual ${nombreRama}`);
        console.log(`git push origin ${nombreRama}`);
        console.log(`git branch --set-upstream-to=origin/${nombreRama}`);
        console.log('');
        console.log('💾 Para registrar en BD, usa:');
        console.log(`node scripts/registrar-rama-bd.js ${idSolicitud} ${tipoRepo} "${nombreRama}"`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    calcularNombreRama();
}

module.exports = { generateBranchName, mapTipoSolicitud }; 