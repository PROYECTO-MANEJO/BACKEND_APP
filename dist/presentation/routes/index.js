"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateRoutes = exports.EventRoutes = exports.CourseRoutes = exports.AuthRoutes = exports.UserRoutes = exports.AppRoutes = exports.apiRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const DIContainer_1 = require("../../infrastructure/config/DIContainer");
const verificationRoutes_1 = require("./verificationRoutes");
const passwordRecoveryRoutes_1 = require("./passwordRecoveryRoutes");
const changeRequestRoutes_1 = tslib_1.__importDefault(require("./changeRequestRoutes"));
const appRoutes_1 = require("./appRoutes");
// Crear router principal
const router = (0, express_1.Router)();
exports.apiRoutes = router;
// Obtener instancia del DIContainer
const container = DIContainer_1.DIContainer.getInstance();
// Rutas refactorizadas (Clean Architecture)
const appRoutes = new appRoutes_1.AppRoutes(container);
router.use("/", appRoutes.getRouter());
// Rutas legacy (mantener temporalmente)
router.use("/verification", verificationRoutes_1.verificationRoutes);
router.use("/password-recovery", passwordRecoveryRoutes_1.passwordRecoveryRoutes);
router.use("/", changeRequestRoutes_1.default);
// Exportar clases de rutas individuales para uso directo
var appRoutes_2 = require("./appRoutes");
Object.defineProperty(exports, "AppRoutes", { enumerable: true, get: function () { return appRoutes_2.AppRoutes; } });
var userRoutes_1 = require("./userRoutes");
Object.defineProperty(exports, "UserRoutes", { enumerable: true, get: function () { return userRoutes_1.UserRoutes; } });
var authRoutes_1 = require("./authRoutes");
Object.defineProperty(exports, "AuthRoutes", { enumerable: true, get: function () { return authRoutes_1.AuthRoutes; } });
var courseRoutes_1 = require("./courseRoutes");
Object.defineProperty(exports, "CourseRoutes", { enumerable: true, get: function () { return courseRoutes_1.CourseRoutes; } });
var eventRoutes_1 = require("./eventRoutes");
Object.defineProperty(exports, "EventRoutes", { enumerable: true, get: function () { return eventRoutes_1.EventRoutes; } });
var certificateRoutes_1 = require("./certificateRoutes");
Object.defineProperty(exports, "CertificateRoutes", { enumerable: true, get: function () { return certificateRoutes_1.CertificateRoutes; } });
//# sourceMappingURL=index.js.map