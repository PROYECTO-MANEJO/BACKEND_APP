/**
 * Configuración de GitHub
 * Este archivo contiene toda la configuración necesaria para la integración con GitHub
 */

const githubConfig = {
  // Token de acceso personal de GitHub
  token: process.env.GITHUB_TOKEN,
  
  // Propietario de los repositorios
  owner: process.env.GITHUB_OWNER,
  
  // Repositorios
  repositories: {
    frontend: process.env.GITHUB_REPO_FRONTEND,
    backend: process.env.GITHUB_REPO_BACKEND
  },
  
  // URL base de la API de GitHub
  baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
  
  // Headers por defecto para las peticiones
  getHeaders: function(userToken = null) {
    return {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${userToken || this.token}`,
      'User-Agent': 'UTA-Events-App'
    };
  },
  
  // Configuración de branches
  branches: {
    main: 'main',
    develop: 'develop'
  },
  
  // Prefijos para nombres de branches y PRs
  prefixes: {
    branch: 'SOL',
    pr: 'Solicitud'
  },

  // Verificar si la configuración es válida
  isValid: function() {
    return !!(this.token && this.owner && this.repositories.frontend && this.repositories.backend);
  }
};

module.exports = githubConfig; 