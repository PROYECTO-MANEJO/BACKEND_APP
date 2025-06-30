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

async function generarReporteUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        cuentas: {
          select: {
            rol_cue: true,
            cor_cue: true
          }
        },
        inscripcionesCurso: {
          include: {
            curso: {
              select: {
                nom_cur: true,
                fec_ini_cur: true,
                fec_fin_cur: true
              }
            }
          }
        },
        inscripciones: {
          include: {
            evento: {
              select: {
                nom_eve: true,
                fec_ini_eve: true,
                fec_fin_eve: true
              }
            }
          }
        }
      }
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión Académica', 110, 50)
      .text('Reporte de Usuarios y Cursos/Eventos', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('REPORTE DE USUARIOS', { align: 'center' });
    doc.moveDown(1.5);

    usuarios.forEach(u => {
      const nombreCompleto = `${u.nom_usu1} ${u.nom_usu2 ?? ''} ${u.ape_usu1} ${u.ape_usu2}`.trim();
      const cuenta = u.cuentas[0];
      const correo = cuenta?.cor_cue || 'Sin correo';
      const rol = cuenta?.rol_cue || 'No definido';

      doc.fontSize(12).font('Times-Bold').text(`Usuario: ${nombreCompleto}`);
      doc.fontSize(10).font('Times-Roman')
        .text(`Cédula: ${u.ced_usu}`)
        .text(`Correo: ${correo}`)
        .text(`Rol: ${rol}`);

      doc.moveDown(0.5);
      doc.font('Times-Bold').text('Cursos Inscritos:');
      doc.font('Times-Roman');
      if (u.inscripcionesCurso.length === 0) {
        doc.text('- No tiene cursos inscritos');
      } else {
        u.inscripcionesCurso.forEach((insc, i) => {
          const c = insc.curso;
          doc.text(`${i + 1}. ${c.nom_cur} (${c.fec_ini_cur.toLocaleDateString('es-EC')} - ${c.fec_fin_cur.toLocaleDateString('es-EC')})`);
        });
      }

      doc.moveDown(0.5);
      doc.font('Times-Bold').text('Eventos Inscritos:');
      doc.font('Times-Roman');
      if (u.inscripciones.length === 0) {
        doc.text('- No tiene eventos inscritos');
      } else {
        u.inscripciones.forEach((insc, i) => {
          const e = insc.evento;
          doc.text(`${i + 1}. ${e.nom_eve} (${e.fec_ini_eve.toLocaleDateString('es-EC')} - ${e.fec_fin_eve?.toLocaleDateString('es-EC') || 'sin fecha fin'})`);
        });
      }

      doc.moveDown(1);
    });

    const bottomY = 770;
    doc.lineWidth(0.5).moveTo(50, bottomY - 20).lineTo(545, bottomY - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - FISEI UTA | Sistema de Gestión de Cursos y Eventos', 50, bottomY - 10, { align: 'center', width: 500 });

    doc.end();
    const buffer = await bufferPromise;
    await prisma.reporte.create({
      data: {
        tipo: 'USUARIOS',
        nombre_archivo: `reporte_usuarios_${Date.now()}.pdf`,
        archivo_pdf: buffer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte de usuarios generado correctamente'
    });
  } catch (error) {
    console.error('[ERROR][Generar PDF Usuarios]', error);
    res.status(500).json({ success: false, message: 'Error al generar el reporte de usuarios' });
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


async function generarReporteEventos(req, res) {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        usuario: { select: { nom_usu1: true, nom_usu2: true, ape_usu1: true, ape_usu2: true } },
        evento: { select: { nom_eve: true, fec_ini_eve: true, fec_fin_eve: true } }
      }
    });

    const agrupados = {};
    inscripciones.forEach(insc => {
      const nombreEvento = insc.evento.nom_eve;
      if (!agrupados[nombreEvento]) {
        agrupados[nombreEvento] = {
          evento: insc.evento,
          participantes: []
        };
      }
      const u = insc.usuario;
      agrupados[nombreEvento].participantes.push(`${u.nom_usu1} ${u.nom_usu2 ?? ''} ${u.ape_usu1} ${u.ape_usu2}`);
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión de Eventos', 110, 50)
      .text('Reporte Generado Automáticamente', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('REPORTE DE EVENTOS', { align: 'center' });
    doc.moveDown(1.5);

    for (const clave in agrupados) {
      const { evento, participantes } = agrupados[clave];
      doc.fontSize(12).font('Times-Bold').text(`Evento: ${evento.nom_eve}`);
      doc.fontSize(10).font('Times-Roman')
        .text(`Fecha Inicio: ${evento.fec_ini_eve.toLocaleDateString('es-EC')}`)
        .text(`Fecha Fin: ${evento.fec_fin_eve.toLocaleDateString('es-EC')}`)
        .text('Participantes:');
      participantes.forEach((p, i) => {
        doc.text(`${i + 1}. ${p}`);
      });
      doc.moveDown(1);
    }

    doc.lineWidth(0.5).moveTo(50, 770 - 20).lineTo(545, 770 - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - Sistema de Gestión de Eventos', 50, 760, { align: 'center', width: 500 });

    doc.end();
    const buffer = await bufferPromise;
    await prisma.reporte.create({
      data: { tipo: 'EVENTOS', nombre_archivo: `reporte_eventos_${Date.now()}.pdf`, archivo_pdf: buffer }
    });

    res.status(201).json({ success: true, message: 'Reporte de eventos generado y almacenado correctamente' });
  } catch (error) {
    console.error('[ERROR][Generar PDF Eventos]', error);
    res.status(500).json({ success: false, message: 'Error al generar y guardar el reporte de eventos' });
  }
}

async function generarReporteCursos(req, res) {
  try {
    const inscripciones = await prisma.inscripcionCurso.findMany({
      include: {
        usuario: { select: { nom_usu1: true, nom_usu2: true, ape_usu1: true, ape_usu2: true } },
        curso: { select: { nom_cur: true, fec_ini_cur: true, fec_fin_cur: true } }
      }
    });

    const agrupados = {};
    inscripciones.forEach(insc => {
      const nombreCurso = insc.curso.nom_cur;
      if (!agrupados[nombreCurso]) {
        agrupados[nombreCurso] = {
          curso: insc.curso,
          participantes: []
        };
      }
      const u = insc.usuario;
      agrupados[nombreCurso].participantes.push(`${u.nom_usu1} ${u.nom_usu2 ?? ''} ${u.ape_usu1} ${u.ape_usu2}`);
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión de Cursos', 110, 50)
      .text('Reporte Generado Automáticamente', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('REPORTE DE CURSOS', { align: 'center' });
    doc.moveDown(1.5);

    for (const clave in agrupados) {
      const { curso, participantes } = agrupados[clave];
      doc.fontSize(12).font('Times-Bold').text(`Curso: ${curso.nom_cur}`);
      doc.fontSize(10).font('Times-Roman')
        .text(`Fecha Inicio: ${curso.fec_ini_cur.toLocaleDateString('es-EC')}`)
        .text(`Fecha Fin: ${curso.fec_fin_cur.toLocaleDateString('es-EC')}`)
        .text('Estudiantes:');
      participantes.forEach((p, i) => {
        doc.text(`${i + 1}. ${p}`);
      });
      doc.moveDown(1);
    }

    doc.lineWidth(0.5).moveTo(50, 770 - 20).lineTo(545, 770 - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - Sistema de Gestión de Cursos', 50, 760, { align: 'center', width: 500 });

    doc.end();
    const buffer = await bufferPromise;
    await prisma.reporte.create({
      data: { tipo: 'CURSOS', nombre_archivo: `reporte_cursos_${Date.now()}.pdf`, archivo_pdf: buffer }
    });

    res.status(201).json({ success: true, message: 'Reporte de cursos generado y almacenado correctamente' });
  } catch (error) {
    console.error('[ERROR][Generar PDF Cursos]', error);
    res.status(500).json({ success: false, message: 'Error al generar y guardar el reporte de cursos' });
  }
}

// =====================================================
// REPORTES DE SOLICITUDES DE CAMBIO
// =====================================================

// 📊 Reporte por Estados de Solicitudes
async function reporteSolicitudesPorEstado(req, res) {
  try {
    const reportePorEstado = await prisma.solicitudCambio.groupBy({
      by: ['estado_sol'],
      _count: {
        id_sol: true
      },
      orderBy: {
        _count: {
          id_sol: 'desc'
        }
      }
    });

    const solicitudesDetalle = await prisma.solicitudCambio.findMany({
      select: {
        titulo_sol: true,
        estado_sol: true,
        prioridad_sol: true,
        tipo_cambio_sol: true,
        fec_creacion_sol: true,
        usuario: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        }
      },
      orderBy: {
        estado_sol: 'asc'
      }
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    // Marco y encabezado
    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión de Solicitudes de Cambio', 110, 50)
      .text('Reporte por Estados de Solicitudes', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('REPORTE DE SOLICITUDES POR ESTADO', { align: 'center' });
    doc.moveDown(1.5);

    // Resumen por estado
    doc.rect(50, doc.y, 500, 20).fill('#9c27b0');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('RESUMEN POR ESTADO', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    
    reportePorEstado.forEach(item => {
      const estadoTraducido = traducirEstado(item.estado_sol);
      doc.text(`${estadoTraducido}: ${item._count.id_sol} solicitudes`, 60);
    });

    // Detalle de solicitudes
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#9c27b0');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('DETALLE DE SOLICITUDES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');

    let estadoActual = '';
    solicitudesDetalle.forEach(solicitud => {
      if (solicitud.estado_sol !== estadoActual) {
        estadoActual = solicitud.estado_sol;
        doc.moveDown(0.5);
        doc.font('Times-Bold').fontSize(11)
          .text(`Estado: ${traducirEstado(estadoActual)}`, 60);
        doc.font('Times-Roman').fontSize(9);
      }

      const nombreUsuario = `${solicitud.usuario.nom_usu1} ${solicitud.usuario.ape_usu1}`;
      const fecha = solicitud.fec_creacion_sol.toLocaleDateString('es-ES');
      
      doc.text(`• ${solicitud.titulo_sol}`, 80);
      doc.text(`  Usuario: ${nombreUsuario} | Fecha: ${fecha}`, 85);
    });

    // Pie de página
    const bottomY = 770;
    doc.lineWidth(0.5).moveTo(50, bottomY - 20).lineTo(545, bottomY - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - Sistema de Gestión de Solicitudes | Reporte Estados', 50, bottomY - 10, { align: 'center', width: 500 });

    doc.end();

    const buffer = await bufferPromise;
    const nombre = `reporte_solicitudes_estados_${Date.now()}.pdf`;

    await prisma.reporte.create({
      data: {
        tipo: 'SOLICITUDES_ESTADO',
        nombre_archivo: nombre,
        archivo_pdf: buffer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte de solicitudes por estado generado y almacenado correctamente'
    });
  } catch (error) {
    console.error('[ERROR][Reporte Solicitudes por Estado]', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de solicitudes por estado'
    });
  }
}

// Función auxiliar para traducir estados
function traducirEstado(estado) {
  const traducciones = {
    'BORRADOR': 'Borrador',
    'PENDIENTE': 'Pendiente',
    'EN_REVISION': 'En Revisión',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada',
    'CANCELADA': 'Cancelada',
    'EN_DESARROLLO': 'En Desarrollo',
    'EN_TESTING': 'En Testing',
    'COMPLETADA': 'Completada',
    'FALLIDA': 'Fallida'
  };
  return traducciones[estado] || estado;
}



// 📊 Reporte por Desarrolladores Asignados
async function reporteSolicitudesPorDesarrollador(req, res) {
  try {
    const resultado = await prisma.solicitudCambio.groupBy({
      by: ['id_desarrollador_asignado'],
      _count: {
        id_sol: true
      },
      where: {
        id_desarrollador_asignado: {
          not: null
        }
      }
    });

    // Obtener información de los desarrolladores
    const desarrolladoresIds = resultado.map(item => item.id_desarrollador_asignado);
    const desarrolladores = await prisma.usuario.findMany({
      where: {
        id_usu: {
          in: desarrolladoresIds
        }
      },
      select: {
        id_usu: true,
        nom_usu1: true,
        nom_usu2: true,
        ape_usu1: true,
        ape_usu2: true
      }
    });

    // Obtener solicitudes detalladas por desarrollador
    const solicitudesDetalle = await prisma.solicitudCambio.findMany({
      where: {
        id_desarrollador_asignado: {
          not: null
        }
      },
      select: {
        titulo_sol: true,
        estado_sol: true,
        prioridad_sol: true,
        fec_creacion_sol: true,
        desarrolladorAsignado: {
          select: {
            nom_usu1: true,
            ape_usu1: true
          }
        }
      },
      orderBy: [
        {
          desarrolladorAsignado: {
            nom_usu1: 'asc'
          }
        },
        {
          fec_creacion_sol: 'desc'
        }
      ]
    });

    const reporteFormateado = resultado.map(item => {
      const dev = desarrolladores.find(d => d.id_usu === item.id_desarrollador_asignado);
      const nombreCompleto = dev ? 
        `${dev.nom_usu1} ${dev.nom_usu2 || ''} ${dev.ape_usu1} ${dev.ape_usu2}`.trim() : 
        'Desarrollador no encontrado';
      
      return {
        desarrollador_id: item.id_desarrollador_asignado,
        desarrollador_nombre: nombreCompleto,
        cantidad: item._count.id_sol
      };
    });

    // Contar solicitudes sin asignar
    const sinAsignar = await prisma.solicitudCambio.count({
      where: {
        id_desarrollador_asignado: null
      }
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    // Marco y encabezado
    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión de Solicitudes de Cambio', 110, 50)
      .text('Reporte de Carga de Trabajo por Desarrollador', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('CARGA DE TRABAJO POR DESARROLLADOR', { align: 'center' });
    doc.moveDown(1.5);

    // Resumen de carga
    doc.rect(50, doc.y, 500, 20).fill('#2196f3');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('RESUMEN DE ASIGNACIONES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');

    // Mostrar resumen ordenado por cantidad
    reporteFormateado
      .sort((a, b) => b.cantidad - a.cantidad)
      .forEach(item => {
        doc.text(`${item.desarrollador_nombre}: ${item.cantidad} solicitudes`, 60);
      });

    if (sinAsignar > 0) {
      doc.text(`Sin asignar: ${sinAsignar} solicitudes`, 60);
    }

    // Detalle por desarrollador
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#2196f3');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('DETALLE DE SOLICITUDES POR DESARROLLADOR', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');

    let desarrolladorActual = '';
    solicitudesDetalle.forEach(solicitud => {
      const nombreDev = solicitud.desarrolladorAsignado 
        ? `${solicitud.desarrolladorAsignado.nom_usu1} ${solicitud.desarrolladorAsignado.ape_usu1}`
        : 'Sin asignar';
      
      if (nombreDev !== desarrolladorActual) {
        desarrolladorActual = nombreDev;
        doc.moveDown(0.5);
        doc.font('Times-Bold').fontSize(11)
          .text(`Desarrollador: ${desarrolladorActual}`, 60);
        doc.font('Times-Roman').fontSize(9);
      }

      const fecha = solicitud.fec_creacion_sol.toLocaleDateString('es-ES');
      const estado = traducirEstado(solicitud.estado_sol);
      
      doc.text(`• ${solicitud.titulo_sol}`, 80);
      doc.text(`  Estado: ${estado} | Fecha: ${fecha}`, 85);
    });

    // Pie de página
    const bottomY = 770;
    doc.lineWidth(0.5).moveTo(50, bottomY - 20).lineTo(545, bottomY - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - Sistema de Gestión de Solicitudes | Reporte Desarrolladores', 50, bottomY - 10, { align: 'center', width: 500 });

    doc.end();

    const buffer = await bufferPromise;
    const nombre = `reporte_solicitudes_desarrolladores_${Date.now()}.pdf`;

    await prisma.reporte.create({
      data: {
        tipo: 'SOLICITUDES_DESARROLLADOR',
        nombre_archivo: nombre,
        archivo_pdf: buffer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte de carga de trabajo por desarrollador generado y almacenado correctamente'
    });
  } catch (error) {
    console.error('[ERROR][Reporte Solicitudes por Desarrollador]', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de solicitudes por desarrollador'
    });
  }
}



// 📊 Generar PDF Reporte Resumen General de Solicitudes
async function reporteSolicitudesResumen(req, res) {
  try {
    // Obtener todos los datos en paralelo
    const [
      totalSolicitudes,
      porEstado,
      porPrioridad,
      porTipo,
      solicitudesHoy,
      solicitudesEsteMes,
      desarrolladoresInfo
    ] = await Promise.all([
      // Total general
      prisma.solicitudCambio.count(),
      
      // Por estado
      prisma.solicitudCambio.groupBy({
        by: ['estado_sol'],
        _count: { id_sol: true },
        orderBy: { _count: { id_sol: 'desc' } }
      }),
      
      // Por prioridad
      prisma.solicitudCambio.groupBy({
        by: ['prioridad_sol'],
        _count: { id_sol: true },
        orderBy: { _count: { id_sol: 'desc' } }
      }),
      
      // Por tipo
      prisma.solicitudCambio.groupBy({
        by: ['tipo_cambio_sol'],
        _count: { id_sol: true },
        orderBy: { _count: { id_sol: 'desc' } }
      }),
      
      // Solicitudes de hoy
      prisma.solicitudCambio.count({
        where: {
          fec_creacion_sol: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Solicitudes de este mes
      prisma.solicitudCambio.count({
        where: {
          fec_creacion_sol: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Info de desarrolladores
      prisma.solicitudCambio.groupBy({
        by: ['id_desarrollador_asignado'],
        _count: { id_sol: true },
        where: {
          id_desarrollador_asignado: { not: null }
        }
      })
    ]);

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    // Marco y encabezado
    doc.rect(40, 40, 515, 712).stroke();
    doc.fontSize(10).font('Times-Roman')
      .text('Sistema de Gestión de Solicitudes de Cambio', 110, 50)
      .text('Reporte Ejecutivo General', 110, 65)
      .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 110, 80);

    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).font('Times-Bold')
      .text('REPORTE EJECUTIVO GENERAL', { align: 'center' });
    doc.moveDown(1.5);

    // Métricas principales
    doc.rect(50, doc.y, 500, 20).fill('#673ab7');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('MÉTRICAS PRINCIPALES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    doc.text(`Total de solicitudes en el sistema: ${totalSolicitudes}`, 60);
    doc.text(`Solicitudes creadas hoy: ${solicitudesHoy}`, 60);
    doc.text(`Solicitudes creadas este mes: ${solicitudesEsteMes}`, 60);
    doc.text(`Desarrolladores con solicitudes asignadas: ${desarrolladoresInfo.length}`, 60);

    // Estados
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#673ab7');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('DISTRIBUCIÓN POR ESTADOS', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    porEstado.forEach(item => {
      const estadoTraducido = traducirEstado(item.estado_sol);
      const porcentaje = ((item._count.id_sol / totalSolicitudes) * 100).toFixed(1);
      doc.text(`${estadoTraducido}: ${item._count.id_sol} (${porcentaje}%)`, 60);
    });

    // Prioridades
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#673ab7');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('DISTRIBUCIÓN POR PRIORIDADES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    porPrioridad.forEach(item => {
      const prioridadTraducida = traducirPrioridad(item.prioridad_sol);
      const porcentaje = ((item._count.id_sol / totalSolicitudes) * 100).toFixed(1);
      doc.text(`${prioridadTraducida}: ${item._count.id_sol} (${porcentaje}%)`, 60);
    });

    // Tipos de cambio más frecuentes (top 5)
    doc.moveDown(1.5);
    doc.rect(50, doc.y, 500, 20).fill('#673ab7');
    doc.fillColor('white').fontSize(12).font('Times-Bold')
      .text('TIPOS DE CAMBIO MÁS FRECUENTES', 55, doc.y + 5);

    doc.moveDown(1).fillColor('black').font('Times-Roman');
    porTipo.slice(0, 5).forEach(item => {
      const tipoTraducido = traducirTipoCambio(item.tipo_cambio_sol);
      const porcentaje = ((item._count.id_sol / totalSolicitudes) * 100).toFixed(1);
      doc.text(`${tipoTraducido}: ${item._count.id_sol} (${porcentaje}%)`, 60);
    });

    // Pie de página
    const bottomY = 770;
    doc.lineWidth(0.5).moveTo(50, bottomY - 20).lineTo(545, bottomY - 20).stroke();
    doc.fontSize(9).font('Times-Italic').fillColor('gray')
      .text('© 2025 - Sistema de Gestión de Solicitudes | Reporte Ejecutivo', 50, bottomY - 10, { align: 'center', width: 500 });

    doc.end();

    const buffer = await bufferPromise;
    const nombre = `reporte_solicitudes_resumen_${Date.now()}.pdf`;

    await prisma.reporte.create({
      data: {
        tipo: 'SOLICITUDES_RESUMEN',
        nombre_archivo: nombre,
        archivo_pdf: buffer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte ejecutivo general de solicitudes generado y almacenado correctamente'
    });
  } catch (error) {
    console.error('[ERROR][Reporte Resumen Solicitudes]', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte resumen de solicitudes'
    });
  }
}

// Función auxiliar para traducir prioridades
function traducirPrioridad(prioridad) {
  const traducciones = {
    'BAJA': 'Baja',
    'MEDIA': 'Media',
    'ALTA': 'Alta',
    'CRITICA': 'Crítica',
    'URGENTE': 'Urgente'
  };
  return traducciones[prioridad] || prioridad;
}

// Función auxiliar para traducir tipos de cambio
function traducirTipoCambio(tipo) {
  const traducciones = {
    'NUEVA_FUNCIONALIDAD': 'Nueva Funcionalidad',
    'MEJORA_EXISTENTE': 'Mejora Existente',
    'CORRECCION_ERROR': 'Corrección de Error',
    'CAMBIO_INTERFAZ': 'Cambio de Interfaz',
    'OPTIMIZACION': 'Optimización',
    'ACTUALIZACION_DATOS': 'Actualización de Datos',
    'CAMBIO_SEGURIDAD': 'Cambio de Seguridad',
    'MIGRACION_DATOS': 'Migración de Datos',
    'INTEGRACION_EXTERNA': 'Integración Externa',
    'OTRO': 'Otro'
  };
  return traducciones[tipo] || tipo;
}



module.exports = {
  guardarReporteFinanciero,
  listarReportesPorTipo,
  descargarReportePorId,
  generarReporteEventos,
  generarReporteCursos,
  generarReporteUsuarios,
  // Reportes PDF de solicitudes
  reporteSolicitudesPorEstado,
  reporteSolicitudesPorDesarrollador,
  reporteSolicitudesResumen
};
