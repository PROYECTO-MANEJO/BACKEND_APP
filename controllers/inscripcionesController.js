const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Inscribir usuario a un evento (validación completa)
async function inscribirUsuarioEvento(req, res) {
  const { idUsuario, idEvento, metodoPago, enlacePago } = req.body;

  if (!idUsuario || !idEvento || !metodoPago) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const metodosPermitidos = ['TARJETA DE CREDITO', 'TRANFERENCIA', 'DEPOSITO'];
  if (!metodosPermitidos.includes(metodoPago)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
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

    // Obtener el evento con su tipo de audiencia
    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento },
      select: {
        tipo_audiencia_eve: true
      }
    });

    if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

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

    // Crear inscripción
    await prisma.inscripcion.create({
      data: {
        id_usu_ins: idUsuario,
        id_eve_ins: idEvento,
        fec_ins: new Date(),
        val_ins: 0,
        met_pag_ins: metodoPago,
        enl_ord_pag_ins: enlacePago || '',
        estado_pago: 'PENDIENTE'
      }
    });

    return res.status(201).json({ message: 'Inscripción realizada con éxito' });
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
