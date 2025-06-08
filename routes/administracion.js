const express = require('express');
const router = express.Router();
const { validateJWT, validateAdmin } = require('../middlewares/validateJWT');

const {
  obtenerCursosEventosAdministrables,
  obtenerDetallesEventoAdmin,
  obtenerDetallesCursoAdmin,
  aprobarInscripcionEvento,
  rechazarInscripcionEvento,
  aprobarInscripcionCurso,
  rechazarInscripcionCurso,
  descargarComprobantePago
} = require('../controllers/administracionController');

// =====================================================
// RUTAS PRINCIPALES DE ADMINISTRACIÓN
// =====================================================

/**
 * GET /api/administracion/cursos-eventos
 * Obtener todos los cursos y eventos administrables
 * Requiere: Autenticación + Rol Admin
 */
router.get('/cursos-eventos', [
  validateJWT,
  validateAdmin
], obtenerCursosEventosAdministrables);

// =====================================================
// RUTAS PARA DETALLES ESPECÍFICOS
// =====================================================

/**
 * GET /api/administracion/evento/:idEvento
 * Obtener detalles completos de un evento con inscripciones
 * Requiere: Autenticación + Rol Admin
 */
router.get('/evento/:idEvento', [
  validateJWT,
  validateAdmin
], obtenerDetallesEventoAdmin);

/**
 * GET /api/administracion/curso/:idCurso
 * Obtener detalles completos de un curso con inscripciones
 * Requiere: Autenticación + Rol Admin
 */
router.get('/curso/:idCurso', [
  validateJWT,
  validateAdmin
], obtenerDetallesCursoAdmin);

// =====================================================
// RUTAS PARA GESTIÓN DE INSCRIPCIONES DE EVENTOS
// =====================================================

/**
 * PUT /api/administracion/evento/inscripcion/:idInscripcion/aprobar
 * Aprobar una inscripción de evento
 * Requiere: Autenticación + Rol Admin
 */
router.put('/evento/inscripcion/:idInscripcion/aprobar', [
  validateJWT,
  validateAdmin
], aprobarInscripcionEvento);

/**
 * PUT /api/administracion/evento/inscripcion/:idInscripcion/rechazar
 * Rechazar una inscripción de evento
 * Body: { motivo?: string }
 * Requiere: Autenticación + Rol Admin
 */
router.put('/evento/inscripcion/:idInscripcion/rechazar', [
  validateJWT,
  validateAdmin
], rechazarInscripcionEvento);

// =====================================================
// RUTAS PARA GESTIÓN DE INSCRIPCIONES DE CURSOS
// =====================================================

/**
 * PUT /api/administracion/curso/inscripcion/:idInscripcion/aprobar
 * Aprobar una inscripción de curso
 * Requiere: Autenticación + Rol Admin
 */
router.put('/curso/inscripcion/:idInscripcion/aprobar', [
  validateJWT,
  validateAdmin
], aprobarInscripcionCurso);

/**
 * PUT /api/administracion/curso/inscripcion/:idInscripcion/rechazar
 * Rechazar una inscripción de curso
 * Body: { motivo?: string }
 * Requiere: Autenticación + Rol Admin
 */
router.put('/curso/inscripcion/:idInscripcion/rechazar', [
  validateJWT,
  validateAdmin
], rechazarInscripcionCurso);

// =====================================================
// RUTAS PARA DESCARGA DE COMPROBANTES
// =====================================================

/**
 * GET /api/administracion/comprobante/:tipo/:idInscripcion
 * Descargar comprobante de pago
 * Parámetros:
 *   - tipo: 'evento' | 'curso'
 *   - idInscripcion: ID de la inscripción
 * Requiere: Autenticación + Rol Admin
 */
router.get('/comprobante/:tipo/:idInscripcion', [
  validateJWT,
  validateAdmin
], descargarComprobantePago);

module.exports = router; 