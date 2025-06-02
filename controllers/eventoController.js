const { PrismaClient, AreaEvento, TipoAudienciaEvento } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo evento
const crearEvento = async (req, res) => {
  try {
    const {
      nom_eve, des_eve, id_cat_eve,
      fec_ini_eve, fec_fin_eve,
      hor_ini_eve, hor_fin_eve,
      dur_eve, are_eve, ubi_eve,
      ced_org_eve, capacidad_max_eve,
      tipo_audiencia_eve
    } = req.body;

    if (!nom_eve || !des_eve || !id_cat_eve || !fec_ini_eve || !hor_ini_eve ||
        !dur_eve || !are_eve || !ubi_eve || !ced_org_eve ||
        !capacidad_max_eve || !tipo_audiencia_eve) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const categoria = await prisma.categoriaEvento.findUnique({ where: { id_cat: id_cat_eve } });
    if (!categoria) return res.status(400).json({ success: false, message: 'Categoría inválida' });

    const organizador = await prisma.organizador.findUnique({ where: { ced_org: ced_org_eve } });
    if (!organizador) return res.status(400).json({ success: false, message: 'Organizador inválido' });

    if (!Object.values(AreaEvento).includes(are_eve)) return res.status(400).json({ success: false, message: 'Área inválida' });
    if (!Object.values(TipoAudienciaEvento).includes(tipo_audiencia_eve)) return res.status(400).json({ success: false, message: 'Tipo audiencia inválido' });

    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        id_cat_eve,
        fec_ini_eve: new Date(fec_ini_eve),
        fec_fin_eve: fec_fin_eve ? new Date(fec_fin_eve) : null,
        hor_ini_eve: new Date(hor_ini_eve),
        hor_fin_eve: hor_fin_eve ? new Date(hor_fin_eve) : null,
        dur_eve: parseInt(dur_eve),
        are_eve,
        ubi_eve,
        ced_org_eve,
        capacidad_max_eve: parseInt(capacidad_max_eve),
        tipo_audiencia_eve
      }
    });

    res.status(201).json({ success: true, message: 'Evento creado correctamente', evento: nuevoEvento });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        categoria: true,
        organizador: true
      },
      orderBy: { fec_ini_eve: 'desc' }
    });

    res.json({ success: true, eventos });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener evento por ID
const obtenerEventoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await prisma.evento.findUnique({
      where: { id_eve: id },
      include: {
        categoria: true,
        organizador: true
      }
    });

    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    res.json({ success: true, evento });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Actualizar evento
const actualizarEvento = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const evento = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    if (data.id_cat_eve) {
      const cat = await prisma.categoriaEvento.findUnique({ where: { id_cat: data.id_cat_eve } });
      if (!cat) return res.status(400).json({ success: false, message: 'Categoría inválida' });
    }

    if (data.ced_org_eve) {
      const org = await prisma.organizador.findUnique({ where: { ced_org: data.ced_org_eve } });
      if (!org) return res.status(400).json({ success: false, message: 'Organizador inválido' });
    }

    const eventoActualizado = await prisma.evento.update({ where: { id_eve: id }, data });
    res.json({ success: true, message: 'Evento actualizado', evento: eventoActualizado });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar evento
const eliminarEvento = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    await prisma.evento.delete({ where: { id_eve: id } });
    res.json({ success: true, message: 'Evento eliminado' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento
};
