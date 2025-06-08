const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
    
    console.log('📁 Archivos recibidos:', {
      cedula: req.files?.cedula_pdf?.[0]?.originalname,
      matricula: req.files?.matricula_pdf?.[0]?.originalname
    });
    
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

    if (user.documentos_verificados) {
      return res.status(400).json({
        success: false,
        message: 'No puedes subir nuevos documentos. Los actuales ya han sido verificados.'
      });
    }

    const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';
    
    // Validar archivos recibidos
    const cedulaFile = req.files?.cedula_pdf?.[0];
    const matriculaFile = req.files?.matricula_pdf?.[0];

    // ✅ NUEVA VALIDACIÓN: Al menos un archivo debe estar presente
    if (!cedulaFile && !matriculaFile) {
      return res.status(400).json({
        success: false,
        message: 'Debes subir al menos un archivo'
      });
    }

    // ✅ VALIDACIÓN MEJORADA: Solo validar si es necesario completar documentos faltantes
    const necesitaCedula = !user.cedula_filename;
    const necesitaMatricula = isEstudiante && !user.matricula_filename;

    if (necesitaCedula && !cedulaFile) {
      return res.status(400).json({
        success: false,
        message: 'El archivo de cédula es obligatorio'
      });
    }

    if (necesitaMatricula && !matriculaFile) {
      return res.status(400).json({
        success: false,
        message: 'Para estudiantes es obligatorio el archivo de matrícula'
      });
    }

    if (!isEstudiante && matriculaFile) {
      return res.status(400).json({
        success: false,
        message: 'Solo los estudiantes pueden subir archivo de matrícula'
      });
    }

    // ✅ PREPARAR DATOS DINÁMICAMENTE
    const updateData = {};

    // Solo actualizar cédula si se envió
    if (cedulaFile) {
      updateData.enl_ced_pdf = cedulaFile.buffer;
      updateData.cedula_filename = cedulaFile.originalname;
      updateData.cedula_size = cedulaFile.size;
    }

    // Solo actualizar matrícula si se envió y es estudiante
    if (matriculaFile && isEstudiante) {
      updateData.enl_mat_pdf = matriculaFile.buffer;
      updateData.matricula_filename = matriculaFile.originalname;
      updateData.matricula_size = matriculaFile.size;
    }

    // Actualizar fecha solo si es la primera vez o si se están actualizando todos
    if (!user.fec_verificacion_docs || (cedulaFile && (!isEstudiante || matriculaFile))) {
      updateData.fec_verificacion_docs = new Date();
    }

    // Asegurar que documentos_verificados esté en false al subir nuevos
    updateData.documentos_verificados = false;

    const updatedUser = await prisma.usuario.update({
      where: { id_usu: userId },
      data: updateData,
      select: {
        id_usu: true,
        cedula_filename: true,
        matricula_filename: true,
        cedula_size: true,
        matricula_size: true,
        documentos_verificados: true,
        fec_verificacion_docs: true
      }
    });

    console.log('✅ Archivos guardados en BD exitosamente');

    res.json({
      success: true,
      message: 'Documentos almacenados exitosamente en la base de datos',
      data: {
        cedula_guardada: !!updatedUser.cedula_filename,
        matricula_guardada: !!updatedUser.matricula_filename,
        cedula_actualizada: !!cedulaFile,
        matricula_actualizada: !!matriculaFile,
        fecha_subida: updatedUser.fec_verificacion_docs,
        archivos_info: {
          cedula: updatedUser.cedula_filename ? {
            nombre: updatedUser.cedula_filename,
            tamaño: `${(updatedUser.cedula_size / 1024).toFixed(2)} KB`
          } : null,
          matricula: updatedUser.matricula_filename ? {
            nombre: updatedUser.matricula_filename,
            tamaño: `${(updatedUser.matricula_size / 1024).toFixed(2)} KB`
          } : null
        },
        documentos_verificados: updatedUser.documentos_verificados
      }
    });

  } catch (error) {
    console.error('❌ Error en uploadDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        enl_ced_pdf: true,        // Archivo como Buffer
        enl_mat_pdf: true,        // Archivo como Buffer
        cedula_filename: true,
        matricula_filename: true,
        ced_usu: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    let fileBuffer;
    let fileName;
    let originalName;

    // ✅ OBTENER ARCHIVO DESDE BD
    if (tipo === 'cedula' && targetUser.enl_ced_pdf) {
      fileBuffer = targetUser.enl_ced_pdf;
      originalName = targetUser.cedula_filename || 'cedula.pdf';
      fileName = `cedula_${targetUser.ced_usu}_${originalName}`;
    } else if (tipo === 'matricula' && targetUser.enl_mat_pdf) {
      fileBuffer = targetUser.enl_mat_pdf;
      originalName = targetUser.matricula_filename || 'matricula.pdf';
      fileName = `matricula_${targetUser.ced_usu}_${originalName}`;
    } else {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado en la base de datos'
      });
    }

    console.log('📥 Descargando desde BD:', fileName, 'Tamaño:', fileBuffer.length);

    // ✅ ENVIAR ARCHIVO DESDE BUFFER
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
    
    console.log('✅ Archivo descargado exitosamente desde BD');

  } catch (error) {
    console.error('❌ Error en downloadDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVA FUNCIÓN: Eliminar documentos
const deleteDocuments = async (req, res) => {
  try {
    const userId = req.uid;
    const { tipo } = req.params; // 'cedula', 'matricula' o 'ambos'

    console.log('🗑️ Eliminando documentos:', { userId, tipo });

    // Verificar usuario
    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: {
        id_usu: true,
        cedula_filename: true,
        matricula_filename: true,
        fec_verificacion_docs: true,
        documentos_verificados: true,
        cuentas: {
          select: { rol_cue: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // ✅ ÚNICA VERIFICACIÓN: Si ya están verificados, no se pueden eliminar
    if (user.documentos_verificados) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar documentos que ya han sido verificados por el administrador'
      });
    }

    const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';

    // Preparar datos de actualización
    let updateData = {};

    if (tipo === 'cedula' || tipo === 'ambos') {
      if (!user.cedula_filename) {
        return res.status(400).json({
          success: false,
          message: 'No hay documento de cédula para eliminar'
        });
      }
      updateData.enl_ced_pdf = null;
      updateData.cedula_filename = null;
      updateData.cedula_size = null;
    }

    if ((tipo === 'matricula' || tipo === 'ambos') && isEstudiante) {
      if (!user.matricula_filename) {
        return res.status(400).json({
          success: false,
          message: 'No hay documento de matrícula para eliminar'
        });
      }
      updateData.enl_mat_pdf = null;
      updateData.matricula_filename = null;
      updateData.matricula_size = null;
    }

    // Si eliminamos todos los documentos, resetear fecha
    if (tipo === 'ambos' || 
        (tipo === 'cedula' && !isEstudiante) || 
        (tipo === 'cedula' && !user.matricula_filename) ||
        (tipo === 'matricula' && !user.cedula_filename)) {
      updateData.fec_verificacion_docs = null;
    }

    // Actualizar en BD
    await prisma.usuario.update({
      where: { id_usu: userId },
      data: updateData
    });

    console.log('✅ Documentos eliminados exitosamente');

    res.json({
      success: true,
      message: 'Documentos eliminados exitosamente',
      data: {
        cedula_eliminada: tipo === 'cedula' || tipo === 'ambos',
        matricula_eliminada: (tipo === 'matricula' || tipo === 'ambos') && isEstudiante,
        puede_volver_a_subir: true
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ ACTUALIZAR la función getDocumentStatus (simplificada)
const getDocumentStatus = async (req, res) => {
  try {
    const userId = req.uid;

    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: {
        cedula_filename: true,
        matricula_filename: true,
        cedula_size: true,
        matricula_size: true,
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

    // ✅ SIMPLIFICADO: Solo verificar si NO están verificados para poder eliminar
    const puede_eliminar = !user.documentos_verificados && 
                          (!!user.cedula_filename || !!user.matricula_filename);

    console.log('📊 Estado calculado:', {
      userId,
      documentos_verificados: user.documentos_verificados,
      puede_eliminar,
      cedula_subida: !!user.cedula_filename,
      matricula_subida: !!user.matricula_filename
    });

    res.json({
      success: true,
      data: {
        cedula_subida: !!user.cedula_filename,
        matricula_subida: !!user.matricula_filename,
        matricula_requerida: isEstudiante,
        documentos_verificados: user.documentos_verificados,
        fecha_verificacion: user.fec_verificacion_docs,
        fecha_subida: user.fec_verificacion_docs,
        archivos_completos: isEstudiante 
          ? (!!user.cedula_filename && !!user.matricula_filename)
          : !!user.cedula_filename,
        
        // ✅ CAMPO SIMPLIFICADO
        puede_eliminar: puede_eliminar,
        puede_subir_nuevos: !user.cedula_filename || (isEstudiante && !user.matricula_filename),
        
        archivos_info: {
          cedula: user.cedula_filename ? {
            nombre: user.cedula_filename,
            tamaño: user.cedula_size ? `${(user.cedula_size / 1024).toFixed(2)} KB` : 'N/A'
          } : null,
          matricula: user.matricula_filename ? {
            nombre: user.matricula_filename,
            tamaño: user.matricula_size ? `${(user.matricula_size / 1024).toFixed(2)} KB` : 'N/A'
          } : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en getDocumentStatus:', error);
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

// Obtener solo usuarios administradores
const getAdminUsers = async (req, res) => {
  try {
    const adminUsers = await prisma.usuario.findMany({
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          },
          where: {
            rol_cue: 'ADMINISTRADOR'
          }
        },
        carrera: {
          select: {
            id_car: true,
            nom_car: true
          }
        }
      },
      where: {
        cuentas: {
          some: {
            rol_cue: 'ADMINISTRADOR'
          }
        }
      }
    });

    const formattedUsers = adminUsers.map(user => ({
      id_usu: user.id_usu,
      ced_usu: user.ced_usu,
      nom_usu1: user.nom_usu1,
      nom_usu2: user.nom_usu2,
      ape_usu1: user.ape_usu1,
      ape_usu2: user.ape_usu2,
      fec_nac_usu: user.fec_nac_usu,
      num_tel_usu: user.num_tel_usu,
      cor_cue: user.cuentas[0]?.cor_cue, // Email con el nombre correcto
      rol_cue: user.cuentas[0]?.rol_cue,
      id_car_per: user.carrera?.id_car,
      carrera: user.carrera ? {
        id_car: user.carrera.id_car,
        nom_car: user.carrera.nom_car
      } : null
    }));

    res.json({
      success: true,
      message: 'Administradores obtenidos exitosamente',
      usuarios: formattedUsers
    });

  } catch (error) {
    console.error('Error en getAdminUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo usuario (solo administradores)
const createUser = async (req, res) => {
  try {
    const {
      ced_usu,
      nom_usu1,
      nom_usu2,
      ape_usu1,
      ape_usu2,
      ema_usu,
      tel_usu,
      rol_cue,
      pas_usu
    } = req.body;

    // Verificar que no exista un usuario con esa cédula
    const existingUser = await prisma.usuario.findUnique({
      where: { ced_usu }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con esa cédula'
      });
    }

    // Verificar que no exista una cuenta con ese email
    const existingAccount = await prisma.cuenta.findUnique({
      where: { cor_cue: ema_usu }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con ese email'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(pas_usu, 10);

        // Crear usuario y cuenta en una transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Crear usuario
      const newUser = await prisma.usuario.create({
        data: {
          ced_usu,
          nom_usu1,
          nom_usu2: nom_usu2 || '',
          ape_usu1,
          ape_usu2: ape_usu2 || '',
          num_tel_usu: tel_usu || null,
          pas_usu: hashedPassword, // Contraseña va en Usuario
          fec_nac_usu: new Date(), // Fecha por defecto
        }
      });

      // Crear cuenta
      const newAccount = await prisma.cuenta.create({
        data: {
          cor_cue: ema_usu,
          rol_cue,
          id_usu_per: newUser.id_usu
        }
      });

      return { user: newUser, account: newAccount };
    });

         res.status(201).json({
       success: true,
       message: 'Usuario creado exitosamente',
       data: {
         id_usu: result.user.id_usu,
         ced_usu: result.user.ced_usu,
         nom_usu1: result.user.nom_usu1,
         nom_usu2: result.user.nom_usu2,
         ape_usu1: result.user.ape_usu1,
         ape_usu2: result.user.ape_usu2,
         ema_usu: result.account.cor_cue,
         tel_usu: result.user.num_tel_usu,
         rol_cue: result.account.rol_cue
       }
     });

  } catch (error) {
    console.error('Error en createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar usuario administrador (solo administradores)
const updateUser = async (req, res) => {
  try {
    const { cedula } = req.params;
    const { 
      nom_usu1, 
      nom_usu2, 
      ape_usu1, 
      ape_usu2, 
      fec_nac_usu, 
      num_tel_usu, 
      pas_usu, 
      cor_cue 
    } = req.body;

    // Buscar usuario existente
    const existingUser = await prisma.usuario.findFirst({
      where: {
        ced_usu: cedula
      },
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

    // Si se proporciona un nuevo email, verificar que no exista en otra cuenta
    if (cor_cue && cor_cue !== existingUser.cuentas[0]?.cor_cue) {
      const existingAccountByEmail = await prisma.cuenta.findFirst({
        where: {
          cor_cue: cor_cue
        }
      });

      if (existingAccountByEmail) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una cuenta con ese correo electrónico'
        });
      }
    }

    // Validar formato de fecha si se proporciona
    let fechaNacimiento = existingUser.fec_nac_usu;
    if (fec_nac_usu) {
      try {
        fechaNacimiento = new Date(fec_nac_usu);
        if (isNaN(fechaNacimiento.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'El formato de fecha de nacimiento es inválido. Use YYYY-MM-DD'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'El formato de fecha de nacimiento es inválido. Use YYYY-MM-DD'
        });
      }
    }

    // Encriptar contraseña si se proporciona
    let hashedPassword = existingUser.pas_usu;
    if (pas_usu && pas_usu.trim() !== '') {
      hashedPassword = await bcrypt.hash(pas_usu, 10);
    }

    // Actualizar en transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Actualizar el usuario
      const updatedUser = await prisma.usuario.update({
        where: {
          ced_usu: cedula
        },
        data: {
          nom_usu1: nom_usu1 || existingUser.nom_usu1,
          nom_usu2: nom_usu2 !== undefined ? nom_usu2 : existingUser.nom_usu2,
          ape_usu1: ape_usu1 || existingUser.ape_usu1,
          ape_usu2: ape_usu2 !== undefined ? ape_usu2 : existingUser.ape_usu2,
          fec_nac_usu: fechaNacimiento,
          num_tel_usu: num_tel_usu !== undefined ? num_tel_usu : existingUser.num_tel_usu,
          pas_usu: hashedPassword
        }
      });

      // Actualizar cuenta si se proporciona nuevo email
      let updatedAccount = existingUser.cuentas[0];
      if (cor_cue && cor_cue !== existingUser.cuentas[0]?.cor_cue) {
        updatedAccount = await prisma.cuenta.update({
          where: {
            id_cue: existingUser.cuentas[0].id_cue
          },
          data: {
            cor_cue: cor_cue
          }
        });
      }

      return { user: updatedUser, account: updatedAccount };
    });

    res.json({
      success: true,
      message: 'Usuario administrador actualizado exitosamente',
      data: {
        usuario: {
          id: result.user.id_usu,
          cedula: result.user.ced_usu,
          nom_usu1: result.user.nom_usu1,
          nom_usu2: result.user.nom_usu2,
          ape_usu1: result.user.ape_usu1,
          ape_usu2: result.user.ape_usu2,
          fec_nac_usu: result.user.fec_nac_usu,
          num_tel_usu: result.user.num_tel_usu,
          cor_cue: result.account.cor_cue,
          rol_cue: result.account.rol_cue
        }
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario administrador:', error);
    
    // Manejo de errores específicos
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        success: false, 
        message: 'Error de duplicación. Verifique que los datos no estén ya registrados.' 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario administrador',
      error: error.message
    });
  }
};

// Eliminar usuario (solo administradores)
const deleteUser = async (req, res) => {
  try {
    const { cedula } = req.params;

    // Buscar usuario
    const existingUser = await prisma.usuario.findUnique({
      where: { ced_usu: cedula },
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

    // Eliminar en transacción (primero cuenta, luego usuario)
    await prisma.$transaction(async (prisma) => {
      // Eliminar cuenta
      await prisma.cuenta.delete({
        where: { id_cue: existingUser.cuentas[0].id_cue }
      });

      // Eliminar usuario
      await prisma.usuario.delete({
        where: { ced_usu: cedula }
      });
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ✅ NUEVAS FUNCIONES PARA VERIFICACIÓN DE DOCUMENTOS
// Obtener usuarios con documentos pendientes de verificación
const getUsersWithPendingDocuments = async (req, res) => {
  try {
    // Buscar todos los usuarios con documentos no verificados
    const allUsersWithDocuments = await prisma.usuario.findMany({
      where: {
        AND: [
          {
            OR: [
              { enl_ced_pdf: { not: null } },
              { enl_mat_pdf: { not: null } }
            ]
          },
          {
            documentos_verificados: false
          }
        ]
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

    // Filtrar en JavaScript para mayor control
    const usersWithDocuments = allUsersWithDocuments.filter(user => {
      const rol = user.cuentas[0]?.rol_cue;
      
      if (rol === 'ESTUDIANTE') {
        // Estudiantes deben tener ambos documentos
        return !!user.enl_ced_pdf && !!user.enl_mat_pdf;
      } else if (rol === 'USUARIO') {
        // Usuarios normales solo necesitan cédula
        return !!user.enl_ced_pdf;
      }
      
      return false;
    });

    // Separar estudiantes y usuarios normales
    const estudiantes = [];
    const usuarios = [];

    usersWithDocuments.forEach(user => {
      const isEstudiante = user.cuentas[0]?.rol_cue === 'ESTUDIANTE';
      
      const userData = {
        id_usu: user.id_usu,
        ced_usu: user.ced_usu,
        nombre_completo: `${user.nom_usu1} ${user.nom_usu2} ${user.ape_usu1} ${user.ape_usu2}`.trim().replace(/\s+/g, ' '),
        email: user.cuentas[0]?.cor_cue,
        rol: user.cuentas[0]?.rol_cue,
        carrera: user.carrera ? user.carrera.nom_car : null,
        documentos: {
          cedula_subida: !!user.enl_ced_pdf,
          matricula_subida: !!user.enl_mat_pdf,
          cedula_filename: user.cedula_filename,
          matricula_filename: user.matricula_filename,
          cedula_size: user.cedula_size,
          matricula_size: user.matricula_size
        }
      };

      if (isEstudiante) {
        estudiantes.push(userData);
      } else {
        usuarios.push(userData);
      }
    });

    res.json({
      success: true,
      data: {
        estudiantes,
        usuarios,
        total: usersWithDocuments.length
      }
    });

  } catch (error) {
    console.error('Error en getUsersWithPendingDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Descargar documento específico de un usuario
const downloadUserDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.params;

    if (!['cedula', 'matricula'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: {
        enl_ced_pdf: true,
        enl_mat_pdf: true,
        cedula_filename: true,
        matricula_filename: true,
        ced_usu: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    let documentData;
    let filename;

    if (documentType === 'cedula') {
      documentData = user.enl_ced_pdf;
      filename = user.cedula_filename || `cedula_${user.ced_usu}.pdf`;
    } else {
      documentData = user.enl_mat_pdf;
      filename = user.matricula_filename || `matricula_${user.ced_usu}.pdf`;
    }

    if (!documentData) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(documentData);

  } catch (error) {
    console.error('Error en downloadUserDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Aprobar documentos de un usuario
const approveUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar el estado de verificación
    await prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        documentos_verificados: true,
        fec_verificacion_docs: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Documentos aprobados exitosamente'
    });

  } catch (error) {
    console.error('Error en approveUserDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Rechazar documentos de un usuario
const rejectUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.usuario.findUnique({
      where: { id_usu: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar los documentos y marcar como no verificados
    await prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        enl_ced_pdf: null,
        enl_mat_pdf: null,
        cedula_filename: null,
        matricula_filename: null,
        cedula_size: null,
        matricula_size: null,
        documentos_verificados: false,
        fec_verificacion_docs: null
      }
    });

    res.json({
      success: true,
      message: 'Documentos rechazados y eliminados. El usuario deberá subir nuevos documentos.'
    });

  } catch (error) {
    console.error('Error en rejectUserDocuments:', error);
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
  getAdminUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadDocuments,
  getDocumentStatus,
  deleteDocuments,
  downloadDocument,
  // ✅ NUEVAS EXPORTACIONES
  getUsersWithPendingDocuments,
  downloadUserDocument,
  approveUserDocuments,
  rejectUserDocuments
};