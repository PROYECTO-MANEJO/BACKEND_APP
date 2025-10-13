"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
/**
 * Enum para roles de usuario
 * Principio OCP: Fácil de extender con nuevos roles
 */
var UserRole;
(function (UserRole) {
    UserRole["ESTUDIANTE"] = "ESTUDIANTE";
    UserRole["USUARIO"] = "USUARIO";
    UserRole["ADMINISTRADOR"] = "ADMINISTRADOR";
    UserRole["ORGANIZADOR"] = "ORGANIZADOR";
    UserRole["MASTER"] = "MASTER";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=User.js.map