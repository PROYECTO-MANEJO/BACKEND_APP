"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageRoutes = void 0;
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
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});
class HomepageRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.homepageController = new HomepageController_1.HomepageController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route GET /homepage/content
         * @description Obtener contenido de la página principal
         * @access Public
         */
        this.router.get("/content", this.homepageController.getContent.bind(this.homepageController));
        /**
         * @route PUT /homepage/content
         * @description Actualizar contenido de la página principal
         * @access Private (Admin, Master)
         */
        this.router.put("/content", jwtMiddleware_1.validateJWT, this.homepageController.updateContent.bind(this.homepageController));
        /**
         * @route POST /homepage/image/:imageType
         * @description Subir imagen específica
         * @access Private (Admin, Master)
         */
        this.router.post("/image/:imageType", jwtMiddleware_1.validateJWT, upload.single('imagen'), this.homepageController.uploadImage.bind(this.homepageController));
        /**
         * @route GET /homepage/image/:imageType
         * @description Obtener imagen específica
         * @access Public
         */
        this.router.get("/image/:imageType", this.homepageController.getImage.bind(this.homepageController));
        /**
         * @route GET /homepage/public-content
         * @description Obtener eventos y cursos para usuarios no autenticados
         * @access Public
         */
        this.router.get("/public-content", this.homepageController.getPublicContent.bind(this.homepageController));
        /**
         * @route GET /homepage/student-content
         * @description Obtener eventos y cursos para estudiantes (por carrera)
         * @access Private (Estudiantes)
         */
        this.router.get("/student-content", jwtMiddleware_1.validateJWT, this.homepageController.getStudentContent.bind(this.homepageController));
        /**
         * @route GET /homepage/external-content
         * @description Obtener eventos y cursos para usuarios externos (solo públicos)
         * @access Public
         */
        this.router.get("/external-content", this.homepageController.getExternalContent.bind(this.homepageController));
    }
    getRouter() {
        return this.router;
    }
}
exports.HomepageRoutes = HomepageRoutes;
//# sourceMappingURL=homepageRoutes.js.map