const { PrismaClient } = require('@prisma/client');
const githubService = require('../services/githubService');

const prisma = new PrismaClient();

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

    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id_sol: id },
      select: {
        id_sol: true,
        titulo_sol: true,
        github_repo_url: true,
        github_branch_name: true,
        github_pr_number: true,
        github_pr_url: true,
        github_commits: true,
        github_last_sync: true
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

module.exports = {
  sincronizarSolicitudConGitHub,
  obtenerInfoGitHub,
  asociarBranch,
  asociarPullRequest,
  generarNombreBranch,
  obtenerEstadoConfiguracion,
  sincronizarSolicitudEnRepo,
  crearBranch,
  crearPullRequest,
  obtenerInfoBranch
}; 