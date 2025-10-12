#!/usr/bin/env node

/**
 * Punto de entrada temporal que inicia el servidor legacy
 * Mientras se completa la implementación de Clean Architecture
 */

import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

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
