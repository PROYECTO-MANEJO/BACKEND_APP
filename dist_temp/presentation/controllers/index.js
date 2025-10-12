"use strict";
// Exportar todos los controladores
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = exports.EventController = exports.CourseController = exports.AuthController = exports.UserController = exports.BaseController = void 0;
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
// Exportar tipos de DTOs
__exportStar(require("../dto/UserDTO"), exports);
__exportStar(require("../dto/CourseDTO"), exports);
__exportStar(require("../dto/CertificateDTO"), exports);
