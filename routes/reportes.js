const express = require('express');
const router = express.Router();

// Importar middlewares de autenticación
const { validateJWT, validateRoles } = require('../middlewares/validateJWT');
const { logReportAccess, validateReportFilters } = require('../middlewares/reportesValidation');

const {
  guardarReporteFinanciero,
  generarReporteEventos,
  generarReporteCursos,
  listarReportesPorTipo,
  descargarReportePorId,
  generarReporteUsuarios,
  // Reportes de solicitudes en PDF
  reporteSolicitudesPorEstado,
  reporteSolicitudesPorDesarrollador,
  reporteSolicitudesResumen
} = require('../controllers/reportesController');

// ==================== RUTAS PARA REPORTES ====================

// Generar y guardar reporte financiero
router.post('/finanzas/pdf', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], guardarReporteFinanciero);

// Generar y guardar reporte de eventos
router.post('/eventos/pdf', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], generarReporteEventos);

// Generar y guardar reporte de cursos
router.post('/cursos/pdf', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], generarReporteCursos);

// Listar reportes por tipo (FINANZAS, EVENTOS, CURSOS)
router.get('/', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], listarReportesPorTipo);

// Descargar PDF de reporte por ID
router.get('/download/:id', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], descargarReportePorId);

//PARA REPORTES DE USUARIOS
router.post('/usuarios/pdf', [validateJWT, validateRoles('ADMINISTRADOR', 'MASTER')], generarReporteUsuarios);

// ==================== RUTAS PARA REPORTES DE SOLICITUDES EN PDF ====================
// 🔒 SOLO PARA USUARIOS MASTER - Generación de reportes PDF para solicitudes

// 📊 Generar reportes PDF de solicitudes (con auditoría)
router.post('/solicitudes/estado/pdf', [validateJWT, validateRoles('MASTER'), logReportAccess], reporteSolicitudesPorEstado);
router.post('/solicitudes/desarrollador/pdf', [validateJWT, validateRoles('MASTER'), logReportAccess], reporteSolicitudesPorDesarrollador);
router.post('/solicitudes/resumen/pdf', [validateJWT, validateRoles('MASTER'), logReportAccess], reporteSolicitudesResumen);

// =============================================================
module.exports = router;
