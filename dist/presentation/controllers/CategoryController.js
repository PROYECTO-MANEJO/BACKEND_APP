"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
class CategoryController {
    constructor(container) {
        this.container = container;
    }
    /**
     * GET /api/categorias
     * Obtener todas las categorías
     */
    async getCategorias(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            const categorias = await prisma.categoriaEvento.findMany({
                orderBy: { nom_cat: 'asc' }
            });
            res.json({
                success: true,
                categorias: categorias.map((cat) => ({
                    id_cat: cat.id_cat,
                    nom_cat: cat.nom_cat,
                    des_cat: cat.des_cat
                }))
            });
        }
        catch (error) {
            console.error('[getCategorias] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/categorias
     * Crear nueva categoría (Admin only)
     */
    async createCategoria(req, res) {
        try {
            const { nom_cat, des_cat } = req.body;
            const prisma = this.container.getPrismaClient();
            if (!nom_cat) {
                res.status(400).json({
                    success: false,
                    message: 'El nombre de la categoría es obligatorio'
                });
                return;
            }
            const nuevaCategoria = await prisma.categoriaEvento.create({
                data: {
                    nom_cat: nom_cat.trim(),
                    des_cat: des_cat?.trim() || null
                }
            });
            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                categoria: nuevaCategoria
            });
        }
        catch (error) {
            console.error('[createCategoria] Error:', error);
            if (error.code === 'P2002') {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map