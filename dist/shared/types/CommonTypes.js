"use strict";
/**
 * Tipos básicos de la aplicación
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.EntityStatus = void 0;
/**
 * Estados comunes de la aplicación
 */
var EntityStatus;
(function (EntityStatus) {
    EntityStatus["ACTIVE"] = "ACTIVE";
    EntityStatus["INACTIVE"] = "INACTIVE";
    EntityStatus["PENDING"] = "PENDING";
    EntityStatus["DELETED"] = "DELETED";
})(EntityStatus || (exports.EntityStatus = EntityStatus = {}));
/**
 * Tipos de logs
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=CommonTypes.js.map