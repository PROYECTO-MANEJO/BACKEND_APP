const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearCategoria = async (req, res) => {
  try {
    const { nom_cat, des_cat, pun_apr_cat, asi_cat } = req.body;

    if (!nom_cat || !des_cat || pun_apr_cat === undefined || asi_cat === undefined) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const nuevaCategoria = await prisma.categoriaEvento.create({
      data: {
        nom_cat,
        des_cat,
        pun_apr_cat: parseFloat(pun_apr_cat),
        asi_cat: parseInt(asi_cat)
      }
    });

    res.status(201).json({ success: true, message: 'Categoría creada correctamente', categoria: nuevaCategoria });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoriaEvento.findMany();
    res.json({ success: true, categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Actualizar una categoría
const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const categoria = await prisma.categoriaEvento.findUnique({ where: { id_cat: id } });
    if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    const actualizada = await prisma.categoriaEvento.update({ where: { id_cat: id }, data });
    res.json({ success: true, message: 'Categoría actualizada', categoria: actualizada });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await prisma.categoriaEvento.findUnique({ where: { id_cat: id } });
    if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    await prisma.categoriaEvento.delete({ where: { id_cat: id } });
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  crearCategoria,
  obtenerCategorias,    
  actualizarCategoria,
  eliminarCategoria
};
