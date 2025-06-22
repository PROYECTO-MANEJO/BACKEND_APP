const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ========================================
// FUNCIONES PARA USUARIOS ÚNICAMENTE
// ========================================

// Crear una nueva solicitud de cambio
const crearSolicitud = async (req, res) => {
  try {
    console.log('=== CREAR SOLICITUD (USUARIO) ===');
    console.log('Body:', req.body);
    console.log('Usuario:', req.usuario?.id_usu);

    // Verificar errores de validación
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const {
      titulo_sol,
      descripcion_sol,
      justificacion_sol,
      tipo_cambio_sol,
      prioridad_sol,
      urgencia_sol
    } = req.body;

    // Obtener el ID del usuario del token JWT
    const usuario_id = req.usuario.id_usu;

    // Preparar datos para la creación - SOLO CAMPOS DEL USUARIO
    const datosCreacion = {
      titulo_sol,
      descripcion_sol,
      justificacion_sol,
      tipo_cambio_sol,
      prioridad_sol: prioridad_sol || 'MEDIA',
      urgencia_sol: urgencia_sol || 'NORMAL',
      id_usuario_sol: usuario_id
      // estado_sol se establece automáticamente como BORRADOR por defecto
    };

    // Crear la solicitud
    const nuevaSolicitud = await prisma.solicitudCambio.create({
      data: datosCreacion,
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    console.log('✅ Solicitud creada exitosamente:', nuevaSolicitud.id_sol);

    // Mapear respuesta para el frontend
    const respuesta = {
      id_sol: nuevaSolicitud.id_sol,
      titulo_sol: nuevaSolicitud.titulo_sol,
      descripcion_sol: nuevaSolicitud.descripcion_sol,
      justificacion_sol: nuevaSolicitud.justificacion_sol,
      tipo_cambio_sol: nuevaSolicitud.tipo_cambio_sol,
      prioridad_sol: nuevaSolicitud.prioridad_sol,
      urgencia_sol: nuevaSolicitud.urgencia_sol,
      estado_sol: nuevaSolicitud.estado_sol,
      fec_creacion_sol: nuevaSolicitud.fec_creacion_sol,
      usuarioSolicitante: nuevaSolicitud.usuario
    };

    res.status(201).json({
      success: true,
      message: 'Solicitud de cambio creada exitosamente',
      data: respuesta
    });

  } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las solicitudes del usuario autenticado
const obtenerMisSolicitudes = async (req, res) => {
  try {
    console.log('=== OBTENER MIS SOLICITUDES (USUARIO) ===');
    console.log('Query params:', req.query);
    console.log('Usuario ID:', req.usuario?.id_usu);

    const usuario_id = req.usuario.id_usu;
    const { estado, tipo_cambio, page = 1, limit = 10 } = req.query;

    // Construir filtros
    const filtros = {
      id_usuario_sol: usuario_id
    };

    // Agregar filtros opcionales
    if (estado && estado.trim() !== '') {
      filtros.estado_sol = estado.trim();
    }

    if (tipo_cambio && tipo_cambio.trim() !== '') {
      filtros.tipo_cambio_sol = tipo_cambio.trim();
    }

    console.log('Filtros aplicados:', filtros);

    // Validar y convertir paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    console.log('Paginación:', { page: pageNum, limit: limitNum, skip });

    // Obtener solicitudes y total
    const [solicitudesRaw, total] = await Promise.all([
      prisma.solicitudCambio.findMany({
        where: filtros,
        select: {
          id_sol: true,
          titulo_sol: true,
          descripcion_sol: true,
          justificacion_sol: true,
          tipo_cambio_sol: true,
          prioridad_sol: true,
          urgencia_sol: true,
          estado_sol: true,
          fec_creacion_sol: true,
          fec_respuesta_sol: true,
          fec_ultima_actualizacion: true,
          // Campos del admin/master que el usuario puede ver
          comentarios_admin_sol: true,
          fecha_planificada_inicio_sol: true,
          fecha_planificada_fin_sol: true,
          // Usuario que creó la solicitud
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true
            }
          }
        },
        orderBy: {
          fec_creacion_sol: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.solicitudCambio.count({
        where: filtros
      })
    ]);

    // Mapear los campos para que coincidan con lo que espera el frontend
    const solicitudes = solicitudesRaw.map(solicitud => ({
      id_sol: solicitud.id_sol,
      titulo_sol: solicitud.titulo_sol,
      descripcion_sol: solicitud.descripcion_sol,
      justificacion_sol: solicitud.justificacion_sol,
      tipo_cambio_sol: solicitud.tipo_cambio_sol,
      prioridad_sol: solicitud.prioridad_sol,
      urgencia_sol: solicitud.urgencia_sol,
      estado_sol: solicitud.estado_sol,
      fec_creacion_sol: solicitud.fec_creacion_sol,
      fec_respuesta_sol: solicitud.fec_respuesta_sol,
      fec_ultima_actualizacion: solicitud.fec_ultima_actualizacion,
      comentarios_admin_sol: solicitud.comentarios_admin_sol,
      fecha_planificada_inicio_sol: solicitud.fecha_planificada_inicio_sol,
      fecha_planificada_fin_sol: solicitud.fecha_planificada_fin_sol,
      usuarioSolicitante: solicitud.usuario,
      // Indicar si puede editar (solo en BORRADOR)
      puede_editar: solicitud.estado_sol === 'BORRADOR',
      puede_cancelar: solicitud.estado_sol === 'BORRADOR',
      puede_enviar: solicitud.estado_sol === 'BORRADOR'
    }));

    console.log('📊 Solicitudes encontradas:', solicitudes.length);
    console.log('📈 Total:', total);

    res.json({
      success: true,
      data: {
        solicitudes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una solicitud específica del usuario autenticado
const obtenerMiSolicitud = async (req, res) => {
  try {
    console.log('=== OBTENER MI SOLICITUD (USUARIO) ===');
    console.log('ID:', req.params.id);
    console.log('Usuario:', req.usuario?.id_usu);

    const { id } = req.params;
    const usuario_id = req.usuario.id_usu;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud requerido'
      });
    }

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: usuario_id
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        },
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
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
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('✅ Solicitud encontrada:', solicitud.id_sol);

    // Mapear los campos para que coincidan con lo que espera el frontend
    const solicitudMapeada = {
      id_sol: solicitud.id_sol,
      titulo_sol: solicitud.titulo_sol,
      descripcion_sol: solicitud.descripcion_sol,
      justificacion_sol: solicitud.justificacion_sol,
      tipo_cambio_sol: solicitud.tipo_cambio_sol,
      prioridad_sol: solicitud.prioridad_sol,
      urgencia_sol: solicitud.urgencia_sol,
      estado_sol: solicitud.estado_sol,
      fec_creacion_sol: solicitud.fec_creacion_sol,
      fec_respuesta_sol: solicitud.fec_respuesta_sol,
      fec_ultima_actualizacion: solicitud.fec_ultima_actualizacion,
      
      // Campos del admin que el usuario puede ver
      comentarios_admin_sol: solicitud.comentarios_admin_sol,
      impacto_negocio_sol: solicitud.impacto_negocio_sol,
      impacto_tecnico_sol: solicitud.impacto_tecnico_sol,
      riesgo_cambio_sol: solicitud.riesgo_cambio_sol,
      categoria_cambio_sol: solicitud.categoria_cambio_sol,
      fecha_planificada_inicio_sol: solicitud.fecha_planificada_inicio_sol,
      fecha_planificada_fin_sol: solicitud.fecha_planificada_fin_sol,
      hora_planificada_inicio_sol: solicitud.hora_planificada_inicio_sol,
      hora_planificada_fin_sol: solicitud.hora_planificada_fin_sol,
      tiempo_estimado_horas_sol: solicitud.tiempo_estimado_horas_sol,
      
      // Campos del desarrollador que el usuario puede ver
      fecha_real_inicio_sol: solicitud.fecha_real_inicio_sol,
      fecha_real_fin_sol: solicitud.fecha_real_fin_sol,
      tiempo_real_horas_sol: solicitud.tiempo_real_horas_sol,
      exito_implementacion: solicitud.exito_implementacion,
      
      // Relaciones
      usuarioSolicitante: solicitud.usuario,
      desarrolladorAsignado: solicitud.desarrolladorAsignado,
      adminResponsable: solicitud.adminResponsable,
      
      // Permisos
      puede_editar: solicitud.estado_sol === 'BORRADOR',
      puede_cancelar: solicitud.estado_sol === 'BORRADOR',
      puede_enviar: solicitud.estado_sol === 'BORRADOR'
    };

    res.json({
      success: true,
      data: solicitudMapeada
    });

  } catch (error) {
    console.error('❌ Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Editar solicitud (SOLO en estado BORRADOR)
const editarSolicitud = async (req, res) => {
  try {
    console.log('=== EDITAR SOLICITUD (USUARIO) ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Usuario:', req.usuario?.id_usu);

    // Verificar errores de validación
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const { id } = req.params;
    const usuario_id = req.usuario.id_usu;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitudExistente = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: usuario_id
      }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // REGLA CRÍTICA: Solo puede editar en estado BORRADOR
    if (solicitudExistente.estado_sol !== 'BORRADOR') {
      return res.status(403).json({
        success: false,
        message: `No se puede editar la solicitud. Solo se pueden editar solicitudes en estado BORRADOR. Estado actual: ${solicitudExistente.estado_sol}`
      });
    }

    const {
      titulo_sol,
      descripcion_sol,
      justificacion_sol,
      tipo_cambio_sol,
      prioridad_sol,
      urgencia_sol
    } = req.body;

    // Preparar datos para actualizar - SOLO CAMPOS DEL USUARIO
    const datosActualizacion = {
      fec_ultima_actualizacion: new Date()
    };

    // Solo actualizar campos que puede editar el usuario
    if (titulo_sol !== undefined) datosActualizacion.titulo_sol = titulo_sol;
    if (descripcion_sol !== undefined) datosActualizacion.descripcion_sol = descripcion_sol;
    if (justificacion_sol !== undefined) datosActualizacion.justificacion_sol = justificacion_sol;
    if (tipo_cambio_sol !== undefined) datosActualizacion.tipo_cambio_sol = tipo_cambio_sol;
    if (prioridad_sol !== undefined) datosActualizacion.prioridad_sol = prioridad_sol;
    if (urgencia_sol !== undefined) datosActualizacion.urgencia_sol = urgencia_sol;

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    console.log('✅ Solicitud editada exitosamente:', solicitudActualizada.id_sol);

    // Mapear respuesta para el frontend
    const respuesta = {
      id_sol: solicitudActualizada.id_sol,
      titulo_sol: solicitudActualizada.titulo_sol,
      descripcion_sol: solicitudActualizada.descripcion_sol,
      justificacion_sol: solicitudActualizada.justificacion_sol,
      tipo_cambio_sol: solicitudActualizada.tipo_cambio_sol,
      prioridad_sol: solicitudActualizada.prioridad_sol,
      urgencia_sol: solicitudActualizada.urgencia_sol,
      estado_sol: solicitudActualizada.estado_sol,
      fec_creacion_sol: solicitudActualizada.fec_creacion_sol,
      fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
      usuarioSolicitante: solicitudActualizada.usuario
    };

    res.json({
      success: true,
      message: 'Solicitud editada exitosamente',
      data: respuesta
    });

  } catch (error) {
    console.error('❌ Error al editar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Enviar solicitud (BORRADOR → PENDIENTE)
const enviarSolicitud = async (req, res) => {
  try {
    console.log('=== ENVIAR SOLICITUD (USUARIO) ===');
    console.log('ID:', req.params.id);
    console.log('Usuario:', req.usuario?.id_usu);

    const { id } = req.params;
    const usuario_id = req.usuario.id_usu;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitudExistente = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: usuario_id
      }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // REGLA CRÍTICA: Solo puede enviar desde estado BORRADOR
    if (solicitudExistente.estado_sol !== 'BORRADOR') {
      return res.status(403).json({
        success: false,
        message: `No se puede enviar la solicitud. Solo se pueden enviar solicitudes en estado BORRADOR. Estado actual: ${solicitudExistente.estado_sol}`
      });
    }

    // Actualizar estado a PENDIENTE
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'PENDIENTE',
        fec_ultima_actualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      }
    });

    console.log('✅ Solicitud enviada exitosamente:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud enviada exitosamente para revisión',
      data: {
        id_sol: solicitudActualizada.id_sol,
        estado_sol: solicitudActualizada.estado_sol,
        fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion
      }
    });

  } catch (error) {
    console.error('❌ Error al enviar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cancelar solicitud (SOLO en estado BORRADOR)
const cancelarSolicitud = async (req, res) => {
  try {
    console.log('=== CANCELAR SOLICITUD (USUARIO) ===');
    console.log('ID:', req.params.id);
    console.log('Usuario:', req.usuario?.id_usu);

    const { id } = req.params;
    const usuario_id = req.usuario.id_usu;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitudExistente = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: usuario_id
      }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // REGLA CRÍTICA: Solo puede cancelar desde estado BORRADOR
    if (solicitudExistente.estado_sol !== 'BORRADOR') {
      return res.status(403).json({
        success: false,
        message: `No se puede cancelar la solicitud. Solo se pueden cancelar solicitudes en estado BORRADOR. Estado actual: ${solicitudExistente.estado_sol}`
      });
    }

    // Actualizar estado a CANCELADA
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'CANCELADA',
        fec_ultima_actualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      }
    });

    console.log('✅ Solicitud cancelada exitosamente:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: {
        id_sol: solicitudActualizada.id_sol,
        estado_sol: solicitudActualizada.estado_sol,
        fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion
      }
    });

  } catch (error) {
    console.error('❌ Error al cancelar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas del usuario
const obtenerEstadisticasUsuario = async (req, res) => {
  try {
    console.log('=== OBTENER ESTADÍSTICAS USUARIO ===');
    console.log('Usuario:', req.usuario?.id_usu);

    const usuario_id = req.usuario.id_usu;

    // Obtener conteos por estado
    const estadisticas = await prisma.solicitudCambio.groupBy({
      by: ['estado_sol'],
      where: {
        id_usuario_sol: usuario_id
      },
      _count: {
        estado_sol: true
      }
    });

    // Convertir a formato más fácil de usar
    const stats = {
      total: 0,
      borradores: 0,
      pendientes: 0,
      en_revision: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0,
      en_desarrollo: 0,
      planes_pendientes_aprobacion: 0,
      listo_para_implementar: 0,
      en_testing: 0,
      en_despliegue: 0,
      completadas: 0,
      fallidas: 0
    };

    estadisticas.forEach(stat => {
      const count = stat._count.estado_sol;
      stats.total += count;
      
      switch (stat.estado_sol) {
        case 'BORRADOR':
          stats.borradores = count;
          break;
        case 'PENDIENTE':
          stats.pendientes = count;
          break;
        case 'EN_REVISION':
          stats.en_revision = count;
          break;
        case 'APROBADA':
          stats.aprobadas = count;
          break;
        case 'RECHAZADA':
          stats.rechazadas = count;
          break;
        case 'CANCELADA':
          stats.canceladas = count;
          break;
        case 'EN_DESARROLLO':
          stats.en_desarrollo = count;
          break;
        case 'PLANES_PENDIENTES_APROBACION':
          stats.planes_pendientes_aprobacion = count;
          break;
        case 'LISTO_PARA_IMPLEMENTAR':
          stats.listo_para_implementar = count;
          break;
        case 'EN_TESTING':
          stats.en_testing = count;
          break;
        case 'EN_DESPLIEGUE':
          stats.en_despliegue = count;
          break;
        case 'COMPLETADA':
          stats.completadas = count;
          break;
        case 'FALLIDA':
          stats.fallidas = count;
          break;
      }
    });

    console.log('📊 Estadísticas calculadas:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ========================================
// FUNCIONES PARA ADMIN MASTER
// ========================================

// Obtener todas las solicitudes (para admin/master) con filtros
const obtenerTodasLasSolicitudes = async (req, res) => {
  try {
    console.log('=== OBTENER TODAS LAS SOLICITUDES (ADMIN MASTER) ===');
    console.log('Query params:', req.query);
    console.log('Admin ID:', req.usuario?.id_usu);

    const { estado, tipo_cambio, usuario_id, page = 1, limit = 10, desde, hasta } = req.query;

    // Construir filtros
    const filtros = {};

    if (estado && estado.trim() !== '') {
      filtros.estado_sol = estado.trim();
    }

    if (tipo_cambio && tipo_cambio.trim() !== '') {
      filtros.tipo_cambio_sol = tipo_cambio.trim();
    }

    if (usuario_id && usuario_id.trim() !== '') {
      filtros.id_usuario_sol = usuario_id.trim();
    }

    // Filtros de fecha
    if (desde || hasta) {
      filtros.fec_creacion_sol = {};
      if (desde) {
        filtros.fec_creacion_sol.gte = new Date(desde);
      }
      if (hasta) {
        filtros.fec_creacion_sol.lte = new Date(hasta);
      }
    }

    console.log('Filtros aplicados:', filtros);

    // Validar y convertir paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Obtener solicitudes y total
    const [solicitudesRaw, total] = await Promise.all([
      prisma.solicitudCambio.findMany({
        where: filtros,
        include: {
          usuario: {
            select: {
              id_usu: true,
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true,
              cuentas: {
                select: {
                  cor_cue: true
                }
              }
            }
          }
        },
        orderBy: [
          { fec_creacion_sol: 'desc' },
          { fec_ultima_actualizacion: 'desc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.solicitudCambio.count({
        where: filtros
      })
    ]);

    console.log('📊 Solicitudes encontradas:', solicitudesRaw.length);
    console.log('📈 Total:', total);

    res.json({
      success: true,
      data: {
        solicitudes: solicitudesRaw,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener todas las solicitudes:', error);
    res.status(500).json({
        success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una solicitud específica (para admin/master)
const obtenerSolicitudParaAdmin = async (req, res) => {
  try {
    console.log('=== OBTENER SOLICITUD PARA ADMIN ===');
    console.log('ID:', req.params.id);
    console.log('Admin ID:', req.usuario?.id_usu);

    const { id } = req.params;

    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      include: {
        usuario: {
          select: {
            id_usu: true,
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
            cuentas: {
              select: {
                cor_cue: true
              }
            }
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

    // Si la solicitud está en estado PENDIENTE, automáticamente la ponemos en revisión
    if (solicitud.estado_sol === 'PENDIENTE') {
      const solicitudActualizada = await prisma.solicitudCambio.update({
        where: { id_sol: id },
      data: {
          estado_sol: 'EN_REVISION',
          fec_ultima_actualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
              id_usu: true,
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
              ape_usu2: true,
              ced_usu: true,
              cuentas: {
                select: {
                  cor_cue: true
                }
              }
          }
        }
      }
    });

      console.log('📋 Solicitud puesta automáticamente en revisión');

      res.json({
      success: true,
        data: solicitudActualizada
      });
    } else {
      console.log('✅ Solicitud encontrada:', solicitud.id_sol);
      
      res.json({
        success: true,
        data: solicitud
      });
    }

  } catch (error) {
    console.error('❌ Error al obtener solicitud para admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar solicitud con campos de admin/master
const actualizarSolicitudMaster = async (req, res) => {
  try {
    console.log('=== ACTUALIZAR SOLICITUD MASTER ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Admin ID:', req.usuario?.id_usu);

    // Verificar errores de validación
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const { id } = req.params;
    const {
      impacto_negocio_sol,
      impacto_tecnico_sol,
      riesgo_cambio_sol,
      categoria_cambio_sol,
      comentarios_admin_sol,
      fecha_planificada_inicio_sol,
      fecha_planificada_fin_sol,
      hora_planificada_inicio_sol,
      hora_planificada_fin_sol,
      tiempo_estimado_horas_sol,
      id_desarrollador_asignado
    } = req.body;

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Solo permitir actualización en estados específicos
    const estadosPermitidos = ['PENDIENTE', 'EN_REVISION', 'APROBADA'];
    if (!estadosPermitidos.includes(solicitudExistente.estado_sol)) {
      return res.status(403).json({
        success: false,
        message: `No se puede actualizar la solicitud en estado ${solicitudExistente.estado_sol}`
      });
    }

    // Preparar datos para actualización - SOLO CAMPOS DEL ADMIN MASTER
    const datosActualizacion = {
      fec_ultima_actualizacion: new Date()
    };

    // Agregar campos que tienen valor
    if (impacto_negocio_sol !== undefined) {
      datosActualizacion.impacto_negocio_sol = impacto_negocio_sol;
    }
    if (impacto_tecnico_sol !== undefined) {
      datosActualizacion.impacto_tecnico_sol = impacto_tecnico_sol;
    }
    if (riesgo_cambio_sol !== undefined) {
      datosActualizacion.riesgo_cambio_sol = riesgo_cambio_sol;
    }
    if (categoria_cambio_sol !== undefined) {
      datosActualizacion.categoria_cambio_sol = categoria_cambio_sol;
    }
    if (comentarios_admin_sol !== undefined) {
      datosActualizacion.comentarios_admin_sol = comentarios_admin_sol;
    }
    if (fecha_planificada_inicio_sol !== undefined) {
      datosActualizacion.fecha_planificada_inicio_sol = fecha_planificada_inicio_sol ? new Date(fecha_planificada_inicio_sol) : null;
    }
    if (fecha_planificada_fin_sol !== undefined) {
      datosActualizacion.fecha_planificada_fin_sol = fecha_planificada_fin_sol ? new Date(fecha_planificada_fin_sol) : null;
    }
    if (hora_planificada_inicio_sol !== undefined) {
      datosActualizacion.hora_planificada_inicio_sol = hora_planificada_inicio_sol;
    }
    if (hora_planificada_fin_sol !== undefined) {
      datosActualizacion.hora_planificada_fin_sol = hora_planificada_fin_sol;
    }
    if (tiempo_estimado_horas_sol !== undefined) {
      datosActualizacion.tiempo_estimado_horas_sol = tiempo_estimado_horas_sol ? parseInt(tiempo_estimado_horas_sol) : null;
    }
    if (id_desarrollador_asignado !== undefined) {
      datosActualizacion.id_desarrollador_asignado = id_desarrollador_asignado || null;
    }

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true,
            cuentas: {
              select: {
                cor_cue: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Solicitud actualizada por master:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud actualizada exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('❌ Error al actualizar solicitud master:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de solicitud a EN_REVISION (PENDIENTE → EN_REVISION)
const ponerEnRevision = async (req, res) => {
  try {
    console.log('=== PONER EN REVISION ===');
    console.log('ID:', req.params.id);
    console.log('Admin ID:', req.usuario?.id_usu);

    const { id } = req.params;

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar estado actual
    if (solicitudExistente.estado_sol !== 'PENDIENTE') {
      return res.status(403).json({
        success: false,
        message: `No se puede poner en revisión desde estado ${solicitudExistente.estado_sol}. Solo desde PENDIENTE.`
      });
    }

    // Cambiar estado a EN_REVISION
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_REVISION',
        fec_ultima_actualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      }
    });

    console.log('✅ Solicitud puesta en revisión:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud puesta en revisión exitosamente',
      data: {
        id_sol: solicitudActualizada.id_sol,
        estado_sol: solicitudActualizada.estado_sol,
        fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion
      }
    });

  } catch (error) {
    console.error('❌ Error al poner en revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Aprobar solicitud (EN_REVISION → APROBADA)
const aprobarSolicitud = async (req, res) => {
  try {
    console.log('=== APROBAR SOLICITUD ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Admin ID:', req.usuario?.id_usu);

    const { id } = req.params;
    const { comentarios_admin_sol } = req.body;

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar estado actual
    if (solicitudExistente.estado_sol !== 'EN_REVISION') {
      return res.status(403).json({
        success: false,
        message: `No se puede aprobar desde estado ${solicitudExistente.estado_sol}. Solo desde EN_REVISION.`
      });
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      estado_sol: 'APROBADA',
      fec_ultima_actualizacion: new Date(),
      fec_respuesta_sol: new Date()
    };

    // Agregar comentarios si se proporcionan
    if (comentarios_admin_sol !== undefined) {
      datosActualizacion.comentarios_admin_sol = comentarios_admin_sol;
    }

    // Aprobar solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
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
        }
      }
    });

    console.log('✅ Solicitud aprobada:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
      data: {
        id_sol: solicitudActualizada.id_sol,
        estado_sol: solicitudActualizada.estado_sol,
        fec_respuesta_sol: solicitudActualizada.fec_respuesta_sol,
        fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
        comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol
      }
    });

  } catch (error) {
    console.error('❌ Error al aprobar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Rechazar solicitud (EN_REVISION → RECHAZADA)
const rechazarSolicitud = async (req, res) => {
  try {
    console.log('=== RECHAZAR SOLICITUD ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Admin ID:', req.usuario?.id_usu);

    const { id } = req.params;
    const { comentarios_admin_sol, motivo_rechazo } = req.body;

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar estado actual
    if (solicitudExistente.estado_sol !== 'EN_REVISION') {
      return res.status(403).json({
        success: false,
        message: `No se puede rechazar desde estado ${solicitudExistente.estado_sol}. Solo desde EN_REVISION.`
      });
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      estado_sol: 'RECHAZADA',
      fec_ultima_actualizacion: new Date(),
      fec_respuesta_sol: new Date()
    };

    // Agregar comentarios si se proporcionan
    if (comentarios_admin_sol !== undefined) {
      datosActualizacion.comentarios_admin_sol = comentarios_admin_sol;
    }

    // Agregar motivo de rechazo si se proporciona
    if (motivo_rechazo !== undefined) {
      datosActualizacion.comentarios_internos_sol = motivo_rechazo;
    }

    // Rechazar solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
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
        }
      }
    });

    console.log('✅ Solicitud rechazada:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      data: {
        id_sol: solicitudActualizada.id_sol,
        estado_sol: solicitudActualizada.estado_sol,
        fec_respuesta_sol: solicitudActualizada.fec_respuesta_sol,
        fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
        comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol,
        comentarios_internos_sol: solicitudActualizada.comentarios_internos_sol
      }
    });

  } catch (error) {
    console.error('❌ Error al rechazar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas generales para admin
const obtenerEstadisticasAdmin = async (req, res) => {
  try {
    console.log('=== OBTENER ESTADÍSTICAS ADMIN ===');
    console.log('Admin ID:', req.usuario?.id_usu);

    // Obtener conteos por estado
    const estadisticas = await prisma.solicitudCambio.groupBy({
      by: ['estado_sol'],
      _count: {
        estado_sol: true
      }
    });

    // Obtener estadísticas por tipo de cambio
    const estadisticasTipo = await prisma.solicitudCambio.groupBy({
      by: ['tipo_cambio_sol'],
      _count: {
        tipo_cambio_sol: true
      }
    });

    // Obtener estadísticas por prioridad
    const estadisticasPrioridad = await prisma.solicitudCambio.groupBy({
      by: ['prioridad_sol'],
      _count: {
        prioridad_sol: true
      }
    });

    // Convertir a formato más fácil de usar
    const statsPorEstado = {
      total: 0,
      borradores: 0,
      pendientes: 0,
      en_revision: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0,
      en_desarrollo: 0,
      planes_pendientes_aprobacion: 0,
      listo_para_implementar: 0,
      en_testing: 0,
      en_despliegue: 0,
      completadas: 0,
      fallidas: 0
    };

    estadisticas.forEach(stat => {
      const count = stat._count.estado_sol;
      statsPorEstado.total += count;
      
      switch (stat.estado_sol) {
        case 'BORRADOR':
          statsPorEstado.borradores = count;
          break;
        case 'PENDIENTE':
          statsPorEstado.pendientes = count;
          break;
        case 'EN_REVISION':
          statsPorEstado.en_revision = count;
          break;
        case 'APROBADA':
          statsPorEstado.aprobadas = count;
          break;
        case 'RECHAZADA':
          statsPorEstado.rechazadas = count;
          break;
        case 'CANCELADA':
          statsPorEstado.canceladas = count;
          break;
        case 'EN_DESARROLLO':
          statsPorEstado.en_desarrollo = count;
          break;
        case 'PLANES_PENDIENTES_APROBACION':
          statsPorEstado.planes_pendientes_aprobacion = count;
          break;
        case 'LISTO_PARA_IMPLEMENTAR':
          statsPorEstado.listo_para_implementar = count;
          break;
        case 'EN_TESTING':
          statsPorEstado.en_testing = count;
          break;
        case 'EN_DESPLIEGUE':
          statsPorEstado.en_despliegue = count;
          break;
        case 'COMPLETADA':
          statsPorEstado.completadas = count;
          break;
        case 'FALLIDA':
          statsPorEstado.fallidas = count;
          break;
      }
    });

    // Convertir estadísticas por tipo
    const statsPorTipo = {};
    estadisticasTipo.forEach(stat => {
      statsPorTipo[stat.tipo_cambio_sol] = stat._count.tipo_cambio_sol;
    });

    // Convertir estadísticas por prioridad
    const statsPorPrioridad = {};
    estadisticasPrioridad.forEach(stat => {
      statsPorPrioridad[stat.prioridad_sol] = stat._count.prioridad_sol;
    });

    console.log('📊 Estadísticas admin calculadas');

    res.json({
      success: true,
      data: {
        por_estado: statsPorEstado,
        por_tipo: statsPorTipo,
        por_prioridad: statsPorPrioridad
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener desarrolladores disponibles
const obtenerDesarrolladores = async (req, res) => {
  try {
    console.log('=== OBTENER DESARROLLADORES ===');
    console.log('Admin ID:', req.usuario?.id_usu);

    // Buscar usuarios con rol DESARROLLADOR
    const desarrolladores = await prisma.usuario.findMany({
      where: {
        cuentas: {
          some: {
            rol_cue: 'DESARROLLADOR'
          }
        }
      },
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        }
      },
      orderBy: [
        { nom_usu1: 'asc' },
        { ape_usu1: 'asc' }
      ]
    });

    console.log('📊 Desarrolladores encontrados:', desarrolladores.length);

    const desarrolladoresFormateados = desarrolladores.map(dev => ({
      id_usu: dev.id_usu,
      nombre_completo: `${dev.nom_usu1} ${dev.nom_usu2 || ''} ${dev.ape_usu1} ${dev.ape_usu2 || ''}`.trim(),
      email: dev.cuentas[0]?.cor_cue || '',
      ced_usu: dev.ced_usu
    }));

    res.json({
      success: true,
      data: desarrolladoresFormateados
    });

  } catch (error) {
    console.error('❌ Error al obtener desarrolladores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  // Funciones de usuario únicamente
  crearSolicitud,
  obtenerMisSolicitudes,
  obtenerMiSolicitud,
  editarSolicitud,
  enviarSolicitud,
  cancelarSolicitud,
  obtenerEstadisticasUsuario,
  
  // Funciones de Admin Master
  obtenerTodasLasSolicitudes,
  obtenerSolicitudParaAdmin,
  actualizarSolicitudMaster,
  ponerEnRevision,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerEstadisticasAdmin,
  obtenerDesarrolladores
}; 