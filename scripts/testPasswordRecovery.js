const { testEmailConnection } = require('../helpers/emailService');
const { generateRecoveryToken } = require('../helpers/recoveryTokenHelper');
const bcrypt = require('bcrypt');

async function testPasswordRecoverySystem() {
  console.log('🧪 Iniciando pruebas del sistema de recuperación de contraseña...\n');

  try {
    // Test 1: Verificar configuración de email
    console.log('1️⃣ Verificando configuración de email...');
    const emailConfigValid = await testEmailConnection();
    if (emailConfigValid) {
      console.log('✅ Configuración de email correcta\n');
    } else {
      console.log('❌ Error en configuración de email\n');
      console.log('Variables de entorno requeridas:');
      console.log('- SMTP_HOST');
      console.log('- SMTP_PORT');
      console.log('- SMTP_USER');
      console.log('- SMTP_PASS');
      console.log('- SMTP_FROM');
      console.log('- FRONTEND_URL\n');
    }

    // Test 2: Verificar generación de tokens
    console.log('2️⃣ Verificando generación de tokens...');
    const { token, hashedToken } = await generateRecoveryToken();
    console.log(`✅ Token generado: ${token.substring(0, 10)}...`);
    console.log(`✅ Token hasheado: ${hashedToken.substring(0, 30)}...\n`);

    // Test 3: Verificar comparación de tokens
    console.log('3️⃣ Verificando comparación de tokens...');
    const isValidToken = await bcrypt.compare(token, hashedToken);
    if (isValidToken) {
      console.log('✅ Comparación de tokens funciona correctamente\n');
    } else {
      console.log('❌ Error en comparación de tokens\n');
    }

    // Test 4: Verificar variables de entorno
    console.log('4️⃣ Verificando variables de entorno...');
    const requiredVars = [
      'SMTP_HOST',
      'SMTP_PORT', 
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
      'FRONTEND_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ Todas las variables de entorno están configuradas');
      console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
      console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
      console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
      console.log(`   SMTP_FROM: ${process.env.SMTP_FROM}\n`);
    } else {
      console.log(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}\n`);
    }

    console.log('🎯 Resumen de la prueba:');
    console.log(`   Email config: ${emailConfigValid ? '✅' : '❌'}`);
    console.log(`   Token generation: ✅`);
    console.log(`   Token comparison: ${isValidToken ? '✅' : '❌'}`);
    console.log(`   Environment vars: ${missingVars.length === 0 ? '✅' : '❌'}`);

    if (emailConfigValid && isValidToken && missingVars.length === 0) {
      console.log('\n🎉 El sistema de recuperación de contraseña está configurado correctamente!');
    } else {
      console.log('\n⚠️  El sistema tiene algunos problemas que necesitan ser corregidos.');
    }

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPasswordRecoverySystem();
}

module.exports = { testPasswordRecoverySystem }; 