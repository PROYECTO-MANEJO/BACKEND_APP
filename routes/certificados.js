const express = require('express');
const router = express.Router();
const { validateJWT, validateAdmin } = require('../middlewares/validateJWT');

const {
  generarCertificadoEvento,
  generarCertificadoCurso,
  generarCertificadoEventoPorParticipacion,
  generarCertificadoCursoPorParticipacion,
  visualizarCertificadoCursoPorParticipacion,
  testConectividad,
  descargarCertificado,
  obtenerMisCertificados,
  regenerarCertificado,
  debugCertificados,
  obtenerParticipacionesTerminadas,
  obtenerParticipacionesCompletas
} = require('../controllers/certificadosController');

// =====================================================
// RUTAS PARA USUARIOS AUTENTICADOS
// =====================================================

/**
 * GET /api/certificados/debug
 * Debug: Ver todas las participaciones del usuario
 * Requiere: Autenticación
 */
router.get('/debug', [
  validateJWT
], debugCertificados);

/**
 * GET /api/certificados/mis-certificados
 * Obtener todos los certificados del usuario autenticado
 * Requiere: Autenticación
 */
router.get('/mis-certificados', [
  validateJWT
], obtenerMisCertificados);
router.get('/mis-certificados/participaciones-completas', [
  validateJWT 
], obtenerParticipacionesCompletas);

/**
 * GET /api/certificados/participaciones-terminadas
 * Obtener todas las participaciones terminadas del usuario (aprobadas y reprobadas)
 * Requiere: Autenticación
 */
router.get('/participaciones-terminadas', [
  validateJWT
], obtenerParticipacionesTerminadas);

/**
 * POST /api/certificados/evento/:idEvento/:idInscripcion
 * Generar certificado para evento aprobado
 * Requiere: Autenticación + Participación aprobada
 */
router.post('/evento/:idEvento/:idInscripcion', [
  validateJWT
], generarCertificadoEvento);

/**
 * POST /api/certificados/curso/:idCurso/:idInscripcion
 * Generar certificado para curso aprobado
 * Requiere: Autenticación + Participación aprobada
 */
router.post('/curso/:idCurso/:idInscripcion', [
  validateJWT
], generarCertificadoCurso);

/**
 * POST /api/certificados/generar-curso/:idParticipacion
 * Generar certificado usando solo ID de participación de curso
 * Requiere: Autenticación + Participación aprobada
 */
router.post('/generar-curso/:idParticipacion', [
  validateJWT
], generarCertificadoCursoPorParticipacion);

/**
 * POST /api/certificados/generar-evento/:idParticipacion
 * Generar certificado usando solo ID de participación de evento
 * Requiere: Autenticación + Participación aprobada
 */
router.post('/generar-evento/:idParticipacion', [
  validateJWT
], generarCertificadoEventoPorParticipacion);

/**
 * GET /api/certificados/test/:id
 * Endpoint de prueba para verificar conectividad
 */
router.get('/test/:id', [
  validateJWT
], testConectividad);

/**
 * GET /api/certificados/visualizar-curso/:idParticipacion
 * Visualizar certificado de curso en el navegador (para modal)
 * Requiere: Autenticación + Participación aprobada
 */
router.get('/visualizar-curso/:idParticipacion', [
  validateJWT
], visualizarCertificadoCursoPorParticipacion);

/**
 * GET /api/certificados/descargar/:tipo/:idParticipacion
 * Descargar certificado existente
 * Parámetros:
 * - tipo: 'evento' o 'curso'
 * - idParticipacion: ID de la participación
 * Requiere: Autenticación + Propiedad del certificado
 */
router.get('/descargar/:tipo/:idParticipacion', [
  validateJWT
], descargarCertificado);

// =====================================================
// RUTAS ADMINISTRATIVAS
// =====================================================

/**
 * PUT /api/certificados/regenerar/:tipo/:idParticipacion
 * Regenerar certificado existente (solo admin)
 * Parámetros:
 * - tipo: 'evento' o 'curso'
 * - idParticipacion: ID de la participación
 * Requiere: Autenticación + Rol Admin
 */
router.put('/regenerar/:tipo/:idParticipacion', [
  validateJWT,
  validateAdmin
], regenerarCertificado);

module.exports = router; 