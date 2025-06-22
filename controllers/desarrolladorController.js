const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener solicitudes asignadas a un desarrollador específico
const getSolicitudesAsignadas = async (req, res) => {
  try {
    const { desarrolladorId } = req.params;
    
    console.log('=== GET SOLICITUDES ASIGNADAS ===');
    console.log('Desarrollador ID:', desarrolladorId);

    // Validar que el ID es un string válido (UUID)
    if (!desarrolladorId || typeof desarrolladorId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de desarrollador inválido'
      });
    }

    // Verificar que el desarrollador existe y tiene el rol correcto
    const desarrollador = await prisma.usuario.findFirst({
      where: {
        id_usu: desarrolladorId,
        cuentas: {
          some: {
            rol_cue: 'DESARROLLADOR'
          }
        }
      },
      include: {
        cuentas: true
      }
    });

    if (!desarrollador) {
      return res.status(404).json({
        success: false,
        message: 'Desarrollador no encontrado'
      });
    }

    console.log('Desarrollador encontrado:', `${desarrollador.nom_usu1} ${desarrollador.ape_usu1}`);

    // Obtener solicitudes asignadas al desarrollador
    const solicitudes = await prisma.solicitudCambio.findMany({
      where: {
        id_desarrollador_asignado: desarrolladorId,
        estado_sol: {
          in: ['APROBADA', 'EN_DESARROLLO', 'PLANES_PENDIENTES_APROBACION', 'LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'EN_PAUSA']
        }
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            cuentas: {
              select: {
                cor_cue: true
              }
            }
          }
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      },
      orderBy: [
        { prioridad_sol: 'desc' },
        { fec_creacion_sol: 'desc' }
      ]
    });

    console.log('Solicitudes encontradas:', solicitudes.length);

    // Formatear datos para el frontend
    const solicitudesFormateadas = solicitudes.map(solicitud => ({
      ...solicitud,
      solicitante: `${solicitud.usuario.nom_usu1} ${solicitud.usuario.ape_usu1}`,
      email_solicitante: solicitud.usuario.cuentas[0]?.cor_cue,
      admin_responsable: solicitud.adminResponsable ? 
        `${solicitud.adminResponsable.nom_usu1} ${solicitud.adminResponsable.ape_usu1}` : null
    }));

    res.json({
      success: true,
      data: solicitudesFormateadas,
      total: solicitudesFormateadas.length
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes asignadas:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener una solicitud específica para desarrollador
const getSolicitudEspecifica = async (req, res) => {
  try {
    const { id } = req.params;
    const desarrolladorId = req.user?.userId || req.user?.id_usu || req.usuario?.id_usu; // Compatibilidad con diferentes middlewares
    
    console.log('=== GET SOLICITUD ESPECÍFICA ===');
    console.log('Solicitud ID:', id);
    console.log('Usuario completo:', req.user || req.usuario);
    console.log('Desarrollador ID extraído:', desarrolladorId);

    if (!desarrolladorId) {
      return res.status(400).json({
        success: false,
        message: 'ID de desarrollador no encontrado en la sesión'
      });
    }

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id
        // Removemos la restricción de desarrollador asignado para permitir más flexibilidad
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            cuentas: {
              select: {
                cor_cue: true
              }
            }
          }
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('Solicitud encontrada:', {
      id: solicitud.id_sol,
      titulo: solicitud.titulo_sol,
      estado: solicitud.estado_sol,
      desarrollador_asignado: solicitud.id_desarrollador_asignado
    });

    // Formatear datos
    const solicitudFormateada = {
      ...solicitud,
      solicitante: `${solicitud.usuario.nom_usu1} ${solicitud.usuario.ape_usu1}`,
      email_solicitante: solicitud.usuario.cuentas[0]?.cor_cue,
      admin_responsable: solicitud.adminResponsable ? 
        `${solicitud.adminResponsable.nom_usu1} ${solicitud.adminResponsable.ape_usu1}` : null,
      desarrollador_asignado: solicitud.desarrolladorAsignado ? 
        `${solicitud.desarrolladorAsignado.nom_usu1} ${solicitud.desarrolladorAsignado.ape_usu1}` : null
    };

    res.json({
      success: true,
      data: solicitudFormateada
    });

  } catch (error) {
    console.error('Error obteniendo solicitud específica:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de una solicitud
const actualizarEstadoSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user?.userId || req.user?.id_usu || req.usuario?.id_usu; // Compatibilidad con diferentes middlewares
    
    console.log('=== ACTUALIZAR ESTADO SOLICITUD ===');
    console.log('Solicitud ID:', id);
    console.log('Nuevo estado:', estado);
    console.log('Usuario completo:', req.user || req.usuario);
    console.log('User ID extraído:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no encontrado en la sesión'
      });
    }

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('Solicitud encontrada para actualizar estado:', {
      id: solicitud.id_sol,
      estado_actual: solicitud.estado_sol,
      desarrollador_asignado: solicitud.id_desarrollador_asignado,
      usuario_solicitante: userId
    });

    // Verificar permisos: debe ser el desarrollador asignado
    if (solicitud.id_desarrollador_asignado !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta solicitud'
      });
    }

    // Validar transiciones de estado permitidas para desarrolladores
    const transicionesPermitidas = {
      'APROBADA': ['EN_DESARROLLO'],
      'EN_DESARROLLO': ['EN_TESTING', 'EN_PAUSA'],
      'EN_PAUSA': ['EN_DESARROLLO'],
      'EN_TESTING': ['EN_DESARROLLO'] // Solo para reportar bugs encontrados
    };

    const estadosPermitidos = transicionesPermitidas[solicitud.estado_sol] || [];
    
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${solicitud.estado_sol} a ${estado}`
      });
    }

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: estado,
        fec_ultima_actualizacion: new Date(),
        // Actualizar fechas reales según el estado
        ...(estado === 'EN_DESARROLLO' && !solicitud.fecha_real_inicio_sol && {
          fecha_real_inicio_sol: new Date(),
          hora_real_inicio_sol: new Date().toTimeString().slice(0, 5)
        }),
        ...(estado === 'EN_TESTING' && {
          fecha_real_fin_sol: new Date(),
          hora_real_fin_sol: new Date().toTimeString().slice(0, 5)
        })
      }
    });

    res.json({
      success: true,
      message: `Estado actualizado a ${estado}`,
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Agregar comentario de desarrollo
const agregarComentarioDesarrollo = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.user?.userId || req.user?.id_usu || req.usuario?.id_usu;

    // Verificar que la solicitud está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no asignada a este desarrollador'
      });
    }

    // Actualizar comentarios técnicos
    const comentarioCompleto = `[${new Date().toLocaleString('es-ES')} - Desarrollador]: ${comentario}`;
    const comentariosExistentes = solicitud.comentarios_tecnicos_sol || '';
    const nuevosComentarios = comentariosExistentes 
      ? `${comentariosExistentes}\n\n${comentarioCompleto}`
      : comentarioCompleto;

    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        comentarios_tecnicos_sol: nuevosComentarios,
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error agregando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas del desarrollador
const getEstadisticasDesarrollador = async (req, res) => {
  try {
    const { desarrolladorId } = req.params;

    const stats = await prisma.solicitudCambio.groupBy({
      by: ['estado_sol'],
      where: {
        id_desarrollador_asignado: desarrolladorId
      },
      _count: {
        estado_sol: true
      }
    });

    const estadisticas = {
      total: 0,
      aprobadas: 0,
      en_desarrollo: 0,
      en_testing: 0,
      en_pausa: 0,
      completadas: 0
    };

    stats.forEach(stat => {
      estadisticas.total += stat._count.estado_sol;
      
      switch (stat.estado_sol) {
        case 'APROBADA':
          estadisticas.aprobadas = stat._count.estado_sol;
          break;
        case 'EN_DESARROLLO':
          estadisticas.en_desarrollo = stat._count.estado_sol;
          break;
        case 'EN_TESTING':
          estadisticas.en_testing = stat._count.estado_sol;
          break;
        case 'EN_PAUSA':
          estadisticas.en_pausa = stat._count.estado_sol;
          break;
        case 'COMPLETADA':
          estadisticas.completadas = stat._count.estado_sol;
          break;
      }
    });

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar planes técnicos (rollout y backout)
const actualizarPlanesTecnicos = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      plan_rollout_sol, 
      plan_backout_sol, 
      plan_testing_sol,
      observaciones_implementacion_sol 
    } = req.body;
    const userId = req.user?.userId || req.user?.id_usu || req.usuario?.id_usu;

    // Verificar que la solicitud está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no asignada a este desarrollador'
      });
    }

    // Solo permitir actualizar planes en ciertos estados
    const estadosPermitidos = ['APROBADA', 'EN_DESARROLLO', 'EN_TESTING', 'EN_PAUSA'];
    if (!estadosPermitidos.includes(solicitud.estado_sol)) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden actualizar los planes en el estado actual'
      });
    }

    // Actualizar planes técnicos
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        plan_rollout_sol,
        plan_backout_sol,
        plan_testing_sol,
        observaciones_implementacion_sol,
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Planes técnicos actualizados exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error actualizando planes técnicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Enviar planes técnicos a revisión del MASTER
const enviarPlanesARevision = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id_usu || req.usuario?.id_usu; // Compatibilidad con diferentes middlewares

    console.log('=== ENVIAR PLANES A REVISIÓN ===');
    console.log('Solicitud ID:', id);
    console.log('Desarrollador ID:', userId);

    // Verificar que la solicitud existe y está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId,
        estado_sol: 'EN_DESARROLLO'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en desarrollo'
      });
    }

    // Validar que los planes técnicos estén completos
    const planesCompletos = solicitud.plan_rollout_sol && 
                           solicitud.plan_backout_sol && 
                           solicitud.plan_testing_sol;

    if (!planesCompletos) {
      return res.status(400).json({
        success: false,
        message: 'Debe completar todos los planes técnicos (Roll-out, Back-out y Testing) antes de enviar a revisión'
      });
    }

    // Actualizar el estado y marcar como enviado a revisión
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'PLANES_PENDIENTES_APROBACION',
        planes_enviados_revision: true,
        fecha_envio_planes: new Date(),
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Planes técnicos enviados a revisión del MASTER exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error enviando planes a revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getSolicitudesAsignadas,
  getSolicitudEspecifica,
  actualizarEstadoSolicitud,
  agregarComentarioDesarrollo,
  getEstadisticasDesarrollador,
  actualizarPlanesTecnicos,
  enviarPlanesARevision
}; 