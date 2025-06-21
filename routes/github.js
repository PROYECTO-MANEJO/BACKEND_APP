const { Router } = require('express');

// Importar controladores
const {
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
} = require('../controllers/githubController');

// Importar middlewares
const { validateJWT, validateAdmin } = require('../middlewares/validateJWT');

const router = Router();

// ===================
// RUTAS DE GITHUB
// ===================

// Obtener estado de configuración de GitHub
// GET /api/github/configuracion
router.get(
  '/configuracion',
  [validateJWT, validateAdmin],
  obtenerEstadoConfiguracion
);

// Sincronizar una solicitud con GitHub (buscar automáticamente branches y PRs en todos los repos)
// POST /api/github/solicitud/:id/sincronizar
router.post(
  '/solicitud/:id/sincronizar',
  [validateJWT, validateAdmin],
  sincronizarSolicitudConGitHub
);

// Sincronizar una solicitud en un repositorio específico
// POST /api/github/solicitud/:id/sincronizar-repo
router.post(
  '/solicitud/:id/sincronizar-repo',
  [validateJWT, validateAdmin],
  sincronizarSolicitudEnRepo
);

// Obtener información de GitHub para una solicitud específica
// GET /api/github/solicitud/:id
router.get(
  '/solicitud/:id',
  [validateJWT, validateAdmin],
  obtenerInfoGitHub
);

// Asociar manualmente un branch a una solicitud
// PUT /api/github/solicitud/:id/branch
router.put(
  '/solicitud/:id/branch',
  [validateJWT, validateAdmin],
  asociarBranch
);

// Asociar manualmente un Pull Request a una solicitud
// PUT /api/github/solicitud/:id/pull-request
router.put(
  '/solicitud/:id/pull-request',
  [validateJWT, validateAdmin],
  asociarPullRequest
);

// Generar nombre de branch sugerido para una solicitud
// GET /api/github/solicitud/:id/branch-sugerido
router.get(
  '/solicitud/:id/branch-sugerido',
  [validateJWT, validateAdmin],
  generarNombreBranch
);

// Crear un nuevo branch para una solicitud
// POST /api/github/solicitud/:id/crear-branch
router.post(
  '/solicitud/:id/crear-branch',
  [validateJWT, validateAdmin],
  crearBranch
);

// Crear Pull Request para una solicitud
// POST /api/github/solicitud/:id/crear-pull-request
router.post(
  '/solicitud/:id/crear-pull-request',
  [validateJWT, validateAdmin],
  crearPullRequest
);

// Obtener información detallada de un branch específico
// GET /api/github/branch/:repoType/:branchName
router.get(
  '/branch/:repoType/:branchName',
  [validateJWT, validateAdmin],
  obtenerInfoBranch
);

module.exports = router; 