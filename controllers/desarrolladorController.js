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
          in: [
            'APROBADA', 
            'PLANES_PENDIENTES_APROBACION', 
            'LISTO_PARA_IMPLEMENTAR', 
            'EN_DESARROLLO', 
            'EN_TESTING', 
            'EN_DESPLIEGUE',
            'COMPLETADA',
            'FALLIDA'
          ]
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
    const desarrolladorId = req.uid; // Usar req.uid que viene del validateJWT
    
    console.log('=== GET SOLICITUD ESPECÍFICA ===');
    console.log('Solicitud ID:', id);
    console.log('Usuario completo:', req.usuario);
    console.log('Desarrollador ID extraído:', desarrolladorId);

    if (!desarrolladorId) {
      return res.status(400).json({
        success: false,
        message: 'ID de desarrollador no encontrado en la sesión'
      });
    }

    // Validar que el ID de solicitud sea válido
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud inválido'
      });
    }

    console.log('Buscando solicitud con ID:', id);

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id
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

    console.log('Resultado de la consulta:', solicitud ? 'Encontrada' : 'No encontrada');

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
      desarrollador_asignado: solicitud.id_desarrollador_asignado,
      usuario_propietario: solicitud.id_usuario_sol
    });

    // Formatear datos con validación segura
    const solicitudFormateada = {
      ...solicitud,
      solicitante: solicitud.usuario ? `${solicitud.usuario.nom_usu1} ${solicitud.usuario.ape_usu1}` : 'Usuario no encontrado',
      email_solicitante: solicitud.usuario?.cuentas?.[0]?.cor_cue || null,
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
    console.error('Stack trace completo:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Actualizar estado de una solicitud
const actualizarEstadoSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.uid; // Usar req.uid que viene del validateJWT
    
    console.log('=== ACTUALIZAR ESTADO SOLICITUD ===');
    console.log('Solicitud ID:', id);
    console.log('Nuevo estado:', estado);
    console.log('Usuario completo:', req.usuario);
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
      'EN_DESARROLLO': ['EN_TESTING'],
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
    const userId = req.uid; // Usar req.uid que viene del validateJWT

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
      planes_pendientes: 0,
      listo_implementar: 0,
      en_desarrollo: 0,
      en_testing: 0,
      en_despliegue: 0,
      completadas: 0,
      fallidas: 0
    };

    stats.forEach(stat => {
      estadisticas.total += stat._count.estado_sol;
      
      switch (stat.estado_sol) {
        case 'APROBADA':
          estadisticas.aprobadas = stat._count.estado_sol;
          break;
        case 'PLANES_PENDIENTES_APROBACION':
          estadisticas.planes_pendientes = stat._count.estado_sol;
          break;
        case 'LISTO_PARA_IMPLEMENTAR':
          estadisticas.listo_implementar = stat._count.estado_sol;
          break;
        case 'EN_DESARROLLO':
          estadisticas.en_desarrollo = stat._count.estado_sol;
          break;
        case 'EN_TESTING':
          estadisticas.en_testing = stat._count.estado_sol;
          break;
        case 'EN_DESPLIEGUE':
          estadisticas.en_despliegue = stat._count.estado_sol;
          break;
        case 'COMPLETADA':
          estadisticas.completadas = stat._count.estado_sol;
          break;
        case 'FALLIDA':
          estadisticas.fallidas = stat._count.estado_sol;
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
      plan_implementacion_sol,  // CAMPO FALTANTE AGREGADO
      plan_rollout_sol, 
      plan_backout_sol, 
      plan_testing_sol,
      observaciones_implementacion_sol 
    } = req.body;
    const userId = req.uid; // Usar req.uid que viene del validateJWT

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
    const estadosPermitidos = ['APROBADA', 'EN_DESARROLLO', 'EN_TESTING'];
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
        plan_implementacion_sol,  // CAMPO FALTANTE AGREGADO
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
    const userId = req.uid; // Usar req.uid que viene del validateJWT

    console.log('=== ENVIAR PLANES A REVISIÓN ===');
    console.log('Solicitud ID:', id);
    console.log('Desarrollador ID:', userId);

    // Verificar que la solicitud existe y está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId,
        estado_sol: 'APROBADA'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está aprobada para crear planes'
      });
    }

    // Validar que los planes técnicos estén completos (TODOS LOS 4 PLANES)
    const planesCompletos = solicitud.plan_implementacion_sol && // VALIDACIÓN FALTANTE AGREGADA
                           solicitud.plan_rollout_sol && 
                           solicitud.plan_backout_sol && 
                           solicitud.plan_testing_sol;

    if (!planesCompletos) {
      return res.status(400).json({
        success: false,
        message: 'Debe completar todos los planes técnicos (Implementación, Roll-out, Back-out y Testing) antes de enviar a revisión'
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

// Iniciar desarrollo (LISTO_PARA_IMPLEMENTAR → EN_DESARROLLO)
const iniciarDesarrollo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.uid; // Usar req.uid que viene del validateJWT

    console.log('=== INICIAR DESARROLLO ===');
    console.log('Solicitud ID:', id);
    console.log('Desarrollador ID:', userId);

    // Validar parámetros
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud inválido'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de desarrollador no encontrado en la sesión'
      });
    }

    // Verificar que la solicitud existe y está asignada al desarrollador
    console.log('Buscando solicitud para iniciar desarrollo...');
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId,
        estado_sol: 'LISTO_PARA_IMPLEMENTAR'
      }
    });

    console.log('Resultado de búsqueda:', solicitud ? 'Encontrada' : 'No encontrada');

    if (!solicitud) {
      // Hacer una búsqueda más amplia para diagnosticar el problema
      const solicitudGeneral = await prisma.solicitudCambio.findFirst({
        where: { id_sol: id }
      });

      if (!solicitudGeneral) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      console.log('Diagnóstico de solicitud:', {
        id: solicitudGeneral.id_sol,
        estado_actual: solicitudGeneral.estado_sol,
        desarrollador_asignado: solicitudGeneral.id_desarrollador_asignado,
        desarrollador_solicitante: userId
      });

      if (solicitudGeneral.id_desarrollador_asignado !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Esta solicitud no está asignada a ti'
        });
      }

      if (solicitudGeneral.estado_sol !== 'LISTO_PARA_IMPLEMENTAR') {
        return res.status(400).json({
          success: false,
          message: `La solicitud está en estado ${solicitudGeneral.estado_sol}, debe estar en LISTO_PARA_IMPLEMENTAR para iniciar desarrollo`
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está lista para implementar'
      });
    }

    console.log('Iniciando desarrollo para solicitud:', solicitud.id_sol);

    // Actualizar estado y fecha de inicio real
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_DESARROLLO',
        fecha_real_inicio_sol: new Date(),
        fec_ultima_actualizacion: new Date()
      }
    });

    console.log('Desarrollo iniciado exitosamente');

    res.json({
      success: true,
      message: 'Desarrollo iniciado exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error iniciando desarrollo:', error);
    console.error('Stack trace completo:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Pasar a testing (EN_DESARROLLO → EN_TESTING)
const pasarATesting = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;
    const userId = req.uid; // Usar req.uid que viene del validateJWT

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

    const datosActualizacion = {
      estado_sol: 'EN_TESTING',
      fec_ultima_actualizacion: new Date()
    };

    if (comentarios) {
      const comentarioCompleto = `[${new Date().toLocaleString('es-ES')} - Testing]: ${comentarios}`;
      const comentariosExistentes = solicitud.comentarios_tecnicos_sol || '';
      datosActualizacion.comentarios_tecnicos_sol = comentariosExistentes 
        ? `${comentariosExistentes}\n\n${comentarioCompleto}`
        : comentarioCompleto;
    }

    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion
    });

    res.json({
      success: true,
      message: 'Solicitud pasada a testing exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error pasando a testing:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Pasar a despliegue (EN_TESTING → EN_DESPLIEGUE)
const pasarADespliegue = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;
    const userId = req.uid; // Usar req.uid que viene del validateJWT

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId,
        estado_sol: 'EN_TESTING'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en testing'
      });
    }

    const datosActualizacion = {
      estado_sol: 'EN_DESPLIEGUE',
      fec_ultima_actualizacion: new Date()
    };

    if (comentarios) {
      const comentarioCompleto = `[${new Date().toLocaleString('es-ES')} - Despliegue]: ${comentarios}`;
      const comentariosExistentes = solicitud.comentarios_tecnicos_sol || '';
      datosActualizacion.comentarios_tecnicos_sol = comentariosExistentes 
        ? `${comentariosExistentes}\n\n${comentarioCompleto}`
        : comentarioCompleto;
    }

    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion
    });

    res.json({
      success: true,
      message: 'Solicitud pasada a despliegue exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error pasando a despliegue:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Completar solicitud (EN_DESPLIEGUE → COMPLETADA/FALLIDA)
const completarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      exito_implementacion, 
      comentarios_tecnicos_sol,
      tiempo_real_horas_sol 
    } = req.body;
    const userId = req.uid; // Usar req.uid que viene del validateJWT

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: userId,
        estado_sol: 'EN_DESPLIEGUE'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en despliegue'
      });
    }

    const datosActualizacion = {
      estado_sol: exito_implementacion ? 'COMPLETADA' : 'FALLIDA',
      exito_implementacion: exito_implementacion,
      fecha_real_fin_sol: new Date(),
      fec_ultima_actualizacion: new Date()
    };

    if (comentarios_tecnicos_sol) {
      datosActualizacion.comentarios_tecnicos_sol = comentarios_tecnicos_sol;
    }

    if (tiempo_real_horas_sol) {
      datosActualizacion.tiempo_real_horas_sol = parseInt(tiempo_real_horas_sol);
    }

    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion
    });

    res.json({
      success: true,
      message: `Solicitud ${exito_implementacion ? 'completada' : 'marcada como fallida'} exitosamente`,
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error completando solicitud:', error);
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
  enviarPlanesARevision,
  iniciarDesarrollo,
  pasarATesting,
  pasarADespliegue,
  completarSolicitud
}; 