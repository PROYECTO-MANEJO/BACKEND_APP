const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

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

// ✅ NUEVA FUNCIÓN: Subir documentos de verificación
const uploadDocuments = async (req, res) => {
  try {
    const userId = req.uid;
    
    // Obtener información del usuario
    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      include: {
        cuentas: {
          select: {
            rol_cue: true
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

    const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';
    
    // Validar archivos recibidos
    const cedulaFile = req.files?.cedula_pdf;
    const matriculaFile = req.files?.matricula_pdf;

    if (!cedulaFile) {
      return res.status(400).json({
        success: false,
        message: 'El archivo de cédula es obligatorio'
      });
    }

    // Si es estudiante pero no envió matrícula
    if (isEstudiante && !matriculaFile) {
      return res.status(400).json({
        success: false,
        message: 'Para estudiantes es obligatorio el archivo de matrícula'
      });
    }

    // Si NO es estudiante pero envió matrícula
    if (!isEstudiante && matriculaFile) {
      return res.status(400).json({
        success: false,
        message: 'Solo los estudiantes pueden subir archivo de matrícula'
      });
    }

    // Eliminar archivos anteriores si existen
    if (user.enl_ced_pdf) {
      const oldCedulaPath = path.join(__dirname, '..', user.enl_ced_pdf);
      if (fs.existsSync(oldCedulaPath)) {
        fs.unlinkSync(oldCedulaPath);
      }
    }

    if (user.enl_mat_pdf) {
      const oldMatriculaPath = path.join(__dirname, '..', user.enl_mat_pdf);
      if (fs.existsSync(oldMatriculaPath)) {
        fs.unlinkSync(oldMatriculaPath);
      }
    }

    // Preparar datos para actualización
    const updateData = {
      enl_ced_pdf: cedulaFile.path,
      documentos_verificados: false, // Resetear verificación
      fec_verificacion_docs: null
    };

    // Solo agregar matrícula si es estudiante
    if (isEstudiante && matriculaFile) {
      updateData.enl_mat_pdf = matriculaFile.path;
    }

    // Actualizar en base de datos
    const updatedUser = await prisma.usuario.update({
      where: { id_usu: userId },
      data: updateData,
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Documentos subidos exitosamente. Pendientes de verificación.',
      data: {
        enl_ced_pdf: updatedUser.enl_ced_pdf,
        enl_mat_pdf: updatedUser.enl_mat_pdf,
        documentos_verificados: updatedUser.documentos_verificados,
        es_estudiante: isEstudiante
      }
    });

  } catch (error) {
    console.error('Error en uploadDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA FUNCIÓN: Obtener estado de documentos
const getDocumentStatus = async (req, res) => {
  try {
    const userId = req.uid;

    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: {
        enl_ced_pdf: true,
        enl_mat_pdf: true,
        documentos_verificados: true,
        fec_verificacion_docs: true,
        cuentas: {
          select: {
            rol_cue: true
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

    const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';

    res.json({
      success: true,
      data: {
        cedula_subida: !!user.enl_ced_pdf,
        matricula_subida: !!user.enl_mat_pdf,
        matricula_requerida: isEstudiante,
        documentos_verificados: user.documentos_verificados,
        fecha_verificacion: user.fec_verificacion_docs,
        archivos_completos: isEstudiante 
          ? (!!user.enl_ced_pdf && !!user.enl_mat_pdf)
          : !!user.enl_ced_pdf
      }
    });

  } catch (error) {
    console.error('Error en getDocumentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA FUNCIÓN: Descargar documentos (solo admins)
const downloadDocument = async (req, res) => {
  try {
    const { userId, tipo } = req.params; // tipo: 'cedula' o 'matricula'
    
    // Verificar que el usuario solicitante es admin
    const currentUser = await prisma.usuario.findUnique({
      where: { id_usu: req.uid },
      include: {
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      }
    });

    const isAdmin = ['ADMINISTRADOR', 'MASTER'].includes(currentUser.cuentas[0]?.rol_cue);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para descargar documentos'
      });
    }

    // Obtener el usuario objetivo
    const targetUser = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: {
        enl_ced_pdf: true,
        enl_mat_pdf: true,
        ced_usu: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    let filePath;
    let fileName;

    if (tipo === 'cedula' && targetUser.enl_ced_pdf) {
      filePath = path.join(__dirname, '..', targetUser.enl_ced_pdf);
      fileName = `cedula_${targetUser.ced_usu}.pdf`;
    } else if (tipo === 'matricula' && targetUser.enl_mat_pdf) {
      filePath = path.join(__dirname, '..', targetUser.enl_mat_pdf);
      fileName = `matricula_${targetUser.ced_usu}.pdf`;
    } else {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error al descargar el archivo'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error en downloadDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA FUNCIÓN: Verificar documentos (solo admins)
const verifyDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verificado, observaciones } = req.body;

    // Verificar que el usuario solicitante es admin
    const currentUser = await prisma.usuario.findUnique({
      where: { id_usu: req.uid },
      include: {
        cuentas: {
          select: {
            rol_cue: true
          }
        }
      }
    });

    const isAdmin = ['ADMINISTRADOR', 'MASTER'].includes(currentUser.cuentas[0]?.rol_cue);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para verificar documentos'
      });
    }

    // Actualizar estado de verificación
    const updatedUser = await prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        documentos_verificados: verificado,
        fec_verificacion_docs: verificado ? new Date() : null
      },
      include: {
        cuentas: {
          select: {
            cor_cue: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Documentos ${verificado ? 'verificados' : 'rechazados'} exitosamente`,
      data: {
        documentos_verificados: updatedUser.documentos_verificados,
        fec_verificacion_docs: updatedUser.fec_verificacion_docs
      }
    });

  } catch (error) {
    console.error('Error en verifyDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar getUserProfile para incluir estado de documentos
const getUserProfile = async (req, res) => {
  try {
    const userId = req.uid;

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

    const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';

    // Formatear la respuesta incluyendo estado de documentos
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
      } : null,
      // ✅ NUEVOS CAMPOS DE DOCUMENTOS
      documentos: {
        cedula_subida: !!user.enl_ced_pdf,
        matricula_subida: !!user.enl_mat_pdf,
        matricula_requerida: isEstudiante,
        documentos_verificados: user.documentos_verificados,
        fecha_verificacion: user.fec_verificacion_docs,
        archivos_completos: isEstudiante 
          ? (!!user.enl_ced_pdf && !!user.enl_mat_pdf)
          : !!user.enl_ced_pdf
      }
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

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  uploadDocuments,      // ✅ NUEVO
  getDocumentStatus,    // ✅ NUEVO
  downloadDocument,     // ✅ NUEVO
  verifyDocuments       // ✅ NUEVO
};