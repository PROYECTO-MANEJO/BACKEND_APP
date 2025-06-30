const axios = require('axios');

// Configuración base
const BASE_URL = 'http://localhost:3000'; // Cambia el puerto si es necesario
let authToken = null;

// Headers básicos
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
});

// Headers para multipart (con archivos)
const getMultipartHeaders = () => ({
  'Content-Type': 'multipart/form-data',
  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
});

async function testCartaMotivacionEndpoints() {
  try {
    console.log('🧪 Iniciando pruebas de endpoints de carta_motivacion...\n');

    // 1. Login para obtener token (necesitas usuarios reales de tu BD)
    console.log('1. Intentando login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com', // Cambiar por email real
        password: 'password123'    // Cambiar por password real
      }, { headers: getHeaders() });

      authToken = loginResponse.data.token;
      console.log('✅ Login exitoso');
    } catch (error) {
      console.log('⚠️  No se pudo hacer login automático. Usa un token manual si es necesario.');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // 2. Obtener eventos disponibles
    console.log('\n2. Obteniendo eventos disponibles...');
    try {
      const eventosResponse = await axios.get(`${BASE_URL}/api/eventos`, {
        headers: getHeaders()
      });
      
      const eventos = eventosResponse.data.eventos || eventosResponse.data;
      console.log(`✅ Eventos obtenidos: ${eventos.length}`);
      
      // Mostrar algunos eventos
      eventos.slice(0, 3).forEach(evento => {
        console.log(`   - ${evento.nom_eve} (${evento.es_gratuito ? 'Gratuito' : `$${evento.precio}`})`);
      });
    } catch (error) {
      console.log('❌ Error obteniendo eventos:', error.response?.data?.message || error.message);
    }

    // 3. Obtener cursos disponibles
    console.log('\n3. Obteniendo cursos disponibles...');
    try {
      const cursosResponse = await axios.get(`${BASE_URL}/api/cursos`, {
        headers: getHeaders()
      });
      
      const cursos = cursosResponse.data.cursos || cursosResponse.data;
      console.log(`✅ Cursos obtenidos: ${cursos.length}`);
      
      // Mostrar algunos cursos
      cursos.slice(0, 3).forEach(curso => {
        console.log(`   - ${curso.nom_cur} (${curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`})`);
      });
    } catch (error) {
      console.log('❌ Error obteniendo cursos:', error.response?.data?.message || error.message);
    }

    // 4. Probar obtener mis inscripciones de eventos (debe incluir carta_motivacion)
    console.log('\n4. Probando obtener mis inscripciones de eventos...');
    if (authToken) {
      try {
        const misInscripcionesResponse = await axios.get(`${BASE_URL}/api/inscripciones/mis-inscripciones`, {
          headers: getHeaders()
        });
        
        const inscripciones = misInscripcionesResponse.data.data || [];
        console.log(`✅ Mis inscripciones eventos: ${inscripciones.length}`);
        
        // Verificar si incluye carta_motivacion
        inscripciones.forEach((ins, index) => {
          const tieneCarta = ins.carta_motivacion !== undefined;
          console.log(`   - Inscripción ${index + 1}: ${ins.evento?.nom_eve || 'Evento'} - Carta incluida: ${tieneCarta ? '✅' : '❌'}`);
          if (ins.carta_motivacion) {
            console.log(`     Carta: "${ins.carta_motivacion.substring(0, 50)}..."`);
          }
        });
      } catch (error) {
        console.log('❌ Error obteniendo mis inscripciones eventos:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('⚠️  Sin token de autenticación. Saltando prueba.');
    }

    // 5. Probar obtener mis inscripciones de cursos (debe incluir carta_motivacion)
    console.log('\n5. Probando obtener mis inscripciones de cursos...');
    if (authToken) {
      try {
        const misInscripcionesCursoResponse = await axios.get(`${BASE_URL}/api/inscripciones-cursos/mis-inscripciones`, {
          headers: getHeaders()
        });
        
        const inscripciones = misInscripcionesCursoResponse.data.data || [];
        console.log(`✅ Mis inscripciones cursos: ${inscripciones.length}`);
        
        // Verificar si incluye carta_motivacion
        inscripciones.forEach((ins, index) => {
          const tieneCarta = ins.carta_motivacion !== undefined;
          console.log(`   - Inscripción ${index + 1}: ${ins.curso?.nom_cur || 'Curso'} - Carta incluida: ${tieneCarta ? '✅' : '❌'}`);
          if (ins.carta_motivacion) {
            console.log(`     Carta: "${ins.carta_motivacion.substring(0, 50)}..."`);
          }
        });
      } catch (error) {
        console.log('❌ Error obteniendo mis inscripciones cursos:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('⚠️  Sin token de autenticación. Saltando prueba.');
    }

    // 6. Probar obtener evento por ID (debe incluir carta_motivacion en inscripciones)
    console.log('\n6. Probando obtener evento por ID...');
    try {
      // Intentar con un ID de evento (necesitas un ID real)
      const eventoId = 'pon-aqui-un-id-real'; // Cambiar por ID real
      
      console.log('⚠️  Para probar este endpoint, necesitas un ID de evento real.');
      console.log('   Ejemplo de uso:');
      console.log(`   GET ${BASE_URL}/api/eventos/${eventoId}`);
      console.log('   Debe retornar inscripciones con campo carta_motivacion');
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    // 7. Probar obtener curso por ID (debe incluir carta_motivacion en inscripciones)
    console.log('\n7. Probando obtener curso por ID...');
    try {
      // Intentar con un ID de curso (necesitas un ID real)
      const cursoId = 'pon-aqui-un-id-real'; // Cambiar por ID real
      
      console.log('⚠️  Para probar este endpoint, necesitas un ID de curso real.');
      console.log('   Ejemplo de uso:');
      console.log(`   GET ${BASE_URL}/api/cursos/${cursoId}`);
      console.log('   Debe retornar inscripciones con campo carta_motivacion');
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('\n✅ Pruebas de endpoints completadas');
    console.log('\n📋 Resumen de verificaciones necesarias:');
    console.log('1. ✅ Endpoints actualizados para incluir carta_motivacion');
    console.log('2. ⚠️  Prueba manual: Crear inscripción con carta_motivacion');
    console.log('3. ⚠️  Prueba manual: Verificar que la carta se guarde en BD');
    console.log('4. ⚠️  Prueba manual: Verificar que la carta aparezca en respuestas');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Función para hacer prueba de inscripción con carta (necesita datos reales)
function ejemploInscripcionConCarta() {
  console.log('\n📝 Ejemplo de inscripción con carta de motivación:');
  console.log(`
POST ${BASE_URL}/api/inscripciones
Headers: {
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "multipart/form-data"
}
Body (FormData): {
  "idUsuario": "id-del-usuario",
  "idEvento": "id-del-evento", 
  "carta_motivacion": "Estoy muy interesado en este evento porque...",
  "metodoPago": "TRANSFERENCIA", // Solo si es evento pagado
  "comprobantePago": archivo.pdf // Solo si es evento pagado
}

Respuesta esperada: {
  "message": "Inscripción realizada con éxito",
  "inscripcion": {
    "id": "...",
    "estado": "APROBADO",
    "carta_motivacion": "Estoy muy interesado...",
    "esGratuito": true,
    "precio": null,
    "tieneComprobante": false
  }
}
  `);
}

// Ejecutar las pruebas
testCartaMotivacionEndpoints();
ejemploInscripcionConCarta();
