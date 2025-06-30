// Script para verificar que carta_motivacion se está devolviendo correctamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarCartaMotivacion() {
  try {
    console.log('🔍 VERIFICANDO CARTA_MOTIVACION EN CONSULTAS\n');

    // 1. Verificar estructura de la tabla
    console.log('1. Verificando estructura de tabla Inscripcion...');
    const sampleInscripcion = await prisma.inscripcion.findFirst();
    if (sampleInscripcion) {
      console.log('✅ Campo carta_motivacion presente:', 'carta_motivacion' in sampleInscripcion);
      console.log('   Valor actual:', sampleInscripcion.carta_motivacion || 'null');
    }

    // 2. Simular obtenerMisInscripcionesEvento
    console.log('\n2. Simulando obtenerMisInscripcionesEvento...');
    const usuarioId = await prisma.usuario.findFirst().then(u => u?.id_usu);
    
    if (usuarioId) {
      const inscripciones = await prisma.inscripcion.findMany({
        where: {
          id_usu_ins: usuarioId
        },
        include: {
          evento: {
            select: {
              id_eve: true,
              nom_eve: true,
              des_eve: true,
              fec_ini_eve: true,
              fec_fin_eve: true,
              hor_ini_eve: true,
              hor_fin_eve: true,
              ubi_eve: true,
              tipo_audiencia_eve: true,
              es_gratuito: true,
              precio: true,
              categoria: {
                select: { nom_cat: true }
              }
            }
          }
        },
        orderBy: {
          fec_ins: 'desc'
        }
      });

      console.log(`   Inscripciones encontradas: ${inscripciones.length}`);
      inscripciones.forEach((ins, index) => {
        console.log(`   Inscripción ${index + 1}:`);
        console.log(`   - ID: ${ins.id_ins}`);
        console.log(`   - Evento: ${ins.evento.nom_eve}`);
        console.log(`   - carta_motivacion presente: ${'carta_motivacion' in ins}`);
        console.log(`   - carta_motivacion valor: ${ins.carta_motivacion || 'null'}`);
        console.log(`   - Todos los campos:`, Object.keys(ins));
        console.log('   ---');
      });
    }

    // 3. Simular obtenerDetallesEventoAdmin
    console.log('\n3. Simulando obtenerDetallesEventoAdmin...');
    const eventoId = await prisma.evento.findFirst().then(e => e?.id_eve);
    
    if (eventoId) {
      const inscripciones = await prisma.inscripcion.findMany({
        where: { id_eve_ins: eventoId },
        include: {
          usuario: {
            include: {
              carrera: {
                select: {
                  nom_car: true
                }
              },
              cuentas: {
                select: {
                  cor_cue: true,
                  rol_cue: true
                }
              }
            }
          },
          adminAprobador: {
            select: {
              nom_usu1: true,
              ape_usu1: true,
              cuentas: {
                select: {
                  cor_cue: true
                }
              }
            }
          }
        },
        orderBy: [
          { estado_pago: 'asc' },
          { fec_ins: 'desc' }
        ]
      });

      console.log(`   Inscripciones del evento: ${inscripciones.length}`);
      inscripciones.forEach((ins, index) => {
        console.log(`   Inscripción ${index + 1}:`);
        console.log(`   - Usuario: ${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`);
        console.log(`   - carta_motivacion presente: ${'carta_motivacion' in ins}`);
        console.log(`   - carta_motivacion valor: ${ins.carta_motivacion || 'null'}`);
        
        // Simular el mapeo de administracionController
        const inscripcionFormateada = {
          id_inscripcion: ins.id_ins,
          fecha_inscripcion: ins.fec_ins,
          estado_pago: ins.estado_pago,
          valor: ins.val_ins,
          metodo_pago: ins.met_pag_ins,
          fecha_aprobacion: ins.fec_aprobacion,
          carta_motivacion: ins.carta_motivacion, // ✅ DEBE ESTAR AQUÍ
          tiene_comprobante: !!ins.comprobante_pago_pdf,
          usuario: {
            id: ins.usuario.id_usu,
            cedula: ins.usuario.ced_usu,
            nombre_completo: `${ins.usuario.nom_usu1} ${ins.usuario.nom_usu2 || ''} ${ins.usuario.ape_usu1} ${ins.usuario.ape_usu2}`.trim(),
            email: ins.usuario.cuentas[0]?.cor_cue || 'No disponible',
            telefono: ins.usuario.num_tel_usu,
            carrera: ins.usuario.carrera?.nom_car || 'No especificada',
            rol: ins.usuario.cuentas[0]?.rol_cue || 'USUARIO'
          }
        };

        console.log(`   - Objeto formateado carta_motivacion: ${inscripcionFormateada.carta_motivacion || 'null'}`);
        console.log('   ---');
      });
    }

    // 4. Verificar consulta directa
    console.log('\n4. Consulta directa con SELECT específico...');
    const consultaDirecta = await prisma.inscripcion.findMany({
      select: {
        id_ins: true,
        carta_motivacion: true,
        estado_pago: true,
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
      },
      take: 3
    });

    console.log(`   Consulta con SELECT específico: ${consultaDirecta.length} resultados`);
    consultaDirecta.forEach((ins, index) => {
      console.log(`   Resultado ${index + 1}:`);
      console.log(`   - Usuario: ${ins.usuario.nom_usu1} ${ins.usuario.ape_usu1}`);
      console.log(`   - Evento: ${ins.evento.nom_eve}`);
      console.log(`   - carta_motivacion: "${ins.carta_motivacion || 'null'}"`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verificarCartaMotivacion();
