const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ FUNCIÓN CORREGIDA para convertir hora string a Date object
const convertirHoraADate = (horaString) => {
  if (!horaString) return null;
  
  // Si ya es una fecha válida, la retornamos
  if (horaString instanceof Date && !isNaN(horaString)) {
    return horaString;
  }
  
  // Validar formato "HH:MM:SS" o "HH:MM"
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  
  if (!timeRegex.test(horaString)) {
    throw new Error('Formato de hora inválido. Use HH:MM:SS o HH:MM');
  }
  
  const [horas, minutos, segundos = 0] = horaString.split(':').map(Number);
  
  if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    throw new Error('Formato de hora inválido');
  }
  
  // ✅ CREAR DATE OBJECT CON FECHA BASE 1970-01-01
  const fecha = new Date('1970-01-01T00:00:00.000Z');
  fecha.setUTCHours(horas, minutos, segundos || 0, 0);
  return fecha;
};

// Función para formatear hora de Date a string legible
const formatearHora = (fechaHora) => {
  if (!fechaHora) return null;
  
  // Si es Date object, extraer solo la hora
  if (fechaHora instanceof Date) {
    return fechaHora.toTimeString().slice(0, 8); // "HH:MM:SS"
  }
  
  // Si es string, retornarlo tal como está
  return fechaHora;
};

// Crear un nuevo evento
const crearEvento = async (req, res) => {
  try {
    const {
      nom_eve,
      des_eve,
      id_cat_eve,
      fec_ini_eve,
      fec_fin_eve,
      hor_ini_eve,
      hor_fin_eve,
      dur_eve,
      are_eve,
      ubi_eve,
      ced_org_eve,
      capacidad_max_eve,
      tipo_audiencia_eve,
      carreras
    } = req.body;

    // ✅ VALIDACIONES BÁSICAS
    if (!nom_eve || !des_eve || !id_cat_eve || !fec_ini_eve || !hor_ini_eve || 
        !dur_eve || !are_eve || !ubi_eve || !ced_org_eve || !capacidad_max_eve) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: nom_eve, des_eve, id_cat_eve, fec_ini_eve, hor_ini_eve, dur_eve, are_eve, ubi_eve, ced_org_eve, capacidad_max_eve' 
      });
    }

    // ✅ VALIDAR FECHAS
    const fechaInicio = new Date(fec_ini_eve);
    const fechaFin = fec_fin_eve ? new Date(fec_fin_eve) : null;
    
    if (isNaN(fechaInicio.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fecha de inicio inválida. Use formato YYYY-MM-DD' 
      });
    }
    
    if (fechaFin && isNaN(fechaFin.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fecha de fin inválida. Use formato YYYY-MM-DD' 
      });
    }
    
    if (fechaFin && fechaFin < fechaInicio) {
      return res.status(400).json({ 
        success: false, 
        message: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      });
    }

    // ✅ VALIDAR Y CONVERTIR HORAS
    let horaInicio, horaFin;
    
    try {
      horaInicio = convertirHoraADate(hor_ini_eve);
      horaFin = hor_fin_eve ? convertirHoraADate(hor_fin_eve) : null;
      
      console.log('Hora inicio convertida:', horaInicio); // Para debug
      console.log('Hora fin convertida:', horaFin); // Para debug
      
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: `Error en formato de hora: ${error.message}` 
      });
    }

    // ✅ VALIDAR ENUMS
    const areasValidas = ['PRACTICA', 'INVESTIGACION', 'ACADEMICA', 'TECNICA', 'INDUSTRIAL', 'EMPRESARIAL', 'IA', 'REDES'];
    const audienciasValidas = ['CARRERA_ESPECIFICA', 'TODAS_CARRERAS', 'PUBLICO_GENERAL'];
    
    if (!areasValidas.includes(are_eve)) {
      return res.status(400).json({ 
        success: false, 
        message: `Área inválida. Valores permitidos: ${areasValidas.join(', ')}` 
      });
    }
    
    if (tipo_audiencia_eve && !audienciasValidas.includes(tipo_audiencia_eve)) {
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de audiencia inválido. Valores permitidos: ${audienciasValidas.join(', ')}` 
      });
    }

    // ✅ VALIDAR NÚMEROS
    const duracion = parseInt(dur_eve);
    const capacidad = parseInt(capacidad_max_eve);
    
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

    // ✅ VERIFICAR QUE EXISTAN REGISTROS RELACIONADOS
    const [categoria, organizador] = await Promise.all([
      prisma.categoriaEvento.findUnique({ where: { id_cat: id_cat_eve } }),
      prisma.organizador.findUnique({ where: { ced_org: ced_org_eve } })
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

    // ✅ CREAR EVENTO CON TRANSACCIÓN
    const nuevoEvento = await prisma.$transaction(async (tx) => {
      // ✅ CREAR EL EVENTO - USANDO DATE OBJECTS
      const evento = await tx.evento.create({
        data: {
          nom_eve: nom_eve.trim(),
          des_eve: des_eve.trim(),
          id_cat_eve,
          fec_ini_eve: fechaInicio,
          fec_fin_eve: fechaFin,
          hor_ini_eve: horaInicio,  // Date object
          hor_fin_eve: horaFin,     // Date object o null
          dur_eve: duracion,
          are_eve,
          ubi_eve: ubi_eve.trim(),
          ced_org_eve,
          capacidad_max_eve: capacidad,
          tipo_audiencia_eve: tipo_audiencia_eve || 'PUBLICO_GENERAL'
        }
      });

      // ✅ ASIGNAR A CARRERAS SI SE ESPECIFICARON
      if (carreras && Array.isArray(carreras) && carreras.length > 0) {
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
          id_eve_per: evento.id_eve,
          id_car_per: id_carrera
        }));

        await tx.eventoPorCarrera.createMany({
          data: asignaciones
        });
      }

      return evento;
    });

    res.status(201).json({ 
      success: true, 
      message: 'Evento creado correctamente', 
      evento: {
        ...nuevoEvento,
        hora_inicio: formatearHora(nuevoEvento.hor_ini_eve),
        hora_fin: formatearHora(nuevoEvento.hor_fin_eve)
      }
    });

  } catch (error) {
    console.error('Error al crear evento:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un evento con estos datos únicos' 
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

// ✅ ACTUALIZAR FUNCIÓN DE ACTUALIZACIÓN
const actualizarEvento = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    const evento = await prisma.evento.findUnique({ 
      where: { id_eve: id } 
    });
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    const datosActualizacion = {};

    // Campos de texto
    if (data.nom_eve) datosActualizacion.nom_eve = data.nom_eve.trim();
    if (data.des_eve) datosActualizacion.des_eve = data.des_eve.trim();
    if (data.ubi_eve) datosActualizacion.ubi_eve = data.ubi_eve.trim();
    
    // Campos numéricos
    if (data.dur_eve) {
      const duracion = parseInt(data.dur_eve);
      if (isNaN(duracion) || duracion <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'La duración debe ser un número positivo' 
        });
      }
      datosActualizacion.dur_eve = duracion;
    }
    
    if (data.capacidad_max_eve) {
      const capacidad = parseInt(data.capacidad_max_eve);
      if (isNaN(capacidad) || capacidad <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'La capacidad máxima debe ser un número positivo' 
        });
      }
      datosActualizacion.capacidad_max_eve = capacidad;
    }

    // Validar y convertir fechas
    if (data.fec_ini_eve) {
      const fechaInicio = new Date(data.fec_ini_eve);
      if (isNaN(fechaInicio.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fecha de inicio inválida' 
        });
      }
      datosActualizacion.fec_ini_eve = fechaInicio;
    }
    
    if (data.fec_fin_eve) {
      const fechaFin = new Date(data.fec_fin_eve);
      if (isNaN(fechaFin.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fecha de fin inválida' 
        });
      }
      datosActualizacion.fec_fin_eve = fechaFin;
    }
    
    // ✅ VALIDAR Y CONVERTIR HORAS - CORREGIDO
    if (data.hor_ini_eve) {
      try {
        datosActualizacion.hor_ini_eve = convertirHoraADate(data.hor_ini_eve);
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: `Error en hora de inicio: ${error.message}` 
        });
      }
    }
    
    if (data.hor_fin_eve) {
      try {
        datosActualizacion.hor_fin_eve = convertirHoraADate(data.hor_fin_eve);
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: `Error en hora de fin: ${error.message}` 
        });
      }
    }

    // Resto de validaciones...
    if (data.are_eve) {
      const areasValidas = ['PRACTICA', 'INVESTIGACION', 'ACADEMICA', 'TECNICA', 'INDUSTRIAL', 'EMPRESARIAL', 'IA', 'REDES'];
      if (!areasValidas.includes(data.are_eve)) {
        return res.status(400).json({ 
          success: false, 
          message: `Área inválida. Valores permitidos: ${areasValidas.join(', ')}` 
        });
      }
      datosActualizacion.are_eve = data.are_eve;
    }
    
    if (data.tipo_audiencia_eve) {
      const audienciasValidas = ['CARRERA_ESPECIFICA', 'TODAS_CARRERAS', 'PUBLICO_GENERAL'];
      if (!audienciasValidas.includes(data.tipo_audiencia_eve)) {
        return res.status(400).json({ 
          success: false, 
          message: `Tipo de audiencia inválido. Valores permitidos: ${audienciasValidas.join(', ')}` 
        });
      }
      datosActualizacion.tipo_audiencia_eve = data.tipo_audiencia_eve;
    }

    // Validar referencias
    if (data.id_cat_eve) {
      const categoria = await prisma.categoriaEvento.findUnique({ 
        where: { id_cat: data.id_cat_eve } 
      });
      if (!categoria) {
        return res.status(400).json({ 
          success: false, 
          message: 'Categoría inválida' 
        });
      }
      datosActualizacion.id_cat_eve = data.id_cat_eve;
    }

    if (data.ced_org_eve) {
      const organizador = await prisma.organizador.findUnique({ 
        where: { ced_org: data.ced_org_eve } 
      });
      if (!organizador) {
        return res.status(400).json({ 
          success: false, 
          message: 'Organizador inválido' 
        });
      }
      datosActualizacion.ced_org_eve = data.ced_org_eve;
    }

    const eventoActualizado = await prisma.evento.update({ 
      where: { id_eve: id }, 
      data: datosActualizacion,
      include: {
        categoria: true,
        organizador: true
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Evento actualizado correctamente', 
      evento: {
        ...eventoActualizado,
        hora_inicio: formatearHora(eventoActualizado.hor_ini_eve),
        hora_fin: formatearHora(eventoActualizado.hor_fin_eve)
      }
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un evento con estos datos únicos' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
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
        eventosPorCarrera: {
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
            inscripciones: true
          }
        }
      },
      orderBy: {
        fec_ini_eve: 'desc'
      }
    });

    const eventosFormateados = eventos.map(evento => ({
      ...evento,
      organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
      categoria_nombre: evento.categoria.nom_cat,
      carreras: evento.eventosPorCarrera.map(epc => ({
        id: epc.carrera.id_car,
        nombre: epc.carrera.nom_car
      })),
      total_inscripciones: evento._count.inscripciones,
      hora_inicio: formatearHora(evento.hor_ini_eve),
      hora_fin: formatearHora(evento.hor_fin_eve)
    }));

    res.json({ 
      success: true, 
      eventos: eventosFormateados 
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

const obtenerEventoPorId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const evento = await prisma.evento.findUnique({
      where: { id_eve: id },
      include: {
        categoria: true,
        organizador: true,
        eventosPorCarrera: {
          include: {
            carrera: true
          }
        },
        inscripciones: {
          include: {
            usuario: {
              select: {
                nom_usu1: true,
                ape_usu1: true,
                cor_usu: true
              }
            }
          }
        },
        _count: {
          select: {
            inscripciones: true
          }
        }
      }
    });
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      evento: {
        ...evento,
        organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
        categoria_nombre: evento.categoria.nom_cat,
        carreras: evento.eventosPorCarrera.map(epc => ({
          id: epc.carrera.id_car,
          nombre: epc.carrera.nom_car
        })),
        total_inscripciones: evento._count.inscripciones,
        hora_inicio: formatearHora(evento.hor_ini_eve),
        hora_fin: formatearHora(evento.hor_fin_eve)
      }
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

const eliminarEvento = async (req, res) => {
  const { id } = req.params;
  
  try {
    const evento = await prisma.evento.findUnique({ 
      where: { id_eve: id },
      include: {
        _count: {
          select: {
            inscripciones: true,
            eventosPorCarrera: true
          }
        }
      }
    });
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    if (evento._count.inscripciones > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar el evento. Tiene ${evento._count.inscripciones} inscripciones asociadas.` 
      });
    }

    await prisma.$transaction(async (tx) => {
      if (evento._count.eventosPorCarrera > 0) {
        await tx.eventoPorCarrera.deleteMany({
          where: { id_eve_per: id }
        });
      }
      
      await tx.evento.delete({ 
        where: { id_eve: id } 
      });
    });
    
    res.json({ 
      success: true, 
      message: 'Evento eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Obtener eventos disponibles para inscribirse (excluyendo los que ya tiene inscripción)
const obtenerEventosDisponibles = async (req, res) => {
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

    // Obtener IDs de eventos donde el usuario ya está inscrito
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_usu_ins: userId },
      select: { id_eve_ins: true }
    });

    const eventosInscritosIds = inscripciones.map(ins => ins.id_eve_ins);

    // Construir filtros de eventos disponibles según rol y carrera
    let eventosFilter = {
      id_eve: {
        notIn: eventosInscritosIds
      }
    };

    // Aplicar filtros según el rol del usuario
    if (rol === 'USUARIO') {
      // Los usuarios externos solo pueden ver eventos de público general
      eventosFilter.tipo_audiencia_eve = 'PUBLICO_GENERAL';
    } else if (rol === 'ESTUDIANTE') {
      if (!carreraId) {
        // Si es estudiante pero no tiene carrera asignada, solo eventos públicos
        eventosFilter.tipo_audiencia_eve = 'PUBLICO_GENERAL';
      } else {
        // Si es estudiante con carrera, puede ver:
        // 1. Eventos públicos generales
        // 2. Eventos para todas las carreras
        // 3. Eventos específicos para su carrera
        eventosFilter.OR = [
          { tipo_audiencia_eve: 'PUBLICO_GENERAL' },
          { tipo_audiencia_eve: 'TODAS_CARRERAS' },
          {
            AND: [
              { tipo_audiencia_eve: 'CARRERA_ESPECIFICA' },
              {
                eventosPorCarrera: {
                  some: {
                    id_car_per: carreraId
                  }
                }
              }
            ]
          }
        ];
      }
    }
    // Los administradores pueden ver todos los eventos (sin filtros adicionales)

    // Obtener eventos con filtros aplicados
    const eventos = await prisma.evento.findMany({
      where: eventosFilter,
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
        eventosPorCarrera: {
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
            inscripciones: true
          }
        }
      },
      orderBy: {
        fec_ini_eve: 'desc'
      }
    });

    const eventosFormateados = eventos.map(evento => ({
      ...evento,
      organizador_nombre: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
      categoria_nombre: evento.categoria.nom_cat,
      carreras: evento.eventosPorCarrera.map(epc => ({
        id: epc.carrera.id_car,
        nombre: epc.carrera.nom_car
      })),
      total_inscripciones: evento._count.inscripciones,
      hora_inicio: formatearHora(evento.hor_ini_eve),
      hora_fin: formatearHora(evento.hor_fin_eve)
    }));

    res.json({ 
      success: true, 
      eventos: eventosFormateados 
    });
  } catch (error) {
    console.error('Error al obtener eventos disponibles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Obtener mis eventos (donde estoy inscrito)
const obtenerMisEventos = async (req, res) => {
  const userId = req.uid;

  try {
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_usu_ins: userId },
      include: {
        evento: {
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
            eventosPorCarrera: {
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
                inscripciones: true
              }
            }
          }
        }
      },
      orderBy: {
        fec_ins: 'desc'
      }
    });

    const eventosFormateados = inscripciones.map(inscripcion => ({
      ...inscripcion.evento,
      organizador_nombre: `${inscripcion.evento.organizador.nom_org1} ${inscripcion.evento.organizador.ape_org1}`,
      categoria_nombre: inscripcion.evento.categoria.nom_cat,
      carreras: inscripcion.evento.eventosPorCarrera.map(epc => ({
        id: epc.carrera.id_car,
        nombre: epc.carrera.nom_car
      })),
      total_inscripciones: inscripcion.evento._count.inscripciones,
      hora_inicio: formatearHora(inscripcion.evento.hor_ini_eve),
      hora_fin: formatearHora(inscripcion.evento.hor_fin_eve),
      // Agregar información de la inscripción
      estado_inscripcion: inscripcion.estado_pago,
      fecha_inscripcion: inscripcion.fec_ins,
      metodo_pago: inscripcion.met_pag_ins,
      valor_pagado: inscripcion.val_ins,
      enlace_pago: inscripcion.enl_ord_pag_ins,
      fecha_aprobacion: inscripcion.fec_aprobacion
    }));

    res.json({ 
      success: true, 
      eventos: eventosFormateados 
    });
  } catch (error) {
    console.error('Error al obtener mis eventos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento,
  obtenerEventosDisponibles,
  obtenerMisEventos
};
