const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Inscribir usuario a un evento (validación completa)
async function inscribirUsuarioEvento(req, res) {
  try {
    const { idUsuario, idEvento, metodoPago } = req.body;
    
    // Obtener archivo de comprobante si existe
    const comprobantePago = req.file;

    console.log('📝 Datos de inscripción recibidos:', {
      idUsuario,
      idEvento,
      metodoPago,
      tieneComprobante: !!comprobantePago
    });

    // Validaciones básicas
    if (!idUsuario || !idEvento) {
      return res.status(400).json({ 
        message: 'ID de usuario e ID de evento son obligatorios' 
      });
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: idUsuario }
    });

    if (!usuario) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento }
    });

    if (!evento) {
      return res.status(404).json({ 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await prisma.inscripcion.findUnique({
      where: {
        id_usu_ins_id_eve_ins: {
          id_usu_ins: idUsuario,
          id_eve_ins: idEvento
        }
      }
    });

    if (inscripcionExistente) {
      return res.status(400).json({ 
        message: 'Ya estás inscrito en este evento' 
      });
    }

    // Verificar capacidad disponible
    const inscripcionesActuales = await prisma.inscripcion.count({
      where: { 
        id_eve_ins: idEvento,
        estado_pago: { in: ['APROBADO', 'PENDIENTE'] }
      }
    });

    if (inscripcionesActuales >= evento.cap_eve) {
      return res.status(400).json({ 
        message: 'El evento ha alcanzado su capacidad máxima' 
      });
    }

    // Preparar datos de inscripción
    const datosInscripcion = {
      id_usu_ins: idUsuario,
      id_eve_ins: idEvento,
      fec_ins: new Date()
    };

    if (evento.es_gratuito) {
      // EVENTO GRATUITO: No requiere datos de pago
      if (metodoPago || comprobantePago) {
        return res.status(400).json({ 
          message: 'Este evento es gratuito, no debe incluir información de pago' 
        });
      }
      
      datosInscripcion.val_ins = null;
      datosInscripcion.met_pag_ins = null;
      datosInscripcion.enl_ord_pag_ins = null;
      datosInscripcion.comprobante_pago_pdf = null;
      datosInscripcion.comprobante_filename = null;
      datosInscripcion.comprobante_size = null;
      datosInscripcion.fec_subida_comprobante = null;
      datosInscripcion.estado_pago = 'APROBADO'; // Automáticamente aprobado
      datosInscripcion.fec_aprobacion = new Date();
      
    } else {
      // EVENTO PAGADO: Requiere datos de pago
      if (!metodoPago) {
        return res.status(400).json({ 
          message: 'Para eventos pagados, el método de pago es obligatorio' 
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
          message: 'Para eventos pagados, el comprobante de pago (archivo PDF) es obligatorio' 
        });
      }
      
      datosInscripcion.val_ins = evento.precio;
      datosInscripcion.met_pag_ins = metodoPago;
      datosInscripcion.enl_ord_pag_ins = null; // Ya no usamos enlaces de texto
      datosInscripcion.comprobante_pago_pdf = comprobantePago.buffer;
      datosInscripcion.comprobante_filename = comprobantePago.originalname;
      datosInscripcion.comprobante_size = comprobantePago.size;
      datosInscripcion.fec_subida_comprobante = new Date();
      datosInscripcion.estado_pago = 'PENDIENTE'; // Requiere aprobación manual
    }

    // Crear inscripción
    const nuevaInscripcion = await prisma.inscripcion.create({
      data: datosInscripcion
    });

    const mensaje = evento.es_gratuito 
      ? 'Inscripción gratuita realizada con éxito' 
      : 'Inscripción enviada. Pendiente de aprobación de pago';

    return res.status(201).json({ 
      message: mensaje,
      inscripcion: {
        id: nuevaInscripcion.id_ins,
        estado: nuevaInscripcion.estado_pago,
        esGratuito: evento.es_gratuito,
        precio: evento.precio,
        tieneComprobante: !!nuevaInscripcion.comprobante_pago_pdf
      }
    });

  } catch (error) {
    console.error('❌ Error en inscribirUsuarioEvento:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

const obtenerMisInscripcionesEvento = async (req, res) => {
  const userId = req.uid;

  try {
    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        id_usu_ins: userId
      },
      include: {
        evento: {
          select: {
            id_eve: true,
            nom_eve: true,
            des_eve: true,
            fec_ini_eve: true,
            fec_fin_eve: true,
            hor_ini_eve: true,
            hor_fin_eve: true,
            ubi_eve: true,
            tipo_audiencia_eve: true,
            categoria: {
              select: { nom_cat: true }
            }
          }
        }
      },
      orderBy: {
        fec_ins: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: inscripciones
    });
  } catch (error) {
    console.error('❌ Error al obtener inscripciones del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus inscripciones'
    });
  }
};

//Validacion o aprovacion de la inscripcion
const aprobarInscripcionEvento = async (req, res) => {
  const adminId = req.uid;
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['APROBADO', 'RECHAZADO'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado no válido. Usa APROBADO o RECHAZADO' });
  }

  try {
    // Verificar si el usuario es admin
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: adminId }
    });

    if (!cuenta || (cuenta.rol_cue !== 'ADMINISTRADOR' && cuenta.rol_cue !== 'MASTER')) {
      return res.status(403).json({ message: 'No autorizado. Solo administradores pueden aprobar inscripciones' });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcion.findUnique({ where: { id_ins: id } });
    if (!inscripcion) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }

    // Actualizar la inscripción
    const actualizada = await prisma.inscripcion.update({
      where: { id_ins: id },
      data: {
        estado_pago: estado,
        id_admin_aprobador: adminId,
        fec_aprobacion: new Date()
      }
    });

    res.status(200).json({
      message: `Inscripción ${estado.toLowerCase()} correctamente`,
      data: actualizada
    });

  } catch (error) {
    console.error('❌ Error al aprobar inscripción:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// ✅ DESCARGAR COMPROBANTE DE PAGO DE EVENTO
async function descargarComprobantePagoEvento(req, res) {
  try {
    const { inscripcionId } = req.params;

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
      return res.status(403).json({
        success: false,
        message: 'No autorizado para descargar comprobantes de pago'
      });
    }

    // Obtener la inscripción con el comprobante
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: inscripcionId },
      select: {
        comprobante_pago_pdf: true,
        comprobante_filename: true,
        comprobante_size: true,
        usuario: {
          select: {
            ced_usu: true,
            nom_usu: true
          }
        },
        evento: {
          select: {
            nom_eve: true
          }
        }
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    if (!inscripcion.comprobante_pago_pdf) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante de pago no encontrado'
      });
    }

    // Generar nombre del archivo
    const fileName = `comprobante_evento_${inscripcion.usuario.ced_usu}_${inscripcion.comprobante_filename || 'comprobante.pdf'}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(inscripcion.comprobante_pago_pdf);

  } catch (error) {
    console.error('❌ Error en descargarComprobantePagoEvento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// ✅ OBTENER TODAS LAS INSCRIPCIONES DE EVENTOS (SOLO ADMIN)
async function obtenerTodasInscripcionesEventos(req, res) {
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

    const inscripciones = await prisma.inscripcion.findMany({
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
        evento: {
          select: {
            id_eve: true,
            nom_eve: true,
            des_eve: true,
            fec_ini_eve: true,
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
        fec_ins: 'desc'
      }
    });

    res.json({
      success: true,
      data: inscripciones
    });

  } catch (error) {
    console.error('❌ Error en obtenerTodasInscripcionesEventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  inscribirUsuarioEvento,
  obtenerMisInscripcionesEvento,
  aprobarInscripcionEvento,
  descargarComprobantePagoEvento,
  obtenerTodasInscripcionesEventos
};
