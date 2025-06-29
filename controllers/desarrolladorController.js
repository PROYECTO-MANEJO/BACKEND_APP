const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GitHubService } = require('../services/githubService');

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
            'EN_DESARROLLO', 
            'EN_TESTING', 
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
        },
        ramas: {
          orderBy: {
            repository_type: 'asc'
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

// Función auxiliar para obtener el token de GitHub del desarrollador
const obtenerTokenGitHubDesarrollador = async (desarrolladorId) => {
  const desarrollador = await prisma.usuario.findUnique({
    where: { id_usu: desarrolladorId },
    select: { github_token: true }
  });

  if (!desarrollador?.github_token) {
    throw new Error('El desarrollador no tiene configurado su token de GitHub');
  }

  return desarrollador.github_token;
};

// Actualizar estado de una solicitud
const actualizarEstadoSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.uid;
    
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

    // Obtener el token de GitHub del desarrollador si es necesario
    let githubToken = null;
    if (['EN_DESARROLLO', 'EN_TESTING'].includes(estado)) {
      try {
        githubToken = await obtenerTokenGitHubDesarrollador(userId);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
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
      en_desarrollo: 0,
      en_testing: 0,
      completadas: 0,
      fallidas: 0
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
      plan_implementacion_sol,
      plan_rollout_sol, 
      plan_backout_sol, 
      plan_testing_sol
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
        plan_implementacion_sol,
        plan_rollout_sol,
        plan_backout_sol,
        plan_testing_sol,
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

// Esta función ya no es necesaria con el nuevo flujo simplificado

// Esta función ya no es necesaria con el nuevo flujo de ramas múltiples

// Pasar solicitud a testing
const pasarATesting = async (req, res) => {
  try {
    const { id } = req.params;
    const desarrolladorId = req.uid;

    console.log('=== PASAR A TESTING ===');
    console.log('Solicitud ID:', id);
    console.log('Desarrollador ID:', desarrolladorId);

    // Obtener el token de GitHub del desarrollador
    let githubToken;
    try {
      githubToken = await obtenerTokenGitHubDesarrollador(desarrolladorId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Verificar que la solicitud existe y está en estado correcto
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        estado_sol: 'EN_DESARROLLO',
        id_desarrollador_asignado: desarrolladorId
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en desarrollo'
      });
    }

    // Verificar que los PRs existen y están listos
    const githubService = new GitHubService();

    // Verificar PR de frontend
    if (!solicitud.frontend_pr_number) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró el Pull Request de frontend'
      });
    }

    // Verificar estado del PR de frontend
    const frontendPRInfo = await githubService.obtenerInformacionPR(
      solicitud.frontend_pr_number,
      'frontend',
      githubToken
    );

    if (!frontendPRInfo || frontendPRInfo.state !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'El Pull Request de frontend no está abierto'
      });
    }

    // Si hay cambios en backend, verificar también ese PR
    if (solicitud.requiere_cambios_backend && solicitud.backend_pr_number) {
      const backendPRInfo = await githubService.obtenerInformacionPR(
        solicitud.backend_pr_number,
        'backend',
        githubToken
      );

      if (!backendPRInfo || backendPRInfo.state !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'El Pull Request de backend no está abierto'
        });
      }
    }

    // Actualizar estado de la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_TESTING',
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Solicitud pasada a testing correctamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error pasando a testing:', error);
    res.status(500).json({
      success: false,
      message: 'Error pasando a testing',
      error: error.message
    });
  }
};

// Pasar solicitud a despliegue
const pasarADespliegue = async (req, res) => {
  try {
    const { id } = req.params;
    const desarrolladorId = req.uid;

    console.log('=== PASAR A DESPLIEGUE ===');
    console.log('Solicitud ID:', id);
    console.log('Desarrollador ID:', desarrolladorId);

    // Obtener el token de GitHub del desarrollador
    let githubToken;
    try {
      githubToken = await obtenerTokenGitHubDesarrollador(desarrolladorId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Verificar que la solicitud existe y está en estado correcto
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        estado_sol: 'EN_TESTING',
        id_desarrollador_asignado: desarrolladorId
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en testing'
      });
    }

    // Verificar que los PRs existen y están listos
    const githubService = new GitHubService();

    // Verificar PR de frontend
    if (!solicitud.frontend_pr_number) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró el Pull Request de frontend'
      });
    }

    // Verificar estado del PR de frontend
    const frontendPRInfo = await githubService.obtenerInformacionPR(
      solicitud.frontend_pr_number,
      'frontend',
      githubToken
    );

    if (!frontendPRInfo || frontendPRInfo.state !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'El Pull Request de frontend no está abierto'
      });
    }

    // Si hay cambios en backend, verificar también ese PR
    if (solicitud.requiere_cambios_backend && solicitud.backend_pr_number) {
      const backendPRInfo = await githubService.obtenerInformacionPR(
        solicitud.backend_pr_number,
        'backend',
        githubToken
      );

      if (!backendPRInfo || backendPRInfo.state !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'El Pull Request de backend no está abierto'
        });
      }
    }

    // Actualizar estado de la solicitud
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_TESTING',
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Solicitud pasada a despliegue correctamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error pasando a despliegue:', error);
    res.status(500).json({
      success: false,
      message: 'Error pasando a despliegue',
      error: error.message
    });
  }
};

// Esta función ya no es necesaria - la completación se maneja automáticamente

// =====================================================
// NUEVAS FUNCIONES PARA MÚLTIPLES RAMAS
// =====================================================

// Crear rama específica (frontend o backend)
const crearRamaEspecifica = async (req, res) => {
  try {
    const { id } = req.params;
    const { repository_type, base_branch = 'develop' } = req.body;
    const desarrolladorId = req.uid;

    console.log('=== CREAR RAMA ESPECÍFICA ===');
    console.log('Solicitud ID:', id);
    console.log('Repository Type:', repository_type);
    console.log('Desarrollador ID:', desarrolladorId);

    // Validar repository_type
    if (!['FRONTEND', 'BACKEND'].includes(repository_type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de repositorio inválido. Debe ser FRONTEND o BACKEND'
      });
    }

    // Obtener el token de GitHub del desarrollador
    let githubToken;
    try {
      githubToken = await obtenerTokenGitHubDesarrollador(desarrolladorId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Verificar que la solicitud existe y está en estado correcto
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        estado_sol: {
          in: ['APROBADA', 'EN_DESARROLLO']
        },
        id_desarrollador_asignado: desarrolladorId
      },
      include: {
        ramas: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en estado válido para crear ramas'
      });
    }

    // Verificar que no existe ya una rama de este tipo
    const ramaExistente = solicitud.ramas.find(rama => rama.repository_type === repository_type);
    if (ramaExistente) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una rama de tipo ${repository_type} para esta solicitud`
      });
    }

    // Generar nombre de rama con sufijo
    const sufijo = repository_type === 'FRONTEND' ? 'f' : 'b';
    const branchName = `feature/SC-${solicitud.id_sol.split('-')[0]}-${sufijo}`;

    // Crear branch en GitHub
    const githubService = new GitHubService();
    const repoType = repository_type.toLowerCase();
    
    console.log(`Creando branch en ${repoType} desde ${base_branch}...`);
    const branchResult = await githubService.crearBranchEspecifico(
      branchName,
      base_branch,
      repoType,
      githubToken
    );

    // Guardar rama en base de datos
    const nuevaRama = await prisma.solicitudRama.create({
      data: {
        id_solicitud: id,
        repository_type,
        branch_name: branchName,
        pr_status: 'PENDING'
      }
    });

    // Actualizar estado de solicitud si es necesario
    await actualizarEstadoSolicitudPorRamas(id);

    res.json({
      success: true,
      message: `Rama ${repository_type} creada correctamente`,
      data: {
        rama: nuevaRama,
        github: branchResult
      }
    });

  } catch (error) {
    console.error('Error creando rama específica:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando rama',
      error: error.message
    });
  }
};

// Crear Pull Request específico
const crearPRSpecifico = async (req, res) => {
  try {
    const { id } = req.params;
    const { repository_type, target_branch = 'develop' } = req.body;
    const desarrolladorId = req.uid;

    console.log('=== CREAR PR ESPECÍFICO ===');
    console.log('Solicitud ID:', id);
    console.log('Repository Type:', repository_type);

    // Validar repository_type
    if (!['FRONTEND', 'BACKEND'].includes(repository_type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de repositorio inválido. Debe ser FRONTEND o BACKEND'
      });
    }

    // Obtener el token de GitHub del desarrollador
    let githubToken;
    try {
      githubToken = await obtenerTokenGitHubDesarrollador(desarrolladorId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Verificar que la solicitud y rama existen
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id_sol: id,
        id_desarrollador_asignado: desarrolladorId
      },
      include: {
        ramas: {
          where: {
            repository_type
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

    const rama = solicitud.ramas[0];
    if (!rama) {
      return res.status(400).json({
        success: false,
        message: `No existe rama de tipo ${repository_type} para esta solicitud`
      });
    }

    if (rama.pr_number) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un PR para la rama ${repository_type}`
      });
    }

    // Crear Pull Request en GitHub
    const githubService = new GitHubService();
    const repoType = repository_type.toLowerCase();
    
    console.log(`Creando PR en ${repoType}...`);
    console.log(`Creando PR para ${repoType} hacia ${target_branch}...`);
    const prResult = await githubService.crearPullRequestEspecifico(
      solicitud,
      rama.branch_name,
      target_branch,
      repoType,
      githubToken
    );

    // Actualizar rama con información del PR
    const ramaActualizada = await prisma.solicitudRama.update({
      where: { id: rama.id },
      data: {
        pr_number: prResult.number,
        pr_url: prResult.html_url,
        pr_state: prResult.state,
        pr_status: 'OPEN',
        updated_at: new Date()
      }
    });

    // Actualizar estado de solicitud si es necesario
    await actualizarEstadoSolicitudPorRamas(id);

    res.json({
      success: true,
      message: `Pull Request ${repository_type} creado correctamente`,
      data: {
        rama: ramaActualizada,
        github: prResult
      }
    });

  } catch (error) {
    console.error('Error creando PR específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando Pull Request',
      error: error.message
    });
  }
};

// Obtener ramas de una solicitud
const obtenerRamasSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const ramas = await prisma.solicitudRama.findMany({
      where: {
        id_solicitud: id
      },
      orderBy: {
        repository_type: 'asc'
      }
    });

    res.json({
      success: true,
      data: ramas
    });

  } catch (error) {
    console.error('Error obteniendo ramas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ramas',
      error: error.message
    });
  }
};

// Función helper para actualizar estado de solicitud basado en ramas
const actualizarEstadoSolicitudPorRamas = async (solicitudId) => {
  try {
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: { id_sol: solicitudId },
      include: { ramas: true }
    });

    if (!solicitud || !solicitud.ramas.length) return;

    const ramas = solicitud.ramas;
    
    // Lógica de estados basada en ramas
    const tieneRamasConPR = ramas.some(rama => rama.pr_number);
    const todasTienenPR = ramas.every(rama => rama.pr_number);
    const todasAprobadas = ramas.every(rama => rama.pr_status === 'APPROVED');
    const algunaRechazada = ramas.some(rama => rama.pr_status === 'REJECTED');
    const todasMergeadas = ramas.every(rama => rama.pr_status === 'MERGED');

    let nuevoEstado = solicitud.estado_sol;

    if (todasMergeadas) {
      nuevoEstado = 'COMPLETADA';
    } else if (algunaRechazada) {
      nuevoEstado = 'EN_DESARROLLO';
    } else if (todasTienenPR) {
      nuevoEstado = 'EN_TESTING';
    } else if (tieneRamasConPR) {
      nuevoEstado = 'EN_DESARROLLO';
    }

    if (nuevoEstado !== solicitud.estado_sol) {
      await prisma.solicitudCambio.update({
        where: { id_sol: solicitudId },
        data: { 
          estado_sol: nuevoEstado,
          fec_ultima_actualizacion: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Error actualizando estado por ramas:', error);
  }
};

// Obtener ramas disponibles de un repositorio
const obtenerRamasDisponibles = async (req, res) => {
  try {
    const { repository_type } = req.params;
    const desarrolladorId = req.uid;

    console.log('=== OBTENER RAMAS DISPONIBLES ===');
    console.log('Repository Type:', repository_type);
    console.log('Desarrollador ID:', desarrolladorId);

    // Validar repository_type
    if (!['frontend', 'backend'].includes(repository_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de repositorio inválido. Debe ser frontend o backend'
      });
    }

    // Obtener el token de GitHub del desarrollador
    let githubToken;
    try {
      githubToken = await obtenerTokenGitHubDesarrollador(desarrolladorId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Obtener ramas del repositorio
    const githubService = new GitHubService();
    const ramas = await githubService.obtenerBranchesDisponibles(repository_type.toLowerCase());

    res.json({
      success: true,
      data: ramas
    });

  } catch (error) {
    console.error('Error obteniendo ramas disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ramas disponibles',
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
  pasarATesting,
  crearRamaEspecifica,
  crearPRSpecifico,
  obtenerRamasSolicitud,
  actualizarEstadoSolicitudPorRamas,
  obtenerRamasDisponibles
}; 