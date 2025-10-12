import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;
}

export class HomepageController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/homepage/content
   * Obtener contenido de la página principal
   */
  public async getContent(req: Request, res: Response): Promise<void> {
    try {
      const prisma = this.container.getPrismaClient();

      // Buscar el primer registro o crear uno por defecto
      let paginaPrincipal = await prisma.paginaPrincipal.findFirst();

      if (!paginaPrincipal) {
        // Crear registro por defecto
        paginaPrincipal = await prisma.paginaPrincipal.create({
          data: {
            titulo_hero: 'FISEI - SIGEC',
            subtitulo_hero: 'Sistema Integral de Gestión de Eventos y Cursos',
            descripcion_hero: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato',
            titulo_ofrecemos: '¿Qué Ofrecemos?',
            subtitulo_ofrecemos: 'Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti',
            titulo_seccion1: 'Cursos Especializados',
            descripcion_seccion1: 'En FISEIIIIIIIIIIIIIIII ofrecemos una amplia variedad de cursos técnicos y académicos diseñados específicamente para potenciar tu desarrollo profesional. Nuestros programas están actualizados con las últimas tendencias tecnológicas y metodologías de enseñanza, garantizando una formación de calidad que te prepare para los desafíos del mundo laboral moderno.',
            titulo_seccion2: 'Eventos Académicos',
            descripcion_seccion2: 'Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria. Organizamos eventos con expertos de la industria, investigadores reconocidos y profesionales destacados que compartirán sus conocimientos y experiencias contigo, creando oportunidades únicas de networking y aprendizaje.',
            titulo_seccion3: 'Certificaciones Oficiales',
            descripcion_seccion3: 'Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas durante tu formación. Nuestras certificaciones están reconocidas por la industria y te brindarán una ventaja competitiva en el mercado laboral, demostrando tu competencia y compromiso con la excelencia académica.',
            titulo_seccion4: 'Comunidad Académica',
            descripcion_seccion4: 'Forma parte de una comunidad universitaria comprometida con la excelencia educativa y la innovación. En FISEI, fomentamos un ambiente colaborativo donde estudiantes, docentes e investigadores trabajamos juntos para crear soluciones innovadoras y contribuir al desarrollo tecnológico del país.',
            texto_footer1: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
            texto_footer2: 'Universidad Técnica de Ambato - Campus Huachi',
            texto_footer3: '© 2024 FISEI-UTA. Todos los derechos reservados.',
            fecha_creacion: new Date()
          },
          include: {
            ultimoEditor: true
          }
        });
      } else {
        // Incluir información del último editor
        paginaPrincipal = await prisma.paginaPrincipal.findUnique({
          where: { id_pag: paginaPrincipal.id_pag },
          include: {
            ultimoEditor: true
          }
        });
      }

      // Convertir imágenes a URLs del servidor
      const contenidoConImagenes = {
        ...paginaPrincipal,
        imagen_hero: paginaPrincipal!.imagen_hero ? `/api/homepage/image/imagen_hero?t=${Date.now()}` : null,
        imagen_seccion1: paginaPrincipal!.imagen_seccion1 ? `/api/homepage/image/imagen_seccion1?t=${Date.now()}` : null,
        imagen_seccion2: paginaPrincipal!.imagen_seccion2 ? `/api/homepage/image/imagen_seccion2?t=${Date.now()}` : null,
        imagen_seccion3: paginaPrincipal!.imagen_seccion3 ? `/api/homepage/image/imagen_seccion3?t=${Date.now()}` : null,
        imagen_seccion4: paginaPrincipal!.imagen_seccion4 ? `/api/homepage/image/imagen_seccion4?t=${Date.now()}` : null,
      };

      res.json({
        success: true,
        data: contenidoConImagenes
      });
    } catch (error: any) {
      console.error('[getContent] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/homepage/content
   * Actualizar contenido de la página principal
   */
  public async updateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.id_usu;
      const data = req.body;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!data) {
        res.status(400).json({
          success: false,
          message: 'Datos requeridos'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Buscar el registro existente
      let paginaPrincipal = await prisma.paginaPrincipal.findFirst();

      const updateData = {
        ...data,
        fecha_ultima_actualizacion: new Date(),
        id_usuario_ultima_edicion: usuarioId
      };

      if (paginaPrincipal) {
        // Actualizar registro existente
        paginaPrincipal = await prisma.paginaPrincipal.update({
          where: { id_pag: paginaPrincipal.id_pag },
          data: updateData,
          include: {
            ultimoEditor: true
          }
        });
      } else {
        // Crear nuevo registro si no existe
        paginaPrincipal = await prisma.paginaPrincipal.create({
          data: {
            ...updateData,
            fecha_creacion: new Date()
          },
          include: {
            ultimoEditor: true
          }
        });
      }

      res.json({
        success: true,
        message: 'Contenido actualizado exitosamente',
        data: paginaPrincipal
      });
    } catch (error: any) {
      console.error('[updateContent] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/homepage/image/:imageType (o /api/pagina-principal/imagen/:tipoImagen)
   * Subir imagen específica
   */
  public async uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Compatibilidad con ambos parámetros: imageType (nuevo) y tipoImagen (legacy)
      const imageType = req.params.imageType || req.params.tipoImagen;
      const usuarioId = req.usuario?.id_usu;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen'
        });
        return;
      }

      if (!imageType) {
        res.status(400).json({
          success: false,
          message: 'Tipo de imagen requerido'
        });
        return;
      }

      // Validar tipo de imagen
      const tiposPermitidos = ['imagen_hero', 'imagen_seccion1', 'imagen_seccion2', 'imagen_seccion3', 'imagen_seccion4'];
      if (!tiposPermitidos.includes(imageType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de imagen no válido'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      let paginaPrincipal = await prisma.paginaPrincipal.findFirst();

      if (!paginaPrincipal) {
        res.status(404).json({
          success: false,
          message: 'No se encontró configuración de página principal'
        });
        return;
      }

      // Actualizar la imagen específica
      const updateData: any = {
        fecha_ultima_actualizacion: new Date(),
        id_usuario_ultima_edicion: usuarioId
      };
      updateData[imageType as string] = req.file.buffer;

      const resultado = await prisma.paginaPrincipal.update({
        where: { id_pag: paginaPrincipal.id_pag },
        data: updateData,
        include: {
          ultimoEditor: true
        }
      });

      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: resultado
      });
    } catch (error: any) {
      console.error('[uploadImage] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/homepage/image/:imageType (o /api/pagina-principal/imagen/:tipoImagen)
   * Obtener imagen específica
   */
  public async getImage(req: Request, res: Response): Promise<void> {
    try {
      // Compatibilidad con ambos parámetros: imageType (nuevo) y tipoImagen (legacy)
      const imageType = req.params.imageType || req.params.tipoImagen;
      const prisma = this.container.getPrismaClient();

      const paginaPrincipal = await prisma.paginaPrincipal.findFirst();

      if (!paginaPrincipal || !paginaPrincipal[imageType as keyof typeof paginaPrincipal]) {
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
        return;
      }

      const imagenBuffer = paginaPrincipal[imageType as keyof typeof paginaPrincipal] as Buffer;

      if (!imagenBuffer) {
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
        return;
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
    } catch (error: any) {
      console.error('[getImage] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/homepage/public-content
   * Obtener eventos y cursos para usuarios NO autenticados (Homepage sin login)
   */
  public async getPublicContent(req: Request, res: Response): Promise<void> {
    try {
      console.log('Obteniendo eventos y cursos para usuario no autenticado');
      const prisma = this.container.getPrismaClient();

      // Obtener todos los eventos activos
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
    } catch (error: any) {
      console.error('[getPublicContent] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener eventos y cursos'
      });
    }
  }

  /**
   * GET /api/homepage/student-content
   * Obtener eventos y cursos para ESTUDIANTES (por carrera + públicos)
   */
  public async getStudentContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.uid;
      console.log('ID de usuario ESTUDIANTE:', userId);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

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
        res.status(400).json({
          success: false,
          message: 'No se encontró la carrera del usuario'
        });
        return;
      }

      // Obtener eventos para el estudiante
      const eventos = await prisma.evento.findMany({
        where: {
          estado: 'ACTIVO',
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

      // Obtener cursos para el estudiante
      const cursos = await prisma.curso.findMany({
        where: {
          estado: 'ACTIVO',
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

      res.json({
        success: true,
        eventos,
        cursos,
        carrera: usuario.carrera?.nom_car
      });
    } catch (error: any) {
      console.error('[getStudentContent] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener eventos y cursos'
      });
    }
  }

  /**
   * GET /api/homepage/external-content
   * Obtener eventos y cursos para USUARIOS EXTERNOS (solo públicos)
   */
  public async getExternalContent(req: Request, res: Response): Promise<void> {
    try {
      console.log('Obteniendo eventos y cursos para USUARIO EXTERNO');
      const prisma = this.container.getPrismaClient();

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
    } catch (error: any) {
      console.error('[getExternalContent] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener eventos y cursos'
      });
    }
  }
}
