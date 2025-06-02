
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo curso
const crearCurso = async (req, res) => {
  try {
    const {
      nom_cur, des_cur, dur_cur, fec_ini_cur, fec_fin_cur,
      id_cat_cur, ced_org_cur
    } = req.body;

    if (!nom_cur || !des_cur || !dur_cur || !fec_ini_cur || !fec_fin_cur || !id_cat_cur || !ced_org_cur) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const categoria = await prisma.categoriaEvento.findUnique({ where: { id_cat: id_cat_cur } });
    if (!categoria) return res.status(400).json({ success: false, message: 'Categoría inválida' });

    const organizador = await prisma.organizador.findUnique({ where: { ced_org: ced_org_cur } });   
    if (!organizador) return res.status(400).json({ success: false, message: 'Organizador inválido' });

    const nuevoCurso = await prisma.curso.create({
      data: {
        nom_cur,
        des_cur,
        dur_cur: parseInt(dur_cur),
        fec_ini_cur: new Date(fec_ini_cur),
        fec_fin_cur: new Date(fec_fin_cur),
        id_cat_cur,
        ced_org_cur
      }
    });

    res.status(201).json({ success: true, message: 'Curso creado correctamente', curso: nuevoCurso });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener todos los cursos
const obtenerCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        categoria: true,
        organizador: true
      },
      orderBy: { fec_ini_cur: 'desc' }
    });
    res.json({ success: true, cursos });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener curso por ID
const obtenerCursoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await prisma.curso.findUnique({
      where: { id_cur: id },
      include: {
        categoria: true,
        organizador: true
      }
    });

    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

    res.json({ success: true, curso });
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Actualizar curso
const actualizarCurso = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const curso = await prisma.curso.findUnique({ where: { id_cur: id } });
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

    if (data.id_cat_cur) {
      const cat = await prisma.categoriaEvento.findUnique({ where: { id_cat: data.id_cat_cur } });
      if (!cat) return res.status(400).json({ success: false, message: 'Categoría inválida' });
    }

    if (data.ced_org_cur) {
      const org = await prisma.organizador.findUnique({ where: { ced_org: data.ced_org_cur } });
      if (!org) return res.status(400).json({ success: false, message: 'Organizador inválido' });
    }

    const cursoActualizado = await prisma.curso.update({
      where: { id_cur: id },
      data
    });

    res.json({ success: true, message: 'Curso actualizado', curso: cursoActualizado });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar curso
const eliminarCurso = async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await prisma.curso.findUnique({ where: { id_cur: id } });
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

    await prisma.curso.delete({ where: { id_cur: id } });
    res.json({ success: true, message: 'Curso eliminado' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso
};
