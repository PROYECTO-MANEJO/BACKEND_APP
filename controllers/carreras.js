const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las carreras
const getAllCarreras = async (req, res) => {
  try {
    const carreras = await prisma.carrera.findMany({
      orderBy: {
        nom_car: 'asc'
      }
    });

    res.json({
      success: true,
      data: carreras
    });

  } catch (error) {
    console.error('Error en getAllCarreras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener una carrera por ID
const getCarreraById = async (req, res) => {
  try {
    const { id } = req.params;

    const carrera = await prisma.carrera.findUnique({
      where: { id_car: id }
    });

    if (!carrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    res.json({
      success: true,
      data: carrera
    });

  } catch (error) {
    console.error('Error en getCarreraById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear una nueva carrera
const createCarrera = async (req, res) => {
  try {
    const { nom_car, des_car, nom_fac_per } = req.body;

    // Verificar si ya existe una carrera con el mismo nombre
    const existingCarrera = await prisma.carrera.findFirst({
      where: {
        nom_car: {
          equals: nom_car,
          mode: 'insensitive' // Búsqueda case-insensitive
        }
      }
    });

    if (existingCarrera) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una carrera con ese nombre'
      });
    }

    // Crear la nueva carrera
    const newCarrera = await prisma.carrera.create({
      data: {
        nom_car: nom_car.trim(),
        des_car: des_car ? des_car.trim() : '',
        nom_fac_per: nom_fac_per ? nom_fac_per.trim() : ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Carrera creada exitosamente',
      data: newCarrera
    });

  } catch (error) {
    console.error('Error en createCarrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar una carrera
const updateCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_car, des_car, nom_fac_per } = req.body;

    // Verificar si la carrera existe
    const existingCarrera = await prisma.carrera.findUnique({
      where: { id_car: id }
    });

    if (!existingCarrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    // Verificar si ya existe otra carrera con el mismo nombre
    const duplicateCarrera = await prisma.carrera.findFirst({
      where: {
        nom_car: {
          equals: nom_car,
          mode: 'insensitive'
        },
        id_car: {
          not: id // Excluir la carrera actual
        }
      }
    });

    if (duplicateCarrera) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otra carrera con ese nombre'
      });
    }

    // Actualizar la carrera
    const updatedCarrera = await prisma.carrera.update({
      where: { id_car: id },
      data: {
        nom_car: nom_car.trim(),
        des_car: des_car ? des_car.trim() : existingCarrera.des_car,
        nom_fac_per: nom_fac_per ? nom_fac_per.trim() : existingCarrera.nom_fac_per
      }
    });

    res.json({
      success: true,
      message: 'Carrera actualizada exitosamente',
      data: updatedCarrera
    });

  } catch (error) {
    console.error('Error en updateCarrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar una carrera
const deleteCarrera = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la carrera existe
    const existingCarrera = await prisma.carrera.findUnique({
      where: { id_car: id }
    });

    if (!existingCarrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    // Verificar si hay usuarios asociados a esta carrera
    const usersWithCarrera = await prisma.usuario.findMany({
      where: { id_car_per: id }
    });

    if (usersWithCarrera.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la carrera porque hay usuarios asociados a ella'
      });
    }

    // Verificar si hay eventos por carrera asociados
    const eventosWithCarrera = await prisma.eventoPorCarrera.findMany({
      where: { id_car_per: id }
    });

    if (eventosWithCarrera.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la carrera porque hay eventos asociados a ella'
      });
    }

    // Eliminar la carrera
    await prisma.carrera.delete({
      where: { id_car: id }
    });

    res.json({
      success: true,
      message: 'Carrera eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteCarrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllCarreras,
  getCarreraById,
  createCarrera,
  updateCarrera,
  deleteCarrera
};