import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { DIContainer } from "../../infrastructure/DIContainer";

// Crear instancia del controlador con inyección de dependencias
const diContainer = DIContainer.getInstance();
const categoryController = new CategoryController(diContainer);

const router = Router();

/**
 * Rutas para gestión de categorías
 * Siguiendo principios RESTful y Clean Architecture
 */

// GET /api/categorias - Obtener todas las categorías
router.get("/", categoryController.getCategorias.bind(categoryController));

// GET /api/categorias/:id - Obtener categoría por ID
router.get(
  "/:id",
  categoryController.getCategoriaById.bind(categoryController)
);

// POST /api/categorias - Crear nueva categoría (Admin only)
router.post("/", categoryController.createCategoria.bind(categoryController));

// PUT /api/categorias/:id - Actualizar categoría (Admin only)
router.put("/:id", categoryController.updateCategoria.bind(categoryController));

// DELETE /api/categorias/:id - Eliminar categoría (Admin only)
router.delete(
  "/:id",
  categoryController.deleteCategoria.bind(categoryController)
);

// GET /api/categorias/:id/eventos - Obtener eventos de una categoría
router.get(
  "/:id/eventos",
  categoryController.getEventosByCategoria.bind(categoryController)
);

// GET /api/categorias/:id/cursos - Obtener cursos de una categoría
router.get(
  "/:id/cursos",
  categoryController.getCursosByCategoria.bind(categoryController)
);

export { router as categoryRoutes };
