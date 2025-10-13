"use strict";
// Exportar todos los controladores
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = exports.CertificateController = exports.EventController = exports.CourseController = exports.AuthController = exports.UserController = exports.BaseController = void 0;
const tslib_1 = require("tslib");
var BaseController_1 = require("./BaseController");
Object.defineProperty(exports, "BaseController", { enumerable: true, get: function () { return BaseController_1.BaseController; } });
var UserController_1 = require("./UserController");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return UserController_1.UserController; } });
var AuthController_1 = require("./AuthController");
Object.defineProperty(exports, "AuthController", { enumerable: true, get: function () { return AuthController_1.AuthController; } });
var CourseController_1 = require("./CourseController");
Object.defineProperty(exports, "CourseController", { enumerable: true, get: function () { return CourseController_1.CourseController; } });
var EventController_1 = require("./EventController");
Object.defineProperty(exports, "EventController", { enumerable: true, get: function () { return EventController_1.EventController; } });
var CertificateController_1 = require("./CertificateController");
Object.defineProperty(exports, "CertificateController", { enumerable: true, get: function () { return CertificateController_1.CertificateController; } });
var AdminController_1 = require("./AdminController");
Object.defineProperty(exports, "AdminController", { enumerable: true, get: function () { return AdminController_1.AdminController; } });
// Exportar tipos de DTOs
tslib_1.__exportStar(require("../dto/UserDTO"), exports);
tslib_1.__exportStar(require("../dto/CourseDTO"), exports);
tslib_1.__exportStar(require("../dto/CertificateDTO"), exports);
//# sourceMappingURL=index.js.map