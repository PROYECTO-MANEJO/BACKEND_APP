#!/usr/bin/env node

// Script para verificar la configuración de GitHub
require('dotenv').config();

console.log('🔍 Verificando configuración de GitHub...\n');

const requiredVars = [
  'GITHUB_TOKEN',
  'GITHUB_DEFAULT_OWNER', 
  'GITHUB_REPO_FRONTEND',
  'GITHUB_REPO_BACKEND'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allConfigured = false;
  } else {
    // Ocultar token por seguridad
    const displayValue = varName === 'GITHUB_TOKEN' 
      ? `ghp_${'*'.repeat(36)}` 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allConfigured) {
  console.log('✅ ¡CONFIGURACIÓN COMPLETA!');
  console.log('GitHub debería funcionar correctamente.');
  console.log('\n🚀 Reinicia el servidor backend:');
  console.log('   npm restart');
  console.log('   # o');
  console.log('   node index.js');
} else {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  console.log('\n📋 Pasos para completar:');
  console.log('1. Crea un archivo .env en la carpeta BACKEND_APP/');
  console.log('2. Agrega las variables faltantes');
  console.log('3. Consulta el archivo GITHUB_SETUP.md para más detalles');
  console.log('\n🔧 Ejemplo de .env:');
  console.log('GITHUB_TOKEN=ghp_1234567890abcdef...');
  console.log('GITHUB_DEFAULT_OWNER=tu_usuario_github');
  console.log('GITHUB_REPO_FRONTEND=FRONTEND_APP');
  console.log('GITHUB_REPO_BACKEND=BACKEND_APP');
}

console.log('\n' + '='.repeat(50)); 