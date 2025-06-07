const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para asociar un evento a una carrera
async function asociarEventoCarrera(req, res) {
  const { eventoId, carreraId } = req.body;

  if (!eventoId || !carreraId) {
    return res.status(400).json({ message: 'ID de evento y carrera son obligatorios' });
  }

  try {
    // Verificar si el evento existe en la tabla Evento
    const evento = await prisma.evento.findUnique({
      where: { id_eve: eventoId },
    });

    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar si la carrera existe en la tabla Carrera
    const carrera = await prisma.carrera.findUnique({
      where: { id_car: carreraId },
    });

    if (!carrera) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    // Si ambos existen, proceder con la asociación
    const eventoCarrera = await prisma.eventoPorCarrera.create({
      data: {
        id_eve_per: eventoId,
        id_car_per: carreraId,
      },
    });

    return res.status(201).json({ message: 'Evento asociado a la carrera con éxito', eventoCarrera });
  } catch (error) {
    console.error('Error al asociar evento a carrera:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

module.exports = { asociarEventoCarrera };
