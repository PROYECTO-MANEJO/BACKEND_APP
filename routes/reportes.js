const express = require('express');
const router = express.Router();
const {
  guardarReporteFinanciero,
  listarReportesPorTipo,
  descargarReportePorId
} = require('../controllers/reportesController');

// Generar y guardar reporte financiero
router.post('/finanzas/pdf', guardarReporteFinanciero);

// Listar historial de reportes por tipo
router.get('/', listarReportesPorTipo);

// Descargar reporte por ID
router.get('/download/:id', descargarReportePorId);

module.exports = router;
