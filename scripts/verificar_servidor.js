const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api';

// Función para verificar la conexión al servidor
const verificarConexion = async () => {
  try {
    console.log('🔍 Verificando conexión al servidor...');
    console.log(`🔗 Intentando conectar a: ${BASE_URL}`);
    
    // Intentar obtener categorías (endpoint que debería existir)
    const response = await axios.get(`${BASE_URL}/categorias`, {
      timeout: 5000 // 5 segundos de timeout
    });
    
    console.log('✅ Conexión exitosa al servidor backend');
    console.log(`📊 Estado de respuesta: ${response.status}`);
    console.log(`📝 Categorías existentes: ${response.data.categorias?.length || 0}`);
    return true;
    
  } catch (error) {
    console.log('❌ Error de conexión al servidor backend');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚫 El servidor no está ejecutándose');
      console.log('\n💡 Soluciones:');
      console.log('   1. Inicia el servidor backend:');
      console.log('      cd BACKEND_APP');
      console.log('      npm run dev');
      console.log('   2. Verifica que esté ejecutándose en el puerto 3000');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 No se puede resolver la dirección del servidor');
    } else if (error.response) {
      console.log(`📄 El servidor respondió con error: ${error.response.status}`);
      console.log(`📝 Mensaje: ${error.response.data?.message || 'Sin mensaje'}`);
    } else {
      console.log(`🔧 Error técnico: ${error.message}`);
    }
    
    return false;
  }
};

// Función para verificar endpoints específicos
const verificarEndpoints = async () => {
  console.log('\n🔍 Verificando endpoints disponibles...');
  
  const endpoints = [
    { name: 'Categorías', url: `${BASE_URL}/categorias`, method: 'GET' },
    { name: 'Organizadores', url: `${BASE_URL}/organizadores`, method: 'GET' },
    { name: 'Carreras', url: `${BASE_URL}/carreras`, method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 3000
      });
      console.log(`✅ ${endpoint.name}: Disponible (${response.status})`);
    } catch (error) {
      if (error.response) {
        console.log(`⚠️ ${endpoint.name}: Responde con error ${error.response.status}`);
      } else {
        console.log(`❌ ${endpoint.name}: No disponible`);
      }
    }
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Verificación del servidor backend\n');
  
  const conexionExitosa = await verificarConexion();
  
  if (conexionExitosa) {
    await verificarEndpoints();
    console.log('\n🎉 ¡El servidor está funcionando correctamente!');
    console.log('✨ Ahora puedes ejecutar los scripts de población de datos.');
  } else {
    console.log('\n🛠️ Pasos para solucionar:');
    console.log('   1. Navega al directorio del backend: cd BACKEND_APP');
    console.log('   2. Instala dependencias si es necesario: npm install');
    console.log('   3. Inicia el servidor: npm run dev');
    console.log('   4. Verifica que aparezca el mensaje "Servidor corriendo en puerto 5000"');
    console.log('   5. Vuelve a ejecutar este script para verificar');
  }
};

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verificarConexion, verificarEndpoints };
