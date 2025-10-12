#!/usr/bin/env node
"use strict";
/**
 * Punto de entrada temporal que inicia el servidor legacy
 * Mientras se completa la implementación de Clean Architecture
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
console.log("🚀 ========================================");
console.log("🚀 Backend API - Modo Híbrido");
console.log("🚀 ========================================");
console.log(`🚀 Node.js: ${process.version}`);
console.log(`🚀 Ambiente: ${process.env.NODE_ENV || "development"}`);
console.log(`🚀 Puerto: ${process.env.PORT || "3000"}`);
console.log("🚀 ========================================");
console.log("⚠️  NOTA: Usando servidor legacy temporalmente");
console.log("   La refactorización Clean Architecture está");
console.log("   parcialmente implementada en src/");
console.log("🚀 ========================================");
// Iniciar servidor legacy
require("../index.js");
//# sourceMappingURL=main_hybrid.js.map