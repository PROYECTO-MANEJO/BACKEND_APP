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
      prioridad_sol,
      // Nuevos campos del solicitante
      impacto_negocio_sol,
      urgencia_sol,
      beneficios_esperados_sol,
      recursos_necesarios_sol,
      fecha_limite_deseada,
      usuarios_afectados_sol
    } = req.body;

    // Obtener el ID del usuario del token JWT (viene del middleware de autenticación)
    const id_usuario_sol = req.usuario.id_usu;

    // Preparar datos para la creación
    const datosCreacion = {
      titulo_sol,
      descripcion_sol,
      justificacion_sol,
      tipo_cambio_sol,
      prioridad_sol: prioridad_sol || 'MEDIA',
      urgencia_sol: urgencia_sol || 'NORMAL',
      id_usuario_sol
    };

    // Agregar campos opcionales solo si se proporcionan
    if (impacto_negocio_sol) datosCreacion.impacto_negocio_sol = impacto_negocio_sol;
    if (beneficios_esperados_sol) datosCreacion.beneficios_esperados_sol = beneficios_esperados_sol;
    if (recursos_necesarios_sol) datosCreacion.recursos_necesarios_sol = recursos_necesarios_sol;
    if (usuarios_afectados_sol) datosCreacion.usuarios_afectados_sol = usuarios_afectados_sol;
    
    // Validar y agregar fecha límite deseada
    if (fecha_limite_deseada) {
      const fechaLimite = new Date(fecha_limite_deseada);
      const ahora = new Date();
      
      if (fechaLimite > ahora) {
        datosCreacion.fecha_limite_deseada = fechaLimite;
      }
    }

    // Crear la solicitud en estado BORRADOR por defecto
    const nuevaSolicitud = await prisma.solicitudCambio.create({
      data: {
        ...datosCreacion,
        estado_sol: 'BORRADOR' // Siempre inicia en BORRADOR
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
      const estadosValidos = [
        'PENDIENTE', 
        'EN_REVISION', 
        'PENDIENTE_APROBACION_TECNICA',
        'PENDIENTE_APROBACION_NEGOCIO',
        'APROBADA', 
        'RECHAZADA', 
        'CANCELADA',
        'EN_DESARROLLO', 
        'EN_TESTING',
        'EN_DESPLIEGUE',
        'COMPLETADA',
        'FALLIDA',
        'CERRADA',
        'EN_PAUSA',
        'ESPERANDO_INFORMACION'
      ];
      if (estadosValidos.includes(estado.trim())) {
        filtros.estado_sol = estado.trim();
      } else {
        console.warn('Estado inválido recibido:', estado);
      }
    }

    // Validar y agregar filtro de tipo de cambio
    if (tipo_cambio && tipo_cambio.trim() !== '') {
      const tiposValidos = [
        'NUEVA_FUNCIONALIDAD', 
        'MEJORA_EXISTENTE', 
        'CORRECCION_ERROR', 
        'CAMBIO_INTERFAZ', 
        'OPTIMIZACION', 
        'ACTUALIZACION_DATOS',
        'CAMBIO_SEGURIDAD',
        'MIGRACION_DATOS',
        'INTEGRACION_EXTERNA',
        'OTRO'
      ];
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
      const estadosValidos = [
        'PENDIENTE', 
        'EN_REVISION', 
        'PENDIENTE_APROBACION_TECNICA',
        'PENDIENTE_APROBACION_NEGOCIO',
        'APROBADA', 
        'RECHAZADA', 
        'CANCELADA',
        'EN_DESARROLLO', 
        'EN_TESTING',
        'EN_DESPLIEGUE',
        'COMPLETADA',
        'FALLIDA',
        'CERRADA',
        'EN_PAUSA',
        'ESPERANDO_INFORMACION'
      ];
      if (estadosValidos.includes(estado.trim())) {
        filtros.estado_sol = estado.trim();
      } else {
        console.warn('Estado inválido recibido:', estado);
      }
    }

    // Validar y agregar filtro de tipo de cambio
    if (tipo_cambio && tipo_cambio.trim() !== '') {
      const tiposValidos = [
        'NUEVA_FUNCIONALIDAD', 
        'MEJORA_EXISTENTE', 
        'CORRECCION_ERROR', 
        'CAMBIO_INTERFAZ', 
        'OPTIMIZACION', 
        'ACTUALIZACION_DATOS',
        'CAMBIO_SEGURIDAD',
        'MIGRACION_DATOS',
        'INTEGRACION_EXTERNA',
        'OTRO'
      ];
      if (tiposValidos.includes(tipo_cambio.trim())) {
        filtros.tipo_cambio_sol = tipo_cambio.trim();
      } else {
        console.warn('Tipo de cambio inválido recibido:', tipo_cambio);
      }
    }

    // Validar y agregar filtro de prioridad
    if (prioridad && prioridad.trim() !== '') {
      const prioridadesValidas = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'URGENTE'];
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

// Función para que los administradores gestionen los aspectos técnicos de la solicitud
const gestionarSolicitudTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      // =========================================
      // CAMPOS BÁSICOS DE GESTIÓN
      // =========================================
      estado_sol,
      prioridad_sol,
      comentarios_admin_sol,
      comentarios_internos_sol,
      
      // =========================================
      // ANÁLISIS DE RIESGO Y CATEGORIZACIÓN
      // =========================================
      riesgo_cambio_sol,
      categoria_cambio_sol,
      comentarios_tecnicos_sol,
      
      // =========================================
      // ANÁLISIS DE IMPACTO
      // =========================================
      impacto_negocio_sol,
      impacto_tecnico_sol,
      tiempo_inactividad_estimado_sol,
      
      // =========================================
      // PLANES DE IMPLEMENTACIÓN
      // =========================================
      plan_implementacion_sol,
      plan_rollout_sol,
      plan_backout_sol,
      plan_rollback_sol,
      plan_testing_sol,
      observaciones_implementacion_sol,
      
      // =========================================
      // PLANIFICACIÓN TEMPORAL
      // =========================================
      fecha_planificada_inicio_sol,
      hora_planificada_inicio_sol,
      fecha_planificada_fin_sol,
      hora_planificada_fin_sol,
      
      fecha_real_inicio_sol,
      hora_real_inicio_sol,
      fecha_real_fin_sol,
      hora_real_fin_sol,
      
      tiempo_estimado_horas_sol,
      tiempo_real_horas_sol,
      
      // =========================================
      // ASIGNACIONES
      // =========================================
      id_implementador,
      
      // =========================================
      // RESULTADOS Y MÉTRICAS
      // =========================================
      exito_implementacion,
      problemas_encontrados,
      satisfaccion_usuario
    } = req.body;

    const id_admin = req.usuario.id_usu;

    console.log('=== GESTIÓN TÉCNICA DEBUG ===');
    console.log('ID Solicitud:', id);
    console.log('ID Admin:', id_admin);
    console.log('Datos recibidos:', req.body);

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

    // Preparar datos de actualización
    const datosActualizacion = {
      id_admin_resp_sol: id_admin,
      fec_ultima_actualizacion: new Date()
    };

    // =========================================
    // CAMPOS BÁSICOS DE GESTIÓN
    // =========================================
    if (estado_sol) datosActualizacion.estado_sol = estado_sol;
    if (prioridad_sol) datosActualizacion.prioridad_sol = prioridad_sol;
    if (comentarios_admin_sol !== undefined) datosActualizacion.comentarios_admin_sol = comentarios_admin_sol;
    if (comentarios_internos_sol !== undefined) datosActualizacion.comentarios_internos_sol = comentarios_internos_sol;

    // =========================================
    // ANÁLISIS DE RIESGO Y CATEGORIZACIÓN
    // =========================================
    if (riesgo_cambio_sol) datosActualizacion.riesgo_cambio_sol = riesgo_cambio_sol;
    if (categoria_cambio_sol) datosActualizacion.categoria_cambio_sol = categoria_cambio_sol;
    if (comentarios_tecnicos_sol !== undefined) datosActualizacion.comentarios_tecnicos_sol = comentarios_tecnicos_sol;

    // =========================================
    // ANÁLISIS DE IMPACTO
    // =========================================
    if (impacto_negocio_sol !== undefined) datosActualizacion.impacto_negocio_sol = impacto_negocio_sol;
    if (impacto_tecnico_sol !== undefined) datosActualizacion.impacto_tecnico_sol = impacto_tecnico_sol;
    if (tiempo_inactividad_estimado_sol !== undefined) datosActualizacion.tiempo_inactividad_estimado_sol = tiempo_inactividad_estimado_sol;

    // =========================================
    // PLANES DE IMPLEMENTACIÓN
    // =========================================
    if (plan_implementacion_sol !== undefined) datosActualizacion.plan_implementacion_sol = plan_implementacion_sol;
    if (plan_rollout_sol !== undefined) datosActualizacion.plan_rollout_sol = plan_rollout_sol;
    if (plan_backout_sol !== undefined) datosActualizacion.plan_backout_sol = plan_backout_sol;
    if (plan_rollback_sol !== undefined) datosActualizacion.plan_rollback_sol = plan_rollback_sol;
    if (plan_testing_sol !== undefined) datosActualizacion.plan_testing_sol = plan_testing_sol;
    if (observaciones_implementacion_sol !== undefined) datosActualizacion.observaciones_implementacion_sol = observaciones_implementacion_sol;

    // =========================================
    // PLANIFICACIÓN TEMPORAL
    // =========================================
    if (fecha_planificada_inicio_sol) {
      datosActualizacion.fecha_planificada_inicio_sol = new Date(fecha_planificada_inicio_sol);
    }
    if (hora_planificada_inicio_sol !== undefined) datosActualizacion.hora_planificada_inicio_sol = hora_planificada_inicio_sol;
    if (fecha_planificada_fin_sol) {
      datosActualizacion.fecha_planificada_fin_sol = new Date(fecha_planificada_fin_sol);
    }
    if (hora_planificada_fin_sol !== undefined) datosActualizacion.hora_planificada_fin_sol = hora_planificada_fin_sol;

    if (fecha_real_inicio_sol) {
      datosActualizacion.fecha_real_inicio_sol = new Date(fecha_real_inicio_sol);
    }
    if (hora_real_inicio_sol !== undefined) datosActualizacion.hora_real_inicio_sol = hora_real_inicio_sol;
    if (fecha_real_fin_sol) {
      datosActualizacion.fecha_real_fin_sol = new Date(fecha_real_fin_sol);
    }
    if (hora_real_fin_sol !== undefined) datosActualizacion.hora_real_fin_sol = hora_real_fin_sol;

    if (tiempo_estimado_horas_sol !== undefined && tiempo_estimado_horas_sol !== '') {
      datosActualizacion.tiempo_estimado_horas_sol = parseInt(tiempo_estimado_horas_sol) || null;
    }
    if (tiempo_real_horas_sol !== undefined && tiempo_real_horas_sol !== '') {
      datosActualizacion.tiempo_real_horas_sol = parseInt(tiempo_real_horas_sol) || null;
    }

    // =========================================
    // ASIGNACIONES
    // =========================================
    if (id_implementador) {
      datosActualizacion.id_implementador = id_implementador;
    }

    // =========================================
    // RESULTADOS Y MÉTRICAS
    // =========================================
    if (typeof exito_implementacion === 'boolean') {
      datosActualizacion.exito_implementacion = exito_implementacion;
    }
    if (problemas_encontrados !== undefined) datosActualizacion.problemas_encontrados = problemas_encontrados;
    if (satisfaccion_usuario !== undefined && satisfaccion_usuario !== '') {
      datosActualizacion.satisfaccion_usuario = parseInt(satisfaccion_usuario) || null;
    }

    // =========================================
    // GESTIÓN AUTOMÁTICA DE FECHAS SEGÚN ESTADO
    // =========================================
    if (estado_sol) {
      const ahora = new Date();
      switch (estado_sol) {
        case 'APROBADA':
          if (!solicitudExistente.fec_respuesta_sol) {
            datosActualizacion.fec_respuesta_sol = ahora;
          }
          break;
        case 'EN_DESARROLLO':
          if (!solicitudExistente.fecha_real_inicio_sol && !fecha_real_inicio_sol) {
            datosActualizacion.fecha_real_inicio_sol = ahora;
          }
          break;
        case 'COMPLETADA':
          if (!solicitudExistente.fecha_real_fin_sol && !fecha_real_fin_sol) {
            datosActualizacion.fecha_real_fin_sol = ahora;
          }
          if (typeof exito_implementacion !== 'boolean') {
            datosActualizacion.exito_implementacion = true; // Por defecto, si se completa es exitoso
          }
          break;
        case 'FALLIDA':
          if (!solicitudExistente.fecha_real_fin_sol && !fecha_real_fin_sol) {
            datosActualizacion.fecha_real_fin_sol = ahora;
          }
          datosActualizacion.exito_implementacion = false;
          break;
        case 'RECHAZADA':
        case 'CANCELADA':
          if (!solicitudExistente.fec_respuesta_sol) {
            datosActualizacion.fec_respuesta_sol = ahora;
          }
          break;
      }
    }

    console.log('Datos de actualización:', datosActualizacion);

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
        },
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        },
        implementador: {
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

    console.log('Solicitud actualizada exitosamente');

    res.json({
      success: true,
      message: 'Gestión técnica actualizada exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error al gestionar solicitud técnica:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una solicitud específica por ID (para administradores) - INCLUYE TODOS LOS CAMPOS TÉCNICOS
const obtenerSolicitudAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== OBTENER SOLICITUD ADMIN ===');
    console.log('ID Solicitud:', id);
    console.log('Admin ID:', req.usuario?.id_usu);

    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
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
        adminResponsable: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        },
        implementador: {
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

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('Solicitud encontrada:', solicitud.titulo_sol);

    res.json({
      success: true,
      data: solicitud
    });

  } catch (error) {
    console.error('Error al obtener solicitud admin:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar desarrollador a una solicitud (solo para administradores)
const asignarDesarrollador = async (req, res) => {
  try {
    const { id } = req.params;
    const { desarrolladorId } = req.body;

    console.log('=== ASIGNAR DESARROLLADOR ===');
    console.log('Solicitud ID:', id, 'Tipo:', typeof id);
    console.log('Desarrollador ID:', desarrolladorId, 'Tipo:', typeof desarrolladorId);
    console.log('Body completo:', req.body);
    console.log('Params completos:', req.params);

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
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
        message: 'Desarrollador no encontrado o no tiene el rol adecuado'
      });
    }

    // Asignar el desarrollador
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        id_desarrollador_asignado: desarrolladorId,
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

    res.json({
      success: true,
      message: 'Desarrollador asignado exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error asignando desarrollador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener lista de desarrolladores disponibles
const obtenerDesarrolladoresDisponibles = async (req, res) => {
  try {
    const desarrolladores = await prisma.usuario.findMany({
      where: {
        cuentas: {
          some: {
            rol_cue: 'DESARROLLADOR'
          }
        }
      },
      select: {
        id_usu: true,
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
    });

    const desarrolladoresFormateados = desarrolladores.map(dev => ({
      id: dev.id_usu,
      nombre: `${dev.nom_usu1} ${dev.nom_usu2 || ''} ${dev.ape_usu1} ${dev.ape_usu2 || ''}`.trim(),
      email: dev.cuentas[0]?.cor_cue
    }));

    res.json({
      success: true,
      data: desarrolladoresFormateados
    });

  } catch (error) {
    console.error('Error obteniendo desarrolladores:', error);
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
    const { id } = req.params;
    const id_usuario = req.usuario.id_usu;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: id_usuario,
        estado_sol: 'BORRADOR'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en estado borrador'
      });
    }

    // Validar campos obligatorios antes de enviar
    const camposObligatorios = [
      'titulo_sol',
      'descripcion_sol', 
      'justificacion_sol',
      'tipo_cambio_sol'
    ];

    const camposFaltantes = camposObligatorios.filter(campo => !solicitud[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
        campos_faltantes: camposFaltantes
      });
    }

    // Actualizar a estado PENDIENTE
    const solicitudEnviada = await prisma.solicitudCambio.update({
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

    res.json({
      success: true,
      message: 'Solicitud enviada exitosamente',
      data: solicitudEnviada
    });

  } catch (error) {
    console.error('Error enviando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Validar permisos de edición según estado y rol
const validarPermisosEdicion = (solicitud, usuario) => {
  const { estado_sol } = solicitud;
  const rol = usuario.cuentas?.[0]?.rol_cue;

  // Definir qué roles pueden editar en qué estados
  const permisosEdicion = {
    'BORRADOR': ['USUARIO'], // Solo el usuario puede editar borradores
    'RECHAZADA': ['USUARIO'], // Usuario puede corregir solicitudes rechazadas
    'PENDIENTE': ['MASTER'], // Solo MASTER puede modificar pendientes
    'EN_REVISION': ['MASTER'],
    'APROBADA': ['MASTER'], // MASTER puede reasignar o modificar
    'EN_DESARROLLO': ['DESARROLLADOR', 'MASTER'], // Desarrollador y MASTER
    'EN_TESTING': ['DESARROLLADOR', 'MASTER'],
    'EN_PAUSA': ['DESARROLLADOR', 'MASTER']
  };

  const rolesPermitidos = permisosEdicion[estado_sol] || [];
  return rolesPermitidos.includes(rol);
};

// Validar transiciones de estado según rol
const validarTransicionEstado = (estadoActual, nuevoEstado, rol) => {
  const transicionesPorRol = {
    'USUARIO': {
      'BORRADOR': ['PENDIENTE'], // Usuario puede enviar borrador
      'RECHAZADA': ['PENDIENTE'] // Usuario puede reenviar rechazada
    },
    'MASTER': {
      'PENDIENTE': ['EN_REVISION', 'RECHAZADA'],
      'EN_REVISION': ['APROBADA', 'RECHAZADA', 'ESPERANDO_INFORMACION'],
      'APROBADA': ['EN_DESARROLLO', 'CANCELADA'],
      'ESPERANDO_INFORMACION': ['EN_REVISION'],
      'EN_DESARROLLO': ['EN_TESTING', 'EN_PAUSA', 'CANCELADA'],
      'EN_TESTING': ['COMPLETADA', 'EN_DESARROLLO'],
      'EN_PAUSA': ['EN_DESARROLLO', 'CANCELADA'],
      'COMPLETADA': ['CERRADA']
    },
    'DESARROLLADOR': {
      'APROBADA': ['EN_DESARROLLO'],
      'EN_DESARROLLO': ['EN_TESTING', 'EN_PAUSA'],
      'EN_PAUSA': ['EN_DESARROLLO'],
      'EN_TESTING': ['EN_DESARROLLO'] // Para reportar bugs
    }
  };

  const transicionesPermitidas = transicionesPorRol[rol]?.[estadoActual] || [];
  return transicionesPermitidas.includes(nuevoEstado);
};

// Obtener solicitudes con planes pendientes de aprobación (para MASTER)
const obtenerSolicitudesPlanesPendientes = async (req, res) => {
  try {
    console.log('=== OBTENER SOLICITUDES CON PLANES PENDIENTES ===');

    // Primero verificar si hay solicitudes con este estado
    const count = await prisma.solicitudCambio.count({
      where: {
        estado_sol: 'PLANES_PENDIENTES_APROBACION'
      }
    });

    console.log('Número de solicitudes con estado PLANES_PENDIENTES_APROBACION:', count);

    // Si no hay solicitudes con ese estado, devolver array vacío
    if (count === 0) {
      console.log('No hay solicitudes con planes pendientes de aprobación');
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No hay solicitudes con planes técnicos pendientes de revisión'
      });
    }

    const solicitudes = await prisma.solicitudCambio.findMany({
      where: {
        estado_sol: 'PLANES_PENDIENTES_APROBACION',
        planes_enviados_revision: true
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
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true
          }
        }
      },
      orderBy: [
        { fecha_envio_planes: 'asc' },
        { prioridad_sol: 'desc' }
      ]
    });

    console.log('Solicitudes encontradas:', solicitudes.length);

    const solicitudesFormateadas = solicitudes.map(solicitud => ({
      ...solicitud,
      solicitante: `${solicitud.usuario.nom_usu1} ${solicitud.usuario.ape_usu1}`,
      email_solicitante: solicitud.usuario.cuentas[0]?.cor_cue,
      desarrollador_asignado: solicitud.desarrolladorAsignado ? 
        `${solicitud.desarrolladorAsignado.nom_usu1} ${solicitud.desarrolladorAsignado.ape_usu1}` : null
    }));

    console.log('Solicitudes con planes pendientes:', solicitudesFormateadas.length);

    res.json({
      success: true,
      data: solicitudesFormateadas,
      total: solicitudesFormateadas.length
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes con planes pendientes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Aprobar o rechazar planes técnicos (solo MASTER) - IDEMPOTENTE
const aprobarRechazarPlanes = async (req, res) => {
  try {
    const { id } = req.params;
    // CAMBIO: Leer datos desde query parameters en lugar del body para evitar OPTIONS
    const { accion, comentarios } = req.query; // accion: 'aprobar' | 'rechazar'
    const id_admin = req.usuario?.id_usu || req.user?.id_usu;

    console.log('=== APROBAR/RECHAZAR PLANES (IDEMPOTENTE) ===');
    console.log('Solicitud ID:', id);
    console.log('Acción:', accion);
    console.log('Admin ID:', id_admin);

    // Validar parámetros
    if (!['aprobar', 'rechazar'].includes(accion)) {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida. Use "aprobar" o "rechazar"'
      });
    }

    // Obtener la solicitud actual sin filtro de estado
    const solicitudActual = await prisma.solicitudCambio.findFirst({
      where: { id_sol: id }
    });

    if (!solicitudActual) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('Estado actual:', solicitudActual.estado_sol);
    console.log('Acción solicitada:', accion);

    // ==========================================
    // LÓGICA IDEMPOTENTE - VERIFICAR ESTADO ACTUAL
    // ==========================================

    // Si la acción es APROBAR
    if (accion === 'aprobar') {
      // Si ya está aprobada, devolver éxito (idempotente)
      if (solicitudActual.estado_sol === 'LISTO_PARA_IMPLEMENTAR') {
        console.log('✅ Solicitud ya aprobada, devolviendo éxito (idempotente)');
        return res.status(200).json({
          success: true,
          message: 'Planes técnicos ya fueron aprobados anteriormente',
          data: solicitudActual,
          accionRealizada: 'ninguna', // No se hizo cambio
          estadoFinal: 'LISTO_PARA_IMPLEMENTAR'
        });
      }
      
      // Si está en desarrollo (rechazada), es conflicto
      if (solicitudActual.estado_sol === 'EN_DESARROLLO') {
        return res.status(409).json({
          success: false,
          message: 'No se puede aprobar: los planes fueron rechazados anteriormente',
          estadoActual: 'EN_DESARROLLO'
        });
      }
    }

    // Si la acción es RECHAZAR
    if (accion === 'rechazar') {
      // Si ya está rechazada (EN_DESARROLLO), devolver éxito (idempotente)
      if (solicitudActual.estado_sol === 'EN_DESARROLLO') {
        console.log('✅ Solicitud ya rechazada, devolviendo éxito (idempotente)');
        return res.status(200).json({
          success: true,
          message: 'Planes técnicos ya fueron rechazados anteriormente',
          data: solicitudActual,
          accionRealizada: 'ninguna', // No se hizo cambio
          estadoFinal: 'EN_DESARROLLO'
        });
      }
      
      // Si está aprobada, es conflicto
      if (solicitudActual.estado_sol === 'LISTO_PARA_IMPLEMENTAR') {
        return res.status(409).json({
          success: false,
          message: 'No se puede rechazar: los planes ya fueron aprobados',
          estadoActual: 'LISTO_PARA_IMPLEMENTAR'
        });
      }
    }

    // Si no está en estado pendiente, no se puede procesar
    if (solicitudActual.estado_sol !== 'PLANES_PENDIENTES_APROBACION') {
      return res.status(400).json({
        success: false,
        message: `No se puede ${accion}: la solicitud no está pendiente de aprobación`,
        estadoActual: solicitudActual.estado_sol,
        estadoEsperado: 'PLANES_PENDIENTES_APROBACION'
      });
    }

    // ==========================================
    // PROCESAR LA ACCIÓN (SOLO SI ESTÁ PENDIENTE)
    // ==========================================
    
    console.log('🔄 Procesando acción:', accion);

    let datosActualizacion;
    let mensaje;

    if (accion === 'aprobar') {
      datosActualizacion = {
        estado_sol: 'LISTO_PARA_IMPLEMENTAR',
        planes_aprobados: true,
        fecha_aprobacion_planes: new Date(),
        comentarios_aprobacion_planes: comentarios || 'Planes técnicos aprobados',
        fec_ultima_actualizacion: new Date()
      };
      mensaje = 'Planes técnicos aprobados exitosamente';
    } else {
      datosActualizacion = {
        estado_sol: 'EN_DESARROLLO',
        planes_enviados_revision: false,
        planes_aprobados: false,
        comentarios_aprobacion_planes: comentarios || 'Planes técnicos requieren modificaciones',
        fec_ultima_actualizacion: new Date()
      };
      mensaje = 'Planes técnicos rechazados. La solicitud regresa a desarrollo';
    }

    // Actualizar la solicitud con verificación adicional de estado
    const solicitudActualizada = await prisma.solicitudCambio.updateMany({
      where: { 
        id_sol: id,
        estado_sol: 'PLANES_PENDIENTES_APROBACION' // Solo actualizar si aún está pendiente
      },
      data: datosActualizacion
    });

    // Si no se actualizó ningún registro, significa que cambió entre la verificación y la actualización
    if (solicitudActualizada.count === 0) {
      // Verificar el estado actual nuevamente
      const estadoActual = await prisma.solicitudCambio.findFirst({
        where: { id_sol: id },
        select: { estado_sol: true }
      });

      console.log('⚠️ No se pudo actualizar, estado actual:', estadoActual?.estado_sol);

      // Verificar si ya está en el estado deseado (idempotencia)
      const estadoDeseado = accion === 'aprobar' ? 'LISTO_PARA_IMPLEMENTAR' : 'EN_DESARROLLO';
      if (estadoActual?.estado_sol === estadoDeseado) {
        console.log('✅ Ya está en el estado deseado, devolviendo éxito');
        return res.status(200).json({
          success: true,
          message: `Planes técnicos ya fueron ${accion === 'aprobar' ? 'aprobados' : 'rechazados'} anteriormente`,
          data: await prisma.solicitudCambio.findFirst({ where: { id_sol: id } }),
          accionRealizada: 'ninguna'
        });
      }

      return res.status(409).json({
        success: false,
        message: 'La solicitud fue modificada por otro usuario. Por favor, recargue la página.',
        estadoActual: estadoActual?.estado_sol
      });
    }

    // Obtener la solicitud actualizada
    const solicitudFinal = await prisma.solicitudCambio.findFirst({
      where: { id_sol: id }
    });

    console.log('✅ Acción completada exitosamente');

    res.status(200).json({
      success: true,
      message,
      data: solicitudFinal,
      accionRealizada: accion
    });

  } catch (error) {
    console.error('Error aprobando/rechazando planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Editar solicitud por usuario (solo BORRADOR y RECHAZADA)
const editarSolicitudUsuario = async (req, res) => {
  try {
    console.log('=== EDITAR SOLICITUD USUARIO ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Usuario:', req.usuario?.id_usu);

    const { id } = req.params;
    const id_usuario = req.usuario.id_usu;
    const {
      titulo_sol,
      descripcion_sol,
      justificacion_sol,
      tipo_cambio_sol,
      prioridad_sol
    } = req.body;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitudExistente = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: id_usuario
      }
    });

    if (!solicitudExistente) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Solo permitir editar borradores y rechazadas
    if (!['BORRADOR', 'RECHAZADA'].includes(solicitudExistente.estado_sol)) {
      return res.status(400).json({
        success: false,
        message: `Solo se pueden editar solicitudes en estado BORRADOR o RECHAZADA. Estado actual: ${solicitudExistente.estado_sol}`
      });
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      fec_ultima_actualizacion: new Date()
    };

    // Solo actualizar campos que se envían
    if (titulo_sol !== undefined) datosActualizacion.titulo_sol = titulo_sol;
    if (descripcion_sol !== undefined) datosActualizacion.descripcion_sol = descripcion_sol;
    if (justificacion_sol !== undefined) datosActualizacion.justificacion_sol = justificacion_sol;
    if (tipo_cambio_sol !== undefined) datosActualizacion.tipo_cambio_sol = tipo_cambio_sol;
    if (prioridad_sol !== undefined) datosActualizacion.prioridad_sol = prioridad_sol;

    // Si la solicitud estaba rechazada, cambiar a borrador para permitir reenvío
    if (solicitudExistente.estado_sol === 'RECHAZADA') {
      datosActualizacion.estado_sol = 'BORRADOR';
      datosActualizacion.comentarios_admin_sol = null; // Limpiar comentarios anteriores
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
            ape_usu2: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Solicitud editada exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error al editar solicitud de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cancelar/Eliminar solicitud (solo BORRADOR)
const cancelarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usu;
    const { motivo = 'Cancelada por el usuario' } = req.body;

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_usuario_sol: id_usuario
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Solo permitir cancelar borradores
    if (solicitud.estado_sol !== 'BORRADOR') {
      return res.status(400).json({
        success: false,
        message: `Solo se pueden cancelar solicitudes en estado BORRADOR. Estado actual: ${solicitud.estado_sol}`
      });
    }

    // Actualizar estado a CANCELADA
    const solicitudCancelada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'CANCELADA',
        comentarios_admin_sol: motivo,
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: solicitudCancelada
    });

  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
  editarSolicitudUsuario,
  actualizarEstadoSolicitud,
  obtenerEstadisticas,
  gestionarSolicitudTecnica,
  obtenerSolicitudAdmin,
  asignarDesarrollador,
  obtenerDesarrolladoresDisponibles,
  enviarSolicitud,
  cancelarSolicitud,
  validarPermisosEdicion,
  validarTransicionEstado,
  obtenerSolicitudesPlanesPendientes,
  aprobarRechazarPlanes
}; 