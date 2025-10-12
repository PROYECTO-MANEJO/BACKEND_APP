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
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen') as any, false);
    }
  }
});

export class HomepageRoutes {
  private router: Router;
  private homepageController: HomepageController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.homepageController = new HomepageController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route GET /homepage/content
     * @description Obtener contenido de la página principal
     * @access Public
     */
    this.router.get(
      "/content",
      this.homepageController.getContent.bind(this.homepageController)
    );

    /**
     * @route PUT /homepage/content
     * @description Actualizar contenido de la página principal
     * @access Private (Admin, Master)
     */
    this.router.put(
      "/content",
      validateJWT,
      this.homepageController.updateContent.bind(this.homepageController)
    );

    /**
     * @route POST /homepage/image/:imageType
     * @description Subir imagen específica
     * @access Private (Admin, Master)
     */
    this.router.post(
      "/image/:imageType",
      validateJWT,
      upload.single('imagen'),
      this.homepageController.uploadImage.bind(this.homepageController)
    );

    /**
     * @route GET /homepage/image/:imageType
     * @description Obtener imagen específica
     * @access Public
     */
    this.router.get(
      "/image/:imageType",
      this.homepageController.getImage.bind(this.homepageController)
    );

    /**
     * @route GET /homepage/public-content
     * @description Obtener eventos y cursos para usuarios no autenticados
     * @access Public
     */
    this.router.get(
      "/public-content",
      this.homepageController.getPublicContent.bind(this.homepageController)
    );

    /**
     * @route GET /homepage/student-content
     * @description Obtener eventos y cursos para estudiantes (por carrera)
     * @access Private (Estudiantes)
     */
    this.router.get(
      "/student-content",
      validateJWT,
      this.homepageController.getStudentContent.bind(this.homepageController)
    );

    /**
     * @route GET /homepage/external-content
     * @description Obtener eventos y cursos para usuarios externos (solo públicos)
     * @access Public
     */
    this.router.get(
      "/external-content",
      this.homepageController.getExternalContent.bind(this.homepageController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
