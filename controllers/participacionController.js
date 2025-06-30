const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// =====================================================
// GESTIÓN DE PARTICIPACIONES - CURSOS
// =====================================================

/**
 * Obtener participaciones de un curso (para gestión de notas/asistencia)
 */
const obtenerParticipacionesCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;

    const curso = await prisma.curso.findUnique({
      where: { id_cur: idCurso },
      include: {
        inscripcionesCurso: {
          include: {
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
        }
      }
    });

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar que el curso no esté cerrado
    if (curso.estado === 'CERRADO') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden modificar las participaciones de un curso cerrado'
      });
    }

    const participaciones = curso.inscripcionesCurso.map(inscripcion => ({
      inscripcionId: inscripcion.id_ins_cur,
      usuario: inscripcion.usuario,
      participacion: inscripcion.participacionesCurso[0] || null,
      estadoPago: inscripcion.estado_pago_cur
    }));

    res.json({
      success: true,
      curso: {
        id: curso.id_cur,
        nombre: curso.nom_cur,
        estado: curso.estado,
        porcentajeAsistenciaAprobacion: curso.porcentaje_asistencia_aprobacion,
        notaMinimaAprobacion: curso.nota_minima_aprobacion
      },
      participaciones
    });
  } catch (error) {
    console.error('Error al obtener participaciones del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

/**
 * Actualizar o crear participación de curso (notas y asistencia)
 */
const actualizarParticipacionCurso = async (req, res) => {
  try {
    const { idCurso, idInscripcion } = req.params;
    const { nota_final, asistencia_porcentaje } = req.body;

    // Validaciones
    if (nota_final === undefined || asistencia_porcentaje === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren nota_final y asistencia_porcentaje'
      });
    }

    if (nota_final < 0 || nota_final > 10) {
      return res.status(400).json({
        success: false,
        message: 'La nota final debe estar entre 0 y 10'
      });
    }

    if (asistencia_porcentaje < 0 || asistencia_porcentaje > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de asistencia debe estar entre 0 y 100'
      });
    }

    // Verificar que el curso existe y no está cerrado
    const curso = await prisma.curso.findUnique({
      where: { id_cur: idCurso }
    });

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    if (curso.estado === 'CERRADO') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden modificar las notas de un curso cerrado'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: idInscripcion },
      include: { participacionesCurso: true }
    });

    if (!inscripcion || inscripcion.id_cur_ins !== idCurso) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada para este curso'
      });
    }

    // Calcular si está aprobado
    const notaMinima = curso.nota_minima_aprobacion || 7.0;
    const asistenciaMinima = curso.porcentaje_asistencia_aprobacion || 70;
    const aprobado = nota_final >= notaMinima && asistencia_porcentaje >= asistenciaMinima;

    let participacion;

    if (inscripcion.participacionesCurso.length > 0) {
      // Actualizar participación existente
      participacion = await prisma.participacionCurso.update({
        where: { id_par_cur: inscripcion.participacionesCurso[0].id_par_cur },
        data: {
          nota_final,
          asistencia_porcentaje,
          aprobado,
          fecha_evaluacion: new Date()
        }
      });
    } else {
      // Crear nueva participación
      participacion = await prisma.participacionCurso.create({
        data: {
          nota_final,
          asistencia_porcentaje,
          aprobado,
          fecha_evaluacion: new Date(),
          id_ins_cur_per: idInscripcion
        }
      });
    }

    res.json({
      success: true,
      message: 'Participación actualizada correctamente',
      participacion
    });
  } catch (error) {
    console.error('Error al actualizar participación del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// =====================================================
// GESTIÓN DE PARTICIPACIONES - EVENTOS
// =====================================================

/**
 * Obtener participaciones de un evento (para gestión de asistencia)
 */
const obtenerParticipacionesEvento = async (req, res) => {
  try {
    const { idEvento } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento },
      include: {
        inscripciones: {
          include: {
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
        }
      }
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar que el evento no esté cerrado
    if (evento.estado === 'CERRADO') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden modificar las participaciones de un evento cerrado'
      });
    }

    const participaciones = evento.inscripciones.map(inscripcion => ({
      inscripcionId: inscripcion.id_ins,
      usuario: inscripcion.usuario,
      participacion: inscripcion.participaciones[0] || null,
      estadoPago: inscripcion.estado_pago
    }));

    res.json({
      success: true,
      evento: {
        id: evento.id_eve,
        nombre: evento.nom_eve,
        estado: evento.estado,
        porcentajeAsistenciaAprobacion: evento.porcentaje_asistencia_aprobacion
      },
      participaciones
    });
  } catch (error) {
    console.error('Error al obtener participaciones del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

/**
 * Actualizar o crear participación de evento (solo asistencia)
 */
const actualizarParticipacionEvento = async (req, res) => {
  try {
    const { idEvento, idInscripcion } = req.params;
    const { asi_par } = req.body;

    // Validaciones
    if (asi_par === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere asi_par (porcentaje de asistencia)'
      });
    }

    if (asi_par < 0 || asi_par > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de asistencia debe estar entre 0 y 100'
      });
    }

    // Verificar que el evento existe y no está cerrado
    const evento = await prisma.evento.findUnique({
      where: { id_eve: idEvento }
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (evento.estado === 'CERRADO') {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar la asistencia de un evento cerrado'
      });
    }

    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: idInscripcion },
      include: { participaciones: true }
    });

    if (!inscripcion || inscripcion.id_eve_ins !== idEvento) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada para este evento'
      });
    }

    // Calcular si está aprobado
    const asistenciaMinima = evento.porcentaje_asistencia_aprobacion || 80;
    const aprobado = asi_par >= asistenciaMinima;

    let participacion;

    if (inscripcion.participaciones.length > 0) {
      // Actualizar participación existente
      participacion = await prisma.participacion.update({
        where: { id_par: inscripcion.participaciones[0].id_par },
        data: {
          asi_par,
          aprobado,
          fec_evaluacion: new Date()
        }
      });
    } else {
      // Crear nueva participación
      participacion = await prisma.participacion.create({
        data: {
          asi_par,
          aprobado,
          fec_evaluacion: new Date(),
          id_ins_per: idInscripcion
        }
      });
    }

    res.json({
      success: true,
      message: 'Participación actualizada correctamente',
      participacion
    });
  } catch (error) {
    console.error('Error al actualizar participación del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

module.exports = {
  obtenerParticipacionesCurso,
  actualizarParticipacionCurso,
  obtenerParticipacionesEvento,
  actualizarParticipacionEvento
};
