"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homepageRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const HomepageController_1 = require("../controllers/HomepageController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
const multer_1 = tslib_1.__importDefault(require("multer"));
// Configuración de multer para imágenes
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Solo se permiten archivos de imagen"), false);
        }
    },
});
// Crear instancia del controlador con inyección de dependencias
const diContainer = DIContainer_1.DIContainer.getInstance();
const homepageController = new HomepageController_1.HomepageController(diContainer);
/**
 * Configuración de rutas para la página principal
 * Siguiendo principios RESTful y Clean Architecture
 */
const router = (0, express_1.Router)();
exports.homepageRoutes = router;
// GET /api/homepage - Obtener contenido de la página principal
router.get("/", homepageController.getContent.bind(homepageController));
// PUT /api/homepage - Actualizar contenido de la página principal (Solo administradores)
router.put("/", jwtMiddleware_1.validateJWT, homepageController.updateContent.bind(homepageController));
// POST /api/homepage/images - Subir imagen (Solo administradores)
router.post("/images", jwtMiddleware_1.validateJWT, upload.single("image"), homepageController.uploadImage.bind(homepageController));
// GET /api/homepage/images/:imageId - Obtener imagen específica
router.get("/images/:imageId", homepageController.getImage.bind(homepageController));
// GET /api/homepage/public-content - Obtener contenido público
router.get("/public-content", homepageController.getPublicContent.bind(homepageController));
// GET /api/homepage/external-content - Obtener contenido para usuarios externos
router.get("/external-content", homepageController.getExternalContent.bind(homepageController));
// GET /api/homepage/student-content - Contenido específico para estudiantes
router.get("/student-content", homepageController.getStudentContent.bind(homepageController));
// Rutas legacy para compatibilidad con versión anterior
router.get("/content", homepageController.getContent.bind(homepageController));
router.put("/content", jwtMiddleware_1.validateJWT, homepageController.updateContent.bind(homepageController));
router.get("/image/:imageType", homepageController.getImage.bind(homepageController));
router.post("/image/:imageType", jwtMiddleware_1.validateJWT, upload.single("image"), homepageController.uploadImage.bind(homepageController));
router.get("/legacy/public-content", homepageController.getPublicContent.bind(homepageController));
router.get("/legacy/external-content", homepageController.getExternalContent.bind(homepageController));
//# sourceMappingURL=homepageRoutes.js.map