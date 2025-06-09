const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const { PassThrough } = require('stream');
const prisma = new PrismaClient();

async function guardarReporteFinanciero(req, res) {
  try {
    // 🔍 Inscripciones aprobadas a eventos
    const inscripcionesEventos = await prisma.inscripcion.findMany({
      where: { estado_pago: 'APROBADO' },
      select: { val_ins: true, evento: { select: { nom_eve: true } } }
    });

    const eventosAgrupados = {};
    let totalEventos = 0;

    inscripcionesEventos.forEach(i => {
      const nombre = i.evento?.nom_eve || 'Sin nombre';
      if (!eventosAgrupados[nombre]) {
        eventosAgrupados[nombre] = { nombre, ingresos: 0, inscritos: 0 };
      }
      eventosAgrupados[nombre].ingresos += parseFloat(i.val_ins);
      eventosAgrupados[nombre].inscritos += 1;
      totalEventos += parseFloat(i.val_ins);
    });

    // 🔍 Inscripciones aprobadas a cursos
    const inscripcionesCursos = await prisma.inscripcionCurso.findMany({
      where: { estado_pago_cur: 'APROBADO' },
      select: { val_ins_cur: true }
    });

    const totalCursos = inscripcionesCursos.reduce((acc, i) => acc + parseFloat(i.val_ins_cur), 0);
    const ingresosTotales = totalEventos + totalCursos;

    // 🖨️ Crear PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    // ===== MARCO =====
    doc.rect(40, 40, 515, 712).stroke(); // Tamaño A4 con margen

    // ===== ENCABEZADO =====
    // doc.image('./public/logo.png', 45, 45, { width: 60 }); // Opcional
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión Financiera', 110, 50)
      .text('Reporte Generado Automáticamente', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('ESTADO FINANCIERO DEL SISTEMA', { align: 'center' });
    doc.moveDown(1.5);

    // ===== INGRESOS =====
    doc.rect(50, doc.y, 500, 20).fill('#1976d2');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('INGRESOS', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    doc.text('Inscripciones a Eventos', 60).text(`$${totalEventos.toFixed(2)}`, 460, doc.y - 15, { align: 'right' });
    doc.text('Inscripciones a Cursos', 60).text(`$${totalCursos.toFixed(2)}`, 460, doc.y - 15, { align: 'right' });
    doc.moveDown(0.5);
    doc.font('Times-Bold').text('TOTAL DE INGRESOS', 60).text(`$${ingresosTotales.toFixed(2)}`, 460, doc.y - 15, { align: 'right' });

    // ===== EVENTOS MÁS POPULARES =====
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#1976d2');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('EVENTOS MÁS POPULARES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    let startY = doc.y;
    const columnX1 = 60;
    const columnX2 = 350;
    const columnX3 = 460;

    doc.font('Times-Bold');
    doc.text('Evento', columnX1, startY);
    doc.text('Monto', columnX2, startY, { width: 80, align: 'right' });
    doc.text('Inscritos', columnX3, startY, { width: 80, align: 'right' });

    doc.font('Times-Roman');
    startY += 20;

    Object.values(eventosAgrupados)
      .sort((a, b) => b.inscritos - a.inscritos)
      .slice(0, 3)
      .forEach(({ nombre, ingresos, inscritos }) => {
        doc.text(nombre, columnX1, startY);
        doc.text(`$${ingresos.toFixed(2)}`, columnX2, startY, { width: 80, align: 'right' });
        doc.text(`${inscritos}`, columnX3, startY, { width: 80, align: 'right' });
        startY += 18;
      });

    // ===== PIE DE PÁGINA =====
    const bottomY = 770;
    doc.lineWidth(0.5).moveTo(50, bottomY - 20).lineTo(545, bottomY - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - FISEI UTA | Sistema de Gestión de Cursos y Eventos', 50, bottomY - 10, { align: 'center', width: 500 });

    doc.end();

    const buffer = await bufferPromise;
    const nombre = 'reporte_financiero_' + Date.now() + '.pdf';

    await prisma.reporte.create({
      data: {
        tipo: 'FINANZAS',
        nombre_archivo: nombre,
        archivo_pdf: buffer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte financiero generado y almacenado correctamente'
    });
  } catch (error) {
    console.error('[ERROR][Generar PDF Financiero]', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar y guardar el reporte financiero'
    });
  }
}
// 📄 GET: /api/reportes?tipo=FINANZAS
async function listarReportesPorTipo(req, res) {
  const { tipo } = req.query;

  if (!tipo) {
    return res.status(400).json({ success: false, message: 'Tipo de reporte requerido' });
  }

  try {
    const reportes = await prisma.reporte.findMany({
      where: { tipo },
      orderBy: { fecha_generado: 'desc' },
      select: {
        id_rep: true,
        nombre_archivo: true,
        fecha_generado: true
      }
    });

    res.json({ success: true, reportes });
  } catch (err) {
    console.error('[Error al listar reportes]', err);
    res.status(500).json({ success: false, message: 'Error al obtener el historial' });
  }
}

// 📥 GET: /api/reportes/:id/download
async function descargarReportePorId(req, res) {
  const { id } = req.params;

  try {
    const reporte = await prisma.reporte.findUnique({
      where: { id_rep: id }
    });

    if (!reporte) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reporte.nombre_archivo}"`);
    res.send(reporte.archivo_pdf);
  } catch (err) {
    console.error('[Error al descargar reporte]', err);
    res.status(500).json({ success: false, message: 'Error al descargar el reporte' });
  }
}

module.exports = {
  guardarReporteFinanciero,
  listarReportesPorTipo,
  descargarReportePorId
};
