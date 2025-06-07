const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ======================= EVENTOS ============================

async function inscribirUsuarioEvento(req, res) {
  const { idUsuario, idEvento, metodoPago, enlacePago } = req.body;

  if (!idUsuario || !idEvento || !metodoPago) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const metodosPermitidos = ['TARJETA_CREDITO', 'TRANFERENCIA', 'EFECTIVO'];
  if (!metodosPermitidos.includes(metodoPago)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
  }

  try {
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: idUsuario },
      include: { usuario: true }
    });

    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });

    const rol = cuenta.rol_cue;
    const carreraId = cuenta.usuario?.id_car_per;

    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento },
      include: { categoria: true }
    });

    if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

    if (rol === 'USUARIO' && evento.tipo_audiencia_eve !== 'PUBLICO_GENERAL') {
      return res.status(403).json({ message: 'Solo puedes inscribirte en eventos públicos' });
    }

    /*if (rol === 'ESTUDIANTE') {
      const eventoPorCarrera = await prisma.eventoPorCarrera.findFirst({
        where: { id_car_per: carreraId, id_eve_per: idEvento }
      });
      if (!eventoPorCarrera && evento.categoria?.nom_cat !== 'PUBLICO_GENERAL') {
        return res.status(403).json({ message: 'Este evento no está disponible para tu carrera' });
      }
    }*/

    const yaInscrito = await prisma.inscripcion.findFirst({
      where: { id_usu_ins: idUsuario, id_eve_ins: idEvento }
    });
    if (yaInscrito) return res.status(400).json({ message: 'Ya estás inscrito en este evento' });

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

    return res.status(200).json({ message: 'Inscripción realizada con éxito' });
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function obtenerInscripcionesEvento(req, res) {
  try {
    const inscripciones = await prisma.inscripcion.findMany({ include: { evento: true, usuario: true } });
    res.status(200).json(inscripciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inscripciones de eventos', error: error.message });
  }
}

async function eliminarInscripcionEvento(req, res) {
  const { id } = req.params;
  try {
    await prisma.inscripcion.delete({ where: { id_ins: id } });
    res.status(200).json({ message: 'Inscripción de evento eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar inscripción', error: error.message });
  }
}

async function actualizarInscripcionEvento(req, res) {
  const { id } = req.params;
  const { metodoPago, enlacePago, estadoPago } = req.body;

  try {
    await prisma.inscripcion.update({
      where: { id_ins: id },
      data: {
        met_pag_ins: metodoPago,
        enl_ord_pag_ins: enlacePago,
        estado_pago: estadoPago
      }
    });
    res.status(200).json({ message: 'Inscripción de evento actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar inscripción', error: error.message });
  }
}

// ======================= CURSOS ============================

async function inscribirUsuarioCurso(req, res) {
  const { idUsuario, idCurso, metodoPago, enlacePago } = req.body;

  if (!idUsuario || !idCurso || !metodoPago) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const metodosPermitidos = ['TARJETA_CREDITO', 'TRANFERENCIA', 'EFECTIVO'];
  if (!metodosPermitidos.includes(metodoPago)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
  }

  try {
    const cuenta = await prisma.cuenta.findFirst({ where: { id_usu_per: idUsuario }, include: { usuario: true } });
    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada para este usuario' });

    if (cuenta.rol_cue !== 'ESTUDIANTE') return res.status(403).json({ message: 'Solo los estudiantes pueden inscribirse en cursos' });

    const curso = await prisma.curso.findUnique({ where: { id_cur: idCurso }, include: { cursosPorCarrera: true } });
    if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });

    if (curso.requiere_verificacion_docs && !cuenta.usuario.documentos_verificados) {
      return res.status(403).json({ message: 'Debes tener los documentos verificados para inscribirte en este curso' });
    }

    const carreraId = cuenta.usuario?.id_car_per;
    const cursoPorCarrera = await prisma.cursoPorCarrera.findFirst({ where: { id_car_per: carreraId, id_cur_per: idCurso } });
    if (!cursoPorCarrera) return res.status(403).json({ message: 'Este curso no está habilitado para tu carrera' });

    const yaInscrito = await prisma.inscripcionCurso.findFirst({ where: { id_usu_ins_cur: idUsuario, id_cur_ins: idCurso } });
    if (yaInscrito) return res.status(400).json({ message: 'Ya estás inscrito en este curso' });

    await prisma.inscripcionCurso.create({
      data: {
        id_usu_ins_cur: idUsuario,
        id_cur_ins: idCurso,
        fec_ins_cur: new Date(),
        val_ins_cur: 0,
        met_pag_ins_cur: metodoPago,
        enl_ord_pag_ins_cur: enlacePago || '',
        estado_pago_cur: 'PENDIENTE'
      }
    });

    return res.status(200).json({ message: 'Estudiante inscrito al curso exitosamente' });
  } catch (error) {
    console.error('Error al inscribir en curso:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function obtenerInscripcionesCurso(req, res) {
  try {
    const inscripciones = await prisma.inscripcionCurso.findMany({ include: { curso: true, usuario: true } });
    res.status(200).json(inscripciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inscripciones de cursos', error: error.message });
  }
}

async function eliminarInscripcionCurso(req, res) {
  const { id } = req.params;
  try {
    await prisma.inscripcionCurso.delete({ where: { id_ins_cur: id } });
    res.status(200).json({ message: 'Inscripción de curso eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar inscripción', error: error.message });
  }
}

async function actualizarInscripcionCurso(req, res) {
  const { id } = req.params;
  const { metodoPago, enlacePago, estadoPago } = req.body;

  try {
    await prisma.inscripcionCurso.update({
      where: { id_ins_cur: id },
      data: {
        met_pag_ins_cur: metodoPago,
        enl_ord_pag_ins_cur: enlacePago,
        estado_pago_cur: estadoPago
      }
    });
    res.status(200).json({ message: 'Inscripción de curso actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar inscripción', error: error.message });
  }
}

// ======================= CARRERAS ============================

async function inscribirEstudianteCarrera(req, res) {
  const { idUsuario, idCarrera } = req.body;

  if (!idUsuario || !idCarrera) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const cuenta = await prisma.cuenta.findFirst({ where: { id_usu_per: idUsuario }, include: { usuario: true } });
    if (!cuenta || cuenta.rol_cue !== 'ESTUDIANTE') {
      return res.status(403).json({ message: 'Solo los estudiantes pueden registrarse en carreras' });
    }

    if (cuenta.usuario.id_car_per) {
      return res.status(400).json({ message: 'El estudiante ya tiene una carrera asignada' });
    }

    const carrera = await prisma.carrera.findUnique({ where: { id_car: idCarrera } });
    if (!carrera) return res.status(404).json({ message: 'Carrera no encontrada' });

    await prisma.usuario.update({
      where: { id_usu: idUsuario },
      data: { id_car_per: idCarrera }
    });

    return res.status(200).json({ message: 'Carrera asignada exitosamente al estudiante' });
  } catch (error) {
    console.error('Error al asignar carrera:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function obtenerInscripcionCarrera(req, res) {
  try {
    const estudiantes = await prisma.usuario.findMany({
      where: { id_car_per: { not: null } },
      include: { carrera: true }
    });
    res.status(200).json(estudiantes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inscripciones de carrera', error: error.message });
  }
}

async function actualizarInscripcionCarrera(req, res) {
  const { id } = req.params;
  const { nuevaCarrera } = req.body;

  try {
    const estudiante = await prisma.usuario.findUnique({ where: { id_usu: id } });
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    await prisma.usuario.update({
      where: { id_usu: id },
      data: { id_car_per: nuevaCarrera }
    });

    return res.status(200).json({ message: 'Carrera actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar inscripción de carrera:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function eliminarInscripcionCarrera(req, res) {
  const { id } = req.params;

  try {
    const estudiante = await prisma.usuario.findUnique({ where: { id_usu: id } });
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    await prisma.usuario.update({
      where: { id_usu: id },
      data: { id_car_per: null }
    });

    return res.status(200).json({ message: 'Inscripción de carrera eliminada' });
  } catch (error) {
    console.error('Error al eliminar inscripción de carrera:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

module.exports = {
  inscribirUsuarioEvento,
  obtenerInscripcionesEvento,
  eliminarInscripcionEvento,
  actualizarInscripcionEvento,
  inscribirUsuarioCurso,
  obtenerInscripcionesCurso,
  eliminarInscripcionCurso,
  actualizarInscripcionCurso,
  inscribirEstudianteCarrera,
  obtenerInscripcionCarrera,
  actualizarInscripcionCarrera,
  eliminarInscripcionCarrera
};
