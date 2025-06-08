const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Inscribir usuario a un evento (validación completa)
async function inscribirUsuarioEvento(req, res) {
  const { idUsuario, idEvento, metodoPago, enlacePago } = req.body;

  if (!idUsuario || !idEvento) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: idUsuario, idEvento' });
  }

  try {
    // Obtener la cuenta y su usuario asociado
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: idUsuario },
      include: { usuario: true }
    });

    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });

    const rol = cuenta.rol_cue;
    const carreraId = cuenta.usuario?.id_car_per;

    // Obtener el evento con información completa
    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento },
      select: {
        tipo_audiencia_eve: true,
        es_gratuito: true,
        precio: true,
        capacidad_max_eve: true,
        _count: {
          select: {
            inscripciones: true
          }
        }
      }
    });

    if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

    // Verificar capacidad disponible
    if (evento._count.inscripciones >= evento.capacidad_max_eve) {
      return res.status(400).json({ message: 'El evento ha alcanzado su capacidad máxima' });
    }

    // Lógica de validación por tipo de usuario
    if (rol === 'USUARIO' && evento.tipo_audiencia_eve !== 'PUBLICO_GENERAL') {
      return res.status(403).json({ message: 'Solo puedes inscribirte en eventos públicos' });
    }

    if (rol === 'ESTUDIANTE') {
      if (!carreraId) {
        return res.status(400).json({ message: 'No tienes una carrera asignada. Contacta al administrador.' });
      }

      // Verificar si el evento está permitido para su carrera
      const permitido = await prisma.eventoPorCarrera.findFirst({
        where: {
          id_car_per: carreraId,
          id_eve_per: idEvento
        }
      });

      if (
        !permitido &&
        evento.tipo_audiencia_eve !== 'PUBLICO_GENERAL' &&
        evento.tipo_audiencia_eve !== 'TODAS_CARRERAS'
      ) {
        return res.status(403).json({
          message: 'Este evento no está habilitado para tu carrera'
        });
      }
    }

    // Verificar si ya está inscrito
    const yaInscrito = await prisma.inscripcion.findUnique({
      where: {
        id_usu_ins_id_eve_ins: {
          id_usu_ins: idUsuario,
          id_eve_ins: idEvento
        }
      }
    });

    if (yaInscrito) {
      return res.status(400).json({ message: 'Ya estás inscrito en este evento' });
    }

    // 🎯 VALIDAR CAMPOS DE PAGO SEGÚN TIPO DE EVENTO
    let datosInscripcion = {
      id_usu_ins: idUsuario,
      id_eve_ins: idEvento,
      fec_ins: new Date()
    };

    if (evento.es_gratuito) {
      // EVENTO GRATUITO: No requiere datos de pago
      if (metodoPago || enlacePago) {
        return res.status(400).json({ 
          message: 'Este evento es gratuito, no debe incluir información de pago' 
        });
      }
      
      datosInscripcion.val_ins = null;
      datosInscripcion.met_pag_ins = null;
      datosInscripcion.enl_ord_pag_ins = null;
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

      if (!enlacePago) {
        return res.status(400).json({ 
          message: 'Para eventos pagados, el comprobante de pago es obligatorio' 
        });
      }
      
      datosInscripcion.val_ins = evento.precio;
      datosInscripcion.met_pag_ins = metodoPago;
      datosInscripcion.enl_ord_pag_ins = enlacePago;
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
        precio: evento.precio
      }
    });
  } catch (error) {
    console.error('❌ Error al inscribirse:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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

module.exports = {
  inscribirUsuarioEvento,
  obtenerMisInscripcionesEvento,
  aprobarInscripcionEvento
};
