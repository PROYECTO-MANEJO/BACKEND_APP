const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener perfil del usuario actual
const getUserProfile = async (req, res) => {
  try {

    const userId = req.uid; // Viene del middleware validateJWT

    // Buscar el usuario con su cuenta y carrera
    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        },
        carrera: {
          select: {
            id_car: true,
            nom_car: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Formatear la respuesta
    const userProfile = {
      id_usu: user.id_usu,
      ced_usu: user.ced_usu,
      nom_usu1: user.nom_usu1,
      nom_usu2: user.nom_usu2,
      ape_usu1: user.ape_usu1,
      ape_usu2: user.ape_usu2,
      fec_nac_usu: user.fec_nac_usu,
      num_tel_usu: user.num_tel_usu,
      id_car_per: user.id_car_per,
      email: user.cuentas[0]?.cor_cue,
      rol: user.cuentas[0]?.rol_cue,
      carrera: user.carrera ? {
        id_car: user.carrera.id_car,
        nom_car: user.carrera.nom_car
      } : null
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil del usuario actual
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.uid;
    const {
      nom_usu1,
      nom_usu2,
      ape_usu1,
      ape_usu2,
      fec_nac_usu,
      num_tel_usu,
      id_car_per
    } = req.body;

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      include: {
        cuentas: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si es estudiante y se está asignando carrera
    const isEstudiante = existingUser.cuentas[0]?.rol_cue === 'ESTUDIANTE';
    
    // Si no es estudiante, no permitir asignar carrera
    let carreraToUpdate = id_car_per;
    if (!isEstudiante && id_car_per) {
      carreraToUpdate = null;
    }

    // Si es estudiante y se proporciona carrera, verificar que existe
    if (isEstudiante && carreraToUpdate) {
      const carreraExists = await prisma.carrera.findUnique({
        where: { id_car: carreraToUpdate }
      });

      if (!carreraExists) {
        return res.status(400).json({
          success: false,
          message: 'La carrera seleccionada no existe'
        });
      }
    }

    // Actualizar el usuario
    const updatedUser = await prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        nom_usu1,
        nom_usu2: nom_usu2 || '',
        ape_usu1,
        ape_usu2: ape_usu2 || '',
        fec_nac_usu: new Date(fec_nac_usu),
        num_tel_usu: num_tel_usu || null,
        id_car_per: carreraToUpdate || null
      },
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        },
        carrera: {
          select: {
            id_car: true,
            nom_car: true
          }
        }
      }
    });

    // Formatear la respuesta
    const userProfile = {
      id_usu: updatedUser.id_usu,
      ced_usu: updatedUser.ced_usu,
      nom_usu1: updatedUser.nom_usu1,
      nom_usu2: updatedUser.nom_usu2,
      ape_usu1: updatedUser.ape_usu1,
      ape_usu2: updatedUser.ape_usu2,
      fec_nac_usu: updatedUser.fec_nac_usu,
      num_tel_usu: updatedUser.num_tel_usu,
      id_car_per: updatedUser.id_car_per,
      email: updatedUser.cuentas[0]?.cor_cue,
      rol: updatedUser.cuentas[0]?.rol_cue,
      carrera: updatedUser.carrera ? {
        id_car: updatedUser.carrera.id_car,
        nom_car: updatedUser.carrera.nom_car
      } : null
    };

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: userProfile
    });

  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios (solo para administradores)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        },
        carrera: {
          select: {
            id_car: true,
            nom_car: true
          }
        }
      }
    });

    const formattedUsers = users.map(user => ({
      id_usu: user.id_usu,
      ced_usu: user.ced_usu,
      nom_usu1: user.nom_usu1,
      nom_usu2: user.nom_usu2,
      ape_usu1: user.ape_usu1,
      ape_usu2: user.ape_usu2,
      fec_nac_usu: user.fec_nac_usu,
      num_tel_usu: user.num_tel_usu,
      email: user.cuentas[0]?.cor_cue,
      rol: user.cuentas[0]?.rol_cue,
      carrera: user.carrera ? {
        id_car: user.carrera.id_car,
        nom_car: user.carrera.nom_car
      } : null
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers
};