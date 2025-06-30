const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para registrar una rama existente en la base de datos
 * Uso: node scripts/registrar-rama-bd.js [id_solicitud] [tipo_repo] [nombre_rama]
 */

async function registrarRamaEnBD() {
    try {
        // Obtener argumentos de línea de comandos
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            console.log('📋 USO DEL SCRIPT:');
            console.log('node scripts/registrar-rama-bd.js [id_solicitud] [tipo_repo] [nombre_rama]');
            console.log('');
            console.log('📌 EJEMPLOS:');
            console.log('node scripts/registrar-rama-bd.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 frontend "feature/SOL-67890_frontend_20250629154530"');
            console.log('node scripts/registrar-rama-bd.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 backend "feature/SOL-67890_backend_20250629154530"');
            console.log('');
            console.log('📌 TIPOS DE REPO: frontend, backend');
            console.log('📌 NOMBRE DE RAMA: Debe estar entre comillas si contiene espacios');
            console.log('');
            
            // Mostrar solicitudes disponibles
            console.log('📋 SOLICITUDES DISPONIBLES:');
            const solicitudes = await prisma.solicitudCambio.findMany({
                select: {
                    id_sol: true,
                    titulo_sol: true,
                    estado_sol: true
                },
                orderBy: {
                    fec_creacion_sol: 'desc'
                },
                take: 10
            });
            
            solicitudes.forEach(s => {
                console.log(`• ${s.id_sol} - ${s.titulo_sol} [${s.estado_sol}]`);
            });
            
            return;
        }

        if (args.length < 3) {
            console.error('❌ Error: Faltan argumentos');
            console.log('Uso: node scripts/registrar-rama-bd.js [id_solicitud] [tipo_repo] [nombre_rama]');
            return;
        }

        const [idSolicitud, tipoRepo, nombreRama] = args;

        // Validar tipo de repo
        if (!['frontend', 'backend'].includes(tipoRepo?.toLowerCase())) {
            console.error('❌ Error: Tipo de repositorio debe ser "frontend" o "backend"');
            return;
        }

        // Verificar que la solicitud existe
        const solicitud = await prisma.solicitudCambio.findUnique({
            where: { id_sol: idSolicitud }
        });

        if (!solicitud) {
            console.error(`❌ Error: No se encontró solicitud con ID: ${idSolicitud}`);
            return;
        }

        // Verificar si ya existe una rama para este repositorio
        const ramaExistente = await prisma.solicitudRama.findFirst({
            where: {
                id_solicitud: idSolicitud,
                repository_type: tipoRepo.toUpperCase()
            }
        });

        if (ramaExistente) {
            console.log('⚠️  Ya existe una rama para este repositorio:');
            console.log(`   ID: ${ramaExistente.id}`);
            console.log(`   Nombre: ${ramaExistente.branch_name}`);
            console.log(`   Estado: ${ramaExistente.pr_status}`);
            console.log('');
            
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            return new Promise((resolve) => {
                rl.question('¿Deseas reemplazarla? (s/n): ', async (respuesta) => {
                    rl.close();
                    
                    if (respuesta.toLowerCase() === 's' || respuesta.toLowerCase() === 'si') {
                        // Actualizar rama existente
                        const ramaActualizada = await prisma.solicitudRama.update({
                            where: { id: ramaExistente.id },
                            data: {
                                branch_name: nombreRama,
                                updated_at: new Date()
                            }
                        });
                        
                        console.log('');
                        console.log('✅ RAMA ACTUALIZADA EXITOSAMENTE:');
                        console.log('═══════════════════════════════════════════════');
                        console.log(`📋 Solicitud: ${solicitud.titulo_sol}`);
                        console.log(`🔖 ID Solicitud: ${idSolicitud}`);
                        console.log(`📁 Repositorio: ${tipoRepo.toUpperCase()}`);
                        console.log(`🌿 Nombre de rama: ${nombreRama}`);
                        console.log(`📊 Estado: ${ramaActualizada.pr_status}`);
                        console.log(`🕒 Actualizada: ${ramaActualizada.updated_at}`);
                        
                    } else {
                        console.log('❌ Operación cancelada');
                    }
                    resolve();
                });
            });
        }

        // Crear nueva rama en BD
        const nuevaRama = await prisma.solicitudRama.create({
            data: {
                id_solicitud: idSolicitud,
                repository_type: tipoRepo.toUpperCase(),
                branch_name: nombreRama,
                pr_status: 'PENDING',
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        // Actualizar estado de solicitud si es necesario
        if (solicitud.estado_sol === 'APROBADA') {
            await prisma.solicitudCambio.update({
                where: { id_sol: idSolicitud },
                data: { 
                    estado_sol: 'EN_DESARROLLO',
                    fec_ultima_actualizacion: new Date()
                }
            });
            console.log('📈 Estado de solicitud actualizado a EN_DESARROLLO');
        }

        // Mostrar resultados
        console.log('');
        console.log('✅ RAMA REGISTRADA EXITOSAMENTE:');
        console.log('═══════════════════════════════════════════════');
        console.log(`📋 Solicitud: ${solicitud.titulo_sol}`);
        console.log(`🔖 ID Solicitud: ${idSolicitud}`);
        console.log(`📁 Repositorio: ${tipoRepo.toUpperCase()}`);
        console.log(`🌿 Nombre de rama: ${nombreRama}`);
        console.log(`📊 Estado: ${nuevaRama.pr_status}`);
        console.log(`🆔 ID en BD: ${nuevaRama.id}`);
        console.log(`🕒 Creada: ${nuevaRama.created_at}`);
        console.log('');
        console.log('🎯 PRÓXIMOS PASOS:');
        console.log('1. Tu compañero debe subir la rama a GitHub con el nombre exacto');
        console.log('2. Desde la app, puede crear el Pull Request');
        console.log('3. El flujo normal continuará desde ahí');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'P2002') {
            console.error('💡 Posible duplicado: Ya existe una rama con estos datos');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Función auxiliar para verificar ramas de una solicitud
async function verificarRamasSolicitud(idSolicitud) {
    try {
        const ramas = await prisma.solicitudRama.findMany({
            where: { id_solicitud: idSolicitud },
            orderBy: { created_at: 'desc' }
        });

        if (ramas.length === 0) {
            console.log('📝 No hay ramas registradas para esta solicitud');
            return;
        }

        console.log('📋 RAMAS EXISTENTES:');
        console.log('═══════════════════════════════════════════════');
        ramas.forEach((rama, index) => {
            console.log(`${index + 1}. ${rama.repository_type}:`);
            console.log(`   🌿 ${rama.branch_name}`);
            console.log(`   📊 Estado: ${rama.pr_status}`);
            console.log(`   🕒 Creada: ${rama.created_at}`);
            if (rama.pr_number) {
                console.log(`   🔗 PR #${rama.pr_number}: ${rama.pr_url}`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error verificando ramas:', error.message);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    registrarRamaEnBD();
}

module.exports = { registrarRamaEnBD, verificarRamasSolicitud }; 