
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Asociar un evento a una carrera
const asociarEventoCarrera = async (req, res) => {
  const { eventoId, carreraId } = req.body;

  if (!eventoId || !carreraId) {
    return res.status(400).json({ message: 'ID de evento y carrera son obligatorios' });
  }

  try {
    // Validar que el evento existe

    

const evento = await prisma.evento.findUnique({
  where: { id_eve: eventoId },
  select: {
    tipo_audiencia_eve: true
  }
});

if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

if (evento.tipo_audiencia_eve !== 'CARRERA_ESPECIFICA') {
  return res.status(400).json({
    message: 'Solo se pueden asociar carreras a eventos con tipo de audiencia CARRERA_ESPECIFICA'
  });
}


    // Validar que la carrera existe
    const carrera = await prisma.carrera.findUnique({
      where: { id_car: carreraId }
    });
    if (!carrera) return res.status(404).json({ message: 'Carrera no encontrada' });

    // Verificar si ya está asociada
    const existe = await prisma.eventoPorCarrera.findUnique({
      where: {
        id_eve_per_id_car_per: {
          id_eve_per: eventoId,
          id_car_per: carreraId
        }
      }
    });
    if (existe) return res.status(400).json({ message: 'Ya está asociada esta carrera al evento' });

    // Asociar
    const asociacion = await prisma.eventoPorCarrera.create({
      data: {
        id_eve_per: eventoId,
        id_car_per: carreraId
      }
    });

    return res.status(201).json({ message: 'Asociación creada', data: asociacion });
  } catch (error) {
    console.error('Error al asociar evento a carrera:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener todas las asociaciones evento-carrera
const listarEventosPorCarrera = async (req, res) => {
  try {
    const asociaciones = await prisma.eventoPorCarrera.findMany({
      include: {
        evento: { select: { nom_eve: true } },
        carrera: { select: { nom_car: true } }
      }
    });
    res.status(200).json({ data: asociaciones });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar asociaciones', error: error.message });
  }
};

// Eliminar una asociación evento-carrera
const eliminarEventoCarrera = async (req, res) => {
  const { eventoId, carreraId } = req.body;

  if (!eventoId || !carreraId) {
    return res.status(400).json({ message: 'ID de evento y carrera son obligatorios' });
  }

  try {
    await prisma.eventoPorCarrera.delete({
      where: {
        id_eve_per_id_car_per: {
          id_eve_per: eventoId,
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
  asociarEventoCarrera,
  listarEventosPorCarrera,
  eliminarEventoCarrera
};
