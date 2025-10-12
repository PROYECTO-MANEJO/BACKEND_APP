#!/usr/bin/env node

/**
 * Punto de entrada principal de la aplicación
 * Backend API con Clean Architecture
 */

import dotenv from "dotenv";
import { Server } from "./Server";

// Cargar variables de entorno
dotenv.config();

/**
 * Función principal para iniciar la aplicación
 */
async function main(): Promise<void> {
  try {
    // Configuración del puerto
    const port = parseInt(process.env.PORT || "3000", 10);

    // Validar configuración mínima
    validateEnvironment();

    // Crear e iniciar servidor
    const server = new Server(port);
    await server.start();
  } catch (error) {
    console.error("❌ Error fatal al iniciar la aplicación:", error);
    process.exit(1);
  }
}

/**
 * Validar variables de entorno críticas
 */
function validateEnvironment(): void {
  const requiredEnvVars = ["DATABASE_URL"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("❌ Variables de entorno faltantes:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n💡 Crea un archivo .env con las variables requeridas");
    process.exit(1);
  }

  console.log("✅ Variables de entorno validadas correctamente");
}

/**
 * Mostrar información de la aplicación
 */
console.log("🚀 ========================================");
console.log("🚀 Backend API - Clean Architecture");
console.log("🚀 ========================================");
console.log(`🚀 Node.js: ${process.version}`);
console.log(`🚀 Ambiente: ${process.env.NODE_ENV || "development"}`);
console.log(`🚀 Puerto configurado: ${process.env.PORT || "3000"}`);
console.log("🚀 ========================================");

// Ejecutar aplicación principal
main().catch((error) => {
  console.error("❌ Error en función main:", error);
  process.exit(1);
});
