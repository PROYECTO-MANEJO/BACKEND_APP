const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const { PassThrough } = require('stream');

const prisma = new PrismaClient();

// =====================================================
// GENERACIÓN DE CERTIFICADOS
// =====================================================

/**
 * Generar certificado usando solo ID de participación de evento
 */
const generarCertificadoEventoPorParticipacion = async (req, res) => {
  try {
    const { idParticipacion } = req.params;
    const userId = req.uid;

    console.log('🔍 Generando certificado por participación evento:', { idParticipacion, userId });

    // Buscar la participación con toda la información necesaria
    const participacion = await prisma.participacion.findFirst({
      where: {
        id_par: idParticipacion,
        inscripcion: {
          id_usu_ins: userId
        }
      },
      include: {
        inscripcion: {
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
        }
      }
    });

    if (!participacion) {
      return res.status(404).json({
        success: false,
        message: 'Participación no encontrada'
      });
    }

    const inscripcion = participacion.inscripcion;

    // Verificar que el usuario está aprobado en el pago (si no es gratuito)
    if (!inscripcion.evento.es_gratuito && inscripcion.estado_pago !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'El pago de la inscripción debe estar aprobado para generar el certificado'
      });
    }

    // Verificar que está aprobado
    if (!participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el evento. Se requiere al menos 70% de asistencia.'
      });
    }

    // Generar el certificado PDF (sobreescribir si ya existe)
    const certificadoBuffer = await generarPDFCertificadoEvento(inscripcion, participacion);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_evento_${inscripcion.id_eve_ins}_${inscripcion.id_ins}_${Date.now()}.pdf`;
    
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
    console.error('❌ Error al generar certificado de evento por participación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generar certificado para evento aprobado
 */
const generarCertificadoEvento = async (req, res) => {
  try {
    const { idEvento, idInscripcion } = req.params;
    const userId = req.uid;

    console.log('🔍 Parámetros recibidos para evento:', { idEvento, idInscripcion, userId });

    // Validar que los parámetros no sean undefined
    if (!idEvento || !idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros idEvento e idInscripcion son requeridos',
        recibido: { idEvento, idInscripcion }
      });
    }

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
 * Generar certificado usando solo ID de participación de curso
 */
const generarCertificadoCursoPorParticipacion = async (req, res) => {
  try {
    const { idParticipacion } = req.params;
    const userId = req.uid;

    console.log('🔍 Generando certificado por participación curso:', { idParticipacion, userId });

    // Buscar la participación con toda la información necesaria
    const participacion = await prisma.participacionCurso.findFirst({
      where: {
        id_par_cur: idParticipacion,
        inscripcionCurso: {
          id_usu_ins_cur: userId
        }
      },
      include: {
        inscripcionCurso: {
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
        }
      }
    });

    if (!participacion) {
      return res.status(404).json({
        success: false,
        message: 'Participación no encontrada'
      });
    }

    const inscripcion = participacion.inscripcionCurso;

    // Verificar que el usuario está aprobado en el pago (si no es gratuito)
    if (!inscripcion.curso.es_gratuito && inscripcion.estado_pago_cur !== 'APROBADO') {
      return res.status(400).json({
        success: false,
        message: 'El pago de la inscripción debe estar aprobado para generar el certificado'
      });
    }

    // Verificar que está aprobado
    if (!participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el curso. Se requiere nota >= 70 y asistencia >= 70%.'
      });
    }

    // Generar el certificado PDF (sobreescribir si ya existe)
    const certificadoBuffer = await generarPDFCertificadoCurso(inscripcion, participacion);
    
    // Generar nombre único para el archivo
    const nombreArchivo = `certificado_curso_${inscripcion.id_cur_ins}_${inscripcion.id_ins_cur}_${Date.now()}.pdf`;
    
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
    console.error('❌ Error al generar certificado de curso por participación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Endpoint de prueba para verificar conectividad
 */
const testConectividad = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint funcionando correctamente',
    timestamp: new Date().toISOString(),
    params: req.params,
    query: req.query,
    userId: req.uid
  });
};

/**
 * Visualizar certificado en navegador (en lugar de descargar)
 */
const visualizarCertificadoCursoPorParticipacion = async (req, res) => {
  try {
    console.log('🔍 ENTRADA - Visualizar certificado curso');
    console.log('📥 Parámetros recibidos:', req.params);
    console.log('📥 Query params:', req.query);
    console.log('📥 Headers:', Object.keys(req.headers));
    
    const { idParticipacion } = req.params;
    // El userId viene del middleware de autenticación (token en query o header)
    const userId = req.uid;

    console.log('🔍 Procesando certificado - ID participación:', idParticipacion);
    console.log('🔍 Usuario autenticado ID:', userId);

    // Buscar la participación con toda la información necesaria
    const participacion = await prisma.participacionCurso.findFirst({
      where: {
        id_par_cur: idParticipacion,
        inscripcionCurso: {
          id_usu_ins_cur: userId
        }
      },
      include: {
        inscripcionCurso: {
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
        }
      }
    });

    if (!participacion) {
      return res.status(404).json({
        success: false,
        message: 'Participación no encontrada'
      });
    }

    const inscripcion = participacion.inscripcionCurso;

    // Verificar que está aprobado
    if (!participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el curso.'
      });
    }

    console.log('📄 Generando PDF...');
    
    // Generar el certificado PDF en tiempo real
    const certificadoBuffer = await generarPDFCertificadoCurso(inscripcion, participacion);
    
    console.log('✅ PDF generado, tamaño:', certificadoBuffer.length);
    
    // Configurar headers para visualización en navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="certificado.pdf"');
    res.setHeader('Content-Length', certificadoBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('📤 Enviando PDF al navegador...');
    res.send(certificadoBuffer);

  } catch (error) {
    console.error('❌ Error al visualizar certificado de curso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Visualizar certificado de evento en navegador (en lugar de descargar)
 */
const visualizarCertificadoEventoPorParticipacion = async (req, res) => {
  try {
    console.log('🔍 ENTRADA - Visualizar certificado evento');
    console.log('📥 Parámetros recibidos:', req.params);
    console.log('📥 Query params:', req.query);
    console.log('📥 Headers:', Object.keys(req.headers));
    
    const { idParticipacion } = req.params;
    // El userId viene del middleware de autenticación (token en query o header)
    const userId = req.uid;

    console.log('🔍 Procesando certificado - ID participación:', idParticipacion);
    console.log('🔍 Usuario autenticado ID:', userId);

    // Buscar la participación con toda la información necesaria
    const participacion = await prisma.participacion.findFirst({
      where: {
        id_par: idParticipacion,
        inscripcion: {
          id_usu_ins: userId
        }
      },
      include: {
        inscripcion: {
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
        }
      }
    });

    if (!participacion) {
      return res.status(404).json({
        success: false,
        message: 'Participación no encontrada'
      });
    }

    const inscripcion = participacion.inscripcion;

    // Verificar que está aprobado
    if (!participacion.aprobado) {
      return res.status(400).json({
        success: false,
        message: 'El participante no ha sido aprobado en el evento.'
      });
    }

    console.log('📄 Generando PDF...');
    
    // Generar el certificado PDF en tiempo real
    const certificadoBuffer = await generarPDFCertificadoEvento(inscripcion, participacion);
    
    console.log('✅ PDF generado, tamaño:', certificadoBuffer.length);
    
    // Configurar headers para visualización en navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="certificado.pdf"');
    res.setHeader('Content-Length', certificadoBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('📤 Enviando PDF al navegador...');
    res.send(certificadoBuffer);

  } catch (error) {
    console.error('❌ Error al visualizar certificado de evento:', error);
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

    console.log('🔍 Parámetros recibidos:', { idCurso, idInscripcion, userId });

    // Validar que los parámetros no sean undefined
    if (!idCurso || !idInscripcion) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros idCurso e idInscripcion son requeridos',
        recibido: { idCurso, idInscripcion }
      });
    }

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
  try {
    console.log('🔄 Iniciando generación PDF evento...');
    
    // Crear documento usando el patrón exitoso de reportesController
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    console.log('📄 Documento PDF inicializado correctamente');

    // Marco decorativo
    doc.rect(40, 40, 755, 515).stroke();

    // Título principal
    doc.fontSize(32).font('Times-Bold')
       .text('CERTIFICADO DE PARTICIPACIÓN', 50, 80, {
         width: 742,
         align: 'center'
       });

    // Línea decorativa
    doc.moveTo(100, 140).lineTo(692, 140).stroke();

    // Texto "Se certifica que"
    doc.fontSize(16).font('Times-Roman')
       .text('Se certifica que', 50, 170, {
         width: 742,
         align: 'center'
       });

    // Nombre del participante
    const nombreCompleto = `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim();
    doc.fontSize(24).font('Times-Bold')
       .text(nombreCompleto.toUpperCase(), 50, 200, {
         width: 742,
         align: 'center'
       });

    // Texto de participación
    doc.fontSize(16).font('Times-Roman')
       .text('participó exitosamente en el evento', 50, 240, {
         width: 742,
         align: 'center'
       });

    // Nombre del evento
    doc.fontSize(20).font('Times-Bold')
       .text(`"${inscripcion.evento.nom_eve}"`, 50, 270, {
         width: 742,
         align: 'center'
       });

    // Información del evento
    const fechaInicio = new Date(inscripcion.evento.fec_ini_eve).toLocaleDateString('es-ES');
    const fechaFin = inscripcion.evento.fec_fin_eve ? 
      new Date(inscripcion.evento.fec_fin_eve).toLocaleDateString('es-ES') : fechaInicio;
    
    const fechasTexto = fechaInicio === fechaFin ? 
      `realizado el ${fechaInicio}` : 
      `realizado del ${fechaInicio} al ${fechaFin}`;

    doc.fontSize(14).font('Times-Roman')
       .text(fechasTexto, 50, 310, {
         width: 742,
         align: 'center'
       });

    doc.text(`Categoría: ${inscripcion.evento.categoria.nom_cat}`, 50, 330, {
      width: 742,
      align: 'center'
    });

    doc.text(`Porcentaje de asistencia: ${participacion.asi_par}%`, 50, 350, {
      width: 742,
      align: 'center'
    });

    // Organizador
    const organizador = inscripcion.evento.organizador;
    const nombreOrganizador = `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim();
    
    doc.fontSize(12).font('Times-Roman')
       .text('Organizado por:', 50, 390, {
         width: 742,
         align: 'center'
       });

    doc.text(nombreOrganizador, 50, 410, {
      width: 742,
      align: 'center'
    });

    // Fecha de emisión y número de certificado
    const fechaEmision = new Date().toLocaleDateString('es-ES');
    doc.fontSize(10).font('Times-Italic')
       .text(`Certificado emitido el ${fechaEmision}`, 50, 450, {
         width: 742,
         align: 'center'
       });

    doc.text(`Número de certificado: EVT-${inscripcion.id_ins.slice(-8).toUpperCase()}`, 50, 470, {
      width: 742,
      align: 'center'
    });

    // Línea final decorativa
    doc.moveTo(100, 500).lineTo(692, 500).stroke();

    console.log('✅ Contenido del PDF generado, finalizando...');
    doc.end();

    const buffer = await bufferPromise;
    console.log('✅ Buffer PDF generado exitosamente, tamaño:', buffer.length);
    return buffer;

  } catch (error) {
    console.error('❌ Error generando PDF evento:', error);
    throw error;
  }
};

/**
 * Generar PDF del certificado para curso
 */
const generarPDFCertificadoCurso = async (inscripcion, participacion) => {
  try {
    console.log('🔄 Iniciando generación PDF curso...');
    
    // Crear documento con configuración para certificado profesional
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40
    });

    const stream = new PassThrough();
    const bufferPromise = getStream.buffer(stream);
    doc.pipe(stream);

    console.log('📄 Documento PDF inicializado correctamente');

    // Definir colores
    const colorRojo = '#dc2626'; // Color rojo principal de la aplicación
    const colorRojoClaro = '#fef2f2'; // Fondo rojo muy claro
    const colorGris = '#374151';
    const colorGrisClaro = '#9ca3af';

    // Fondo sutil
    doc.rect(0, 0, 842, 595).fill(colorRojoClaro);

    // Marco principal decorativo
    doc.strokeColor(colorRojo).lineWidth(3);
    doc.rect(30, 30, 782, 535).stroke();

    // Marco interno decorativo
    doc.strokeColor(colorRojo).lineWidth(1);
    doc.rect(50, 50, 742, 495).stroke();

    // Header con fondo rojo
    doc.rect(60, 60, 722, 80).fill(colorRojo);

    // Título principal en blanco
    doc.fillColor('white').fontSize(28).font('Times-Bold')
       .text('CERTIFICADO DE APROBACIÓN', 70, 85, {
         width: 702,
         align: 'center'
       });

    // Línea decorativa dorada
    doc.strokeColor('#fbbf24').lineWidth(2);
    doc.moveTo(100, 170).lineTo(742, 170).stroke();

    // Texto "Se certifica que" elegante
    doc.fillColor(colorGris).fontSize(18).font('Times-Italic')
       .text('Por medio del presente se certifica que', 70, 190, {
         width: 702,
         align: 'center'
       });

    // Nombre del participante con estilo destacado
    const nombreCompleto = `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim();
    
    // Fondo sutil para el nombre
    doc.rect(120, 215, 602, 40).fill('#f9fafb');
    doc.strokeColor(colorRojo).lineWidth(1).rect(120, 215, 602, 40).stroke();
    
    doc.fillColor(colorRojo).fontSize(24).font('Times-Bold')
       .text(nombreCompleto.toUpperCase(), 130, 230, {
         width: 582,
         align: 'center'
       });

    // Texto descriptivo
    doc.fillColor(colorGris).fontSize(16).font('Times-Roman')
       .text('ha completado exitosamente y obtenido la aprobación en el curso:', 70, 280, {
         width: 702,
         align: 'center'
       });

    // Nombre del curso con fondo destacado
    doc.rect(100, 300, 642, 35).fill('#fef2f2');
    doc.strokeColor(colorRojo).lineWidth(1).rect(100, 300, 642, 35).stroke();
    
    doc.fillColor(colorRojo).fontSize(20).font('Times-Bold')
       .text(`"${inscripcion.curso.nom_cur}"`, 110, 312, {
         width: 622,
         align: 'center'
       });

    // Información del curso y fechas
    const fechaInicio = new Date(inscripcion.curso.fec_ini_cur).toLocaleDateString('es-ES');
    const fechaFin = inscripcion.curso.fec_fin_cur ? 
      new Date(inscripcion.curso.fec_fin_cur).toLocaleDateString('es-ES') : fechaInicio;
    
    const fechasTexto = fechaInicio === fechaFin ? 
      `Realizado el ${fechaInicio}` : 
      `Realizado del ${fechaInicio} al ${fechaFin}`;

    doc.fillColor(colorGris).fontSize(14).font('Times-Roman')
       .text(fechasTexto, 70, 355, {
         width: 702,
         align: 'center'
       });

    if (inscripcion.curso.categoria) {
      doc.text(`Categoría: ${inscripcion.curso.categoria.nom_cat}`, 70, 375, {
        width: 702,
        align: 'center'
      });
    }

    // Calificaciones en cajas destacadas
    const yPos = 410;
    
    // Caja para nota final
    doc.rect(200, yPos, 180, 50).fill('#fef2f2');
    doc.strokeColor(colorRojo).lineWidth(1).rect(200, yPos, 180, 50).stroke();
    doc.fillColor(colorRojo).fontSize(12).font('Times-Bold')
       .text('NOTA FINAL', 210, yPos + 8, { width: 160, align: 'center' });
    doc.fontSize(20).font('Times-Bold')
       .text(`${participacion.nota_final}/100`, 210, yPos + 25, { width: 160, align: 'center' });

    // Caja para asistencia
    doc.rect(462, yPos, 180, 50).fill('#fef2f2');
    doc.strokeColor(colorRojo).lineWidth(1).rect(462, yPos, 180, 50).stroke();
    doc.fillColor(colorRojo).fontSize(12).font('Times-Bold')
       .text('ASISTENCIA', 472, yPos + 8, { width: 160, align: 'center' });
    doc.fontSize(20).font('Times-Bold')
       .text(`${participacion.asistencia_porcentaje}%`, 472, yPos + 25, { width: 160, align: 'center' });

    // Organizador si existe
    if (inscripcion.curso.organizador) {
      const organizador = inscripcion.curso.organizador;
      const nombreOrganizador = `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim();
      
      doc.fillColor(colorGrisClaro).fontSize(12).font('Times-Roman')
         .text('Organizado por:', 70, 485, {
           width: 702,
           align: 'center'
         });

      doc.fillColor(colorGris).fontSize(14).font('Times-Bold')
         .text(nombreOrganizador, 70, 500, {
           width: 702,
           align: 'center'
         });
    }

    // Footer con información del certificado
    doc.rect(60, 520, 722, 25).fill('#f3f4f6');
    
    const fechaEmision = new Date().toLocaleDateString('es-ES');
    const numeroSerie = `CUR-${inscripcion.id_ins_cur.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    doc.fillColor(colorGrisClaro).fontSize(10).font('Times-Roman')
       .text(`Certificado emitido el ${fechaEmision} | Número de serie: ${numeroSerie}`, 70, 528, {
         width: 702,
         align: 'center'
       });

    // Línea decorativa final
    doc.strokeColor('#fbbf24').lineWidth(2);
    doc.moveTo(100, 510).lineTo(742, 510).stroke();

    // Sellos/marcas decorativas en las esquinas
    doc.fillColor(colorRojo).fontSize(8).font('Times-Bold');
    
    // Esquina superior izquierda
    doc.text('CERTIFICADO', 70, 70, { rotate: 0 });
    doc.text('OFICIAL', 70, 82, { rotate: 0 });
    
    // Esquina superior derecha
    doc.text('APROBADO', 750, 70, { rotate: 0, width: 50, align: 'right' });
    doc.text('✓', 770, 82, { rotate: 0 });

    console.log('✅ Contenido del PDF generado, finalizando...');
    doc.end();

    const buffer = await bufferPromise;
    console.log('✅ Buffer PDF generado exitosamente, tamaño:', buffer.length);
    return buffer;

  } catch (error) {
    console.error('❌ Error generando PDF curso:', error);
    throw error;
  }
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

const obtenerParticipacionesCompletas = async (req, res) => {
  try {
    const userId = req.uid;

    // participaciones en eventos
    const eventos = await prisma.participacion.findMany({
      where: {
        inscripcion: { id_usu_ins: userId }
      },
      include: {
        inscripcion: {
          include: {
            evento: { select: { nom_eve: true } },
            usuario: { select: { nom_usu1: true, ape_usu1: true } }
          }
        }
      }
    });

    // participaciones en cursos
    const cursos = await prisma.participacionCurso.findMany({
      where: {
        inscripcionCurso: { id_usu_ins_cur: userId }
      },
      include: {
        inscripcionCurso: {
          include: {
            curso: { select: { nom_cur: true } },
            usuario: { select: { nom_usu1: true, ape_usu1: true } }
          }
        }
      }
    });

    const eventosFormateados = eventos.map(p => ({
      id_par: p.id_par,
      evento: p.inscripcion?.evento?.nom_eve || 'Sin nombre',
      asi_par: p.asi_par,
      aprobado: p.aprobado,
      en_progreso: p.aprobado === null,
      usuario: `${p.inscripcion?.usuario?.nom_usu1} ${p.inscripcion?.usuario?.ape_usu1}`,
      fec_cer_par: p.fec_cer_par,
      tiene_certificado_pdf: !!p.certificado_pdf
    }));

    const cursosFormateados = cursos.map(p => ({
      id_par_cur: p.id_par_cur,
      curso: p.inscripcionCurso?.curso?.nom_cur || 'Sin nombre',
      nota_final: p.nota_final,
      asistencia_porcentaje: p.asistencia_porcentaje,
      aprobado: p.aprobado,
      en_progreso: p.aprobado === null,
      usuario: `${p.inscripcionCurso?.usuario?.nom_usu1} ${p.inscripcionCurso?.usuario?.ape_usu1}`,
      fec_cer_par_cur: p.fec_cer_par_cur,
      tiene_certificado_pdf: !!p.certificado_pdf
    }));

    return res.status(200).json({
      success: true,
      message: "Participaciones completas obtenidas exitosamente",
      data: {
        eventos: eventosFormateados,
        cursos: cursosFormateados
      }
    });
  } catch (error) {
    console.error("❌ Error en obtenerParticipacionesCompletas:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  generarCertificadoEvento,
  generarCertificadoCurso,
  generarCertificadoEventoPorParticipacion,
  generarCertificadoCursoPorParticipacion,
  visualizarCertificadoCursoPorParticipacion,
  visualizarCertificadoEventoPorParticipacion,
  testConectividad,
  descargarCertificado,
  obtenerMisCertificados,
  regenerarCertificado,
  debugCertificados,
  obtenerParticipacionesTerminadas,
  obtenerParticipacionesCompletas,
  // Exportar funciones de generación de PDF para uso del helper
  generarPDFCertificadoEvento,
  generarPDFCertificadoCurso
};