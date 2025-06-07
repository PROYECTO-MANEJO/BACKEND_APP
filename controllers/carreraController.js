const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para crear una nueva carrera
async function crearCarrera(req, res) {
  const { nombre, descripcion, facultad } = req.body;  // Asegúrate de recibir 'facultad'

  if (!nombre || !descripcion || !facultad) {
    return res.status(400).json({ message: 'Nombre, descripción y facultad son obligatorios' });
  }

  try {
    const nuevaCarrera = await prisma.carrera.create({
      data: {
        nom_car: nombre,
        des_car: descripcion,
        nom_fac_per: facultad,  // Asignamos el valor de 'facultad' al campo 'nom_fac_per'
      },
    });
    return res.status(201).json({ message: 'Carrera creada con éxito', nuevaCarrera });
  } catch (error) {
    console.error('Error al crear la carrera:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

module.exports = { crearCarrera };
