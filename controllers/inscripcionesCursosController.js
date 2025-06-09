const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inscribir usuario a un curso (validación completa)
async function inscribirUsuarioCurso(req, res) {
  try {
    const { idUsuario, idCurso, metodoPago } = req.body;
    
    // Obtener archivo de comprobante si existe
    const comprobantePago = req.file;

    console.log('📝 Datos de inscripción en curso recibidos:', {
      idUsuario,
      idCurso,
      metodoPago,
      tieneComprobante: !!comprobantePago
    });

    // Validaciones básicas
    if (!idUsuario || !idCurso) {
      return res.status(400).json({ 
        message: 'ID de usuario e ID de curso son obligatorios' 
      });
    }

    // Verificar que el usuario existe y obtener información de documentos
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: idUsuario },
      include: {
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // ✅ VERIFICACIÓN OBLIGATORIA DE DOCUMENTOS - SIN EXCEPCIONES
    const isEstudiante = usuario.cuentas[0]?.rol_cue === 'ESTUDIANTE';
    
    // Verificar que los documentos están verificados por el admin
    if (!usuario.documentos_verificados) {
      return res.status(400).json({
        message: 'Debes tener tus documentos verificados por un administrador antes de poder inscribirte. Sube tu cédula' + 
                 (isEstudiante ? ' y matrícula' : '') + ' en tu perfil y espera la verificación administrativa.'
      });
    }

    // Verificar que tiene todos los documentos requeridos subidos
    const tieneDocumentosCompletos = isEstudiante 
      ? (!!usuario.enl_ced_pdf && !!usuario.enl_mat_pdf)
      : !!usuario.enl_ced_pdf;

    if (!tieneDocumentosCompletos) {
      return res.status(400).json({
        message: 'Debes subir todos los documentos requeridos (cédula' + 
                 (isEstudiante ? ' y matrícula' : '') + ') antes de poder inscribirte.'
      });
    }

    // Verificar que el curso existe
    const curso = await prisma.curso.findUnique({
      where: { id_cur: idCurso }
    });

    if (!curso) {
      return res.status(404).json({ 
        message: 'Curso no encontrado' 
      });
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await prisma.inscripcionCurso.findUnique({
      where: {
        id_usu_ins_cur_id_cur_ins: {
          id_usu_ins_cur: idUsuario,
          id_cur_ins: idCurso
        }
      }
    });

    if (inscripcionExistente) {
      return res.status(400).json({ 
        message: 'Ya estás inscrito en este curso' 
      });
    }

    // Verificar capacidad disponible
    const inscripcionesActuales = await prisma.inscripcionCurso.count({
      where: { 
        id_cur_ins: idCurso,
        estado_pago_cur: { in: ['APROBADO', 'PENDIENTE'] }
      }
    });

    if (inscripcionesActuales >= curso.cap_cur) {
      return res.status(400).json({ 
        message: 'El curso ha alcanzado su capacidad máxima' 
      });
    }

    // Preparar datos de inscripción
    const datosInscripcion = {
      id_usu_ins_cur: idUsuario,
      id_cur_ins: idCurso,
      fec_ins_cur: new Date()
    };

    if (curso.es_gratuito) {
      // CURSO GRATUITO: No requiere datos de pago
      if (metodoPago || comprobantePago) {
        return res.status(400).json({ 
          message: 'Este curso es gratuito, no debe incluir información de pago' 
        });
      }
      
      datosInscripcion.val_ins_cur = null;
      datosInscripcion.met_pag_ins_cur = null;
      datosInscripcion.enl_ord_pag_ins_cur = null;
      datosInscripcion.comprobante_pago_pdf = null;
      datosInscripcion.comprobante_filename = null;
      datosInscripcion.comprobante_size = null;
      datosInscripcion.fec_subida_comprobante = null;
      datosInscripcion.estado_pago_cur = 'APROBADO'; // Automáticamente aprobado
      datosInscripcion.fec_aprobacion_cur = new Date();
      
    } else {
      // CURSO PAGADO: Requiere datos de pago
      if (!metodoPago) {
        return res.status(400).json({ 
          message: 'Para cursos pagados, el método de pago es obligatorio' 
        });
      }

      const metodosPermitidos = ['TARJETA_CREDITO', 'TRANFERENCIA', 'DEPOSITO'];
      if (!metodosPermitidos.includes(metodoPago)) {
        return res.status(400).json({ 
          message: `Método de pago no válido. Valores permitidos: ${metodosPermitidos.join(', ')}` 
        });
      }

      if (!comprobantePago) {
        return res.status(400).json({ 
          message: 'Para cursos pagados, el comprobante de pago (archivo PDF) es obligatorio' 
        });
      }
      
      datosInscripcion.val_ins_cur = curso.precio;
      datosInscripcion.met_pag_ins_cur = metodoPago;
      datosInscripcion.enl_ord_pag_ins_cur = null; // Ya no usamos enlaces de texto
      datosInscripcion.comprobante_pago_pdf = comprobantePago.buffer;
      datosInscripcion.comprobante_filename = comprobantePago.originalname;
      datosInscripcion.comprobante_size = comprobantePago.size;
      datosInscripcion.fec_subida_comprobante = new Date();
      datosInscripcion.estado_pago_cur = 'PENDIENTE'; // Requiere aprobación manual
    }

    // Crear inscripción
    const nuevaInscripcion = await prisma.inscripcionCurso.create({
      data: datosInscripcion
    });

    const mensaje = curso.es_gratuito 
      ? 'Inscripción gratuita realizada con éxito' 
      : 'Inscripción enviada. Pendiente de aprobación de pago';

    return res.status(201).json({ 
      message: mensaje,
      inscripcion: {
        id: nuevaInscripcion.id_ins_cur,
        estado: nuevaInscripcion.estado_pago_cur,
        esGratuito: curso.es_gratuito,
        precio: curso.precio,
        tieneComprobante: !!nuevaInscripcion.comprobante_pago_pdf
      }
    });

  } catch (error) {
    console.error('❌ Error en inscribirUsuarioCurso:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Obtener inscripciones de cursos del usuario
const obtenerMisInscripcionesCurso = async (req, res) => {
  const userId = req.uid;

  try {
    const inscripciones = await prisma.inscripcionCurso.findMany({
      where: { id_usu_ins_cur: userId },
      include: {
        curso: {
          select: {
            id_cur: true,
            nom_cur: true,
            des_cur: true,
            fec_ini_cur: true,
            fec_fin_cur: true,
            tipo_audiencia_cur: true,
            categoria: { select: { nom_cat: true } }
          }
        }
      },
      orderBy: { fec_ins_cur: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: inscripciones
    });
  } catch (error) {
    console.error('❌ Error al obtener inscripciones de cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus inscripciones'
    });
  }
};

// Aprobar inscripción a curso (admin/master)
const aprobarInscripcionCurso = async (req, res) => {
  const adminId = req.uid;
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['APROBADO', 'RECHAZADO'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado no válido. Usa APROBADO o RECHAZADO' });
  }

  try {
    const cuenta = await prisma.cuenta.findFirst({ where: { id_usu_per: adminId } });

    if (!cuenta || (cuenta.rol_cue !== 'ADMINISTRADOR' && cuenta.rol_cue !== 'MASTER')) {
      return res.status(403).json({ message: 'No autorizado. Solo administradores pueden aprobar inscripciones' });
    }

    const inscripcion = await prisma.inscripcionCurso.findUnique({ where: { id_ins_cur: id } });
    if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });

    const actualizada = await prisma.inscripcionCurso.update({
      where: { id_ins_cur: id },
      data: {
        estado_pago_cur: estado,
        id_admin_aprobador_cur: adminId,
        fec_aprobacion_cur: new Date()
      }
    });

    res.status(200).json({
      message: `Inscripción ${estado.toLowerCase()} correctamente`,
      data: actualizada
    });
  } catch (error) {
    console.error('❌ Error al aprobar inscripción de curso:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// ✅ DESCARGAR COMPROBANTE DE PAGO DE CURSO
async function descargarComprobantePagoCurso(req, res) {
  try {
    const { inscripcionId } = req.params;

    // Validar ID
    if (!inscripcionId) {
      res.status(400);
      return res.send('Error: ID de inscripción es obligatorio');
    }

    // Verificar que el usuario solicitante es admin
    const currentUser = await prisma.usuario.findUnique({
      where: { id_usu: req.uid },
      include: {
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      }
    });

    const isAdmin = ['ADMINISTRADOR', 'MASTER'].includes(currentUser.cuentas[0]?.rol_cue);
    
    if (!isAdmin) {
      res.status(403);
      return res.send('Error: No autorizado para descargar comprobantes de pago');
    }

    // Obtener la inscripción con el comprobante
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: inscripcionId },
      select: {
        comprobante_pago_pdf: true,
        comprobante_filename: true,
        comprobante_size: true,
        usuario: {
          select: {
            ced_usu: true,
            nom_usu1: true,
            ape_usu1: true
          }
        },
        curso: {
          select: {
            nom_cur: true
          }
        }
      }
    });

    if (!inscripcion) {
      res.status(404);
      return res.send('Error: Inscripción no encontrada');
    }

    if (!inscripcion.comprobante_pago_pdf) {
      res.status(404);
      return res.send('Error: Comprobante de pago no encontrado para esta inscripción');
    }

    // Verificar que el comprobante tiene datos
    console.log('🔍 Debugging comprobante curso:');
    console.log('- Tipo de dato:', typeof inscripcion.comprobante_pago_pdf);
    console.log('- Es Buffer:', Buffer.isBuffer(inscripcion.comprobante_pago_pdf));
    console.log('- Longitud:', inscripcion.comprobante_pago_pdf ? inscripcion.comprobante_pago_pdf.length : 'null');

    if (!inscripcion.comprobante_pago_pdf) {
      res.status(500);
      return res.send('Error: El comprobante_pago_pdf es null o undefined');
    }

    if (inscripcion.comprobante_pago_pdf.length === 0) {
      res.status(500);
      return res.send('Error: El archivo del comprobante tiene longitud 0');
    }

    // Convertir a Buffer si no lo es (puede venir como Uint8Array de Prisma)
    let bufferComprobante;
    if (Buffer.isBuffer(inscripcion.comprobante_pago_pdf)) {
      bufferComprobante = inscripcion.comprobante_pago_pdf;
    } else if (inscripcion.comprobante_pago_pdf instanceof Uint8Array) {
      bufferComprobante = Buffer.from(inscripcion.comprobante_pago_pdf);
      console.log('✅ Convertido de Uint8Array a Buffer');
    } else {
      res.status(500);
      return res.send(`Error: Tipo de dato no soportado: ${typeof inscripcion.comprobante_pago_pdf}`);
    }

    // Generar nombre del archivo
    const fileName = inscripcion.comprobante_filename || 
                    `comprobante_curso_${inscripcion.usuario.nom_usu1}_${inscripcion.usuario.ape_usu1}.pdf`;

    // Log para debugging
    console.log(`📄 Descargando comprobante curso: ${fileName}, Tamaño: ${bufferComprobante.length} bytes`);

    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', bufferComprobante.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Enviar el archivo binario
    return res.end(bufferComprobante);

  } catch (error) {
    console.error('❌ Error en descargarComprobantePagoCurso:', error);
    
    // Si ya se enviaron headers, no podemos enviar JSON
    if (res.headersSent) {
      return res.end();
    }
    
    res.status(500);
    return res.send(`Error interno del servidor: ${error.message}`);
  }
}

// ✅ OBTENER TODAS LAS INSCRIPCIONES DE CURSOS (SOLO ADMIN)
async function obtenerTodasInscripcionesCursos(req, res) {
  try {
    // Verificar que el usuario es admin
    const currentUser = await prisma.usuario.findUnique({
      where: { id_usu: req.uid },
      include: {
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      }
    });

    const isAdmin = ['ADMINISTRADOR', 'MASTER'].includes(currentUser.cuentas[0]?.rol_cue);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver todas las inscripciones'
      });
    }

    const inscripciones = await prisma.inscripcionCurso.findMany({
      include: {
        usuario: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true,
            cor_usu: true,
            ced_usu: true
          }
        },
        curso: {
          select: {
            id_cur: true,
            nom_cur: true,
            des_cur: true,
            fec_ini_cur: true,
            precio: true,
            es_gratuito: true
          }
        },
        adminAprobador: {
          select: {
            nom_usu: true,
            ape_usu: true
          }
        }
      },
      orderBy: {
        fec_ins_cur: 'desc'
      }
    });

    res.json({
      success: true,
      data: inscripciones
    });

  } catch (error) {
    console.error('❌ Error en obtenerTodasInscripcionesCursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  inscribirUsuarioCurso,
  obtenerMisInscripcionesCurso,
  aprobarInscripcionCurso,
  descargarComprobantePagoCurso,
  obtenerTodasInscripcionesCursos
};
