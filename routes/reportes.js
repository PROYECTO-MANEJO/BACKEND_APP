const express = require('express');
const router = express.Router();

const {
  guardarReporteFinanciero,
  generarReporteEventos,
  generarReporteCursos,
  listarReportesPorTipo,
  descargarReportePorId,
  generarReporteUsuarios
} = require('../controllers/reportesController');

// ==================== RUTAS PARA REPORTES ====================

// Generar y guardar reporte financiero
router.post('/finanzas/pdf', guardarReporteFinanciero);

// Generar y guardar reporte de eventos
router.post('/eventos/pdf', generarReporteEventos);

// Generar y guardar reporte de cursos
router.post('/cursos/pdf', generarReporteCursos);

// Listar reportes por tipo (FINANZAS, EVENTOS, CURSOS)
router.get('/', listarReportesPorTipo);

// Descargar PDF de reporte por ID
router.get('/download/:id', descargarReportePorId);


//PARA REPORTES DE USUARIOS
 router.post('/usuarios/pdf', generarReporteUsuarios);

// =============================================================
module.exports = router;
