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
  aprobarPR,
  // Funciones para múltiples ramas
  crearRamaEspecifica,
  crearPRSpecifico,
  obtenerRamasSolicitud
} = require('../controllers/githubController');

// Importar middlewares
const { validateJWT, validateAdmin, validateDeveloper, validateMaster } = require('../middlewares/validateJWT');

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

// ===================
// RUTAS PARA DESARROLLADORES
// ===================

// Crear branch con GitFlow para desarrolladores
// POST /api/github/dev/solicitud/:id/crear-branch-gitflow
router.post(
  '/dev/solicitud/:id/crear-branch-gitflow',
  [validateJWT, validateDeveloper],
  crearBranchGitFlow
);

// Crear Pull Request para desarrolladores
// POST /api/github/dev/solicitud/:id/crear-pull-request
router.post(
  '/dev/solicitud/:id/crear-pull-request',
  [validateJWT, validateDeveloper],
  crearPullRequestDesarrollador
);

// Cambiar estado a ESPERANDO_APROBACION
// PUT /api/github/dev/solicitud/:id/esperando-aprobacion
router.put(
  '/dev/solicitud/:id/esperando-aprobacion',
  [validateJWT, validateDeveloper],
  cambiarAEsperandoAprobacion
);

// Obtener tipos GitFlow disponibles
// GET /api/github/dev/gitflow-types
router.get(
  '/dev/gitflow-types',
  [validateJWT],
  obtenerTiposGitFlow
);

// Obtener branches disponibles en un repositorio
// GET /api/github/dev/branches/:repoType
router.get(
  '/dev/branches/:repoType',
  [validateJWT],
  obtenerBranchesRepositorio
);

// Obtener información de GitHub para desarrolladores (solo solicitudes asignadas a ellos)
// GET /api/github/dev/solicitud/:id
router.get(
  '/dev/solicitud/:id',
  [validateJWT, validateDeveloper],
  obtenerInfoGitHub
);

// ===================
// RUTAS PARA MÚLTIPLES RAMAS
// ===================

// Crear rama específica (frontend o backend) - Solo desarrolladores
// POST /api/github/dev/solicitud/:id/crear-rama
router.post(
  '/dev/solicitud/:id/crear-rama',
  [validateJWT, validateDeveloper],
  crearRamaEspecifica
);

// Crear PR específico para una rama - Solo desarrolladores
// POST /api/github/dev/solicitud/:id/crear-pr
router.post(
  '/dev/solicitud/:id/crear-pr',
  [validateJWT, validateDeveloper],
  crearPRSpecifico
);

// Obtener todas las ramas de una solicitud - Desarrolladores y Master
// GET /api/github/solicitud/:id/ramas
router.get(
  '/solicitud/:id/ramas',
  [validateJWT],
  obtenerRamasSolicitud
);

// ===================
// RUTAS PARA POLLING/AUTOMATIZACIÓN
// ===================

// Detectar PRs automáticamente (para polling)
// POST /api/github/detectar-prs
router.post(
  '/detectar-prs',
  [validateJWT, validateMaster],
  detectarPullRequests
);

// Verificar merges y actualizar estados (para polling)
// POST /api/github/verificar-merges
router.post(
  '/verificar-merges',
  [validateJWT, validateMaster],
  verificarMerges
);

// Validar token personal de GitHub
// POST /api/github/dev/validate-token
router.post(
  '/dev/validate-token',
  [validateJWT, validateDeveloper],
  validarTokenPersonal
);

// Rechazar un PR
router.post('/solicitud/:id/rechazar-pr',
  validateJWT,
  validateMaster,
  rechazarPR
);

// Aprobar y mergear un PR
router.post('/solicitud/:id/aprobar-pr',
  validateJWT,
  validateMaster,
  aprobarPR
);

module.exports = router; 