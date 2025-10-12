"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRoutes = exports.PasswordRecoveryRoutes = exports.AuthRoutes = exports.UserRoutes = exports.AppRoutes = exports.apiRoutes = void 0;
const express_1 = require("express");
const appRoutes_1 = require("./appRoutes");
// Crear router principal
const router = (0, express_1.Router)();
exports.apiRoutes = router;
// Rutas refactorizadas (Clean Architecture)
const appRoutes = new appRoutes_1.AppRoutes();
router.use("/", appRoutes.getRouter());
// Exportar clases de rutas individuales para uso directo
var appRoutes_2 = require("./appRoutes");
Object.defineProperty(exports, "AppRoutes", { enumerable: true, get: function () { return appRoutes_2.AppRoutes; } });
var userRoutes_1 = require("./userRoutes");
Object.defineProperty(exports, "UserRoutes", { enumerable: true, get: function () { return userRoutes_1.UserRoutes; } });
var authRoutes_1 = require("./authRoutes");
Object.defineProperty(exports, "AuthRoutes", { enumerable: true, get: function () { return authRoutes_1.AuthRoutes; } });
var passwordRecoveryRoutes_1 = require("./passwordRecoveryRoutes");
Object.defineProperty(exports, "PasswordRecoveryRoutes", { enumerable: true, get: function () { return passwordRecoveryRoutes_1.PasswordRecoveryRoutes; } });
var verificationRoutes_1 = require("./verificationRoutes");
Object.defineProperty(exports, "VerificationRoutes", { enumerable: true, get: function () { return verificationRoutes_1.VerificationRoutes; } });
//# sourceMappingURL=index.js.map