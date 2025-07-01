const paginaPrincipalService = require('../services/paginaPrincipalService');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuración de multer para imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

class PaginaPrincipalController {
  // Obtener contenido de la página principal
  async obtenerContenido(req, res) {
    try {
      const contenido = await paginaPrincipalService.obtenerContenido();
      
      // Convertir imágenes a URLs del servidor para enviar al frontend
      const contenidoConImagenes = {
        ...contenido,
        imagen_hero: contenido.imagen_hero ? `/api/pagina-principal/imagen/imagen_hero?t=${Date.now()}` : null,
        imagen_seccion1: contenido.imagen_seccion1 ? `/api/pagina-principal/imagen/imagen_seccion1?t=${Date.now()}` : null,
        imagen_seccion2: contenido.imagen_seccion2 ? `/api/pagina-principal/imagen/imagen_seccion2?t=${Date.now()}` : null,
        imagen_seccion3: contenido.imagen_seccion3 ? `/api/pagina-principal/imagen/imagen_seccion3?t=${Date.now()}` : null,
        imagen_seccion4: contenido.imagen_seccion4 ? `/api/pagina-principal/imagen/imagen_seccion4?t=${Date.now()}` : null,
      };
      
      res.json({
        success: true,
        data: contenidoConImagenes
      });
    } catch (error) {
      console.error('Error en obtenerContenido:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Actualizar contenido de la página principal
  async actualizarContenido(req, res) {
    try {
      const usuarioId = req.usuario.id_usu;
      const data = req.body;
      
      // Validación básica
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Datos requeridos'
        });
      }
      
      const contenidoActualizado = await paginaPrincipalService.actualizarContenido(data, usuarioId);
      
      res.json({
        success: true,
        message: 'Contenido actualizado exitosamente',
        data: contenidoActualizado
      });
    } catch (error) {
      console.error('Error en actualizarContenido:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Subir imagen
  async subirImagen(req, res) {
    try {
      const { tipoImagen } = req.params;
      const usuarioId = req.usuario.id_usu;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen'
        });
      }
      
      // Validar tipo de imagen
      const tiposPermitidos = ['imagen_hero', 'imagen_seccion1', 'imagen_seccion2', 'imagen_seccion3', 'imagen_seccion4'];
      if (!tiposPermitidos.includes(tipoImagen)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de imagen no válido'
        });
      }
      
      const resultado = await paginaPrincipalService.subirImagen(tipoImagen, req.file.buffer, usuarioId);
      
      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error en subirImagen:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Obtener imagen específica
  async obtenerImagen(req, res) {
    try {
      const { tipoImagen } = req.params;
      
      const imagenBuffer = await paginaPrincipalService.obtenerImagen(tipoImagen);
      
      if (!imagenBuffer) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }
      
      // Determinar tipo de contenido basado en los primeros bytes
      let contentType = 'image/jpeg'; // default
      
      // Detectar formato por magic numbers
      if (imagenBuffer[0] === 0xFF && imagenBuffer[1] === 0xD8) {
        contentType = 'image/jpeg';
      } else if (imagenBuffer[0] === 0x89 && imagenBuffer[1] === 0x50 && imagenBuffer[2] === 0x4E && imagenBuffer[3] === 0x47) {
        contentType = 'image/png';
      } else if (imagenBuffer[0] === 0x47 && imagenBuffer[1] === 0x49 && imagenBuffer[2] === 0x46) {
        contentType = 'image/gif';
      } else if (imagenBuffer[0] === 0x52 && imagenBuffer[1] === 0x49 && imagenBuffer[2] === 0x46 && imagenBuffer[3] === 0x46) {
        contentType = 'image/webp';
      }
      
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      res.send(imagenBuffer);
    } catch (error) {
      console.error('Error en obtenerImagen:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Instancia del controlador
const controller = new PaginaPrincipalController();

// Obtener eventos y cursos para usuarios NO autenticados (Homepage sin login)
const getEventosCursosPublicos = async (req, res) => {
  try {
    console.log('Obteniendo eventos y cursos para usuario no autenticado');

    // Obtener todos los eventos activos (sin filtro de fecha para mostrar más contenido)
    const eventos = await prisma.evento.findMany({
      where: {
        estado: 'ACTIVO'
      },
      select: {
        id_eve: true,
        nom_eve: true,
        des_eve: true,
        fec_ini_eve: true,
        fec_fin_eve: true,
        hor_ini_eve: true,
        hor_fin_eve: true,
        ubi_eve: true,
        dur_eve: true,
        capacidad_max_eve: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_eve: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        eventosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripciones: {
          where: {
            estado_pago: 'APROBADO'
          },
          select: {
            id_ins: true
          }
        }
      },
      orderBy: {
        fec_ini_eve: 'asc'
      },
      take: 8
    });

    // Obtener todos los cursos activos
    const cursos = await prisma.curso.findMany({
      where: {
        estado: 'ACTIVO'
      },
      select: {
        id_cur: true,
        nom_cur: true,
        des_cur: true,
        fec_ini_cur: true,
        fec_fin_cur: true,
        dur_cur: true,
        capacidad_max_cur: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_cur: true,
        requiere_verificacion_docs: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        cursosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripcionesCurso: {
          where: {
            estado_pago_cur: 'APROBADO'
          },
          select: {
            id_ins_cur: true
          }
        }
      },
      orderBy: {
        fec_ini_cur: 'asc'
      },
      take: 8
    });

    console.log(`Eventos públicos encontrados: ${eventos.length}`);
    console.log(`Cursos públicos encontrados: ${cursos.length}`);

    res.json({
      success: true,
      eventos,
      cursos
    });

  } catch (error) {
    console.error('Error al obtener eventos y cursos públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos y cursos'
    });
  }
};

// Obtener eventos y cursos para ESTUDIANTES (por carrera + públicos)
const getEventosCursosCarrera = async (req, res) => {
  try {
    const userId = req.uid;
    console.log('ID de usuario ESTUDIANTE:', userId);

    // Obtener la carrera del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      select: { 
        id_car_per: true,
        carrera: {
          select: {
            nom_car: true
          }
        }
      }
    });
    console.log('Datos del usuario:', usuario);

    if (!usuario || !usuario.id_car_per) {
      console.log('No se encontró carrera para el usuario');
      return res.status(400).json({
        success: false,
        message: 'No se encontró la carrera del usuario'
      });
    }

    // Verificar eventos específicos para esta carrera (para debugging)
    const eventosPorCarreraEspecifica = await prisma.eventoPorCarrera.findMany({
      where: {
        id_car_per: usuario.id_car_per
      },
      select: {
        id_eve_per: true,
        evento: {
          select: {
            nom_eve: true,
            estado: true,
            tipo_audiencia_eve: true
          }
        }
      }
    });
    
    console.log('Eventos específicos para esta carrera encontrados:', eventosPorCarreraEspecifica.length);
    eventosPorCarreraEspecifica.forEach(e => {
      console.log(`- Evento: ${e.evento.nom_eve}, Estado: ${e.evento.estado}, Audiencia: ${e.evento.tipo_audiencia_eve}`);
    });
    
    // Obtener eventos para el estudiante - SIN FILTRO DE FECHA para debugging
    const eventos = await prisma.evento.findMany({
      where: {
        estado: 'ACTIVO',
        // Quitamos temporalmente el filtro de fecha
        OR: [
          // Eventos públicos para todos
          { tipo_audiencia_eve: 'PUBLICO_GENERAL' },
          // Eventos para todas las carreras
          { tipo_audiencia_eve: 'TODAS_CARRERAS' },
          // Eventos específicos para mi carrera
          {
            AND: [
              { tipo_audiencia_eve: 'CARRERA_ESPECIFICA' },
              {
                eventosPorCarrera: {
                  some: {
                    id_car_per: usuario.id_car_per
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id_eve: true,
        nom_eve: true,
        des_eve: true,
        fec_ini_eve: true,
        fec_fin_eve: true,
        hor_ini_eve: true,
        hor_fin_eve: true,
        ubi_eve: true,
        dur_eve: true,
        capacidad_max_eve: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_eve: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        eventosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripciones: {
          where: {
            estado_pago: 'APROBADO'
          },
          select: {
            id_ins: true
          }
        }
      },
      orderBy: {
        fec_ini_eve: 'asc'
      }
    });

    console.log('Carrera del usuario:', usuario.id_car_per, usuario.carrera?.nom_car);
    
    // Verificar cursos específicos para esta carrera (para debugging)
    const cursosPorCarreraEspecifica = await prisma.cursoPorCarrera.findMany({
      where: {
        id_car_per: usuario.id_car_per
      },
      select: {
        id_cur_per: true,
        curso: {
          select: {
            nom_cur: true,
            estado: true,
            tipo_audiencia_cur: true
          }
        }
      }
    });
    
    console.log('Cursos específicos para esta carrera encontrados:', cursosPorCarreraEspecifica.length);
    cursosPorCarreraEspecifica.forEach(c => {
      console.log(`- Curso: ${c.curso.nom_cur}, Estado: ${c.curso.estado}, Audiencia: ${c.curso.tipo_audiencia_cur}`);
    });
    
    // Obtener cursos para el estudiante - SIN FILTRO DE FECHA para debugging
    const cursos = await prisma.curso.findMany({
      where: {
        estado: 'ACTIVO',
        // Quitamos temporalmente el filtro de fecha para ver todos los cursos
        OR: [
          // Cursos públicos para todos
          { tipo_audiencia_cur: 'PUBLICO_GENERAL' },
          // Cursos para todas las carreras
          { tipo_audiencia_cur: 'TODAS_CARRERAS' },
          // Cursos específicos para mi carrera
          {
            AND: [
              { tipo_audiencia_cur: 'CARRERA_ESPECIFICA' },
              {
                cursosPorCarrera: {
                  some: {
                    id_car_per: usuario.id_car_per
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id_cur: true,
        nom_cur: true,
        des_cur: true,
        fec_ini_cur: true,
        fec_fin_cur: true,
        dur_cur: true,
        capacidad_max_cur: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_cur: true,
        requiere_verificacion_docs: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        cursosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripcionesCurso: {
          where: {
            estado_pago_cur: 'APROBADO'
          },
          select: {
            id_ins_cur: true
          }
        }
      },
      orderBy: {
        fec_ini_cur: 'asc'
      }
    });

    console.log(`Eventos encontrados para estudiante: ${eventos.length}`);
    console.log(`Cursos encontrados para estudiante: ${cursos.length}`);
    
    // Mostrar detalles de los cursos encontrados
    cursos.forEach(c => {
      console.log(`- Curso encontrado: ${c.nom_cur}, Audiencia: ${c.tipo_audiencia_cur}`);
    });
    
    // Mostrar detalles de los eventos encontrados
    eventos.forEach(e => {
      console.log(`- Evento encontrado: ${e.nom_eve}, Audiencia: ${e.tipo_audiencia_eve}`);
    });

    res.json({
      success: true,
      eventos,
      cursos,
      carrera: usuario.carrera.nom_car
    });

  } catch (error) {
    console.error('Error detallado al obtener eventos y cursos por carrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos y cursos'
    });
  }
};

// Obtener eventos y cursos para USUARIOS EXTERNOS (solo públicos)
const getEventosCursosDisponibles = async (req, res) => {
  try {
    console.log('Obteniendo eventos y cursos para USUARIO EXTERNO');

    // Solo eventos públicos para usuarios externos
    const eventos = await prisma.evento.findMany({
      where: {
        estado: 'ACTIVO',
        tipo_audiencia_eve: 'PUBLICO_GENERAL', // Solo públicos
        fec_ini_eve: {
          gte: new Date() // Solo eventos futuros
        }
      },
      select: {
        id_eve: true,
        nom_eve: true,
        des_eve: true,
        fec_ini_eve: true,
        fec_fin_eve: true,
        hor_ini_eve: true,
        hor_fin_eve: true,
        ubi_eve: true,
        dur_eve: true,
        capacidad_max_eve: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_eve: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        eventosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripciones: {
          where: {
            estado_pago: 'APROBADO'
          },
          select: {
            id_ins: true
          }
        }
      },
      orderBy: {
        fec_ini_eve: 'asc'
      }
    });

    // Solo cursos públicos para usuarios externos
    const cursos = await prisma.curso.findMany({
      where: {
        estado: 'ACTIVO',
        tipo_audiencia_cur: 'PUBLICO_GENERAL', // Solo públicos
        fec_ini_cur: {
          gte: new Date() // Solo cursos futuros
        }
      },
      select: {
        id_cur: true,
        nom_cur: true,
        des_cur: true,
        fec_ini_cur: true,
        fec_fin_cur: true,
        dur_cur: true,
        capacidad_max_cur: true,
        es_gratuito: true,
        precio: true,
        tipo_audiencia_cur: true,
        requiere_verificacion_docs: true,
        categoria: {
          select: {
            nom_cat: true
          }
        },
        cursosPorCarrera: {
          select: {
            carrera: {
              select: {
                nom_car: true
              }
            }
          }
        },
        inscripcionesCurso: {
          where: {
            estado_pago_cur: 'APROBADO'
          },
          select: {
            id_ins_cur: true
          }
        }
      },
      orderBy: {
        fec_ini_cur: 'asc'
      }
    });

    console.log(`Eventos públicos encontrados para usuario externo: ${eventos.length}`);
    console.log(`Cursos públicos encontrados para usuario externo: ${cursos.length}`);

    res.json({
      success: true,
      eventos,
      cursos
    });

  } catch (error) {
    console.error('Error al obtener eventos y cursos para usuario externo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos y cursos'
    });
  }
};

// Exportar controlador y middleware de upload
module.exports = {
  obtenerContenido: controller.obtenerContenido.bind(controller),
  actualizarContenido: controller.actualizarContenido.bind(controller),
  subirImagen: controller.subirImagen.bind(controller),
  obtenerImagen: controller.obtenerImagen.bind(controller),
  uploadMiddleware: upload.single('imagen'),
  getEventosCursosPublicos,
  getEventosCursosCarrera,
  getEventosCursosDisponibles
}; 