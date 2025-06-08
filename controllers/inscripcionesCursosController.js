const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inscribir usuario a un curso (validación completa)
async function inscribirUsuarioCurso(req, res) {
  const { idUsuario, idCurso, metodoPago, enlacePago } = req.body;

  if (!idUsuario || !idCurso) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: idUsuario, idCurso' });
  }

  try {
    // Obtener cuenta y usuario asociado
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: idUsuario },
      include: { usuario: true }
    });

    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });

    const rol = cuenta.rol_cue;
    const usuario = cuenta.usuario;
    const carreraId = usuario?.id_car_per;

    // Obtener el curso con información completa
    const curso = await prisma.curso.findUnique({
      where: { id_cur: idCurso },
      select: {
        tipo_audiencia_cur: true,
        requiere_verificacion_docs: true,
        es_gratuito: true,
        precio: true,
        capacidad_max_cur: true,
        _count: {
          select: {
            inscripcionesCurso: true
          }
        }
      }
    });

    if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });

    // Verificar capacidad disponible
    if (curso._count.inscripcionesCurso >= curso.capacidad_max_cur) {
      return res.status(400).json({ message: 'El curso ha alcanzado su capacidad máxima' });
    }

    // Validación por tipo de usuario
    if (rol === 'USUARIO') {
      if (curso.tipo_audiencia_cur !== 'PUBLICO_GENERAL') {
        return res.status(403).json({ message: 'Solo puedes inscribirte en cursos públicos' });
      }
    }

    if (rol === 'ESTUDIANTE') {
      if (!carreraId) {
        return res.status(400).json({ message: 'No tienes una carrera asignada. Contacta al administrador.' });
      }

      if (curso.requiere_verificacion_docs && !usuario.documentos_verificados) {
        return res.status(403).json({ message: 'Debes tener los documentos verificados para inscribirte' });
      }

      const permitido = await prisma.cursoPorCarrera.findFirst({
        where: {
          id_car_per: carreraId,
          id_cur_per: idCurso
        }
      });

      if (
        !permitido &&
        curso.tipo_audiencia_cur !== 'PUBLICO_GENERAL' &&
        curso.tipo_audiencia_cur !== 'TODAS_CARRERAS'
      ) {
        return res.status(403).json({
          message: 'Este curso no está habilitado para tu carrera'
        });
      }
    }

    // Verificar si ya está inscrito
    const yaInscrito = await prisma.inscripcionCurso.findUnique({
      where: {
        id_usu_ins_cur_id_cur_ins: {
          id_usu_ins_cur: idUsuario,
          id_cur_ins: idCurso
        }
      }
    });

    if (yaInscrito) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }

    // 🎯 VALIDAR CAMPOS DE PAGO SEGÚN TIPO DE CURSO
    let datosInscripcion = {
      id_usu_ins_cur: idUsuario,
      id_cur_ins: idCurso,
      fec_ins_cur: new Date()
    };

    if (curso.es_gratuito) {
      // CURSO GRATUITO: No requiere datos de pago
      if (metodoPago || enlacePago) {
        return res.status(400).json({ 
          message: 'Este curso es gratuito, no debe incluir información de pago' 
        });
      }
      
      datosInscripcion.val_ins_cur = null;
      datosInscripcion.met_pag_ins_cur = null;
      datosInscripcion.enl_ord_pag_ins_cur = null;
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

      if (!enlacePago) {
        return res.status(400).json({ 
          message: 'Para cursos pagados, el comprobante de pago es obligatorio' 
        });
      }
      
      datosInscripcion.val_ins_cur = curso.precio;
      datosInscripcion.met_pag_ins_cur = metodoPago;
      datosInscripcion.enl_ord_pag_ins_cur = enlacePago;
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
        precio: curso.precio
      }
    });
  } catch (error) {
    console.error('❌ Error al inscribirse en curso:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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

module.exports = {
  inscribirUsuarioCurso,
  obtenerMisInscripcionesCurso,
  aprobarInscripcionCurso
};
