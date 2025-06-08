const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Asociar un curso a una carrera
const asociarCursoCarrera = async (req, res) => {
  const { cursoId, carreraId } = req.body;

  if (!cursoId || !carreraId) {
    return res.status(400).json({ message: 'ID de curso y carrera son obligatorios' });
  }

  try {
        const curso = await prisma.curso.findUnique({
        where: { id_cur: cursoId },
        select: {
            tipo_audiencia_cur: true
        }
        });

        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });

        if (curso.tipo_audiencia_cur !== 'CARRERA_ESPECIFICA') {
        return res.status(400).json({
            message: 'Solo se pueden asociar cursos con audiencia de tipo CARRERA_ESPECIFICA'
        });
        }

    const carrera = await prisma.carrera.findUnique({ where: { id_car: carreraId } });

    if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
    if (!carrera) return res.status(404).json({ message: 'Carrera no encontrada' });

    const yaExiste = await prisma.cursoPorCarrera.findUnique({
      where: {
        id_cur_per_id_car_per: {
          id_cur_per: cursoId,
          id_car_per: carreraId
        }
      }
    });

    if (yaExiste) return res.status(400).json({ message: 'Ya está asociada esta carrera al curso' });

    const nuevaAsociacion = await prisma.cursoPorCarrera.create({
      data: {
        id_cur_per: cursoId,
        id_car_per: carreraId
      }
    });

    res.status(201).json({
      message: 'Curso asociado exitosamente a la carrera',
      data: nuevaAsociacion
    });
  } catch (error) {
    console.error('❌ Error al asociar curso a carrera:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Listar asociaciones curso-carrera
const listarCursosPorCarrera = async (req, res) => {
  try {
    const relaciones = await prisma.cursoPorCarrera.findMany({
      include: {
        curso: { select: { nom_cur: true } },
        carrera: { select: { nom_car: true } }
      }
    });

    res.status(200).json({ data: relaciones });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asociaciones', error: error.message });
  }
};

// Eliminar una asociación
const eliminarCursoCarrera = async (req, res) => {
  const { cursoId, carreraId } = req.body;

  if (!cursoId || !carreraId) {
    return res.status(400).json({ message: 'ID de curso y carrera son obligatorios' });
  }

  try {
    await prisma.cursoPorCarrera.delete({
      where: {
        id_cur_per_id_car_per: {
          id_cur_per: cursoId,
          id_car_per: carreraId
        }
      }
    });

    res.status(200).json({ message: 'Asociación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar asociación', error: error.message });
  }
};

module.exports = {
  asociarCursoCarrera,
  listarCursosPorCarrera,
  eliminarCursoCarrera
};
