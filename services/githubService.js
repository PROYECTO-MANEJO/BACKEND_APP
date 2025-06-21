const axios = require('axios');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = process.env.GITHUB_TOKEN; // Token de acceso personal
    this.defaultOwner = process.env.GITHUB_DEFAULT_OWNER || 'tu-organizacion';
    this.defaultRepo = process.env.GITHUB_DEFAULT_REPO || 'tu-repositorio';
    
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

  // Sincronizar información de GitHub para una solicitud
  async sincronizarSolicitud(solicitudId) {
    try {
      const resultado = {
        branches: [],
        pullRequests: [],
        commits: [],
        lastSync: new Date()
      };

      // Buscar branches relacionados
      resultado.branches = await this.buscarBranchesPorSolicitud(solicitudId);

      // Buscar Pull Requests relacionados
      resultado.pullRequests = await this.buscarPullRequestsPorSolicitud(solicitudId);

      // Si hay branches, obtener commits
      if (resultado.branches.length > 0) {
        for (const branch of resultado.branches) {
          const commits = await this.obtenerCommitsDeBranch(branch.name);
          resultado.commits = resultado.commits.concat(commits);
        }
      }

      return resultado;
    } catch (error) {
      console.error('Error sincronizando con GitHub:', error.message);
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
}

module.exports = new GitHubService(); 