const axios = require('axios');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = process.env.GITHUB_TOKEN; // Token de acceso personal
    this.defaultOwner = process.env.GITHUB_DEFAULT_OWNER || 'tu-organizacion';
    this.defaultRepo = process.env.GITHUB_DEFAULT_REPO || 'tu-repositorio';
    
    // Solo 2 repositorios: Frontend y Backend
    this.repositories = {
      frontend: process.env.GITHUB_REPO_FRONTEND,
      backend: process.env.GITHUB_REPO_BACKEND
    };
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SolicitudesCambio-App'
      }
    });
  }

  // Verificar si el servicio está configurado correctamente
  isConfigured() {
    return !!(this.token && this.defaultOwner && this.defaultRepo);
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

      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`);
      const pr = response.data;

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
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files
      };
    } catch (error) {
      console.error('Error obteniendo detalles del PR:', error.message);
      return null;
    }
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
}

module.exports = new GitHubService(); 