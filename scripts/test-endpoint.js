const axios = require('axios');

async function testEditEndpoint() {
  try {
    console.log('Probando endpoint de editar...');
    
    // Primero obtener un token de admin (necesitarás ajustar esto con credenciales reales)
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'oriofrio0126@gmail.com', // Ajustar con email real
      password: 'password123' // Ajustar con password real
    });
    
    const token = loginResponse.data.token;
    console.log('Token obtenido:', token ? 'SÍ' : 'NO');
    
    // Probar el endpoint de editar
    const editResponse = await axios.put(
      'http://localhost:3000/api/solicitudes-cambio/admin/ec7e9558-536f-49d2-8ba0-1fea4e51fcea/editar',
      {
        estado_sol: 'APROBADA',
        prioridad_sol: 'ALTA',
        comentarios_admin_sol: 'Test comentario',
        comentarios_internos_sol: 'Test comentario interno'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta:', editResponse.status, editResponse.data);
    
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testEditEndpoint();
}

module.exports = testEditEndpoint; 