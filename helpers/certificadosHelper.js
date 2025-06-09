const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

// =====================================================
// HELPER PARA GENERACIÓN AUTOMÁTICA DE CERTIFICADOS
// =====================================================

/**
 * Generar certificado automáticamente cuando se aprueba una participación
 * Se llama desde el controlador de administración después de registrar participación
 */
const generarCertificadoAutomatico = async (tipo, inscripcionId, participacionData) => {
  try {
    // Solo generar certificado si la participación está aprobada
    if (!participacionData.aprobado) {
      return { success: false, message: 'Participación no aprobada, certificado no generado' };
    }

    if (tipo === 'evento') {
      return await generarCertificadoEventoAutomatico(inscripcionId, participacionData);
    } else if (tipo === 'curso') {
      return await generarCertificadoCursoAutomatico(inscripcionId, participacionData);
    }

    return { success: false, message: 'Tipo de participación no válido' };

  } catch (error) {
    console.error('❌ Error al generar certificado automático:', error);
    return { success: false, message: 'Error al generar certificado', error: error.message };
  }
};

/**
 * Generar certificado para evento automáticamente
 */
const generarCertificadoEventoAutomatico = async (inscripcionId, participacionData) => {
  try {
    // Obtener datos completos de la inscripción
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: inscripcionId },
      include: {
        evento: {
          include: {
            categoria: true,
            organizador: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    if (!inscripcion) {
      return { success: false, message: 'Inscripción no encontrada' };
    }

    // Generar el certificado PDF
    const certificadoBuffer = await generarPDFCertificadoEvento(inscripcion, participacionData);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_evento_${inscripcion.id_eve_ins}_${inscripcionId}_${Date.now()}.pdf`;
    
    // Actualizar la participación con el certificado
    await prisma.participacion.update({
      where: { id_ins_per: inscripcionId },
      data: {
        certificado_pdf: certificadoBuffer,
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        fec_cer_par: new Date()
      }
    });

    return {
      success: true,
      message: 'Certificado de evento generado automáticamente',
      certificado_filename: nombreArchivo,
      certificado_size: certificadoBuffer.length
    };

  } catch (error) {
    console.error('❌ Error al generar certificado de evento automático:', error);
    return { success: false, message: 'Error al generar certificado de evento', error: error.message };
  }
};

/**
 * Generar certificado para curso automáticamente
 */
const generarCertificadoCursoAutomatico = async (inscripcionId, participacionData) => {
  try {
    // Obtener datos completos de la inscripción
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: inscripcionId },
      include: {
        curso: {
          include: {
            categoria: true,
            organizador: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    if (!inscripcion) {
      return { success: false, message: 'Inscripción no encontrada' };
    }

    // Generar el certificado PDF
    const certificadoBuffer = await generarPDFCertificadoCurso(inscripcion, participacionData);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_curso_${inscripcion.id_cur_ins}_${inscripcionId}_${Date.now()}.pdf`;
    
    // Actualizar la participación con el certificado
    await prisma.participacionCurso.update({
      where: { id_ins_cur_per: inscripcionId },
      data: {
        certificado_pdf: certificadoBuffer,
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        fec_cer_par_cur: new Date()
      }
    });

    return {
      success: true,
      message: 'Certificado de curso generado automáticamente',
      certificado_filename: nombreArchivo,
      certificado_size: certificadoBuffer.length
    };

  } catch (error) {
    console.error('❌ Error al generar certificado de curso automático:', error);
    return { success: false, message: 'Error al generar certificado de curso', error: error.message };
  }
};

// =====================================================
// FUNCIONES DE GENERACIÓN DE PDF (REUTILIZADAS)
// =====================================================

/**
 * Generar PDF del certificado para evento
 */
const generarPDFCertificadoEvento = async (inscripcion, participacion) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4'
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Configuración de colores
      const colorPrincipal = '#2C3E50';
      const colorSecundario = '#3498DB';
      const colorDorado = '#F39C12';

      // Título principal
      doc.font('Helvetica-Bold')
         .fontSize(36)
         .fillColor(colorPrincipal)
         .text('CERTIFICADO DE PARTICIPACIÓN', 50, 80, { align: 'center' });

      // Línea decorativa
      doc.moveTo(100, 140).lineTo(700, 140).stroke(colorDorado);

      // Texto principal
      doc.font('Helvetica')
         .fontSize(18)
         .fillColor('#2C3E50')
         .text('Se certifica que', 50, 180, { align: 'center' });

      // Nombre del participante
      const nombreCompleto = `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim();
      doc.font('Helvetica-Bold')
         .fontSize(28)
         .fillColor(colorSecundario)
         .text(nombreCompleto.toUpperCase(), 50, 220, { align: 'center' });

      // Texto de participación
      doc.font('Helvetica')
         .fontSize(18)
         .fillColor('#2C3E50')
         .text('participó exitosamente en el evento', 50, 270, { align: 'center' });

      // Nombre del evento
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor(colorPrincipal)
         .text(`"${inscripcion.evento.nom_eve}"`, 50, 310, { align: 'center' });

      // Información del evento
      const fechaInicio = new Date(inscripcion.evento.fec_ini_eve).toLocaleDateString('es-ES');
      const fechaFin = inscripcion.evento.fec_fin_eve ? 
        new Date(inscripcion.evento.fec_fin_eve).toLocaleDateString('es-ES') : fechaInicio;
      
      const fechasTexto = fechaInicio === fechaFin ? 
        `realizado el ${fechaInicio}` : 
        `realizado del ${fechaInicio} al ${fechaFin}`;

      doc.font('Helvetica')
         .fontSize(16)
         .text(fechasTexto, 50, 360, { align: 'center' });

      doc.text(`Categoría: ${inscripcion.evento.categoria.nom_cat}`, 50, 385, { align: 'center' });
      doc.text(`Porcentaje de asistencia: ${participacion.asi_par || participacion.asistencia_porcentaje}%`, 50, 410, { align: 'center' });

      // Organizador
      const organizador = inscripcion.evento.organizador;
      const nombreOrganizador = `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim();
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .text('Organizado por:', 50, 450, { align: 'center' });
      
      doc.font('Helvetica')
         .fontSize(16)
         .text(nombreOrganizador, 50, 470, { align: 'center' });

      // Fecha de emisión y número de certificado
      const fechaEmision = new Date().toLocaleDateString('es-ES');
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#7F8C8D')
         .text(`Certificado emitido el ${fechaEmision}`, 50, 520, { align: 'center' });

      doc.text(`Número de certificado: EVT-${inscripcion.id_ins.slice(-8).toUpperCase()}`, 50, 540, { align: 'center' });

      // Línea final decorativa
      doc.moveTo(100, 570).lineTo(700, 570).stroke(colorDorado);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generar PDF del certificado para curso
 */
const generarPDFCertificadoCurso = async (inscripcion, participacion) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4'
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Configuración de colores
      const colorPrincipal = '#2C3E50';
      const colorSecundario = '#27AE60';
      const colorDorado = '#F39C12';

      // Título principal
      doc.font('Helvetica-Bold')
         .fontSize(36)
         .fillColor(colorPrincipal)
         .text('CERTIFICADO DE APROBACIÓN', 50, 80, { align: 'center' });

      // Línea decorativa
      doc.moveTo(100, 140).lineTo(700, 140).stroke(colorDorado);

      // Texto principal
      doc.font('Helvetica')
         .fontSize(18)
         .fillColor('#2C3E50')
         .text('Se certifica que', 50, 180, { align: 'center' });

      // Nombre del participante
      const nombreCompleto = `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim();
      doc.font('Helvetica-Bold')
         .fontSize(28)
         .fillColor(colorSecundario)
         .text(nombreCompleto.toUpperCase(), 50, 220, { align: 'center' });

      // Texto de aprobación
      doc.font('Helvetica')
         .fontSize(18)
         .fillColor('#2C3E50')
         .text('ha aprobado satisfactoriamente el curso', 50, 270, { align: 'center' });

      // Nombre del curso
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor(colorPrincipal)
         .text(`"${inscripcion.curso.nom_cur}"`, 50, 310, { align: 'center' });

      // Información del curso
      const fechaInicio = new Date(inscripcion.curso.fec_ini_cur).toLocaleDateString('es-ES');
      const fechaFin = new Date(inscripcion.curso.fec_fin_cur).toLocaleDateString('es-ES');
      
      doc.font('Helvetica')
         .fontSize(16)
         .text(`realizado del ${fechaInicio} al ${fechaFin}`, 50, 350, { align: 'center' });

      doc.text(`Categoría: ${inscripcion.curso.categoria.nom_cat}`, 50, 375, { align: 'center' });
      doc.text(`Duración: ${inscripcion.curso.dur_cur} horas académicas`, 50, 400, { align: 'center' });

      // Calificaciones
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(colorSecundario)
         .text(`Nota final: ${participacion.nota_final}/100`, 50, 430, { align: 'center' });
      
      doc.text(`Porcentaje de asistencia: ${participacion.asistencia_porcentaje}%`, 50, 455, { align: 'center' });

      // Organizador
      const organizador = inscripcion.curso.organizador;
      const nombreOrganizador = `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim();
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor('#2C3E50')
         .text('Organizado por:', 50, 485, { align: 'center' });
      
      doc.font('Helvetica')
         .fontSize(16)
         .text(nombreOrganizador, 50, 505, { align: 'center' });

      // Fecha de emisión y número de certificado
      const fechaEmision = new Date().toLocaleDateString('es-ES');
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#7F8C8D')
         .text(`Certificado emitido el ${fechaEmision}`, 50, 540, { align: 'center' });

      doc.text(`Número de certificado: CUR-${inscripcion.id_ins_cur.slice(-8).toUpperCase()}`, 50, 560, { align: 'center' });

      // Línea final decorativa
      doc.moveTo(100, 580).lineTo(700, 580).stroke(colorDorado);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarCertificadoAutomatico,
  generarCertificadoEventoAutomatico,
  generarCertificadoCursoAutomatico
}; 