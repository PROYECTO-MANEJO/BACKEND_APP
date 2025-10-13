import { Router } from "express";
import { HomepageController } from "../controllers/HomepageController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";
import multer from "multer";

// Configuración de multer para imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen") as any, false);
    }
  },
});

// Crear instancia del controlador con inyección de dependencias
const diContainer = DIContainer.getInstance();
const homepageController = new HomepageController(diContainer);

/**
 * Configuración de rutas para la página principal
 * Siguiendo principios RESTful y Clean Architecture
 */
const router = Router();

// GET /api/homepage - Obtener contenido de la página principal
router.get("/", homepageController.getContent.bind(homepageController));

// PUT /api/homepage - Actualizar contenido de la página principal (Solo administradores)
router.put(
  "/",
  validateJWT,
  homepageController.updateContent.bind(homepageController)
);

// POST /api/homepage/images - Subir imagen (Solo administradores)
router.post(
  "/images",
  validateJWT,
  upload.single("image"),
  homepageController.uploadImage.bind(homepageController)
);

// GET /api/homepage/images/:imageId - Obtener imagen específica
router.get(
  "/images/:imageId",
  homepageController.getImage.bind(homepageController)
);

// GET /api/homepage/public-content - Obtener contenido público
router.get(
  "/public-content",
  homepageController.getPublicContent.bind(homepageController)
);

// GET /api/homepage/external-content - Obtener contenido para usuarios externos
router.get(
  "/external-content",
  homepageController.getExternalContent.bind(homepageController)
);

// GET /api/homepage/student-content - Contenido específico para estudiantes
router.get(
  "/student-content",
  homepageController.getStudentContent.bind(homepageController)
);

// Rutas legacy para compatibilidad con versión anterior
router.get("/content", homepageController.getContent.bind(homepageController));
router.put(
  "/content",
  validateJWT,
  homepageController.updateContent.bind(homepageController)
);
router.get(
  "/image/:imageType",
  homepageController.getImage.bind(homepageController)
);
router.post(
  "/image/:imageType",
  validateJWT,
  upload.single("image"),
  homepageController.uploadImage.bind(homepageController)
);
router.get(
  "/legacy/public-content",
  homepageController.getPublicContent.bind(homepageController)
);
router.get(
  "/legacy/external-content",
  homepageController.getExternalContent.bind(homepageController)
);

export { router as homepageRoutes };
