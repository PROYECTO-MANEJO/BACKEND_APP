const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const githubService = require('../services/githubService');

// Sincronizar una solicitud con GitHub
const sincronizarSolicitudConGitHub = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
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

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está configurado en el servidor'
      });
    }

    // Sincronizar con GitHub
    const resultadoSync = await githubService.sincronizarSolicitud(id);

    if (!resultadoSync) {
      return res.status(500).json({
        success: false,
        message: 'Error al sincronizar con GitHub'
      });
    }

    // Actualizar la solicitud con la información de GitHub
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_commits: resultadoSync.commits,
        github_last_sync: resultadoSync.lastSync,
        // Si encontramos branches, usar el primero como principal
        github_branch_name: resultadoSync.branches.length > 0 ? resultadoSync.branches[0].name : null,
        // Si encontramos PRs, usar el primero
        github_pr_number: resultadoSync.pullRequests.length > 0 ? resultadoSync.pullRequests[0].number : null,
        github_pr_url: resultadoSync.pullRequests.length > 0 ? resultadoSync.pullRequests[0].url : null
      }
    });

    res.json({
      success: true,
      message: 'Sincronización con GitHub completada',
      data: {
        solicitud: solicitudActualizada,
        github: resultadoSync
      }
    });

  } catch (error) {
    console.error('Error sincronizando con GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener información de GitHub para una solicitud
const obtenerInfoGitHub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // Construir la consulta base según el rol
    let whereClause = { id_sol: id };

    // Si es desarrollador, solo puede ver solicitudes asignadas a él
    if (userRole === 'DESARROLLADOR') {
      whereClause.id_desarrollador_asignado = userId;
    }

    // Consulta unificada para todos los roles
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: whereClause,
      select: {
        id_sol: true,
        titulo_sol: true,
        estado_sol: true,
        id_desarrollador_asignado: true,
        github_repo_url: true,
        github_branch_name: true,
        github_pr_number: true,
        github_pr_url: true,
        github_pr_state: true,
        github_merged_at: true,
        github_last_sync: true,
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            github_token: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: userRole === 'DESARROLLADOR' 
          ? 'Solicitud no encontrada o no tienes acceso a ella'
          : 'Solicitud no encontrada'
      });
    }

    // Si hay un PR asociado y GitHub está configurado, obtener detalles adicionales
    let detallesPR = null;
    if (solicitud.github_pr_number && githubService.isConfigured()) {
      try {
        // Determinar el tipo de repositorio basado en la URL
        const repoType = solicitud.github_repo_url?.includes('backend') ? 'backend' : 'frontend';
        detallesPR = await githubService.obtenerInformacionPR(solicitud.github_pr_number, repoType);
      } catch (error) {
        console.error('Error al obtener detalles del PR:', error);
      }
    }

    // Combinar la información de la solicitud con los detalles del PR
    const respuesta = {
      ...solicitud,
      commits: detallesPR?.commits || [],
      files: detallesPR?.files || [],
      title: detallesPR?.title || solicitud.titulo_sol,
      author: detallesPR?.author || 'No disponible',
      created_at: detallesPR?.created_at || solicitud.github_last_sync,
      state: detallesPR?.state || solicitud.github_pr_state || 'No disponible',
      stats: detallesPR?.stats || {
        commits_count: 0,
        files_changed: 0,
        additions: 0,
        deletions: 0
      }
    };

    res.json({
      success: true,
      data: respuesta
    });

  } catch (error) {
    console.error('Error obteniendo información de GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asociar manualmente un branch de GitHub a una solicitud
const asociarBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, repoUrl } = req.body;

    if (!branchName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del branch es requerido'
      });
    }

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

    // Actualizar la solicitud con la información del branch
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_branch_name: branchName,
        github_repo_url: repoUrl || null,
        github_last_sync: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Branch asociado exitosamente',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error asociando branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asociar manualmente un Pull Request a una solicitud
const asociarPullRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { prNumber, prUrl } = req.body;

    if (!prNumber) {
      return res.status(400).json({
        success: false,
        message: 'El número del Pull Request es requerido'
      });
    }

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

    // Verificar que el estado actual permite el cambio
    if (solicitud.estado_sol !== 'EN_DESARROLLO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede crear un Pull Request cuando la solicitud está EN_DESARROLLO'
      });
    }

    // Si GitHub está configurado, obtener detalles del PR
    let detallesPR = null;
    if (githubService.isConfigured()) {
      detallesPR = await githubService.obtenerDetallesPullRequest(prNumber);
    }

    // Actualizar la solicitud con la información del PR
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_pr_number: prNumber,
        github_pr_url: prUrl || (detallesPR ? detallesPR.url : null),
        github_branch_name: detallesPR ? detallesPR.branch : solicitud.github_branch_name,
        github_last_sync: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Pull Request asociado exitosamente',
      data: {
        solicitud: solicitudActualizada,
        pullRequest: detallesPR
      }
    });

  } catch (error) {
    console.error('Error asociando Pull Request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Generar nombre de branch sugerido
const generarNombreBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      select: {
        id_sol: true,
        titulo_sol: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const nombreSugerido = githubService.generarNombreBranch(solicitud);
    const urlCrearBranch = githubService.generarUrlCrearBranch(solicitud);

    res.json({
      success: true,
      data: {
        nombreSugerido,
        urlCrearBranch
      }
    });

  } catch (error) {
    console.error('Error generando nombre de branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estado de configuración de GitHub
const obtenerEstadoConfiguracion = async (req, res) => {
  try {
    const configurado = githubService.isConfigured();
    const repositorios = githubService.getRepositoriesInfo();
    
    res.json({
      success: true,
      data: {
        configurado,
        repositorios,
        mensaje: configurado 
          ? 'GitHub está configurado correctamente' 
          : 'GitHub no está configurado. Verifica las variables de entorno GITHUB_TOKEN, GITHUB_DEFAULT_OWNER y GITHUB_DEFAULT_REPO'
      }
    });

  } catch (error) {
    console.error('Error verificando configuración de GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Sincronizar una solicitud en un repositorio específico
const sincronizarSolicitudEnRepo = async (req, res) => {
  try {
    const { id } = req.params;
    const { repoType } = req.body;

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

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está configurado en el servidor'
      });
    }

    // Sincronizar con repositorio específico
    const resultadoSync = await githubService.sincronizarSolicitudEnRepo(id, repoType);

    if (!resultadoSync) {
      return res.status(500).json({
        success: false,
        message: 'Error al sincronizar con GitHub'
      });
    }

    res.json({
      success: true,
      message: `Sincronización con repositorio ${repoType} completada`,
      data: resultadoSync
    });

  } catch (error) {
    console.error('Error sincronizando repositorio específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear un nuevo branch para una solicitud
const crearBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { repoType, baseBranch } = req.body;

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

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está configurado en el servidor'
      });
    }

    // Crear el branch
    const resultado = await githubService.crearBranch(solicitud, repoType, baseBranch);

    // Actualizar la solicitud con la información del branch creado
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_branch_name: resultado.branchName,
        github_repo_url: `https://github.com/${githubService.defaultOwner}/${resultado.repository}`,
        github_last_sync: new Date()
      }
    });

    res.json({
      success: true,
      message: resultado.alreadyExists ? 'Branch ya existía' : 'Branch creado exitosamente',
      data: {
        branch: resultado,
        solicitud: solicitudActualizada
      }
    });

  } catch (error) {
    console.error('Error creando branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear Pull Request para una solicitud
const crearPullRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, repoType, baseBranch } = req.body;

    if (!branchName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del branch es requerido'
      });
    }

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

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está configurado en el servidor'
      });
    }

    // Verificar que el estado actual permite el cambio
    if (solicitud.estado_sol !== 'EN_DESARROLLO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede crear un Pull Request cuando la solicitud está EN_DESARROLLO'
      });
    }

    // Crear el Pull Request
    const resultado = await githubService.crearPullRequest(solicitud, branchName, repoType, baseBranch);

    // Actualizar la solicitud con la información del PR
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_pr_number: resultado.number,
        github_pr_url: resultado.url,
        github_branch_name: resultado.branchName,
        github_repo_url: `https://github.com/${githubService.defaultOwner}/${resultado.repository}`,
        github_last_sync: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Pull Request creado exitosamente',
      data: {
        pullRequest: resultado,
        solicitud: solicitudActualizada
      }
    });

  } catch (error) {
    console.error('Error creando Pull Request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener información detallada de un branch
const obtenerInfoBranch = async (req, res) => {
  try {
    const { branchName, repoType } = req.params;

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está configurado en el servidor'
      });
    }

    // Obtener información del branch
    const branchInfo = await githubService.obtenerInfoBranch(branchName, repoType);

    res.json({
      success: true,
      data: branchInfo
    });

  } catch (error) {
    console.error('Error obteniendo información del branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ===================================
// NUEVOS CONTROLADORES PARA DESARROLLADORES
// ===================================

// Obtener token GitHub del usuario
const obtenerTokenUsuario = async (userId) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: { github_token: true }
    });
    return usuario?.github_token || null;
  } catch (error) {
    console.error('Error obteniendo token de usuario:', error);
    return null;
  }
};

// Crear branch con GitFlow para desarrolladores
const crearBranchGitFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchType, baseBranch, repoType } = req.body;
    const userId = req.userId; // Viene del middleware de autenticación

    // Validar datos requeridos
    if (!branchType || !repoType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de branch y repositorio son requeridos'
      });
    }

    // Verificar que la solicitud existe y está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      include: {
        desarrolladorAsignado: {
          select: {
            id_usu: true,
            github_token: true
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

    // Verificar que el usuario es el desarrollador asignado
    if (solicitud.desarrolladorAsignado?.id_usu !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para trabajar en esta solicitud'
      });
    }

    // Obtener token personal del desarrollador
    const userToken = await obtenerTokenUsuario(userId);

    console.log('🔄 Iniciando creación de branch GitFlow:'+' ' + branchType + ' ' + baseBranch + ' ' + repoType + ' ' + userToken );
    // Crear el branch con GitFlow
    const resultado = await githubService.crearBranchGitFlow(
      solicitud, 
      branchType, 
      baseBranch, 
      repoType, 
      userToken
    );

    // Actualizar la solicitud con información del branch
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_branch_name: resultado.branchName,
        github_repo_url: `https://github.com/${githubService.defaultOwner}/${resultado.repository}`,
        github_last_sync: new Date()
      }
    });

    res.json({
      success: true,
      message: resultado.alreadyExists ? 'Branch ya existía' : 'Branch creado exitosamente',
      data: {
        branch: resultado,
        solicitud: solicitudActualizada
      }
    });

  } catch (error) {
    console.error('Error creando branch GitFlow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear Pull Request personalizado para desarrolladores
const crearPullRequestDesarrollador = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, repoType, baseBranch } = req.body;
    const userId = req.userId;

    // Validar datos requeridos
    if (!branchName || !repoType || !baseBranch) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del branch, repositorio y branch base son requeridos'
      });
    }

    // Verificar que la solicitud existe y está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que el estado actual permite el cambio
    if (solicitud.estado_sol !== 'EN_DESARROLLO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede crear un Pull Request cuando la solicitud está EN_DESARROLLO'
      });
    }

    // Obtener el token del desarrollador si existe
    const desarrollador = await prisma.usuario.findUnique({
      where: { id_usu: userId }
    });

    const userToken = desarrollador?.github_token || null;

    // Crear el Pull Request usando el servicio de GitHub
    const pullRequest = await githubService.crearPullRequestPersonalizado(
      solicitud,
      branchName,
      repoType,
      baseBranch,  // Usar el branch base proporcionado
      userToken
    );

    // Actualizar la solicitud con información del PR
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        github_pr_number: pullRequest.number,
        github_pr_url: pullRequest.url,
        github_branch_name: pullRequest.branchName,
        github_repo_url: `https://github.com/${githubService.defaultOwner}/${pullRequest.repository}`,
        github_last_sync: new Date(),
        estado_sol: 'EN_TESTING',
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Pull Request creado exitosamente',
      data: {
        pullRequest: pullRequest,
        solicitud: solicitudActualizada
      }
    });

  } catch (error) {
    console.error('Error creando Pull Request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de solicitud a ESPERANDO_APROBACION
const cambiarAEsperandoAprobacion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificar que la solicitud existe y está asignada al desarrollador
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.id_desarrollador_asignado !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta solicitud'
      });
    }

    // Verificar que el estado actual permite el cambio
    if (solicitud.estado_sol !== 'EN_DESARROLLO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede cambiar a ESPERANDO_APROBACION desde EN_DESARROLLO'
      });
    }

    // Actualizar el estado
    const solicitudActualizada = await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'ESPERANDO_APROBACION',
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Estado actualizado a ESPERANDO_APROBACION',
      data: solicitudActualizada
    });

  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tipos GitFlow disponibles
const obtenerTiposGitFlow = async (req, res) => {
  try {
    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'GitHub no está configurado en el servidor',
        error: 'GITHUB_NOT_CONFIGURED',
        suggestion: 'Configure las variables de entorno GITHUB_TOKEN, GITHUB_DEFAULT_OWNER, etc.'
      });
    }

    const tipos = githubService.getGitFlowTypes();
    
    res.json({
      success: true,
      data: tipos
    });

  } catch (error) {
    console.error('Error obteniendo tipos GitFlow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener branches disponibles en un repositorio
const obtenerBranchesRepositorio = async (req, res) => {
  try {
    const { repoType } = req.params;

    // Verificar si GitHub está configurado
    if (!githubService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'GitHub no está configurado en el servidor',
        error: 'GITHUB_NOT_CONFIGURED',
        suggestion: 'Configure las variables de entorno GITHUB_TOKEN, GITHUB_DEFAULT_OWNER, etc.'
      });
    }

    const branches = await githubService.obtenerBranchesDisponibles(repoType);
    
    res.json({
      success: true,
      data: branches
    });

  } catch (error) {
    console.error('Error obteniendo branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Detectar PRs automáticamente y actualizar estados
const detectarPullRequests = async (req, res) => {
  try {
    // Obtener solicitudes en estado EN_DESARROLLO o ESPERANDO_APROBACION
    const solicitudesActivas = await prisma.solicitudCambio.findMany({
      where: {
        estado_sol: {
          in: ['EN_DESARROLLO', 'ESPERANDO_APROBACION']
        }
      },
      select: { id_sol: true, github_pr_number: true }
    });

    const solicitudIds = solicitudesActivas.map(s => s.id_sol);
    
    if (solicitudIds.length === 0) {
      return res.json({
        success: true,
        message: 'No hay solicitudes activas para verificar',
        data: []
      });
    }

    // Detectar PRs automáticamente
    const resultados = await githubService.detectarPullRequestsAutomaticamente(solicitudIds);
    
    // Actualizar solicitudes que tienen PRs nuevos
    const actualizaciones = [];
    for (const resultado of resultados) {
      const solicitud = solicitudesActivas.find(s => s.id_sol === resultado.solicitudId);
      const primerPR = resultado.pullRequests[0];
      
      if (primerPR && !solicitud.github_pr_number) {
        // Actualizar solicitud con información del PR encontrado
        const solicitudActualizada = await prisma.solicitudCambio.update({
          where: { id_sol: resultado.solicitudId },
          data: {
            github_pr_number: primerPR.number,
            github_pr_url: primerPR.url,
            github_branch_name: primerPR.branch,
            github_last_sync: new Date()
          }
        });
        
        actualizaciones.push({
          solicitudId: resultado.solicitudId,
          prNumber: primerPR.number,
          actualizada: true
        });
      }
    }

    res.json({
      success: true,
      message: `Detectados ${resultados.length} PRs, ${actualizaciones.length} solicitudes actualizadas`,
      data: {
        prsDetectados: resultados,
        solicitudesActualizadas: actualizaciones
      }
    });

  } catch (error) {
    console.error('Error detectando PRs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar merge de PRs y actualizar estados a COMPLETADA
const verificarMerges = async (req, res) => {
  try {
    // Obtener solicitudes en estado ESPERANDO_APROBACION con PR asignado
    const solicitudesConPR = await prisma.solicitudCambio.findMany({
      where: {
        estado_sol: 'ESPERANDO_APROBACION',
        github_pr_number: {
          not: null
        }
      },
      select: { 
        id_sol: true, 
        github_pr_number: true, 
        github_repo_url: true 
      }
    });

    const verificaciones = [];
    
    for (const solicitud of solicitudesConPR) {
      try {
        // Determinar tipo de repositorio desde la URL
        const repoType = solicitud.github_repo_url?.includes('FRONTEND') ? 'frontend' : 'backend';
        
        // Verificar estado del merge
        const estadoMerge = await githubService.verificarEstadoMerge(
          solicitud.github_pr_number, 
          repoType
        );
        
        if (estadoMerge.merged) {
          // Actualizar estado a COMPLETADA
          const solicitudActualizada = await prisma.solicitudCambio.update({
            where: { id_sol: solicitud.id_sol },
            data: {
              estado_sol: 'COMPLETADA',
              fecha_real_fin_sol: new Date(),
              exito_implementacion: true,
              fec_ultima_actualizacion: new Date()
            }
          });
          
          verificaciones.push({
            solicitudId: solicitud.id_sol,
            prNumber: solicitud.github_pr_number,
            merged: true,
            estadoActualizado: 'COMPLETADA'
          });
        } else {
          verificaciones.push({
            solicitudId: solicitud.id_sol,
            prNumber: solicitud.github_pr_number,
            merged: false,
            estado: estadoMerge.state
          });
        }
      } catch (error) {
        console.warn(`Error verificando PR ${solicitud.github_pr_number}:`, error.message);
        verificaciones.push({
          solicitudId: solicitud.id_sol,
          prNumber: solicitud.github_pr_number,
          error: error.message
        });
      }
    }

    const mergeados = verificaciones.filter(v => v.merged).length;

    res.json({
      success: true,
      message: `Verificados ${verificaciones.length} PRs, ${mergeados} fueron mergeados`,
      data: verificaciones
    });

  } catch (error) {
    console.error('Error verificando merges:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Validar token personal de GitHub
const validarTokenPersonal = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es requerido'
      });
    }

    const validacion = await githubService.validarTokenPersonal(token);

    res.json({
      success: true,
      data: validacion
    });

  } catch (error) {
    console.error('Error validando token personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Rechazar un PR con comentarios
const rechazarPR = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    // Obtener la solicitud
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      select: {
        id_sol: true,
        github_pr_number: true,
        github_repo_url: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (!solicitud.github_pr_number) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene un PR asociado'
      });
    }

    // Determinar tipo de repositorio desde la URL
    const repoType = solicitud.github_repo_url?.toLowerCase().includes('backend') ? 'backend' : 'frontend';

    // Rechazar el PR en GitHub
    await githubService.rechazarPR(solicitud.github_pr_number, comentarios, repoType);

    // Actualizar estado de la solicitud
    await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'EN_DESARROLLO',
        fec_ultima_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: 'PR rechazado exitosamente'
    });

  } catch (error) {
    console.error('Error rechazando PR:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Aprobar un PR con comentarios y hacer merge automático
const aprobarPR = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    // Obtener la solicitud
    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      select: {
        id_sol: true,
        github_pr_number: true,
        github_repo_url: true,
        estado_sol: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (!solicitud.github_pr_number) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene un PR asociado'
      });
    }

    // Determinar tipo de repositorio desde la URL
    const repoType = solicitud.github_repo_url?.includes('backend') ? 'backend' : 'frontend';

    // Aprobar y mergear el PR
    await githubService.aprobarYMergearPR(
      solicitud.github_pr_number,
      comentarios || 'PR aprobado por MASTER',
      repoType
    );

    // Actualizar estado de la solicitud
    await prisma.solicitudCambio.update({
      where: { id_sol: id },
      data: {
        estado_sol: 'COMPLETADA',
        github_pr_state: 'merged',
        github_merged_at: new Date(),
        comentarios_internos_sol: `PR aprobado y mergeado por MASTER el ${new Date().toLocaleString()}:\n\n${comentarios || 'Sin comentarios adicionales'}`
      }
    });

    res.json({
      success: true,
      message: 'PR aprobado y mergeado correctamente'
    });

  } catch (error) {
    console.error('Error al aprobar PR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar PR',
      error: error.message
    });
  }
};

module.exports = {
  // Controladores existentes
  sincronizarSolicitudConGitHub,
  obtenerInfoGitHub,
  asociarBranch,
  asociarPullRequest,
  generarNombreBranch,
  obtenerEstadoConfiguracion,
  sincronizarSolicitudEnRepo,
  crearBranch,
  crearPullRequest,
  obtenerInfoBranch,
  
  // Nuevos controladores para desarrolladores
  crearBranchGitFlow,
  crearPullRequestDesarrollador,
  cambiarAEsperandoAprobacion,
  obtenerTiposGitFlow,
  obtenerBranchesRepositorio,
  detectarPullRequests,
  verificarMerges,
  validarTokenPersonal,
  rechazarPR,
  aprobarPR
}; 