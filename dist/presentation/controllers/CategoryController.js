"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
class CategoryController {
    constructor(container) {
        this.container = container;
        this.categoryRepository = container.getCategoryRepository();
    }
    /**
     * GET /api/categorias
     * Obtener todas las categorías
     */
    async getCategorias(req, res) {
        try {
            const categorias = await this.categoryRepository.findAll();
            res.json({
                success: true,
                categorias: categorias.map((cat) => ({
                    id_cat: cat.id,
                    nom_cat: cat.name,
                    des_cat: cat.description,
                })),
            });
        }
        catch (error) {
            console.error("[getCategorias] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
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
            if (!nom_cat) {
                res.status(400).json({
                    success: false,
                    message: "El nombre de la categoría es obligatorio",
                });
                return;
            }
            // Verificar si ya existe una categoría con ese nombre
            const existingCategories = await this.categoryRepository.findByName(nom_cat.trim());
            if (existingCategories.length > 0) {
                res.status(400).json({
                    success: false,
                    message: "Ya existe una categoría con ese nombre",
                });
                return;
            }
            // Crear objeto del dominio para la nueva categoría
            const categoryData = {
                name: nom_cat.trim(),
                description: des_cat?.trim() || "",
            };
            const nuevaCategoria = await this.categoryRepository.create(categoryData);
            res.status(201).json({
                success: true,
                message: "Categoría creada exitosamente",
                categoria: {
                    id_cat: nuevaCategoria.id,
                    nom_cat: nuevaCategoria.name,
                    des_cat: nuevaCategoria.description,
                },
            });
        }
        catch (error) {
            console.error("[createCategoria] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/categorias/:id
     * Obtener categoría por ID
     */
    async getCategoriaById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría es requerido",
                });
                return;
            }
            const categoryId = parseInt(id);
            if (isNaN(categoryId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría debe ser un número válido",
                });
                return;
            }
            const categoria = await this.categoryRepository.findById(id);
            if (!categoria) {
                res.status(404).json({
                    success: false,
                    message: "Categoría no encontrada",
                });
                return;
            }
            res.json({
                success: true,
                categoria: {
                    id_cat: categoria.id,
                    nom_cat: categoria.name,
                    des_cat: categoria.description,
                },
            });
        }
        catch (error) {
            console.error("[getCategoriaById] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * PUT /api/categorias/:id
     * Actualizar categoría (Admin only)
     */
    async updateCategoria(req, res) {
        try {
            const { id } = req.params;
            const { nom_cat, des_cat } = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría es requerido",
                });
                return;
            }
            const categoryId = parseInt(id);
            if (isNaN(categoryId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría debe ser un número válido",
                });
                return;
            }
            // Verificar que la categoría existe
            const existingCategory = await this.categoryRepository.findById(id);
            if (!existingCategory) {
                res.status(404).json({
                    success: false,
                    message: "Categoría no encontrada",
                });
                return;
            }
            // Crear objeto de actualización
            const updateData = {};
            if (nom_cat !== undefined) {
                // Verificar si ya existe otra categoría con ese nombre
                const categoriesWithName = await this.categoryRepository.findByName(nom_cat.trim());
                const duplicateCategory = categoriesWithName.find((cat) => cat.id !== parseInt(id));
                if (duplicateCategory) {
                    res.status(400).json({
                        success: false,
                        message: "Ya existe una categoría con ese nombre",
                    });
                    return;
                }
                updateData.name = nom_cat.trim();
            }
            if (des_cat !== undefined)
                updateData.description = des_cat?.trim() || "";
            const categoriaActualizada = await this.categoryRepository.update(id, updateData);
            if (!categoriaActualizada) {
                res.status(500).json({
                    success: false,
                    message: "Error al actualizar la categoría",
                });
                return;
            }
            res.json({
                success: true,
                message: "Categoría actualizada exitosamente",
                categoria: {
                    id_cat: categoriaActualizada.id,
                    nom_cat: categoriaActualizada.name,
                    des_cat: categoriaActualizada.description,
                },
            });
        }
        catch (error) {
            console.error("[updateCategoria] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * DELETE /api/categorias/:id
     * Eliminar categoría (Admin only)
     */
    async deleteCategoria(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría es requerido",
                });
                return;
            }
            // Verificar que la categoría existe
            const existingCategory = await this.categoryRepository.findById(id);
            if (!existingCategory) {
                res.status(404).json({
                    success: false,
                    message: "Categoría no encontrada",
                });
                return;
            }
            // Verificar si la categoría puede ser eliminada (no tiene eventos o cursos asociados)
            const canBeDeleted = await this.categoryRepository.canBeDeleted(id);
            if (!canBeDeleted) {
                res.status(400).json({
                    success: false,
                    message: "No se puede eliminar la categoría porque tiene eventos o cursos asociados",
                });
                return;
            }
            await this.categoryRepository.delete(id);
            res.json({
                success: true,
                message: "Categoría eliminada exitosamente",
            });
        }
        catch (error) {
            console.error("[deleteCategoria] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/categorias/:id/eventos
     * Obtener eventos asociados a una categoría
     */
    async getEventosByCategoria(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría es requerido",
                });
                return;
            }
            // Verificar que la categoría existe
            const categoria = await this.categoryRepository.findById(id);
            if (!categoria) {
                res.status(404).json({
                    success: false,
                    message: "Categoría no encontrada",
                });
                return;
            }
            const eventos = await this.categoryRepository.findEventsById(id);
            res.json({
                success: true,
                categoria: {
                    id_cat: categoria.id,
                    nom_cat: categoria.name,
                },
                eventos,
            });
        }
        catch (error) {
            console.error("[getEventosByCategoria] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/categorias/:id/cursos
     * Obtener cursos asociados a una categoría
     */
    async getCursosByCategoria(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de categoría es requerido",
                });
                return;
            }
            // Verificar que la categoría existe
            const categoria = await this.categoryRepository.findById(id);
            if (!categoria) {
                res.status(404).json({
                    success: false,
                    message: "Categoría no encontrada",
                });
                return;
            }
            const cursos = await this.categoryRepository.findCoursesById(id);
            res.json({
                success: true,
                categoria: {
                    id_cat: categoria.id,
                    nom_cat: categoria.name,
                },
                cursos,
            });
        }
        catch (error) {
            console.error("[getCursosByCategoria] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map