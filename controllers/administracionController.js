const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// =====================================================
// OBTENER TODOS LOS CURSOS Y EVENTOS ADMINISTRABLES
// =====================================================

/**
 * Obtener todos los cursos y eventos que están activos o se pueden administrar
 * Incluye información básica y estadísticas de inscripciones
 */
const obtenerCursosEventosAdministrables = async (req, res) => {
  try {
    const fechaActual = new Date();
    
    // Obtener eventos que aún no han terminado
    const eventos = await prisma.evento.findMany({
      where: {
        fec_fin_eve: { gte: fechaActual }
      },
      include: {
        categoria: {
          select: {
            nom_cat: true,
            des_cat: true
          }
        },
        organizador: {
          select: {
            nom_org1: true,
            nom_org2: true,
            ape_org1: true,
            ape_org2: true
          }
        },
        _count: {
          select: {
            inscripciones: true
          }
        }
      },
      orderBy: [
        { fec_ini_eve: 'desc' }
      ]
    });

    // Obtener cursos que aún no han terminado
    const cursos = await prisma.curso.findMany({
      where: {
        fec_fin_cur: { gte: fechaActual }
      },
      include: {
        categoria: {
          select: {
            nom_cat: true,
            des_cat: true
          }
        },
        organizador: {
          select: {
            nom_org1: true,
            nom_org2: true,
            ape_org1: true,
            ape_org2: true
          }
        },
        _count: {
          select: {
            inscripcionesCurso: true
          }
        }
      },
      orderBy: [
        { fec_ini_cur: 'desc' }
      ]
    });

    // Obtener estadísticas adicionales para eventos
    const eventosConEstadisticas = await Promise.all(
      eventos.map(async (evento) => {
        const estadisticas = await prisma.inscripcion.groupBy({
          by: ['estado_pago'],
          where: { id_eve_ins: evento.id_eve },
          _count: true
        });

        const stats = {
          total: evento._count.inscripciones,
          aprobadas: 0,
          pendientes: 0,
          rechazadas: 0,
          disponibles: evento.capacidad_max_eve - evento._count.inscripciones
        };

        estadisticas.forEach(stat => {
          switch(stat.estado_pago.toLowerCase()) {
            case 'aprobada':
              stats.aprobadas = stat._count;
              break;
            case 'pendiente':
              stats.pendientes = stat._count;
              break;
            case 'rechazada':
              stats.rechazadas = stat._count;
              break;
          }
        });

        return {
          ...evento,
          tipo: 'EVENTO',
          estadisticas: stats,
          organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
          categoria_nombre: evento.categoria.nom_cat
        };
      })
    );

    // Obtener estadísticas adicionales para cursos
    const cursosConEstadisticas = await Promise.all(
      cursos.map(async (curso) => {
        const estadisticas = await prisma.inscripcionCurso.groupBy({
          by: ['estado_pago_cur'],
          where: { id_cur_ins: curso.id_cur },
          _count: true
        });

        const stats = {
          total: curso._count.inscripcionesCurso,
          aprobadas: 0,
          pendientes: 0,
          rechazadas: 0,
          disponibles: curso.capacidad_max_cur - curso._count.inscripcionesCurso
        };

        estadisticas.forEach(stat => {
          switch(stat.estado_pago_cur.toLowerCase()) {
            case 'aprobado':
              stats.aprobadas = stat._count;
              break;
            case 'pendiente':
              stats.pendientes = stat._count;
              break;
            case 'rechazado':
              stats.rechazadas = stat._count;
              break;
          }
        });

        return {
          ...curso,
          tipo: 'CURSO',
          estadisticas: stats,
          organizador_nombre: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
          categoria_nombre: curso.categoria.nom_cat
        };
      })
    );

    // Combinar y ordenar por fecha de inicio
    const todosLosItems = [...eventosConEstadisticas, ...cursosConEstadisticas]
      .sort((a, b) => {
        const fechaA = a.tipo === 'EVENTO' ? a.fec_ini_eve : a.fec_ini_cur;
        const fechaB = b.tipo === 'EVENTO' ? b.fec_ini_eve : b.fec_ini_cur;
        return new Date(fechaB) - new Date(fechaA);
      });

    return res.status(200).json({
      success: true,
      message: 'Cursos y eventos activos obtenidos exitosamente',
      data: {
        total: todosLosItems.length,
        eventos: eventosConEstadisticas.length,
        cursos: cursosConEstadisticas.length,
        items: todosLosItems
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener cursos y eventos administrables:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// OBTENER DETALLES DE EVENTO CON INSCRIPCIONES
// =====================================================

/**
 * Obtener detalles completos de un evento con todas las inscripciones
 * Incluye comprobantes de pago para eventos pagados
 */
const obtenerDetallesEventoAdmin = async (req, res) => {
  try {
    const { idEvento } = req.params;

    if (!idEvento) {
      return res.status(400).json({
        success: false,
        message: 'ID del evento es obligatorio'
      });
    }

    // Obtener evento con detalles completos
    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento },
      include: {
        categoria: true,
        organizador: true,
        eventosPorCarrera: {
          include: {
            carrera: {
              select: {
                nom_car: true,
                des_car: true
              }
            }
          }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Obtener todas las inscripciones con detalles de usuarios
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_eve_ins: idEvento },
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
        { estado_pago: 'asc' }, // Pendientes primero
        { fec_ins: 'desc' }
      ]
    });

    // Formatear inscripciones con información adicional
    const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
      id_inscripcion: inscripcion.id_ins,
      fecha_inscripcion: inscripcion.fec_ins,
      estado_pago: inscripcion.estado_pago,
      valor: inscripcion.val_ins,
      metodo_pago: inscripcion.met_pag_ins,
      fecha_aprobacion: inscripcion.fec_aprobacion,
      tiene_comprobante: !!inscripcion.comprobante_pago_pdf,
      comprobante_info: inscripcion.comprobante_pago_pdf ? {
        filename: inscripcion.comprobante_filename,
        size: inscripcion.comprobante_size,
        fecha_subida: inscripcion.fec_subida_comprobante
      } : null,
      usuario: {
        id: inscripcion.usuario.id_usu,
        cedula: inscripcion.usuario.ced_usu,
        nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2}`.trim(),
        email: inscripcion.usuario.cuentas[0]?.cor_cue || 'No disponible',
        telefono: inscripcion.usuario.num_tel_usu,
        carrera: inscripcion.usuario.carrera?.nom_car || 'No especificada',
        rol: inscripcion.usuario.cuentas[0]?.rol_cue || 'USUARIO'
      },
      admin_aprobador: inscripcion.adminAprobador ? {
        nombre: `${inscripcion.adminAprobador.nom_usu1} ${inscripcion.adminAprobador.ape_usu1}`,
        email: inscripcion.adminAprobador.cuentas[0]?.cor_cue
      } : null
    }));

    // Estadísticas de inscripciones
    const estadisticas = {
      total: inscripciones.length,
      aprobadas: inscripciones.filter(i => i.estado_pago === 'APROBADO').length,
      pendientes: inscripciones.filter(i => i.estado_pago === 'PENDIENTE').length,
      rechazadas: inscripciones.filter(i => i.estado_pago === 'RECHAZADO').length,
      disponibles: evento.capacidad_max_eve - inscripciones.length,
      con_comprobante: inscripciones.filter(i => i.comprobante_pago_pdf).length
    };

    return res.status(200).json({
      success: true,
      message: 'Detalles del evento obtenidos exitosamente',
      data: {
        evento: {
          ...evento,
          organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
          categoria_nombre: evento.categoria.nom_cat,
          carreras_dirigidas: evento.eventosPorCarrera.map(epc => epc.carrera.nom_car)
        },
        estadisticas,
        inscripciones: inscripcionesFormateadas
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles del evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// OBTENER DETALLES DE CURSO CON INSCRIPCIONES
// =====================================================

/**
 * Obtener detalles completos de un curso con todas las inscripciones
 * Incluye comprobantes de pago para cursos pagados
 */
const obtenerDetallesCursoAdmin = async (req, res) => {
  try {
    const { idCurso } = req.params;

    if (!idCurso) {
      return res.status(400).json({
        success: false,
        message: 'ID del curso es obligatorio'
      });
    }

    // Obtener curso con detalles completos
    const curso = await prisma.curso.findUnique({
      where: { id_cur: idCurso },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: {
              select: {
                nom_car: true,
                des_car: true
              }
            }
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Obtener todas las inscripciones con detalles de usuarios
    const inscripciones = await prisma.inscripcionCurso.findMany({
      where: { id_cur_ins: idCurso },
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
        { estado_pago_cur: 'asc' }, // Pendientes primero
        { fec_ins_cur: 'desc' }
      ]
    });

    // Formatear inscripciones con información adicional
    const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
      id_inscripcion: inscripcion.id_ins_cur,
      fecha_inscripcion: inscripcion.fec_ins_cur,
      estado_pago: inscripcion.estado_pago_cur,
      valor: inscripcion.val_ins_cur,
      metodo_pago: inscripcion.met_pag_ins_cur,
      fecha_aprobacion: inscripcion.fec_aprobacion_cur,
      tiene_comprobante: !!inscripcion.comprobante_pago_pdf,
      comprobante_info: inscripcion.comprobante_pago_pdf ? {
        filename: inscripcion.comprobante_filename,
        size: inscripcion.comprobante_size,
        fecha_subida: inscripcion.fec_subida_comprobante
      } : null,
      usuario: {
        id: inscripcion.usuario.id_usu,
        cedula: inscripcion.usuario.ced_usu,
        nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2}`.trim(),
        email: inscripcion.usuario.cuentas[0]?.cor_cue || 'No disponible',
        telefono: inscripcion.usuario.num_tel_usu,
        carrera: inscripcion.usuario.carrera?.nom_car || 'No especificada',
        rol: inscripcion.usuario.cuentas[0]?.rol_cue || 'USUARIO'
      },
      admin_aprobador: inscripcion.adminAprobador ? {
        nombre: `${inscripcion.adminAprobador.nom_usu1} ${inscripcion.adminAprobador.ape_usu1}`,
        email: inscripcion.adminAprobador.cuentas[0]?.cor_cue
      } : null
    }));

    // Estadísticas de inscripciones
    const estadisticas = {
      total: inscripciones.length,
      aprobadas: inscripciones.filter(i => i.estado_pago_cur === 'APROBADO').length,
      pendientes: inscripciones.filter(i => i.estado_pago_cur === 'PENDIENTE').length,
      rechazadas: inscripciones.filter(i => i.estado_pago_cur === 'RECHAZADO').length,
      disponibles: curso.capacidad_max_cur - inscripciones.length,
      con_comprobante: inscripciones.filter(i => i.comprobante_pago_pdf).length
    };

    return res.status(200).json({
      success: true,
      message: 'Detalles del curso obtenidos exitosamente',
      data: {
        curso: {
          ...curso,
          organizador_nombre: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
          categoria_nombre: curso.categoria.nom_cat,
          carreras_dirigidas: curso.cursosPorCarrera.map(cpc => cpc.carrera.nom_car)
        },
        estadisticas,
        inscripciones: inscripcionesFormateadas
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles del curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// APROBAR INSCRIPCIÓN DE EVENTO
// =====================================================

/**
 * Aprobar una inscripción de evento (solo para eventos pagados)
 */
const aprobarInscripcionEvento = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const adminId = req.uid; // Del middleware de autenticación

    if (!idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción es obligatorio'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: idInscripcion },
      include: {
        evento: {
          select: {
            nom_eve: true,
            es_gratuito: true,
            capacidad_max_eve: true
          }
        },
        usuario: {
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
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que no sea un evento gratuito
    if (inscripcion.evento.es_gratuito) {
      return res.status(400).json({
        success: false,
        message: 'Los eventos gratuitos se aprueban automáticamente'
      });
    }

    // Verificar que esté pendiente
    if (inscripcion.estado_pago !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `La inscripción ya está ${inscripcion.estado_pago.toLowerCase()}`
      });
    }

    // Verificar capacidad disponible
    const inscripcionesAprobadas = await prisma.inscripcion.count({
      where: {
        id_eve_ins: inscripcion.id_eve_ins,
        estado_pago: 'APROBADO'
      }
    });

    if (inscripcionesAprobadas >= inscripcion.evento.capacidad_max_eve) {
      return res.status(400).json({
        success: false,
        message: 'El evento ha alcanzado su capacidad máxima'
      });
    }

    // Aprobar inscripción
    const inscripcionAprobada = await prisma.inscripcion.update({
      where: { id_ins: idInscripcion },
      data: {
        estado_pago: 'APROBADO',
        id_admin_aprobador: adminId,
        fec_aprobacion: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} aprobada exitosamente`,
      data: {
        inscripcion: inscripcionAprobada,
        evento: inscripcion.evento.nom_eve,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`
      }
    });

  } catch (error) {
    console.error('❌ Error al aprobar inscripción de evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// RECHAZAR INSCRIPCIÓN DE EVENTO
// =====================================================

/**
 * Rechazar una inscripción de evento
 */
const rechazarInscripcionEvento = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { motivo } = req.body;
    const adminId = req.uid; // Del middleware de autenticación

    if (!idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción es obligatorio'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: idInscripcion },
      include: {
        evento: {
          select: {
            nom_eve: true,
            es_gratuito: true
          }
        },
        usuario: {
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
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que no sea un evento gratuito
    if (inscripcion.evento.es_gratuito) {
      return res.status(400).json({
        success: false,
        message: 'Los eventos gratuitos se aprueban automáticamente'
      });
    }

    // Verificar que esté pendiente
    if (inscripcion.estado_pago !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `La inscripción ya está ${inscripcion.estado_pago.toLowerCase()}`
      });
    }

    // Rechazar inscripción
    const inscripcionRechazada = await prisma.inscripcion.update({
      where: { id_ins: idInscripcion },
      data: {
        estado_pago: 'RECHAZADO',
        id_admin_aprobador: adminId,
        fec_aprobacion: new Date(),
        // Podríamos agregar un campo para el motivo si fuera necesario
        enl_ord_pag_ins: motivo ? `RECHAZADO: ${motivo}` : 'RECHAZADO'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} rechazada`,
      data: {
        inscripcion: inscripcionRechazada,
        evento: inscripcion.evento.nom_eve,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        motivo: motivo || 'No especificado'
      }
    });

  } catch (error) {
    console.error('❌ Error al rechazar inscripción de evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// APROBAR INSCRIPCIÓN DE CURSO
// =====================================================

/**
 * Aprobar una inscripción de curso (solo para cursos pagados)
 */
const aprobarInscripcionCurso = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const adminId = req.uid; // Del middleware de autenticación

    if (!idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción es obligatorio'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: idInscripcion },
      include: {
        curso: {
          select: {
            nom_cur: true,
            es_gratuito: true,
            capacidad_max_cur: true
          }
        },
        usuario: {
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
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que no sea un curso gratuito
    if (inscripcion.curso.es_gratuito) {
      return res.status(400).json({
        success: false,
        message: 'Los cursos gratuitos se aprueban automáticamente'
      });
    }

    // Verificar que esté pendiente
    if (inscripcion.estado_pago_cur !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `La inscripción ya está ${inscripcion.estado_pago_cur.toLowerCase()}`
      });
    }

    // Verificar capacidad disponible
    const inscripcionesAprobadas = await prisma.inscripcionCurso.count({
      where: {
        id_cur_ins: inscripcion.id_cur_ins,
        estado_pago_cur: 'APROBADO'
      }
    });

    if (inscripcionesAprobadas >= inscripcion.curso.capacidad_max_cur) {
      return res.status(400).json({
        success: false,
        message: 'El curso ha alcanzado su capacidad máxima'
      });
    }

    // Aprobar inscripción
    const inscripcionAprobada = await prisma.inscripcionCurso.update({
      where: { id_ins_cur: idInscripcion },
      data: {
        estado_pago_cur: 'APROBADO',
        id_admin_aprobador_cur: adminId,
        fec_aprobacion_cur: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} aprobada exitosamente`,
      data: {
        inscripcion: inscripcionAprobada,
        curso: inscripcion.curso.nom_cur,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`
      }
    });

  } catch (error) {
    console.error('❌ Error al aprobar inscripción de curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// RECHAZAR INSCRIPCIÓN DE CURSO
// =====================================================

/**
 * Rechazar una inscripción de curso
 */
const rechazarInscripcionCurso = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { motivo } = req.body;
    const adminId = req.uid; // Del middleware de autenticación

    if (!idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción es obligatorio'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: idInscripcion },
      include: {
        curso: {
          select: {
            nom_cur: true,
            es_gratuito: true
          }
        },
        usuario: {
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
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que no sea un curso gratuito
    if (inscripcion.curso.es_gratuito) {
      return res.status(400).json({
        success: false,
        message: 'Los cursos gratuitos se aprueban automáticamente'
      });
    }

    // Verificar que esté pendiente
    if (inscripcion.estado_pago_cur !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `La inscripción ya está ${inscripcion.estado_pago_cur.toLowerCase()}`
      });
    }

    // Rechazar inscripción
    const inscripcionRechazada = await prisma.inscripcionCurso.update({
      where: { id_ins_cur: idInscripcion },
      data: {
        estado_pago_cur: 'RECHAZADO',
        id_admin_aprobador_cur: adminId,
        fec_aprobacion_cur: new Date(),
        // Podríamos agregar un campo para el motivo si fuera necesario
        enl_ord_pag_ins_cur: motivo ? `RECHAZADO: ${motivo}` : 'RECHAZADO'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Inscripción de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} rechazada`,
      data: {
        inscripcion: inscripcionRechazada,
        curso: inscripcion.curso.nom_cur,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        motivo: motivo || 'No especificado'
      }
    });

  } catch (error) {
    console.error('❌ Error al rechazar inscripción de curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// DESCARGAR COMPROBANTE DE PAGO
// =====================================================

/**
 * Descargar comprobante de pago de una inscripción (evento o curso)
 */
const descargarComprobantePago = async (req, res) => {
  try {
    const { tipo, idInscripcion } = req.params;

    // Validar tipo
    if (!['evento', 'curso'].includes(tipo)) {
      res.status(400);
      return res.send('Error: Tipo debe ser "evento" o "curso"');
    }

    // Validar ID
    if (!idInscripcion) {
      res.status(400);
      return res.send('Error: ID de inscripción es obligatorio');
    }

    let inscripcion;

    // Obtener inscripción según el tipo
    if (tipo === 'evento') {
      inscripcion = await prisma.inscripcion.findUnique({
        where: { id_ins: idInscripcion },
        select: {
          comprobante_pago_pdf: true,
          comprobante_filename: true,
          comprobante_size: true,
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });
    } else {
      inscripcion = await prisma.inscripcionCurso.findUnique({
        where: { id_ins_cur: idInscripcion },
        select: {
          comprobante_pago_pdf: true,
          comprobante_filename: true,
          comprobante_size: true,
          usuario: {
            select: {
              nom_usu1: true,
              ape_usu1: true
            }
          }
        }
      });
    }

    // Verificar que existe la inscripción
    if (!inscripcion) {
      res.status(404);
      return res.send('Error: Inscripción no encontrada');
    }

    // Verificar que existe el comprobante
    if (!inscripcion.comprobante_pago_pdf) {
      res.status(404);
      return res.send('Error: No hay comprobante de pago disponible para esta inscripción');
    }

    // Verificar que el comprobante tiene datos
    console.log('🔍 Debugging comprobante:');
    console.log('- Tipo de dato:', typeof inscripcion.comprobante_pago_pdf);
    console.log('- Es Buffer:', Buffer.isBuffer(inscripcion.comprobante_pago_pdf));
    console.log('- Longitud:', inscripcion.comprobante_pago_pdf ? inscripcion.comprobante_pago_pdf.length : 'null');
    console.log('- Primeros bytes:', inscripcion.comprobante_pago_pdf ? inscripcion.comprobante_pago_pdf.slice(0, 10) : 'null');

    if (!inscripcion.comprobante_pago_pdf) {
      res.status(500);
      return res.send('Error: El comprobante_pago_pdf es null o undefined');
    }

    if (inscripcion.comprobante_pago_pdf.length === 0) {
      res.status(500);
      return res.send('Error: El archivo del comprobante tiene longitud 0');
    }

    // Convertir a Buffer si no lo es (puede venir como Uint8Array de Prisma)
    let bufferComprobante;
    if (Buffer.isBuffer(inscripcion.comprobante_pago_pdf)) {
      bufferComprobante = inscripcion.comprobante_pago_pdf;
    } else if (inscripcion.comprobante_pago_pdf instanceof Uint8Array) {
      bufferComprobante = Buffer.from(inscripcion.comprobante_pago_pdf);
      console.log('✅ Convertido de Uint8Array a Buffer');
    } else {
      res.status(500);
      return res.send(`Error: Tipo de dato no soportado: ${typeof inscripcion.comprobante_pago_pdf}`);
    }

    // Generar nombre de archivo si no existe
    const filename = inscripcion.comprobante_filename || 
                    `comprobante_${inscripcion.usuario.nom_usu1}_${inscripcion.usuario.ape_usu1}_${tipo}.pdf`;

    // Log para debugging
    console.log(`📄 Descargando comprobante: ${filename}, Tamaño: ${bufferComprobante.length} bytes`);

    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', bufferComprobante.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Enviar el archivo binario
    return res.end(bufferComprobante);

  } catch (error) {
    console.error('❌ Error al descargar comprobante:', error);
    
    // Si ya se enviaron headers, no podemos enviar JSON
    if (res.headersSent) {
      return res.end();
    }
    
    res.status(500);
    return res.send(`Error interno del servidor: ${error.message}`);
  }
};

// =====================================================
// GESTIÓN DE CALIFICACIONES Y ASISTENCIA
// =====================================================

/**
 * Registrar participación en evento (solo asistencia)
 */
const registrarParticipacionEvento = async (req, res) => {
  try {
    const { idEvento } = req.params;
    const { inscripcion_id, asistencia_porcentaje } = req.body;

    // Validar datos requeridos
    if (!inscripcion_id || asistencia_porcentaje === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción y porcentaje de asistencia son obligatorios'
      });
    }

    // Validar porcentaje de asistencia
    const asistencia = parseInt(asistencia_porcentaje);
    if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de asistencia debe ser un número entre 0 y 100'
      });
    }

    // Verificar que la inscripción existe y pertenece al evento
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        id_ins: inscripcion_id,
        id_eve_ins: idEvento
      },
      include: {
        evento: {
          select: {
            nom_eve: true,
            es_gratuito: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        }
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que el usuario está aprobado (si no es gratuito)
    if (!inscripcion.evento.es_gratuito && inscripcion.estado_pago !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede registrar asistencia de usuarios con pago aprobado'
      });
    }

    // Calcular aprobación automáticamente (70% mínimo para aprobar)
    const aprobado = asistencia >= 70;

    // Buscar si ya existe un registro de participación
    let participacion = await prisma.participacion.findFirst({
      where: {
        id_ins_per: inscripcion_id
      }
    });

    if (participacion) {
      // Actualizar registro existente
      participacion = await prisma.participacion.update({
        where: { id_par: participacion.id_par },
        data: {
          asi_par: asistencia,
          aprobado: aprobado,
          fec_evaluacion: new Date()
        }
      });
    } else {
      // Crear nuevo registro
      participacion = await prisma.participacion.create({
        data: {
          id_ins_per: inscripcion_id,
          asi_par: asistencia,
          aprobado: aprobado,
          fec_evaluacion: new Date()
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Participación de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} registrada exitosamente`,
      data: {
        participacion,
        evento: inscripcion.evento.nom_eve,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        asistencia_porcentaje: asistencia,
        aprobado: aprobado,
        estado: aprobado ? 'APROBADO' : 'REPROBADO'
      }
    });

  } catch (error) {
    console.error('❌ Error al registrar participación en evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registrar participación en curso (asistencia y calificación)
 */
const registrarParticipacionCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const { inscripcion_id, asistencia_porcentaje, nota_final } = req.body;

    // Validar datos requeridos
    if (!inscripcion_id || asistencia_porcentaje === undefined || nota_final === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción, porcentaje de asistencia y nota final son obligatorios'
      });
    }

    // Validar porcentaje de asistencia
    const asistencia = parseFloat(asistencia_porcentaje);
    if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de asistencia debe ser un número entre 0 y 100'
      });
    }

    // Validar nota final
    const nota = parseFloat(nota_final);
    if (isNaN(nota) || nota < 0 || nota > 100) {
      return res.status(400).json({
        success: false,
        message: 'La nota final debe ser un número entre 0 y 100'
      });
    }

    // Verificar que la inscripción existe y pertenece al curso
    const inscripcion = await prisma.inscripcionCurso.findFirst({
      where: {
        id_ins_cur: inscripcion_id,
        id_cur_ins: idCurso
      },
      include: {
        curso: {
          select: {
            nom_cur: true,
            es_gratuito: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        }
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que el usuario está aprobado (si no es gratuito)
    if (!inscripcion.curso.es_gratuito && inscripcion.estado_pago_cur !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede registrar calificación de usuarios con pago aprobado'
      });
    }

    // Calcular aprobación automáticamente (nota >= 70 && asistencia >= 70%)
    const aprobado = nota >= 70 && asistencia >= 70;

    // Buscar si ya existe un registro de participación
    let participacion = await prisma.participacionCurso.findFirst({
      where: {
        id_ins_cur_per: inscripcion_id
      }
    });

    const dataToUpdate = {
      asistencia_porcentaje: asistencia,
      nota_final: nota,
      aprobado: aprobado,
      fecha_evaluacion: new Date()
    };

    if (participacion) {
      // Actualizar registro existente
      participacion = await prisma.participacionCurso.update({
        where: { id_par_cur: participacion.id_par_cur },
        data: dataToUpdate
      });
    } else {
      // Crear nuevo registro
      participacion = await prisma.participacionCurso.create({
        data: {
          id_ins_cur_per: inscripcion_id,
          ...dataToUpdate
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Participación de ${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1} registrada exitosamente`,
      data: {
        participacion,
        curso: inscripcion.curso.nom_cur,
        usuario: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        asistencia_porcentaje: asistencia,
        nota_final: nota,
        aprobado: aprobado,
        estado: aprobado ? 'APROBADO' : 'REPROBADO'
      }
    });

  } catch (error) {
    console.error('❌ Error al registrar participación en curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  obtenerCursosEventosAdministrables,
  obtenerDetallesEventoAdmin,
  obtenerDetallesCursoAdmin,
  aprobarInscripcionEvento,
  rechazarInscripcionEvento,
  aprobarInscripcionCurso,
  rechazarInscripcionCurso,
  descargarComprobantePago,
  registrarParticipacionEvento,
  registrarParticipacionCurso
};