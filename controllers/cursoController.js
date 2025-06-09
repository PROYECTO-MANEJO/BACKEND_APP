const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo curso
const crearCurso = async (req, res) => {
  try {
    const {
      nom_cur,
      des_cur,
      dur_cur,
      fec_ini_cur,
      fec_fin_cur,
      id_cat_cur,
      ced_org_cur,
      capacidad_max_cur,
      tipo_audiencia_cur,
      requiere_verificacion_docs,
      es_gratuito,
      precio,
      carreras // Array opcional de IDs de carreras
    } = req.body;

    // ✅ VALIDACIONES BÁSICAS
    if (!nom_cur || !des_cur || !dur_cur || !fec_ini_cur || !fec_fin_cur || 
        !id_cat_cur || !ced_org_cur || !capacidad_max_cur) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: nom_cur, des_cur, dur_cur, fec_ini_cur, fec_fin_cur, id_cat_cur, ced_org_cur, capacidad_max_cur' 
      });
    }

    // ✅ VALIDAR FECHAS
    const fechaInicio = new Date(fec_ini_cur);
    const fechaFin = new Date(fec_fin_cur);
    
    if (isNaN(fechaInicio.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fecha de inicio inválida. Use formato YYYY-MM-DD' 
      });
    }
    
    if (isNaN(fechaFin.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fecha de fin inválida. Use formato YYYY-MM-DD' 
      });
    }
    
    if (fechaFin <= fechaInicio) {
      return res.status(400).json({ 
        success: false, 
        message: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      });
    }

    // ✅ VALIDAR NÚMEROS
    const duracion = parseInt(dur_cur);
    const capacidad = parseInt(capacidad_max_cur);
    
    if (isNaN(duracion) || duracion <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La duración debe ser un número positivo' 
      });
    }
    
    if (isNaN(capacidad) || capacidad <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La capacidad máxima debe ser un número positivo' 
      });
    }

    // ✅ VALIDAR ENUM TIPO AUDIENCIA
    if (tipo_audiencia_cur) {
      const audienciasValidas = ['CARRERA_ESPECIFICA', 'TODAS_CARRERAS', 'PUBLICO_GENERAL'];
      if (!audienciasValidas.includes(tipo_audiencia_cur)) {
        return res.status(400).json({ 
          success: false, 
          message: `Tipo de audiencia inválido. Valores permitidos: ${audienciasValidas.join(', ')}` 
        });
      }
    }

    // ✅ VALIDAR CONFIGURACIÓN DE PRECIO
    const esGratuito = es_gratuito !== undefined ? es_gratuito : true; // Default: gratuito
    let precioCurso = null;
    
    if (!esGratuito) {
      // Si no es gratuito, debe tener precio
      if (precio === undefined || precio === null) {
        return res.status(400).json({ 
          success: false, 
          message: 'Para cursos pagados, el precio es obligatorio' 
        });
      }
      
      precioCurso = parseFloat(precio);
      if (isNaN(precioCurso) || precioCurso <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'El precio debe ser un número positivo' 
        });
      }
    } else {
      // Si es gratuito, no debe tener precio
      if (precio !== undefined && precio !== null) {
        return res.status(400).json({ 
          success: false, 
          message: 'Los cursos gratuitos no pueden tener precio' 
        });
      }
    }

    // ✅ VERIFICAR QUE EXISTAN REGISTROS RELACIONADOS
    const [categoria, organizador] = await Promise.all([
      prisma.categoriaEvento.findUnique({ where: { id_cat: id_cat_cur } }),
      prisma.organizador.findUnique({ where: { ced_org: ced_org_cur } })
    ]);

    if (!categoria) {
      return res.status(400).json({ 
        success: false, 
        message: 'La categoría especificada no existe' 
      });
    }

    if (!organizador) {
      return res.status(400).json({ 
        success: false, 
        message: 'El organizador especificado no existe' 
      });
    }

    // ✅ CREAR CURSO CON TRANSACCIÓN
    const nuevoCurso = await prisma.$transaction(async (tx) => {
      // Crear el curso
      const curso = await tx.curso.create({
        data: {
          nom_cur: nom_cur.trim(),
          des_cur: des_cur.trim(),
          dur_cur: duracion,
          fec_ini_cur: fechaInicio,
          fec_fin_cur: fechaFin,
          id_cat_cur,
          ced_org_cur,
          capacidad_max_cur: capacidad,
          tipo_audiencia_cur: tipo_audiencia_cur || 'PUBLICO_GENERAL',
          requiere_verificacion_docs: requiere_verificacion_docs !== undefined ? requiere_verificacion_docs : true,
          es_gratuito: esGratuito,
          precio: precioCurso
        }
      });

      // ✅ ASIGNAR A CARRERAS SI SE ESPECIFICARON
      if (carreras && Array.isArray(carreras) && carreras.length > 0) {
        // Verificar que las carreras existan
        const carrerasExistentes = await tx.carrera.findMany({
          where: {
            id_car: {
              in: carreras
            }
          },
          select: { id_car: true }
        });

        if (carrerasExistentes.length !== carreras.length) {
          throw new Error('Una o más carreras especificadas no existen');
        }

        const asignaciones = carreras.map(id_carrera => ({
          id_cur_per: curso.id_cur,
          id_car_per: id_carrera
        }));

        await tx.cursoPorCarrera.createMany({
          data: asignaciones
        });
      }

      return curso;
    });

    res.status(201).json({ 
      success: true, 
      message: 'Curso creado correctamente', 
      curso: nuevoCurso 
    });

  } catch (error) {
    console.error('Error al crear curso:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un curso con estos datos únicos' 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de referencia: verificar que existan la categoría y organizador' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todos los cursos
const obtenerCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        categoria: {
          select: {
            id_cat: true,
            nom_cat: true,
            des_cat: true
          }
        },
        organizador: {
          select: {
            ced_org: true,
            nom_org1: true,
            nom_org2: true,
            ape_org1: true,
            ape_org2: true,
            tit_aca_org: true
          }
        },
        cursosPorCarrera: {
          include: {
            carrera: {
              select: {
                id_car: true,
                nom_car: true
              }
            }
          }
        },
        _count: {
          select: {
            inscripcionesCurso: true
          }
        }
      },
      orderBy: {
        fec_ini_cur: 'desc'
      }
    });

    // Formatear respuesta
    const cursosFormateados = cursos.map(curso => ({
      ...curso,
      organizador_nombre: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
      categoria_nombre: curso.categoria.nom_cat,
      carreras: curso.cursosPorCarrera.map(cpc => ({
        id: cpc.carrera.id_car,
        nombre: cpc.carrera.nom_car
      })),
      total_inscripciones: curso._count.inscripcionesCurso,
      // Calcular duración en semanas (aproximada)
      duracion_semanas: Math.ceil(curso.dur_cur / 40), // Asumiendo 40 horas por semana
      // Estado del curso basado en fechas
      estado: obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur),
      // 🎯 INFORMACIÓN DE PRECIO
      es_gratuito: curso.es_gratuito,
      precio: curso.precio,
      plazas_disponibles: curso.capacidad_max_cur - curso._count.inscripcionesCurso
    }));

    res.json({ 
      success: true, 
      cursos: cursosFormateados 
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Función auxiliar para obtener el estado del curso
const obtenerEstadoCurso = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  if (hoy < inicio) return 'PROXIMAMENTE';
  if (hoy >= inicio && hoy <= fin) return 'EN_CURSO';
  if (hoy > fin) return 'FINALIZADO';
  return 'INDETERMINADO';
};

// Obtener curso por ID
const obtenerCursoPorId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const curso = await prisma.curso.findUnique({
      where: { id_cur: id },
      include: {
        categoria: true,
        organizador: true,
        cursosPorCarrera: {
          include: {
            carrera: true
          }
        },
        inscripcionesCurso: {
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true,
                cor_usu: true,
                documentos_verificados: true
              }
            }
          }
        },
        _count: {
          select: {
            inscripcionesCurso: true
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Curso no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      curso: {
        ...curso,
        organizador_nombre: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
        categoria_nombre: curso.categoria.nom_cat,
        carreras: curso.cursosPorCarrera.map(cpc => ({
          id: cpc.carrera.id_car,
          nombre: cpc.carrera.nom_car
        })),
        total_inscripciones: curso._count.inscripcionesCurso,
        estado: obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur),
        plazas_disponibles: curso.capacidad_max_cur - curso._count.inscripcionesCurso
      }
    });
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Actualizar curso
const actualizarCurso = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    const curso = await prisma.curso.findUnique({ 
      where: { id_cur: id } 
    });
    
    if (!curso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Curso no encontrado' 
      });
    }

    // Preparar datos para actualización
    const datosActualizacion = {};

    // Campos de texto
    if (data.nom_cur) datosActualizacion.nom_cur = data.nom_cur.trim();
    if (data.des_cur) datosActualizacion.des_cur = data.des_cur.trim();
    
    // Campos numéricos
    if (data.dur_cur) {
      const duracion = parseInt(data.dur_cur);
      if (isNaN(duracion) || duracion <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'La duración debe ser un número positivo' 
        });
      }
      datosActualizacion.dur_cur = duracion;
    }
    
    if (data.capacidad_max_cur) {
      const capacidad = parseInt(data.capacidad_max_cur);
      if (isNaN(capacidad) || capacidad <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'La capacidad máxima debe ser un número positivo' 
        });
      }
      datosActualizacion.capacidad_max_cur = capacidad;
    }

    // Campos booleanos
    if (data.requiere_verificacion_docs !== undefined) {
      datosActualizacion.requiere_verificacion_docs = Boolean(data.requiere_verificacion_docs);
    }

    // 🎯 VALIDAR CONFIGURACIÓN DE PRECIO
    if (data.es_gratuito !== undefined) {
      const esGratuito = Boolean(data.es_gratuito);
      datosActualizacion.es_gratuito = esGratuito;
      
      if (!esGratuito) {
        // Si se cambia a pagado, debe tener precio
        if (data.precio === undefined || data.precio === null) {
          return res.status(400).json({ 
            success: false, 
            message: 'Para cursos pagados, el precio es obligatorio' 
          });
        }
        
        const precio = parseFloat(data.precio);
        if (isNaN(precio) || precio <= 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'El precio debe ser un número positivo' 
          });
        }
        datosActualizacion.precio = precio;
      } else {
        // Si se cambia a gratuito, quitar el precio
        datosActualizacion.precio = null;
      }
    } else if (data.precio !== undefined) {
      // Solo se actualiza el precio si el curso ya es pagado
      if (curso.es_gratuito) {
        return res.status(400).json({ 
          success: false, 
          message: 'No se puede establecer precio en un curso gratuito. Primero cambie es_gratuito a false' 
        });
      }
      
      const precio = parseFloat(data.precio);
      if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'El precio debe ser un número positivo' 
        });
      }
      datosActualizacion.precio = precio;
    }

    // Validar y convertir fechas
    if (data.fec_ini_cur) {
      const fechaInicio = new Date(data.fec_ini_cur);
      if (isNaN(fechaInicio.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fecha de inicio inválida' 
        });
      }
      datosActualizacion.fec_ini_cur = fechaInicio;
    }
    
    if (data.fec_fin_cur) {
      const fechaFin = new Date(data.fec_fin_cur);
      if (isNaN(fechaFin.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fecha de fin inválida' 
        });
      }
      datosActualizacion.fec_fin_cur = fechaFin;
    }

    // Validar enum tipo audiencia
    if (data.tipo_audiencia_cur) {
      const audienciasValidas = ['CARRERA_ESPECIFICA', 'TODAS_CARRERAS', 'PUBLICO_GENERAL'];
      if (!audienciasValidas.includes(data.tipo_audiencia_cur)) {
        return res.status(400).json({ 
          success: false, 
          message: `Tipo de audiencia inválido. Valores permitidos: ${audienciasValidas.join(', ')}` 
        });
      }
      datosActualizacion.tipo_audiencia_cur = data.tipo_audiencia_cur;
    }

    // Validar referencias
    if (data.id_cat_cur) {
      const categoria = await prisma.categoriaEvento.findUnique({ 
        where: { id_cat: data.id_cat_cur } 
      });
      if (!categoria) {
        return res.status(400).json({ 
          success: false, 
          message: 'Categoría inválida' 
        });
      }
      datosActualizacion.id_cat_cur = data.id_cat_cur;
    }

    if (data.ced_org_cur) {
      const organizador = await prisma.organizador.findUnique({ 
        where: { ced_org: data.ced_org_cur } 
      });
      if (!organizador) {
        return res.status(400).json({ 
          success: false, 
          message: 'Organizador inválido' 
        });
      }
      datosActualizacion.ced_org_cur = data.ced_org_cur;
    }

    // Actualizar curso
    const cursoActualizado = await prisma.curso.update({ 
      where: { id_cur: id }, 
      data: datosActualizacion,
      include: {
        categoria: true,
        organizador: true
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Curso actualizado correctamente', 
      curso: cursoActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un curso con estos datos únicos' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Eliminar curso
const eliminarCurso = async (req, res) => {
  const { id } = req.params;
  
  try {
    const curso = await prisma.curso.findUnique({ 
      where: { id_cur: id },
      include: {
        _count: {
          select: {
            inscripcionesCurso: true,
            cursosPorCarrera: true
          }
        }
      }
    });
    
    if (!curso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Curso no encontrado' 
      });
    }

    // Verificar si tiene inscripciones
    if (curso._count.inscripcionesCurso > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar el curso. Tiene ${curso._count.inscripcionesCurso} inscripciones asociadas.` 
      });
    }

    // Eliminar con transacción (primero las relaciones)
    await prisma.$transaction(async (tx) => {
      // Eliminar asignaciones a carreras
      if (curso._count.cursosPorCarrera > 0) {
        await tx.cursoPorCarrera.deleteMany({
          where: { id_cur_per: id }
        });
      }
      
      // Eliminar el curso
      await tx.curso.delete({ 
        where: { id_cur: id } 
      });
    });
    
    res.json({ 
      success: true, 
      message: 'Curso eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Obtener cursos disponibles para inscribirse (excluyendo los que ya tiene inscripción)
const obtenerCursosDisponibles = async (req, res) => {
  const userId = req.uid;

  try {
    // Obtener información del usuario para filtros
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: userId },
      include: {
        cuentas: {
          select: {
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

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const rol = usuario.cuentas[0]?.rol_cue;
    const carreraId = usuario.id_car_per;

    // Obtener IDs de cursos donde el usuario ya está inscrito
    const inscripciones = await prisma.inscripcionCurso.findMany({
      where: { id_usu_ins_cur: userId },
      select: { id_cur_ins: true }
    });

    const cursosInscritosIds = inscripciones.map(ins => ins.id_cur_ins);

    // Construir filtros de cursos disponibles según rol y carrera
    let cursosFilter = {
      id_cur: {
        notIn: cursosInscritosIds
      }
    };

    // Filtrar según tipo de usuario
    if (rol === 'USUARIO') {
      // Usuarios solo pueden ver cursos públicos
      cursosFilter.tipo_audiencia_cur = 'PUBLICO_GENERAL';
    } else if (rol === 'ESTUDIANTE' && carreraId) {
      // Estudiantes pueden ver cursos públicos, de todas las carreras, o específicos de su carrera
      cursosFilter.OR = [
        { tipo_audiencia_cur: 'PUBLICO_GENERAL' },
        { tipo_audiencia_cur: 'TODAS_CARRERAS' },
        {
          tipo_audiencia_cur: 'CARRERA_ESPECIFICA',
          cursosPorCarrera: {
            some: {
              id_car_per: carreraId
            }
          }
        }
      ];
      delete cursosFilter.tipo_audiencia_cur;
    }

    // Obtener cursos con toda la información necesaria
    const cursos = await prisma.curso.findMany({
      where: cursosFilter,
      include: {
        categoria: {
          select: {
            id_cat: true,
            nom_cat: true,
            des_cat: true
          }
        },
        organizador: {
          select: {
            ced_org: true,
            nom_org1: true,
            nom_org2: true,
            ape_org1: true,
            ape_org2: true,
            tit_aca_org: true
          }
        },
        cursosPorCarrera: {
          include: {
            carrera: {
              select: {
                id_car: true,
                nom_car: true
              }
            }
          }
        },
        _count: {
          select: {
            inscripcionesCurso: true
          }
        }
      },
      orderBy: {
        fec_ini_cur: 'desc'
      }
    });

    // Procesar datos para el frontend
    const cursosFormateados = cursos.map(curso => {
      // Calcular nombre completo del organizador
      const organizador = curso.organizador;
      const nombreCompleto = organizador
        ? `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim()
        : 'Sin organizador';

      return {
        ...curso,
        categoria_nombre: curso.categoria?.nom_cat || 'Sin categoría',
        organizador_nombre: nombreCompleto,
        carreras: curso.cursosPorCarrera.map(cc => ({
          id: cc.carrera.id_car,
          nombre: cc.carrera.nom_car
        })),
        total_inscripciones: curso._count.inscripcionesCurso,
        estado: obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur)
      };
    });

    res.status(200).json({
      success: true,
      cursos: cursosFormateados,
      total: cursosFormateados.length,
      filtros: {
        rol: rol,
        carrera: usuario.carrera?.nom_car || 'Sin carrera'
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener cursos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos disponibles'
    });
  }
};

// Obtener mis cursos (donde estoy inscrito)
const obtenerMisCursos = async (req, res) => {
  const userId = req.uid;

  try {
    const inscripciones = await prisma.inscripcionCurso.findMany({
      where: { id_usu_ins_cur: userId },
      include: {
        curso: {
          include: {
            categoria: {
              select: {
                id_cat: true,
                nom_cat: true,
                des_cat: true
              }
            },
            organizador: {
              select: {
                ced_org: true,
                nom_org1: true,
                nom_org2: true,
                ape_org1: true,
                ape_org2: true,
                tit_aca_org: true
              }
            },
            cursosPorCarrera: {
              include: {
                carrera: {
                  select: {
                    id_car: true,
                    nom_car: true
                  }
                }
              }
            },
            _count: {
              select: {
                inscripcionesCurso: true
              }
            }
          }
        }
      },
      orderBy: {
        fec_ins_cur: 'desc'
      }
    });

    // Procesar datos para incluir información de inscripción
    const cursosFormateados = inscripciones.map(inscripcion => {
      const curso = inscripcion.curso;
      
      // Calcular nombre completo del organizador
      const organizador = curso.organizador;
      const nombreCompleto = organizador
        ? `${organizador.tit_aca_org || ''} ${organizador.nom_org1} ${organizador.nom_org2 || ''} ${organizador.ape_org1} ${organizador.ape_org2 || ''}`.trim()
        : 'Sin organizador';

      return {
        ...curso,
        categoria_nombre: curso.categoria?.nom_cat || 'Sin categoría',
        organizador_nombre: nombreCompleto,
        carreras: curso.cursosPorCarrera.map(cc => ({
          id: cc.carrera.id_car,
          nombre: cc.carrera.nom_car
        })),
        total_inscripciones: curso._count.inscripcionesCurso,
        estado: obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur),
        // Información de la inscripción
        estado_inscripcion: inscripcion.estado_pago_cur,
        fecha_inscripcion: inscripcion.fec_ins_cur,
        metodo_pago: inscripcion.met_pag_ins_cur,
        valor_pagado: inscripcion.val_ins_cur,
        enlace_pago: inscripcion.enl_ord_pag_ins_cur,
        fecha_aprobacion: inscripcion.fec_aprobacion_cur
      };
    });

    res.status(200).json({
      success: true,
      cursos: cursosFormateados,
      total: cursosFormateados.length
    });

  } catch (error) {
    console.error('❌ Error al obtener mis cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus cursos'
    });
  }
};

// Actualizar carreras de un curso
const actualizarCarrerasCurso = async (req, res) => {
  const { id } = req.params;
  const { carreras } = req.body;
  
  try {
    // Verificar que el curso existe
    const curso = await prisma.curso.findUnique({ 
      where: { id_cur: id },
      select: {
        tipo_audiencia_cur: true
      }
    });
    
    if (!curso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Curso no encontrado' 
      });
    }

    // Solo permitir actualizar carreras si el tipo de audiencia es CARRERA_ESPECIFICA
    if (curso.tipo_audiencia_cur !== 'CARRERA_ESPECIFICA') {
      return res.status(400).json({ 
        success: false, 
        message: 'Solo se pueden asignar carreras a cursos con audiencia específica' 
      });
    }

    // Validar que carreras sea un array
    if (!Array.isArray(carreras)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Las carreras deben ser un array de IDs' 
      });
    }

    // Verificar que todas las carreras existan
    if (carreras.length > 0) {
      const carrerasExistentes = await prisma.carrera.findMany({
        where: {
          id_car: {
            in: carreras
          }
        },
        select: { id_car: true }
      });

      if (carrerasExistentes.length !== carreras.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'Una o más carreras especificadas no existen' 
        });
      }
    }

    // Actualizar carreras con transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar todas las asignaciones actuales
      await tx.cursoPorCarrera.deleteMany({
        where: { id_cur_per: id }
      });

      // Crear las nuevas asignaciones si hay carreras
      if (carreras.length > 0) {
        const asignaciones = carreras.map(id_carrera => ({
          id_cur_per: id,
          id_car_per: id_carrera
        }));

        await tx.cursoPorCarrera.createMany({
          data: asignaciones
        });
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Carreras del curso actualizadas correctamente' 
    });
  } catch (error) {
    console.error('Error al actualizar carreras del curso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso,
  obtenerCursosDisponibles,
  obtenerMisCursos,
  actualizarCarrerasCurso
};
