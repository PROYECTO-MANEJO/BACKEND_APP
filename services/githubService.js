const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('../config/github');

class GitHubService {
  constructor() {
    this.baseURL = config.baseUrl;
    this.token = config.token;
    this.defaultOwner = config.owner;
    this.defaultRepo = config.defaultRepo || 'tu-repositorio';
    
    // Solo 2 repositorios: Frontend y Backend
    this.repositories = config.repositories;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SolicitudesCambio-App'
      }
    });

    // GitFlow branch types
    this.gitFlowTypes = {
      'feature': { prefix: 'feature/', defaultBase: 'develop' },
      'hotfix': { prefix: 'hotfix/', defaultBase: 'main' },
      'bugfix': { prefix: 'bugfix/', defaultBase: 'develop' },
      'release': { prefix: 'release/', defaultBase: 'develop' }
    };

    // Validar configuración requerida
    if (!this.defaultOwner) {
      console.error('❌ GITHUB_OWNER no está configurado en el .env');
    }
    if (!this.repositories.frontend || !this.repositories.backend) {
      console.error('❌ GITHUB_REPO_FRONTEND o GITHUB_REPO_BACKEND no están configurados en el .env');
    }
  }

  // Verificar si el servicio está configurado correctamente
  isConfigured(userToken = null) {
    const hasValidToken = !!(userToken || this.token);
    return !!(hasValidToken && this.defaultOwner && this.repositories);
  }

  // Buscar branches que contengan el ID de la solicitud
  async buscarBranchesPorSolicitud(solicitudId, owner = this.defaultOwner, repo = this.defaultRepo) {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const response = await this.client.get(`/repos/${owner}/${repo}/branches`);
      const branches = response.data;
      
      // Buscar branches que contengan el ID de la solicitud
      const branchesRelacionados = branches.filter(branch => 
        branch.name.includes(solicitudId) || 
        branch.name.includes(`SOL-${solicitudId}`) ||
        branch.name.includes(`solicitud-${solicitudId}`)
      );

      return branchesRelacionados;
    } catch (error) {
      console.error('Error buscando branches:', error.message);
      return [];
    }
  }

  // Obtener commits de un branch específico
  async obtenerCommitsDeBranch(branchName, owner = this.defaultOwner, repo = this.defaultRepo) {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          sha: branchName,
          per_page: 50
        }
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }));
    } catch (error) {
      console.error('Error obteniendo commits:', error.message);
      return [];
    }
  }

  // Buscar Pull Requests relacionados con una solicitud
  async buscarPullRequestsPorSolicitud(solicitudId, owner = this.defaultOwner, repo = this.defaultRepo) {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const response = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
        params: {
          state: 'all',
          per_page: 100
        }
      });

      const pullRequests = response.data;
      
      // Buscar PRs que contengan el ID de la solicitud en título o branch
      const prsRelacionados = pullRequests.filter(pr => 
        pr.title.includes(solicitudId) ||
        pr.title.includes(`SOL-${solicitudId}`) ||
        pr.head.ref.includes(solicitudId) ||
        pr.head.ref.includes(`SOL-${solicitudId}`) ||
        pr.head.ref.includes(`solicitud-${solicitudId}`)
      );

      return prsRelacionados.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        merged: pr.merged_at !== null,
        url: pr.html_url,
        branch: pr.head.ref,
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        author: pr.user.login
      }));
    } catch (error) {
      console.error('Error buscando Pull Requests:', error.message);
      return [];
    }
  }

  // Obtener información detallada de un Pull Request
  async obtenerDetallesPullRequest(prNumber, owner = this.defaultOwner, repo = this.defaultRepo) {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      // Obtener información básica del PR
      const prResponse = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`);
      const pr = prResponse.data;

      // Obtener commits del PR
      const commitsResponse = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/commits`);
      const commits = commitsResponse.data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        shortMessage: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        formattedDate: new Date(commit.commit.author.date).toLocaleDateString('es-ES')
      }));

      // Obtener archivos modificados
      const filesResponse = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
      const files = filesResponse.data.map(file => ({
        filename: file.filename,
        status: file.status,
        statusLabel: this.getFileStatusLabel(file.status),
        statusColor: this.getFileStatusColor(file.status),
        additions: file.additions,
        deletions: file.deletions,
        extension: file.filename.split('.').pop()
      }));

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        merged: pr.merged_at !== null,
        url: pr.html_url,
        branch: pr.head.ref,
        base_branch: pr.base.ref,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        author: pr.user.login,
        commits,
        files,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files
      };
    } catch (error) {
      console.error('Error obteniendo detalles del PR:', error.message);
      return null;
    }
  }

  // Obtener etiqueta para el estado del archivo
  getFileStatusLabel(status) {
    const labels = {
      added: 'Agregado',
      removed: 'Eliminado',
      modified: 'Modificado',
      renamed: 'Renombrado',
      copied: 'Copiado',
      changed: 'Cambiado',
      unchanged: 'Sin cambios'
    };
    return labels[status] || status;
  }

  // Obtener color para el estado del archivo
  getFileStatusColor(status) {
    const colors = {
      added: '#16a34a',    // Verde
      removed: '#dc2626',  // Rojo
      modified: '#2563eb', // Azul
      renamed: '#9333ea',  // Púrpura
      copied: '#0d9488',   // Verde azulado
      changed: '#0891b2',  // Cian
      unchanged: '#6b7280' // Gris
    };
    return colors[status] || '#6b7280';
  }

  // Sincronizar información de GitHub para una solicitud en múltiples repositorios
  async sincronizarSolicitud(solicitudId) {
    try {
      const resultado = {
        branches: [],
        pullRequests: [],
        commits: [],
        repositories: {},
        lastSync: new Date()
      };

      // Buscar en todos los repositorios configurados
      for (const [repoType, repoName] of Object.entries(this.repositories)) {
        try {
          const repoBranches = await this.buscarBranchesPorSolicitud(solicitudId, this.defaultOwner, repoName);
          const repoPRs = await this.buscarPullRequestsPorSolicitud(solicitudId, this.defaultOwner, repoName);
          
          if (repoBranches.length > 0 || repoPRs.length > 0) {
            resultado.repositories[repoType] = {
              name: repoName,
              branches: repoBranches,
              pullRequests: repoPRs
            };
            
            resultado.branches = resultado.branches.concat(repoBranches.map(b => ({...b, repository: repoName, repoType})));
            resultado.pullRequests = resultado.pullRequests.concat(repoPRs.map(pr => ({...pr, repository: repoName, repoType})));
            
            // Obtener commits de los branches encontrados
            for (const branch of repoBranches) {
              const commits = await this.obtenerCommitsDeBranch(branch.name, this.defaultOwner, repoName);
              resultado.commits = resultado.commits.concat(commits.map(c => ({...c, repository: repoName, repoType})));
            }
          }
        } catch (error) {
          console.warn(`Error buscando en repositorio ${repoName}:`, error.message);
        }
      }

      return resultado;
    } catch (error) {
      console.error('Error sincronizando con GitHub:', error.message);
      return null;
    }
  }

  // Método para sincronizar solo un repositorio específico
  async sincronizarSolicitudEnRepo(solicitudId, repoType = 'frontend') {
    try {
      const repoName = this.repositories[repoType];
      
      const resultado = {
        branches: [],
        pullRequests: [],
        commits: [],
        repository: repoName,
        repoType: repoType,
        lastSync: new Date()
      };

      // Buscar branches relacionados en el repo específico
      resultado.branches = await this.buscarBranchesPorSolicitud(solicitudId, this.defaultOwner, repoName);

      // Buscar Pull Requests relacionados
      resultado.pullRequests = await this.buscarPullRequestsPorSolicitud(solicitudId, this.defaultOwner, repoName);

      // Si hay branches, obtener commits
      if (resultado.branches.length > 0) {
        for (const branch of resultado.branches) {
          const commits = await this.obtenerCommitsDeBranch(branch.name, this.defaultOwner, repoName);
          resultado.commits = resultado.commits.concat(commits);
        }
      }

      return resultado;
    } catch (error) {
      console.error(`Error sincronizando repositorio ${repoType}:`, error.message);
      return null;
    }
  }

  // Generar nombre de branch sugerido para una solicitud
  generarNombreBranch(solicitud) {
    const titulo = solicitud.titulo_sol
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return `SOL-${solicitud.id_sol.substring(0, 8)}-${titulo}`;
  }

  // Generar URL para crear un nuevo branch (enlace directo)
  generarUrlCrearBranch(solicitud, owner = this.defaultOwner, repo = this.defaultRepo) {
    const branchName = this.generarNombreBranch(solicitud);
    return `https://github.com/${owner}/${repo}/tree/${branchName}`;
  }

  // Generar URL para crear un Pull Request
  generarUrlCrearPullRequest(solicitud, branchName, owner = this.defaultOwner, repo = this.defaultRepo) {
    const titulo = `SOL-${solicitud.id_sol.substring(0, 8)}: ${solicitud.titulo_sol}`;
    const cuerpo = `
## Solicitud de Cambio: ${solicitud.titulo_sol}

**ID de Solicitud:** ${solicitud.id_sol}
**Tipo:** ${solicitud.tipo_cambio_sol}
**Prioridad:** ${solicitud.prioridad_sol}

### Descripción
${solicitud.descripcion_sol}

### Justificación
${solicitud.justificacion_sol}

---
*Este PR está vinculado automáticamente con la solicitud de cambio ${solicitud.id_sol}*
    `;

    const params = new URLSearchParams({
      title: titulo,
      body: cuerpo,
      head: branchName,
      base: 'main' // o 'master', según tu configuración
    });

    return `https://github.com/${owner}/${repo}/compare/${branchName}?${params.toString()}`;
  }

  // Obtener repositorios disponibles
  getRepositories() {
    return this.repositories;
  }

  // Obtener lista de repositorios con información
  getRepositoriesInfo() {
    return Object.entries(this.repositories).map(([type, name]) => ({
      type,
      name,
      fullName: `${this.defaultOwner}/${name}`,
      url: `https://github.com/${this.defaultOwner}/${name}`
    }));
  }

  // Crear un nuevo branch en un repositorio específico
  async crearBranch(solicitud, repoType = 'frontend', baseBranch = 'main') {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const repoName = this.repositories[repoType];
      const branchName = this.generarNombreBranch(solicitud);

      // 1. Obtener el SHA del branch base
      const baseBranchResponse = await this.client.get(`/repos/${this.defaultOwner}/${repoName}/git/refs/heads/${baseBranch}`);
      const baseSha = baseBranchResponse.data.object.sha;

      // 2. Crear el nuevo branch
      const newBranchResponse = await this.client.post(`/repos/${this.defaultOwner}/${repoName}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      });

      return {
        success: true,
        branchName,
        repository: repoName,
        repoType,
        url: `https://github.com/${this.defaultOwner}/${repoName}/tree/${branchName}`,
        baseBranch,
        sha: newBranchResponse.data.object.sha
      };

    } catch (error) {
      console.error('Error creando branch:', error.message);
      
      // Si el branch ya existe, devolver información del branch existente
      if (error.response?.status === 422 && error.response.data.message.includes('already exists')) {
        const branchName = this.generarNombreBranch(solicitud);
        const repoName = this.repositories[repoType];
        
        return {
          success: true,
          branchName,
          repository: repoName,
          repoType,
          url: `https://github.com/${this.defaultOwner}/${repoName}/tree/${branchName}`,
          alreadyExists: true
        };
      }
      
      throw error;
    }
  }

  // Crear Pull Request desde un branch
  async crearPullRequest(solicitud, branchName, repoType = 'frontend', baseBranch = 'main') {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const repoName = this.repositories[repoType];
      
      const titulo = `SOL-${solicitud.id_sol.substring(0, 8)}: ${solicitud.titulo_sol}`;
      const cuerpo = `## Solicitud de Cambio: ${solicitud.titulo_sol}

**ID de Solicitud:** ${solicitud.id_sol}
**Tipo:** ${solicitud.tipo_cambio_sol}
**Prioridad:** ${solicitud.prioridad_sol}

### Descripción
${solicitud.descripcion_sol}

### Justificación
${solicitud.justificacion_sol}

### Planes de Implementación
${solicitud.plan_implementacion_sol || 'Por definir'}

---
*Este PR está vinculado automáticamente con la solicitud de cambio ${solicitud.id_sol}*
      `;

      const prResponse = await this.client.post(`/repos/${this.defaultOwner}/${repoName}/pulls`, {
        title: titulo,
        head: branchName,
        base: baseBranch,
        body: cuerpo,
        draft: false
      });

      return {
        success: true,
        number: prResponse.data.number,
        url: prResponse.data.html_url,
        title: prResponse.data.title,
        branchName,
        repository: repoName,
        repoType
      };

    } catch (error) {
      console.error('Error creando Pull Request:', error.message);
      throw error;
    }
  }

  // Obtener información detallada de un branch específico
  async obtenerInfoBranch(branchName, repoType = 'frontend') {
    try {
      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const repoName = this.repositories[repoType];

      // Obtener información del branch
      const branchResponse = await this.client.get(`/repos/${this.defaultOwner}/${repoName}/branches/${branchName}`);
      
      // Obtener commits del branch
      const commitsResponse = await this.client.get(`/repos/${this.defaultOwner}/${repoName}/commits`, {
        params: {
          sha: branchName,
          per_page: 10
        }
      });

      return {
        name: branchName,
        repository: repoName,
        repoType,
        url: `https://github.com/${this.defaultOwner}/${repoName}/tree/${branchName}`,
        lastCommit: {
          sha: branchResponse.data.commit.sha,
          message: branchResponse.data.commit.commit.message,
          author: branchResponse.data.commit.commit.author.name,
          date: branchResponse.data.commit.commit.author.date
        },
        commits: commitsResponse.data.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url
        })),
        protected: branchResponse.data.protected
      };

    } catch (error) {
      console.error('Error obteniendo información del branch:', error.message);
      throw error;
    }
  }

  // ===================================
  // NUEVAS FUNCIONALIDADES PARA DESARROLLADORES
  // ===================================

  // Crear cliente con token personalizado (si el desarrollador tiene uno)
  createClientWithToken(userToken = null) {
    const token = userToken || this.token;
    if (!token) {
      throw new Error('No se proporcionó un token válido');
    }
    
    if (!this.baseURL) {
      throw new Error('No se ha configurado la URL base de GitHub');
    }

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SolicitudesCambio-App'
      }
    });
  }

  // Generar nombre de branch según GitFlow
  generarNombreBranchGitFlow(solicitud, branchType = 'feature') {
    const gitFlowConfig = this.gitFlowTypes[branchType];
    if (!gitFlowConfig) {
      throw new Error(`Tipo de branch no soportado: ${branchType}`);
    }

    // Tomar máximo 5 caracteres del ID
    const shortId = solicitud.id_sol.substring(0, 5);
    
    // Limpiar y acortar título (reemplazar espacios con guiones bajos, solo caracteres alfanuméricos)
    const cleanTitle = solicitud.titulo_sol
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    return `${gitFlowConfig.prefix}${shortId}_${cleanTitle}`;
  }

  // Crear branch con GitFlow y token personalizado
  async crearBranchGitFlow(solicitud, branchType = 'feature', baseBranch = null, repoType = 'frontend', userToken = null) {
    try {
      console.log('🔍 Iniciando creación de branch GitFlow:', {
        solicitudId: solicitud.id_sol,
        branchType,
        baseBranch,
        repoType
      });

      if (!this.isConfigured(userToken)) {
        console.error('❌ GitHub no está configurado:', {
          token: !!(userToken || this.token),
          owner: this.defaultOwner,
          repos: this.repositories
        });
        throw new Error('GitHub no está configurado');
      }

      const repoName = this.repositories[repoType];
      console.log('📦 Repositorio seleccionado:', {
        type: repoType,
        name: repoName,
        owner: this.defaultOwner
      });

      // Si no se especifica baseBranch, usar el default del tipo
      const targetBaseBranch = baseBranch || this.gitFlowTypes[branchType]?.defaultBase || 'develop';
      console.log('🌿 Branch base a utilizar:', targetBaseBranch);

      // Crear cliente con token personalizado si se proporciona
      const client = this.createClientWithToken(userToken);

      // 1. Verificar que existe el branch base usando la API de branches
      try {
        console.log('🔍 Verificando branch base usando API de branches...');
        const branchesResponse = await client.get(`/repos/${this.defaultOwner}/${repoName}/branches`);
        const branches = branchesResponse.data;
        console.log('📋 Branches disponibles:', branches.map(b => b.name));
        
        const branchExists = branches.some(b => b.name === targetBaseBranch);
        if (!branchExists) {
          console.error('❌ Branch base no encontrado en la lista de branches:', targetBaseBranch);
          throw new Error(`El branch base '${targetBaseBranch}' no existe en el repositorio ${repoName}`);
        }

        console.log('✅ Branch base encontrado:', targetBaseBranch);
        
        // 2. Obtener el SHA del branch base
        const baseBranchResponse = await client.get(`/repos/${this.defaultOwner}/${repoName}/branches/${targetBaseBranch}`);
        const baseSha = baseBranchResponse.data.commit.sha;
        const branchName = this.generarNombreBranchGitFlow(solicitud, branchType);

        // 3. Crear el nuevo branch
        console.log('📝 Creando nuevo branch:', branchName, 'desde SHA:', baseSha);
        const newBranchResponse = await client.post(`/repos/${this.defaultOwner}/${repoName}/git/refs`, {
          ref: `refs/heads/${branchName}`,
          sha: baseSha
        });

        console.log('✅ Branch creado exitosamente:', newBranchResponse.data.ref);

        return {
          success: true,
          branchName,
          repository: repoName,
          repoType,
          url: `https://github.com/${this.defaultOwner}/${repoName}/tree/${branchName}`,
          baseBranch: targetBaseBranch,
          sha: newBranchResponse.data.object.sha
        };

      } catch (error) {
        console.error('❌ Error detallado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 404) {
          throw new Error(`El branch base '${targetBaseBranch}' no existe o no es accesible en el repositorio ${repoName}`);
        }
        throw error;
      }

    } catch (error) {
      console.error('❌ Error en crearBranchGitFlow:', error);
      throw error;
    }
  }

  // Crear Pull Request con token personalizado
  async crearPullRequestPersonalizado(solicitud, branchName, repoType = 'frontend', baseBranch = null, userToken = null) {
    try {
      const client = this.createClientWithToken(userToken);
      const repoName = this.repositories[repoType];
      
      // Usar exactamente el branch base proporcionado sin valores por defecto
      const targetBaseBranch = baseBranch;

      console.log('🔍 Creando Pull Request:', {
        repo: repoName,
        head: branchName,
        base: targetBaseBranch,
        title: `SOL-${solicitud.id_sol.substring(0, 8)}: ${solicitud.titulo_sol}`
      });

      // Primero verificamos que el branch base exista
      try {
        const baseResponse = await client.get(`/repos/${this.defaultOwner}/${repoName}/git/ref/heads/${targetBaseBranch}`);
        console.log('✅ Branch base verificado:', baseResponse.data);
      } catch (error) {
        console.error('❌ Error verificando branch base:', error.message);
        throw new Error(`El branch base ${targetBaseBranch} no existe en el repositorio ${repoName}`);
      }

      // Luego verificamos que el branch head exista
      try {
        const headResponse = await client.get(`/repos/${this.defaultOwner}/${repoName}/git/ref/heads/${branchName}`);
        console.log('✅ Branch head verificado:', headResponse.data);
      } catch (error) {
        console.error('❌ Error verificando branch head:', error.message);
        throw new Error(`El branch ${branchName} no existe en el repositorio ${repoName}`);
      }
      
      const titulo = `SOL-${solicitud.id_sol.substring(0, 8)}: ${solicitud.titulo_sol}`;
      const cuerpo = `## Solicitud de Cambio: ${solicitud.titulo_sol}

**ID de Solicitud:** ${solicitud.id_sol}
**Tipo:** ${solicitud.tipo_cambio_sol}
**Prioridad:** ${solicitud.prioridad_sol}

### Descripción
${solicitud.descripcion_sol}

### Justificación
${solicitud.justificacion_sol}

### Plan de Implementación
${solicitud.plan_implementacion_sol || 'Por definir'}

### Plan de Testing
${solicitud.plan_testing_sol || 'Por definir'}

### Plan de Roll-out
${solicitud.plan_rollout_sol || 'Por definir'}

### Plan de Back-out
${solicitud.plan_backout_sol || 'Por definir'}

---
*Este PR está vinculado automáticamente con la solicitud de cambio ${solicitud.id_sol}*
      `;

      try {
        const prResponse = await client.post(`/repos/${this.defaultOwner}/${repoName}/pulls`, {
          title: titulo,
          head: branchName,
          base: targetBaseBranch,
          body: cuerpo,
          draft: false
        });

        return {
          success: true,
          number: prResponse.data.number,
          url: prResponse.data.html_url,
          title: prResponse.data.title,
          branchName,
          repository: repoName,
          repoType,
          baseBranch: targetBaseBranch,
          createdWithPersonalToken: !!userToken
        };

      } catch (error) {
        console.error('Error detallado al crear Pull Request:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          requestData: error.config?.data,
          errors: error.response?.data?.errors // Mostrar los errores específicos
        });
        throw error;
      }
    } catch (error) {
      console.error('Error detallado al crear Pull Request:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: error.config?.data
      });
      throw error;
    }
  }

  // Obtener tipos de GitFlow disponibles
  getGitFlowTypes() {
    return Object.keys(this.gitFlowTypes).map(type => ({
      type,
      prefix: this.gitFlowTypes[type].prefix,
      defaultBase: this.gitFlowTypes[type].defaultBase,
      description: this.getGitFlowDescription(type)
    }));
  }

  // Obtener descripción de tipos GitFlow
  getGitFlowDescription(type) {
    const descriptions = {
      'feature': 'Nueva funcionalidad o mejora',
      'hotfix': 'Corrección urgente en producción',
      'bugfix': 'Corrección de errores',
      'release': 'Preparación de nueva versión'
    };
    return descriptions[type] || 'Tipo de branch personalizado';
  }

  // Detectar PRs automáticamente para solicitudes específicas
  async detectarPullRequestsAutomaticamente(solicitudIds = []) {
    try {
      const resultados = [];

      for (const solicitudId of solicitudIds) {
        const prsEncontrados = [];
        
        // Buscar en ambos repositorios
        for (const [repoType, repoName] of Object.entries(this.repositories)) {
          try {
            const prs = await this.buscarPullRequestsPorSolicitud(solicitudId, this.defaultOwner, repoName);
            prsEncontrados.push(...prs.map(pr => ({ ...pr, repository: repoName, repoType })));
          } catch (error) {
            console.warn(`Error buscando PRs en ${repoName} para solicitud ${solicitudId}:`, error.message);
          }
        }

        if (prsEncontrados.length > 0) {
          resultados.push({
            solicitudId,
            pullRequests: prsEncontrados,
            lastChecked: new Date()
          });
        }
      }

      return resultados;
    } catch (error) {
      console.error('Error detectando PRs automáticamente:', error.message);
      return [];
    }
  }

  // Verificar estado de merge de un PR
  async verificarEstadoMerge(prNumber, repoType = 'frontend') {
    try {
      const repoName = this.repositories[repoType];
      const pr = await this.obtenerDetallesPullRequest(prNumber, this.defaultOwner, repoName);
      
      return {
        prNumber,
        repository: repoName,
        repoType,
        merged: pr?.merged || false,
        state: pr?.state || 'unknown',
        mergedAt: pr?.merged_at,
        url: pr?.url
      };
    } catch (error) {
      console.error('Error verificando estado de merge:', error.message);
      return {
        prNumber,
        merged: false,
        state: 'error',
        error: error.message
      };
    }
  }

  // Obtener branches disponibles en un repositorio
  async obtenerBranchesDisponibles(repoType = 'frontend') {
    try {
      const repoName = this.repositories[repoType];
      const response = await this.client.get(`/repos/${this.defaultOwner}/${repoName}/branches`);
      
      return response.data.map(branch => ({
        name: branch.name,
        protected: branch.protected,
        lastCommit: {
          sha: branch.commit.sha,
          url: branch.commit.url
        }
      }));
    } catch (error) {
      console.error('Error obteniendo branches disponibles:', error.message);
      return [];
    }
  }

  // Validar un token de GitHub personal
  async validarTokenPersonal(token) {
    try {
      if (!token) {
        return { valid: false, error: 'Token no proporcionado' };
      }

      // Crear cliente temporal con el token a validar
      const tempClient = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SolicitudesCambio-App'
        }
      });

      // Intentar obtener información del usuario autenticado
      const response = await tempClient.get('/user');
      
      // También verificar permisos en los repositorios principales
      const permissions = {};
      for (const [repoType, repoName] of Object.entries(this.repositories)) {
        try {
          const repoResponse = await tempClient.get(`/repos/${this.defaultOwner}/${repoName}`);
          permissions[repoType] = {
            push: repoResponse.data.permissions?.push || false,
            pull: repoResponse.data.permissions?.pull || false,
            admin: repoResponse.data.permissions?.admin || false
          };
        } catch (error) {
          permissions[repoType] = {
            push: false,
            pull: false,
            admin: false,
            error: error.response?.status === 404 ? 'Repository not found' : 'Access denied'
          };
        }
      }

      return {
        valid: true,
        user: {
          login: response.data.login,
          name: response.data.name,
          email: response.data.email,
          avatar_url: response.data.avatar_url
        },
        permissions,
        scopes: response.headers['x-oauth-scopes']?.split(', ') || [],
        rateLimit: {
          limit: response.headers['x-ratelimit-limit'],
          remaining: response.headers['x-ratelimit-remaining'],
          reset: new Date(response.headers['x-ratelimit-reset'] * 1000)
        }
      };

    } catch (error) {
      console.error('Error validando token personal:', error.message);
      
      let errorMessage = 'Token inválido';
      if (error.response?.status === 401) {
        errorMessage = 'Token no autorizado o expirado';
      } else if (error.response?.status === 403) {
        errorMessage = 'Token válido pero sin permisos suficientes';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }

      return {
        valid: false,
        error: errorMessage,
        statusCode: error.response?.status
      };
    }
  }

  // Función removida - duplicada. Ver versión actualizada más abajo

  // Obtener token del MASTER
  async obtenerTokenMaster() {
    const masterUser = await prisma.usuario.findFirst({
      where: {
        cuentas: {
          some: {
            rol_cue: 'MASTER'
          }
        }
      },
      select: {
        github_token: true
      }
    });

    if (!masterUser?.github_token) {
      throw new Error('No se encontró el token del MASTER');
    }

    return masterUser.github_token;
  }

  // Aprobar y mergear PR usando el token del MASTER
  async aprobarYMergearPR(prNumber, comentarios, repoType = 'frontend') {
    try {
      // Obtener el token del MASTER
      const masterToken = await this.obtenerTokenMaster();
      
      const owner = this.defaultOwner;
      const repo = this.repositories[repoType];

      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      // Crear cliente con el token del MASTER
      const client = this.createClientWithToken(masterToken);

      // Agregar comentario de aprobación
      await client.post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        body: `✅ Aprobado por MASTER\n\n${comentarios || ''}`
      });

      // Mergear el PR usando squash
      await client.put(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
        merge_method: 'squash',
        commit_title: `[MASTER] Merge PR #${prNumber}`,
        commit_message: comentarios || 'Cambios aprobados por MASTER'
      });

      return true;
    } catch (error) {
      console.error('Error en aprobarYMergearPR:', error);
      throw error;
    }
  }

  // Rechazar PR usando el token del MASTER
  async rechazarPR(prNumber, comentarios, repoType = 'frontend') {
    try {
      // Obtener el token del MASTER
      const masterToken = await this.obtenerTokenMaster();
      
      const owner = this.defaultOwner;
      const repo = this.repositories[repoType];

      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      // Crear cliente con el token del MASTER
      const client = this.createClientWithToken(masterToken);

      // Agregar comentario de rechazo
      await client.post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        body: `❌ Rechazado por MASTER\n\n${comentarios || ''}`
      });

      return true;
    } catch (error) {
      console.error('Error en rechazarPR:', error);
      throw error;
    }
  }

  // =====================================================
  // NUEVAS FUNCIONES PARA MÚLTIPLES RAMAS
  // =====================================================

  /**
   * Crear rama específica para frontend o backend
   * @param {string} branchName - Nombre de la rama (ej: feature/SC-123-f)
   * @param {string} baseBranch - Rama base (ej: develop)
   * @param {string} repoType - Tipo de repositorio (frontend/backend)
   * @param {string} userToken - Token del desarrollador
   */
  async crearBranchEspecifico(branchName, baseBranch = 'develop', repoType = 'frontend', userToken = null) {
    try {
      console.log('🔧 Creando rama específica:', { branchName, baseBranch, repoType });

      if (!this.isConfigured(userToken)) {
        throw new Error('GitHub no está configurado correctamente');
      }

      // Validar repositorio
      if (!['frontend', 'backend'].includes(repoType)) {
        throw new Error('Tipo de repositorio inválido. Debe ser frontend o backend');
      }

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      // Crear cliente con token del desarrollador
      const octokit = new Octokit({
        auth: userToken || this.token
      });

      // Obtener el SHA de la rama base
      const { data: baseBranchData } = await octokit.rest.git.getRef({
        owner: this.defaultOwner,
        repo,
        ref: `heads/${baseBranch}`
      });

      // Crear nueva rama
      const { data: newBranch } = await octokit.rest.git.createRef({
        owner: this.defaultOwner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseBranchData.object.sha
      });

      console.log('✅ Rama creada exitosamente:', branchName);

      return {
        branchName,
        repo: `${this.defaultOwner}/${repo}`,
        url: `https://github.com/${this.defaultOwner}/${repo}/tree/${branchName}`,
        sha: newBranch.object.sha,
        baseBranch,
        repository_type: repoType.toUpperCase()
      };

    } catch (error) {
      console.error('❌ Error creando rama específica:', error);
      
      if (error.status === 422) {
        throw new Error(`La rama ${branchName} ya existe en el repositorio ${repoType}`);
      } else if (error.status === 404) {
        throw new Error(`Rama base ${baseBranch} no encontrada en el repositorio ${repoType}`);
      } else if (error.status === 401) {
        throw new Error('Token de GitHub inválido o sin permisos');
      }
      
      throw error;
    }
  }

  /**
   * Crear Pull Request específico
   * @param {object} solicitud - Objeto de la solicitud
   * @param {string} branchName - Nombre de la rama
   * @param {string} baseBranch - Rama destino
   * @param {string} repoType - Tipo de repositorio
   * @param {string} userToken - Token del desarrollador
   */
  async crearPullRequestEspecifico(solicitud, branchName, baseBranch = 'develop', repoType = 'frontend', userToken = null) {
    try {
      console.log('🔧 Creando PR específico:', { branchName, baseBranch, repoType });

      if (!this.isConfigured(userToken)) {
        throw new Error('GitHub no está configurado correctamente');
      }

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      // Crear cliente con token del desarrollador
      const octokit = new Octokit({
        auth: userToken || this.token
      });

      // Generar título y descripción del PR
      const repoTypeLabel = repoType === 'frontend' ? 'Frontend' : 'Backend';
      const title = `[${repoTypeLabel}] ${solicitud.titulo_sol}`;
      
      const body = this.generarDescripcionPR(solicitud, repoType);

      // Crear Pull Request
      const { data: pullRequest } = await octokit.rest.pulls.create({
        owner: this.defaultOwner,
        repo,
        title,
        body,
        head: branchName,
        base: baseBranch,
        draft: false
      });

      console.log('✅ PR creado exitosamente:', pullRequest.number);

      return {
        number: pullRequest.number,
        title: pullRequest.title,
        body: pullRequest.body,
        html_url: pullRequest.html_url,
        state: pullRequest.state,
        head: {
          ref: pullRequest.head.ref,
          sha: pullRequest.head.sha
        },
        base: {
          ref: pullRequest.base.ref
        },
        repository_type: repoType.toUpperCase()
      };

    } catch (error) {
      console.error('❌ Error creando PR específico:', error);
      
      if (error.status === 422) {
        const message = error.response?.data?.errors?.[0]?.message || 'Error de validación';
        throw new Error(`Error creando PR: ${message}`);
      } else if (error.status === 404) {
        throw new Error(`Rama ${branchName} no encontrada en el repositorio ${repoType}`);
      } else if (error.status === 401) {
        throw new Error('Token de GitHub inválido o sin permisos');
      }
      
      throw error;
    }
  }

  /**
   * Generar descripción del PR según el tipo de repositorio
   */
  generarDescripcionPR(solicitud, repoType) {
    const repoTypeLabel = repoType === 'frontend' ? 'Frontend' : 'Backend';
    
    return `## ${repoTypeLabel} - Solicitud de Cambio #${solicitud.id_sol}

### Descripción
${solicitud.descripcion_sol}

### Justificación
${solicitud.justificacion_sol}

### Tipo de Cambio
- **Categoría**: ${solicitud.tipo_cambio_sol}
- **Prioridad**: ${solicitud.prioridad_sol}
- **Repositorio**: ${repoTypeLabel}

### Checklist ${repoTypeLabel}
${repoType === 'frontend' ? 
`- [ ] Componentes actualizados
- [ ] Estilos implementados
- [ ] Responsive design verificado
- [ ] Tests unitarios actualizados
- [ ] Integración con backend verificada` :
`- [ ] Endpoints implementados
- [ ] Validaciones agregadas
- [ ] Base de datos actualizada
- [ ] Tests unitarios actualizados
- [ ] Documentación API actualizada`}

### Información Adicional
- **Solicitud ID**: ${solicitud.id_sol}
- **Fecha Creación**: ${new Date(solicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
- **Desarrollador**: Asignado

---
*Este PR fue generado automáticamente por el sistema de gestión de solicitudes de cambio.*`;
  }

  /**
   * Obtener información de PR específico
   * @param {number} prNumber - Número del PR
   * @param {string} repoType - Tipo de repositorio
   */
  async obtenerInformacionPR(prNumber, repoType = 'frontend') {
    try {
      console.log('🔍 Obteniendo información del PR:', { prNumber, repoType });

      if (!this.isConfigured()) {
        throw new Error('GitHub no está configurado');
      }

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      const octokit = new Octokit({
        auth: this.token
      });

      // Obtener información del PR
      const { data: pr } = await octokit.rest.pulls.get({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber
      });

      // Obtener commits del PR
      const { data: commits } = await octokit.rest.pulls.listCommits({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber
      });

      // Obtener archivos modificados
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber
      });

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        merged: pr.merged_at !== null,
        html_url: pr.html_url,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha
        },
        base: {
          ref: pr.base.ref
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url
        },
        commits: commits.map(commit => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date
        })),
        files: files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions
        })),
        stats: {
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changed_files
        },
        repository_type: repoType.toUpperCase()
      };

    } catch (error) {
      console.error('❌ Error obteniendo información del PR:', error);
      
      if (error.status === 404) {
        throw new Error(`PR #${prNumber} no encontrado en el repositorio ${repoType}`);
      }
      
      throw error;
    }
  }

  /**
   * Aprobar PR específico
   * @param {number} prNumber - Número del PR
   * @param {string} comentarios - Comentarios de aprobación
   * @param {string} repoType - Tipo de repositorio
   */
  async aprobarPR(prNumber, comentarios, repoType = 'frontend') {
    try {
      console.log('✅ Aprobando PR:', { prNumber, repoType });

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      const octokit = new Octokit({
        auth: this.token
      });

      // Crear review de aprobación
      await octokit.rest.pulls.createReview({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber,
        body: comentarios || `PR aprobado por Master - ${repoType}`,
        event: 'APPROVE'
      });

      console.log('✅ PR aprobado exitosamente');

      return {
        success: true,
        message: `PR #${prNumber} aprobado en ${repoType}`
      };

    } catch (error) {
      console.error('❌ Error aprobando PR:', error);
      throw error;
    }
  }

  /**
   * Rechazar PR específico
   * @param {number} prNumber - Número del PR
   * @param {string} comentarios - Comentarios de rechazo
   * @param {string} repoType - Tipo de repositorio
   */
  async rechazarPR(prNumber, comentarios, repoType = 'frontend') {
    try {
      console.log('❌ Rechazando PR:', { prNumber, repoType });

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      const octokit = new Octokit({
        auth: this.token
      });

      // Crear review de rechazo
      await octokit.rest.pulls.createReview({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber,
        body: comentarios,
        event: 'REQUEST_CHANGES'
      });

      console.log('❌ PR rechazado exitosamente');

      return {
        success: true,
        message: `PR #${prNumber} rechazado en ${repoType}`
      };

    } catch (error) {
      console.error('❌ Error rechazando PR:', error);
      throw error;
    }
  }

  /**
   * Obtener información de todas las ramas de una solicitud
   * @param {number} solicitudId - ID de la solicitud
   */
  async obtenerRamasSolicitud(solicitudId) {
    try {
      console.log('🔍 Obteniendo ramas de solicitud:', solicitudId);

      // Obtener ramas de la base de datos
      const ramas = await prisma.solicitudRama.findMany({
        where: {
          id_solicitud: solicitudId
        },
        orderBy: {
          repository_type: 'asc'
        }
      });

      // Para cada rama que tiene PR, obtener información actualizada de GitHub
      const ramasConInfo = await Promise.all(
        ramas.map(async (rama) => {
          if (rama.pr_number) {
            try {
              const prInfo = await this.obtenerInformacionPR(rama.pr_number, rama.repository_type.toLowerCase());
              return {
                ...rama,
                pr_info: prInfo
              };
            } catch (error) {
              console.warn(`No se pudo obtener info del PR ${rama.pr_number} para ${rama.repository_type}:`, error.message);
              return rama;
            }
          }
          return rama;
        })
      );

      return ramasConInfo;

    } catch (error) {
      console.error('❌ Error obteniendo ramas de solicitud:', error);
      throw error;
    }
  }

  /**
   * Mergear PR específico después de aprobación
   * @param {number} prNumber - Número del PR
   * @param {string} repoType - Tipo de repositorio
   */
  async mergearPR(prNumber, repoType = 'frontend') {
    try {
      console.log('🔄 Mergeando PR:', { prNumber, repoType });

      const repo = this.repositories[repoType];
      if (!repo) {
        throw new Error(`Repositorio ${repoType} no configurado`);
      }

      const octokit = new Octokit({
        auth: this.token
      });

      // Mergear Pull Request
      const { data: merge } = await octokit.rest.pulls.merge({
        owner: this.defaultOwner,
        repo,
        pull_number: prNumber,
        commit_title: `Merge PR #${prNumber}`,
        merge_method: 'merge'
      });

      console.log('✅ PR mergeado exitosamente');

      return {
        success: true,
        sha: merge.sha,
        merged: true,
        message: `PR #${prNumber} mergeado exitosamente en ${repoType}`
      };

    } catch (error) {
      console.error('❌ Error mergeando PR:', error);
      
      if (error.status === 405) {
        throw new Error(`PR #${prNumber} no se puede mergear automáticamente. Revisar conflictos.`);
      } else if (error.status === 409) {
        throw new Error(`PR #${prNumber} ya fue mergeado o cerrado.`);
      }
      
      throw error;
    }
  }
}

// Crear una instancia única
const githubServiceInstance = new GitHubService();

// Exportar tanto la clase como la instancia
module.exports = githubServiceInstance;
module.exports.GitHubService = GitHubService; 