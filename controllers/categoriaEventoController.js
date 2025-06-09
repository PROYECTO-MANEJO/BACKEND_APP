const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearCategoria = async (req, res) => {
  try {
    // ✅ CAMPOS CORREGIDOS: Solo nom_cat y des_cat
    const { nom_cat, des_cat } = req.body;

    if (!nom_cat || !des_cat) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y descripción de la categoría son obligatorios' 
      });
    }

    const nuevaCategoria = await prisma.categoriaEvento.create({
      data: {
        nom_cat: nom_cat.trim(),
        des_cat: des_cat.trim()
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Categoría creada correctamente', 
      categoria: nuevaCategoria 
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener todas las categorías con estadísticas
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoriaEvento.findMany({
      include: {
        _count: {
          select: {
            eventos: true,
            cursos: true
          }
        }
      }
    });
    
    res.json({ success: true, categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Actualizar una categoría
const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nom_cat, des_cat } = req.body;
  
  try {
    const categoria = await prisma.categoriaEvento.findUnique({ 
      where: { id_cat: id } 
    });
    
    if (!categoria) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoría no encontrada' 
      });
    }

    const actualizada = await prisma.categoriaEvento.update({ 
      where: { id_cat: id }, 
      data: {
        ...(nom_cat && { nom_cat: nom_cat.trim() }),
        ...(des_cat && { des_cat: des_cat.trim() })
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Categoría actualizada correctamente', 
      categoria: actualizada 
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si existe
    const categoria = await prisma.categoriaEvento.findUnique({ 
      where: { id_cat: id },
      include: {
        _count: {
          select: {
            eventos: true,
            cursos: true
          }
        }
      }
    });
    
    if (!categoria) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoría no encontrada' 
      });
    }

    // Verificar si tiene eventos o cursos asociados
    if (categoria._count.eventos > 0 || categoria._count.cursos > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar la categoría. Tiene ${categoria._count.eventos} eventos y ${categoria._count.cursos} cursos asociados.` 
      });
    }

    await prisma.categoriaEvento.delete({ where: { id_cat: id } });
    
    res.json({ 
      success: true, 
      message: 'Categoría eliminada correctamente' 
    });
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
