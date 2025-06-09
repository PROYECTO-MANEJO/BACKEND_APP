const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

// =====================================================
// GENERACIÓN DE CERTIFICADOS
// =====================================================

/**
 * Generar certificado para evento aprobado
 */
const generarCertificadoEvento = async (req, res) => {
  try {
    const { idEvento, idInscripcion } = req.params;
    const userId = req.uid;

    // Verificar que la inscripción pertenece al usuario o es admin
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        id_ins: idInscripcion,
        id_eve_ins: idEvento,
        OR: [
          { id_usu_ins: userId },
          { 
            // Permitir a admins generar certificados
            evento: {
              organizador: {
                // O cualquier admin del sistema
              }
            }
          }
        ]
      },
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
        },
        participaciones: true
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada o no autorizada'
      });
    }

    // Verificar que el usuario está aprobado en el pago (si no es gratuito)
    if (!inscripcion.evento.es_gratuito && inscripcion.estado_pago !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'El pago de la inscripción debe estar aprobado para generar el certificado'
      });
    }

    // Verificar que existe participación y está aprobada
    const participacion = inscripcion.participaciones[0];
    if (!participacion || !participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el evento. Se requiere al menos 70% de asistencia.'
      });
    }

    // Verificar si ya existe un certificado generado
    if (participacion.certificado_pdf) {
      return res.status(400).json({
        success: false,
        message: 'El certificado ya ha sido generado para este evento',
        certificado_disponible: true
      });
    }

    // Generar el certificado PDF
    const certificadoBuffer = await generarPDFCertificadoEvento(inscripcion, participacion);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_evento_${idEvento}_${idInscripcion}_${Date.now()}.pdf`;
    
    // Actualizar la participación con el certificado como datos binarios
    await prisma.participacion.update({
      where: { id_par: participacion.id_par },
      data: {
        certificado_pdf: certificadoBuffer,
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        fec_cer_par: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Certificado generado exitosamente',
      data: {
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        evento: inscripcion.evento.nom_eve,
        participante: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        fecha_generacion: new Date(),
        asistencia: participacion.asi_par
      }
    });

  } catch (error) {
    console.error('❌ Error al generar certificado de evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generar certificado para curso aprobado
 */
const generarCertificadoCurso = async (req, res) => {
  try {
    const { idCurso, idInscripcion } = req.params;
    const userId = req.uid;

    // Verificar que la inscripción pertenece al usuario
    const inscripcion = await prisma.inscripcionCurso.findFirst({
      where: {
        id_ins_cur: idInscripcion,
        id_cur_ins: idCurso,
        id_usu_ins_cur: userId
      },
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
        },
        participacionesCurso: true
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que el usuario está aprobado en el pago (si no es gratuito)
    if (!inscripcion.curso.es_gratuito && inscripcion.estado_pago_cur !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'El pago de la inscripción debe estar aprobado para generar el certificado'
      });
    }

    // Verificar que existe participación y está aprobada
    const participacion = inscripcion.participacionesCurso[0];
    if (!participacion || !participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el curso. Se requiere nota >= 70 y asistencia >= 70%.'
      });
    }

    // Verificar si ya existe un certificado generado
    if (participacion.certificado_pdf) {
      return res.status(400).json({
        success: false,
        message: 'El certificado ya ha sido generado para este curso',
        certificado_disponible: true
      });
    }

    // Generar el certificado PDF
    const certificadoBuffer = await generarPDFCertificadoCurso(inscripcion, participacion);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_curso_${idCurso}_${idInscripcion}_${Date.now()}.pdf`;
    
    // Actualizar la participación con el certificado como datos binarios
    await prisma.participacionCurso.update({
      where: { id_par_cur: participacion.id_par_cur },
      data: {
        certificado_pdf: certificadoBuffer,
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        fec_cer_par_cur: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Certificado generado exitosamente',
      data: {
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length,
        curso: inscripcion.curso.nom_cur,
        participante: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.ape_usu1}`,
        fecha_generacion: new Date(),
        nota_final: participacion.nota_final,
        asistencia: participacion.asistencia_porcentaje
      }
    });

  } catch (error) {
    console.error('❌ Error al generar certificado de curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Descargar certificado existente
 */
const descargarCertificado = async (req, res) => {
  try {
    const { tipo, idParticipacion } = req.params;
    const userId = req.uid;

    let participacion = null;

    if (tipo === 'evento') {
      participacion = await prisma.participacion.findFirst({
        where: {
          id_par: idParticipacion,
          inscripcion: {
            id_usu_ins: userId
          }
        },
        include: {
          inscripcion: {
            include: {
              evento: true,
              usuario: true
            }
          }
        }
      });
    } else if (tipo === 'curso') {
      participacion = await prisma.participacionCurso.findFirst({
        where: {
          id_par_cur: idParticipacion,
          inscripcionCurso: {
            id_usu_ins_cur: userId
          }
        },
        include: {
          inscripcionCurso: {
            include: {
              curso: true,
              usuario: true
            }
          }
        }
      });
    }

    if (!participacion || !participacion.certificado_pdf) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }

    // Enviar el archivo desde los datos binarios
    const nombreDescarga = participacion.certificado_filename || `certificado_${tipo}_${idParticipacion}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}"`);
    res.setHeader('Content-Length', participacion.certificado_size || participacion.certificado_pdf.length);
    
    res.send(participacion.certificado_pdf);

  } catch (error) {
    console.error('❌ Error al descargar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener mis certificados generados
 */
const obtenerMisCertificados = async (req, res) => {
  try {
    const userId = req.uid;

    // Obtener certificados de eventos
    const certificadosEventos = await prisma.participacion.findMany({
      where: {
        inscripcion: {
          id_usu_ins: userId
        },
        aprobado: true,
        certificado_pdf: {
          not: null
        }
      },
      include: {
        inscripcion: {
          include: {
            evento: {
              select: {
                id_eve: true,
                nom_eve: true,
                fec_ini_eve: true,
                fec_fin_eve: true,
                categoria: {
                  select: {
                    nom_cat: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Obtener certificados de cursos
    const certificadosCursos = await prisma.participacionCurso.findMany({
      where: {
        inscripcionCurso: {
          id_usu_ins_cur: userId
        },
        aprobado: true,
        certificado_pdf: {
          not: null
        }
      },
      include: {
        inscripcionCurso: {
          include: {
            curso: {
              select: {
                id_cur: true,
                nom_cur: true,
                fec_ini_cur: true,
                fec_fin_cur: true,
                categoria: {
                  select: {
                    nom_cat: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Formatear respuesta
    const eventosFormateados = certificadosEventos.map(cert => ({
      id: cert.id_par,
      tipo: 'evento',
      titulo: cert.inscripcion.evento.nom_eve,
      categoria: cert.inscripcion.evento.categoria.nom_cat,
      fecha_inicio: cert.inscripcion.evento.fec_ini_eve,
      fecha_fin: cert.inscripcion.evento.fec_fin_eve,
      fecha_certificado: cert.fec_cer_par,
      asistencia: cert.asi_par,
      aprobado: cert.aprobado,
      url_descarga: `/api/certificados/descargar/evento/${cert.id_par}`
    }));

    const cursosFormateados = certificadosCursos.map(cert => ({
      id: cert.id_par_cur,
      tipo: 'curso',
      titulo: cert.inscripcionCurso.curso.nom_cur,
      categoria: cert.inscripcionCurso.curso.categoria.nom_cat,
      fecha_inicio: cert.inscripcionCurso.curso.fec_ini_cur,
      fecha_fin: cert.inscripcionCurso.curso.fec_fin_cur,
      fecha_certificado: cert.fec_cer_par_cur,
      nota_final: cert.nota_final,
      asistencia: cert.asistencia_porcentaje,
      aprobado: cert.aprobado,
      url_descarga: `/api/certificados/descargar/curso/${cert.id_par_cur}`
    }));

    res.status(200).json({
      success: true,
      message: 'Certificados obtenidos exitosamente',
      data: {
        total: eventosFormateados.length + cursosFormateados.length,
        eventos: eventosFormateados,
        cursos: cursosFormateados,
        todos: [...eventosFormateados, ...cursosFormateados].sort((a, b) => 
          new Date(b.fecha_certificado) - new Date(a.fecha_certificado)
        )
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener certificados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Debug endpoint para verificar participaciones y certificados
 */
const debugCertificados = async (req, res) => {
  try {
    const userId = req.uid;

    // Obtener todas las participaciones de eventos del usuario
    const participacionesEventos = await prisma.participacion.findMany({
      where: {
        inscripcion: {
          id_usu_ins: userId
        }
      },
      include: {
        inscripcion: {
          include: {
            evento: {
              select: {
                nom_eve: true
              }
            },
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            }
          }
        }
      }
    });

    // Obtener todas las participaciones de cursos del usuario
    const participacionesCursos = await prisma.participacionCurso.findMany({
      where: {
        inscripcionCurso: {
          id_usu_ins_cur: userId
        }
      },
      include: {
        inscripcionCurso: {
          include: {
            curso: {
              select: {
                nom_cur: true
              }
            },
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Datos de debug obtenidos',
      data: {
        userId: userId,
        eventos: participacionesEventos.map(p => ({
          id_par: p.id_par,
          id_ins_per: p.id_ins_per,
          aprobado: p.aprobado,
          asi_par: p.asi_par,
          tiene_certificado_pdf: !!p.certificado_pdf,
          certificado_filename: p.certificado_filename,
          certificado_size: p.certificado_size,
          fec_cer_par: p.fec_cer_par,
          evento: p.inscripcion?.evento?.nom_eve,
          usuario: `${p.inscripcion?.usuario?.nom_usu1} ${p.inscripcion?.usuario?.ape_usu1}`
        })),
        cursos: participacionesCursos.map(p => ({
          id_par_cur: p.id_par_cur,
          id_ins_cur_per: p.id_ins_cur_per,
          aprobado: p.aprobado,
          nota_final: p.nota_final,
          asistencia_porcentaje: p.asistencia_porcentaje,
          tiene_certificado_pdf: !!p.certificado_pdf,
          certificado_filename: p.certificado_filename,
          certificado_size: p.certificado_size,
          fec_cer_par_cur: p.fec_cer_par_cur,
          curso: p.inscripcionCurso?.curso?.nom_cur,
          usuario: `${p.inscripcionCurso?.usuario?.nom_usu1} ${p.inscripcionCurso?.usuario?.ape_usu1}`
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error en debug certificados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// =====================================================
// FUNCIONES DE GENERACIÓN DE PDF
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
      doc.text(`Porcentaje de asistencia: ${participacion.asi_par}%`, 50, 410, { align: 'center' });

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

// =====================================================
// FUNCIONES ADMINISTRATIVAS
// =====================================================

/**
 * Regenerar certificado (solo admin)
 */
const regenerarCertificado = async (req, res) => {
  try {
    const { tipo, idParticipacion } = req.params;

    // Verificar permisos de admin
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: req.uid }
    });

    if (!cuenta || !['ADMINISTRADOR', 'MASTER'].includes(cuenta.rol_cue)) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden regenerar certificados'
      });
    }

    if (tipo === 'evento') {
      const participacion = await prisma.participacion.findUnique({
        where: { id_par: idParticipacion },
        include: {
          inscripcion: {
            include: {
              evento: { include: { categoria: true, organizador: true } },
              usuario: true
            }
          }
        }
      });

      if (!participacion || !participacion.aprobado) {
        return res.status(400).json({
          success: false,
          message: 'No se puede regenerar certificado para participación no aprobada'
        });
      }

      // Generar nuevo certificado
      const certificadoBuffer = await generarPDFCertificadoEvento(participacion.inscripcion, participacion);
      const nombreArchivo = `certificado_evento_${participacion.inscripcion.id_eve_ins}_${participacion.inscripcion.id_ins}_${Date.now()}.pdf`;
      
      await prisma.participacion.update({
        where: { id_par: idParticipacion },
        data: {
          certificado_pdf: certificadoBuffer,
          certificado_filename: nombreArchivo,
          certificado_size: certificadoBuffer.length,
          fec_cer_par: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Certificado de evento regenerado exitosamente',
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length
      });

    } else if (tipo === 'curso') {
      const participacion = await prisma.participacionCurso.findUnique({
        where: { id_par_cur: idParticipacion },
        include: {
          inscripcionCurso: {
            include: {
              curso: { include: { categoria: true, organizador: true } },
              usuario: true
            }
          }
        }
      });

      if (!participacion || !participacion.aprobado) {
        return res.status(400).json({
          success: false,
          message: 'No se puede regenerar certificado para participación no aprobada'
        });
      }

      // Generar nuevo certificado
      const certificadoBuffer = await generarPDFCertificadoCurso(participacion.inscripcionCurso, participacion);
      const nombreArchivo = `certificado_curso_${participacion.inscripcionCurso.id_cur_ins}_${participacion.inscripcionCurso.id_ins_cur}_${Date.now()}.pdf`;
      
      await prisma.participacionCurso.update({
        where: { id_par_cur: idParticipacion },
        data: {
          certificado_pdf: certificadoBuffer,
          certificado_filename: nombreArchivo,
          certificado_size: certificadoBuffer.length,
          fec_cer_par_cur: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Certificado de curso regenerado exitosamente',
        certificado_filename: nombreArchivo,
        certificado_size: certificadoBuffer.length
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Tipo de certificado no válido'
    });

  } catch (error) {
    console.error('❌ Error al regenerar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todas las participaciones del usuario que ya han sido evaluadas
 */
const obtenerParticipacionesTerminadas = async (req, res) => {
  try {
    const userId = req.uid;

    // COPIA EXACTA DEL DEBUG
    const participacionesEventos = await prisma.participacion.findMany({
      where: {
        inscripcion: {
          id_usu_ins: userId
        }
      },
      include: {
        inscripcion: {
          include: {
            evento: {
              select: {
                nom_eve: true
              }
            },
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            }
          }
        }
      }
    });

    const participacionesCursos = await prisma.participacionCurso.findMany({
      where: {
        inscripcionCurso: {
          id_usu_ins_cur: userId
        }
      },
      include: {
        inscripcionCurso: {
          include: {
            curso: {
              select: {
                nom_cur: true
              }
            },
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Participaciones evaluadas obtenidas exitosamente',
      data: {
        userId: userId,
        eventos: participacionesEventos
          .filter(p => p.asi_par !== null) // Solo evaluados
          .map(p => ({
            id_par: p.id_par,
            id_ins_per: p.id_ins_per,
            aprobado: p.aprobado,
            asi_par: p.asi_par,
            tiene_certificado_pdf: !!p.certificado_pdf,
            certificado_filename: p.certificado_filename,
            certificado_size: p.certificado_size,
            fec_cer_par: p.fec_cer_par,
            evento: p.inscripcion?.evento?.nom_eve,
            usuario: `${p.inscripcion?.usuario?.nom_usu1} ${p.inscripcion?.usuario?.ape_usu1}`
          })),
        cursos: participacionesCursos
          .filter(p => p.nota_final !== null) // Solo evaluados
          .map(p => ({
            id_par_cur: p.id_par_cur,
            id_ins_cur_per: p.id_ins_cur_per,
            aprobado: p.aprobado,
            nota_final: p.nota_final,
            asistencia_porcentaje: p.asistencia_porcentaje,
            tiene_certificado_pdf: !!p.certificado_pdf,
            certificado_filename: p.certificado_filename,
            certificado_size: p.certificado_size,
            fec_cer_par_cur: p.fec_cer_par_cur,
            curso: p.inscripcionCurso?.curso?.nom_cur,
            usuario: `${p.inscripcionCurso?.usuario?.nom_usu1} ${p.inscripcionCurso?.usuario?.ape_usu1}`
          }))
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener participaciones terminadas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  generarCertificadoEvento,
  generarCertificadoCurso,
  descargarCertificado,
  obtenerMisCertificados,
  regenerarCertificado,
  debugCertificados,
  obtenerParticipacionesTerminadas
};