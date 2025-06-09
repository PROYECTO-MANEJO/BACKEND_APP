const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Crear una nueva solicitud de cambio
const crearSolicitud = async (req, res) => {
  try {
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
      prioridad_sol 
    } = req.body;

    // Obtener el ID del usuario del token JWT (viene del middleware de autenticación)
    const id_usuario_sol = req.usuario.id_usu;

    // Crear la solicitud
    const nuevaSolicitud = await prisma.solicitudCambio.create({
      data: {
        titulo_sol,
        descripcion_sol,
        justificacion_sol,
        tipo_cambio_sol,
        prioridad_sol: prioridad_sol || 'MEDIA',
        id_usuario_sol
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
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud de cambio creada exitosamente',
      data: nuevaSolicitud
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las solicitudes del usuario autenticado
const obtenerSolicitudesUsuario = async (req, res) => {
  try {
    console.log('=== OBTENER SOLICITUDES USUARIO ===');
    console.log('Query params:', req.query);
    console.log('Usuario ID:', req.usuario?.id_usu);
    
    const id_usuario = req.usuario.id_usu;
    const { estado, tipo_cambio, page = 1, limit = 10 } = req.query;

    // Construir filtros - solo agregar si no están vacíos y son válidos
    const filtros = {
      id_usuario_sol: id_usuario
    };

    // Validar y agregar filtro de estado
    if (estado && estado.trim() !== '') {
      const estadosValidos = ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_DESARROLLO', 'COMPLETADA'];
      if (estadosValidos.includes(estado.trim())) {
        filtros.estado_sol = estado.trim();
      } else {
        console.warn('Estado inválido recibido:', estado);
      }
    }

    // Validar y agregar filtro de tipo de cambio
    if (tipo_cambio && tipo_cambio.trim() !== '') {
      const tiposValidos = ['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_INTERFAZ', 'OPTIMIZACION', 'OTRO'];
      if (tiposValidos.includes(tipo_cambio.trim())) {
        filtros.tipo_cambio_sol = tipo_cambio.trim();
      } else {
        console.warn('Tipo de cambio inválido recibido:', tipo_cambio);
      }
    }

    console.log('Filtros aplicados:', filtros);

    // Validar y convertir paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    console.log('Paginación:', { page: pageNum, limit: limitNum, skip });

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudCambio.findMany({
        where: filtros,
        select: {
          id_sol: true,
          titulo_sol: true,
          descripcion_sol: true,
          justificacion_sol: true,
          tipo_cambio_sol: true,
          prioridad_sol: true,
          estado_sol: true,
          fec_creacion_sol: true,
          fec_respuesta_sol: true,
          comentarios_admin_sol: true,
          comentarios_internos_sol: true,
          adminResponsable: {
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

    console.log(`Usuario ${id_usuario}: Encontradas ${solicitudes.length} solicitudes de ${total} total`);

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
    console.error('Error al obtener solicitudes del usuario:', error);
    console.error('Stack trace:', error.stack);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Datos no encontrados'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener una solicitud específica por ID
const obtenerSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usu;

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: id_usuario // Solo el usuario que creó la solicitud puede verla
      },
      select: {
        id_sol: true,
        titulo_sol: true,
        descripcion_sol: true,
        justificacion_sol: true,
        tipo_cambio_sol: true,
        prioridad_sol: true,
        estado_sol: true,
        fec_creacion_sol: true,
        fec_respuesta_sol: true,
        comentarios_admin_sol: true,
        comentarios_internos_sol: true,
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
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

    res.json({
      success: true,
      data: solicitud
    });

  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// FUNCIONES PARA ADMINISTRADORES

// Obtener todas las solicitudes (solo administradores)
const obtenerTodasLasSolicitudes = async (req, res) => {
  try {
    console.log('=== OBTENER TODAS LAS SOLICITUDES ===');
    console.log('Query params:', req.query);
    
    const { estado, tipo_cambio, prioridad, page = 1, limit = 10 } = req.query;

    // Construir filtros - solo agregar si no están vacíos y son válidos
    const filtros = {};

    // Validar y agregar filtro de estado
    if (estado && estado.trim() !== '') {
      const estadosValidos = ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_DESARROLLO', 'COMPLETADA'];
      if (estadosValidos.includes(estado.trim())) {
        filtros.estado_sol = estado.trim();
      } else {
        console.warn('Estado inválido recibido:', estado);
      }
    }

    // Validar y agregar filtro de tipo de cambio
    if (tipo_cambio && tipo_cambio.trim() !== '') {
      const tiposValidos = ['NUEVA_FUNCIONALIDAD', 'MEJORA_EXISTENTE', 'CORRECCION_ERROR', 'CAMBIO_INTERFAZ', 'OPTIMIZACION', 'OTRO'];
      if (tiposValidos.includes(tipo_cambio.trim())) {
        filtros.tipo_cambio_sol = tipo_cambio.trim();
      } else {
        console.warn('Tipo de cambio inválido recibido:', tipo_cambio);
      }
    }

    // Validar y agregar filtro de prioridad
    if (prioridad && prioridad.trim() !== '') {
      const prioridadesValidas = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
      if (prioridadesValidas.includes(prioridad.trim())) {
        filtros.prioridad_sol = prioridad.trim();
      } else {
        console.warn('Prioridad inválida recibida:', prioridad);
      }
    }

    console.log('Filtros aplicados:', filtros);

    // Validar y convertir paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Limitar entre 1 y 50
    const skip = (pageNum - 1) * limitNum;

    console.log('Paginación:', { page: pageNum, limit: limitNum, skip });

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudCambio.findMany({
        where: filtros,
        select: {
          id_sol: true,
          titulo_sol: true,
          descripcion_sol: true,
          justificacion_sol: true,
          tipo_cambio_sol: true,
          prioridad_sol: true,
          estado_sol: true,
          fec_creacion_sol: true,
          fec_respuesta_sol: true,
          comentarios_admin_sol: true,
          comentarios_internos_sol: true,
          usuario: {
            select: {
              nom_usu1: true,
              nom_usu2: true,
              ape_usu1: true,
              ape_usu2: true,
              ced_usu: true
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
          { fec_creacion_sol: 'desc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.solicitudCambio.count({
        where: filtros
      })
    ]);

    console.log(`Encontradas ${solicitudes.length} solicitudes de ${total} total`);

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
    console.error('Error al obtener todas las solicitudes:', error);
    console.error('Stack trace:', error.stack);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Datos no encontrados'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Error de datos duplicados'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Responder a una solicitud (aprobar/rechazar) - Solo administradores
const responderSolicitud = async (req, res) => {
  try {
    console.log('=== RESPONDER SOLICITUD ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Usuario:', req.usuario?.id_usu);
    
    // Verificar errores de validación
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      console.log('Errores de validación:', errores.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const { id } = req.params;
    const { estado_sol, prioridad_sol, comentarios_admin_sol, comentarios_internos_sol } = req.body;
    const id_admin = req.usuario.id_usu;

    console.log('Datos extraídos:', { estado_sol, prioridad_sol, comentarios_admin_sol, comentarios_internos_sol });

    // Validar que el ID sea un UUID válido
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud inválido'
      });
    }

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    console.log('Solicitud existente:', solicitudExistente ? 'SÍ' : 'NO');

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que la solicitud está en estado que puede ser procesada
    if (!['PENDIENTE', 'EN_REVISION'].includes(solicitudExistente.estado_sol)) {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      });
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      estado_sol,
      id_admin_resp_sol: id_admin,
      fec_respuesta_sol: new Date()
    };

    // Agregar campos opcionales si están presentes y no son undefined
    if (prioridad_sol !== undefined && prioridad_sol !== null && prioridad_sol !== '') {
      datosActualizacion.prioridad_sol = prioridad_sol;
    }
    
    if (comentarios_admin_sol !== undefined) {
      datosActualizacion.comentarios_admin_sol = comentarios_admin_sol || null;
    }
    
    if (comentarios_internos_sol !== undefined) {
      datosActualizacion.comentarios_internos_sol = comentarios_internos_sol || null;
    }

    console.log('Datos a actualizar:', datosActualizacion);

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
      select: {
        id_sol: true,
        titulo_sol: true,
        descripcion_sol: true,
        justificacion_sol: true,
        tipo_cambio_sol: true,
        prioridad_sol: true,
        estado_sol: true,
        fec_creacion_sol: true,
        fec_respuesta_sol: true,
        comentarios_admin_sol: true,
        comentarios_internos_sol: true,
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
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

    console.log('Solicitud respondida exitosamente:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: `Solicitud ${estado_sol.toLowerCase()} exitosamente`,
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error al responder solicitud:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Error de datos duplicados'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Editar una solicitud (solo administradores)
const editarSolicitud = async (req, res) => {
  try {
    console.log('=== EDITAR SOLICITUD ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Usuario:', req.usuario?.id_usu);
    
    // Verificar errores de validación
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      console.log('Errores de validación:', errores.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const { id } = req.params;
    const { estado_sol, prioridad_sol, comentarios_admin_sol, comentarios_internos_sol } = req.body;

    console.log('Datos extraídos:', { estado_sol, prioridad_sol, comentarios_admin_sol, comentarios_internos_sol });

    // Validar que el ID sea un UUID válido
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud inválido'
      });
    }

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    console.log('Solicitud existente:', solicitudExistente ? 'SÍ' : 'NO');

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que la solicitud no esté completada (no se puede editar)
    if (solicitudExistente.estado_sol === 'COMPLETADA') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una solicitud completada'
      });
    }

    // Preparar datos para actualizar - solo incluir campos que no sean undefined
    const datosActualizacion = {};

    // Solo actualizar campos que se envían y no son undefined
    if (estado_sol !== undefined && estado_sol !== null && estado_sol !== '') {
      datosActualizacion.estado_sol = estado_sol;
    }
    
    if (prioridad_sol !== undefined && prioridad_sol !== null && prioridad_sol !== '') {
      datosActualizacion.prioridad_sol = prioridad_sol;
    }
    
    if (comentarios_admin_sol !== undefined) {
      datosActualizacion.comentarios_admin_sol = comentarios_admin_sol || null;
    }
    
    if (comentarios_internos_sol !== undefined) {
      datosActualizacion.comentarios_internos_sol = comentarios_internos_sol || null;
    }

    console.log('Datos a actualizar:', datosActualizacion);

    // Verificar que hay al menos un campo para actualizar
    if (Object.keys(datosActualizacion).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      });
    }

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: datosActualizacion,
      select: {
        id_sol: true,
        titulo_sol: true,
        descripcion_sol: true,
        justificacion_sol: true,
        tipo_cambio_sol: true,
        prioridad_sol: true,
        estado_sol: true,
        fec_creacion_sol: true,
        fec_respuesta_sol: true,
        comentarios_admin_sol: true,
        comentarios_internos_sol: true,
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
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

    console.log('Solicitud actualizada exitosamente:', solicitudActualizada.id_sol);

    res.json({
      success: true,
      message: 'Solicitud editada exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error al editar solicitud:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Error de datos duplicados'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar el estado de una solicitud (para cambios de estado durante desarrollo)
const actualizarEstadoSolicitud = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errores.array()
      });
    }

    const { id } = req.params;
    const { estado_sol } = req.body;

    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: { estado_sol },
      select: {
        id_sol: true,
        titulo_sol: true,
        descripcion_sol: true,
        justificacion_sol: true,
        tipo_cambio_sol: true,
        prioridad_sol: true,
        estado_sol: true,
        fec_creacion_sol: true,
        fec_respuesta_sol: true,
        comentarios_admin_sol: true,
        comentarios_internos_sol: true,
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
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

    res.json({
      success: true,
      message: 'Estado de solicitud actualizado exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error al actualizar estado de solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de solicitudes (solo administradores)
const obtenerEstadisticas = async (req, res) => {
  try {
    console.log('=== OBTENER ESTADÍSTICAS ===');
    console.log('Usuario solicitante:', req.usuario?.id_usu);
    
    const [
      totalSolicitudes,
      solicitudesPorEstado,
      solicitudesPorTipo,
      solicitudesPorPrioridad
    ] = await Promise.all([
      prisma.solicitudCambio.count(),
      prisma.solicitudCambio.groupBy({
        by: ['estado_sol'],
        _count: {
          estado_sol: true
        }
      }),
      prisma.solicitudCambio.groupBy({
        by: ['tipo_cambio_sol'],
        _count: {
          tipo_cambio_sol: true
        }
      }),
      prisma.solicitudCambio.groupBy({
        by: ['prioridad_sol'],
        _count: {
          prioridad_sol: true
        }
      })
    ]);

    console.log('Estadísticas obtenidas:', {
      total: totalSolicitudes,
      porEstado: solicitudesPorEstado.length,
      porTipo: solicitudesPorTipo.length,
      porPrioridad: solicitudesPorPrioridad.length
    });

    res.json({
      success: true,
      data: {
        total: totalSolicitudes,
        porEstado: solicitudesPorEstado.map(item => ({
          estado: item.estado_sol,
          cantidad: item._count.estado_sol
        })),
        porTipo: solicitudesPorTipo.map(item => ({
          tipo: item.tipo_cambio_sol,
          cantidad: item._count.tipo_cambio_sol
        })),
        porPrioridad: solicitudesPorPrioridad.map(item => ({
          prioridad: item.prioridad_sol,
          cantidad: item._count.prioridad_sol
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    console.error('Stack trace:', error.stack);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Datos no encontrados'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudesUsuario,
  obtenerSolicitudPorId,
  obtenerTodasLasSolicitudes,
  responderSolicitud,
  editarSolicitud,
  actualizarEstadoSolicitud,
  obtenerEstadisticas
}; 