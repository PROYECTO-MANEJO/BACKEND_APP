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
    if (['EN_DESARROLLO', 'EN_TESTING', 'EN_DESPLIEGUE'].includes(estado)) {
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
        estado_sol: {
          in: ['APROBADA', 'EN_DESARROLLO']
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en estado válido para enviar planes'
      });
    }

    // Validar que los planes técnicos estén completos (TODOS LOS 4 PLANES)
    const planesCompletos = solicitud.plan_implementacion_sol && 
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

// Iniciar desarrollo de una solicitud
const iniciarDesarrollo = async (req, res) => {
  try {
    const { id } = req.params;
    const desarrolladorId = req.uid;

    console.log('=== INICIAR DESARROLLO ===');
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
        estado_sol: 'LISTO_PARA_IMPLEMENTAR',
        id_desarrollador_asignado: desarrolladorId
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está lista para iniciar desarrollo'
      });
    }

    // Crear branch en GitHub usando el token del desarrollador
    const githubService = new GitHubService();
    
    // Crear branch en frontend
    console.log('Creando branch en frontend...');
    const frontendBranch = await githubService.crearBranchGitFlow(
      solicitud,
      'feature',
      'develop',
      'frontend',
      githubToken
    );

    // Crear branch en backend si es necesario
    let backendBranch = null;
    if (solicitud.requiere_cambios_backend) {
      console.log('Creando branch en backend...');
      backendBranch = await githubService.crearBranchGitFlow(
        solicitud,
        'feature',
        'develop',
        'backend',
        githubToken
      );
    }

    // Crear Pull Request en frontend
    console.log('Creando PR en frontend...');
    const frontendPR = await githubService.crearPullRequestPersonalizado(
      solicitud,
      frontendBranch.branchName,
      'frontend',
      'develop',
      githubToken
    );

    // Crear Pull Request en backend si es necesario
    let backendPR = null;
    if (backendBranch) {
      console.log('Creando PR en backend...');
      backendPR = await githubService.crearPullRequestPersonalizado(
        solicitud,
        backendBranch.branchName,
        'backend',
        'develop',
        githubToken
      );
    }

    // Actualizar solicitud con información de GitHub
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_DESARROLLO',
        frontend_branch: frontendBranch.branchName,
        backend_branch: backendBranch?.branchName || null,
        frontend_pr_url: frontendPR.html_url,
        backend_pr_url: backendPR?.html_url || null,
        frontend_pr_number: frontendPR.number,
        backend_pr_number: backendPR?.number || null,
        fec_inicio_desarrollo_sol: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Desarrollo iniciado correctamente',
      data: {
        solicitud: solicitudActualizada,
        frontend: {
          branch: frontendBranch,
          pullRequest: frontendPR
        },
        backend: backendBranch ? {
          branch: backendBranch,
          pullRequest: backendPR
        } : null
      }
    });

  } catch (error) {
    console.error('Error iniciando desarrollo:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciando desarrollo',
      error: error.message
    });
  }
};

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
        estado_sol: 'EN_DESPLIEGUE',
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