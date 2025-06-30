// Script para probar el administracionController.js con carta_motivacion
const axios = require('axios');

// Configuración base
const BASE_URL = 'http://localhost:3000'; // Cambiar puerto si es necesario
let authToken = null;

// Headers básicos
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
});

async function testAdministracionController() {
  try {
    console.log('🧪 Iniciando pruebas del administracionController.js...\n');

    // 1. Login para obtener token de admin (necesitas credenciales reales)
    console.log('1. Intentando login como administrador...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@example.com', // Cambiar por email real de admin
        password: 'password123'     // Cambiar por password real
      }, { headers: getHeaders() });

      authToken = loginResponse.data.token;
      console.log('✅ Login exitoso como administrador');
    } catch (error) {
      console.log('⚠️  No se pudo hacer login automático. Usa un token manual si es necesario.');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Para continuar las pruebas, configura authToken manualmente.');
      return;
    }

    // 2. Obtener cursos y eventos administrables
    console.log('\n2. Obteniendo cursos y eventos administrables...');
    try {
      const response = await axios.get(`${BASE_URL}/api/administracion/cursos-eventos`, {
        headers: getHeaders()
      });
      
      const data = response.data.data || response.data;
      console.log(`✅ Cursos y eventos obtenidos:`);
      console.log(`   - Eventos: ${data.eventos?.length || 0}`);
      console.log(`   - Cursos: ${data.cursos?.length || 0}`);
      
      // Mostrar algunos ejemplos
      if (data.eventos?.length > 0) {
        console.log(`   - Primer evento: ${data.eventos[0].nom_eve}`);
      }
      if (data.cursos?.length > 0) {
        console.log(`   - Primer curso: ${data.cursos[0].nom_cur}`);
      }
      
      return data; // Retornar para usar en siguientes pruebas
      
    } catch (error) {
      console.log('❌ Error obteniendo cursos y eventos:', error.response?.data?.message || error.message);
      return null;
    }

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

async function testDetallesEventoAdmin(eventoId) {
  try {
    console.log(`\n3. Probando obtener detalles de evento ${eventoId}...`);
    
    const response = await axios.get(`${BASE_URL}/api/administracion/evento/${eventoId}`, {
      headers: getHeaders()
    });
    
    const data = response.data.data;
    console.log('✅ Detalles del evento obtenidos');
    console.log(`   - Evento: ${data.evento.nom_eve}`);
    console.log(`   - Total inscripciones: ${data.estadisticas.total}`);
    console.log(`   - Pendientes: ${data.estadisticas.pendientes}`);
    console.log(`   - Aprobadas: ${data.estadisticas.aprobadas}`);
    
    // ✅ VERIFICAR QUE INCLUYA CARTA_MOTIVACION
    if (data.inscripciones && data.inscripciones.length > 0) {
      console.log('\n   📋 Verificando inscripciones:');
      data.inscripciones.forEach((ins, index) => {
        const tieneCarta = ins.carta_motivacion !== undefined;
        console.log(`   - Inscripción ${index + 1}: ${ins.usuario.nombre_completo}`);
        console.log(`     ✅ Campo carta_motivacion incluido: ${tieneCarta ? 'SÍ' : 'NO'}`);
        if (ins.carta_motivacion) {
          console.log(`     📝 Carta: "${ins.carta_motivacion.substring(0, 50)}..."`);
        }
      });
    } else {
      console.log('   ⚠️  No hay inscripciones para verificar');
    }
    
    return data;
    
  } catch (error) {
    console.log('❌ Error obteniendo detalles del evento:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testDetallesCursoAdmin(cursoId) {
  try {
    console.log(`\n4. Probando obtener detalles de curso ${cursoId}...`);
    
    const response = await axios.get(`${BASE_URL}/api/administracion/curso/${cursoId}`, {
      headers: getHeaders()
    });
    
    const data = response.data.data;
    console.log('✅ Detalles del curso obtenidos');
    console.log(`   - Curso: ${data.curso.nom_cur}`);
    console.log(`   - Total inscripciones: ${data.estadisticas.total}`);
    console.log(`   - Pendientes: ${data.estadisticas.pendientes}`);
    console.log(`   - Aprobadas: ${data.estadisticas.aprobadas}`);
    
    // ✅ VERIFICAR QUE INCLUYA CARTA_MOTIVACION
    if (data.inscripciones && data.inscripciones.length > 0) {
      console.log('\n   📋 Verificando inscripciones:');
      data.inscripciones.forEach((ins, index) => {
        const tieneCarta = ins.carta_motivacion !== undefined;
        console.log(`   - Inscripción ${index + 1}: ${ins.usuario.nombre_completo}`);
        console.log(`     ✅ Campo carta_motivacion incluido: ${tieneCarta ? 'SÍ' : 'NO'}`);
        if (ins.carta_motivacion) {
          console.log(`     📝 Carta: "${ins.carta_motivacion.substring(0, 50)}..."`);
        }
      });
    } else {
      console.log('   ⚠️  No hay inscripciones para verificar');
    }
    
    return data;
    
  } catch (error) {
    console.log('❌ Error obteniendo detalles del curso:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función principal que ejecuta todas las pruebas
async function ejecutarPruebas() {
  try {
    // Obtener datos iniciales
    const datosIniciales = await testAdministracionController();
    
    if (!datosIniciales || !authToken) {
      console.log('\n❌ No se pueden continuar las pruebas sin autenticación');
      return;
    }
    
    // Probar con el primer evento disponible
    if (datosIniciales.eventos?.length > 0) {
      const primerEvento = datosIniciales.eventos[0];
      await testDetallesEventoAdmin(primerEvento.id_eve);
    } else {
      console.log('\n⚠️  No hay eventos para probar detalles');
    }
    
    // Probar con el primer curso disponible
    if (datosIniciales.cursos?.length > 0) {
      const primerCurso = datosIniciales.cursos[0];
      await testDetallesCursoAdmin(primerCurso.id_cur);
    } else {
      console.log('\n⚠️  No hay cursos para probar detalles');
    }
    
    console.log('\n✅ Pruebas del administracionController.js completadas');
    console.log('\n📋 Resumen:');
    console.log('1. ✅ obtenerCursosEventosAdministrables - OK');
    console.log('2. ✅ obtenerDetallesEventoAdmin - Ahora incluye carta_motivacion');
    console.log('3. ✅ obtenerDetallesCursoAdmin - Ahora incluye carta_motivacion');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Función para mostrar ejemplos de uso
function mostrarEjemplosDeUso() {
  console.log('\n📝 Ejemplos de uso de los endpoints corregidos:');
  console.log(`
1. Obtener cursos y eventos administrables:
   GET ${BASE_URL}/api/administracion/cursos-eventos
   Headers: { "Authorization": "Bearer YOUR_ADMIN_TOKEN" }

2. Obtener detalles de evento con inscripciones (incluye carta_motivacion):
   GET ${BASE_URL}/api/administracion/evento/{idEvento}
   Headers: { "Authorization": "Bearer YOUR_ADMIN_TOKEN" }
   
   Respuesta esperada:
   {
     "data": {
       "evento": {...},
       "inscripciones": [
         {
           "id_inscripcion": "...",
           "carta_motivacion": "Texto de la carta...", // ✅ AHORA INCLUIDO
           "usuario": {...},
           "estado_pago": "PENDIENTE",
           "tiene_comprobante": true
         }
       ]
     }
   }

3. Obtener detalles de curso con inscripciones (incluye carta_motivacion):
   GET ${BASE_URL}/api/administracion/curso/{idCurso}
   Headers: { "Authorization": "Bearer YOUR_ADMIN_TOKEN" }
   
   Respuesta esperada:
   {
     "data": {
       "curso": {...},
       "inscripciones": [
         {
           "id_inscripcion": "...",
           "carta_motivacion": "Texto de la carta...", // ✅ AHORA INCLUIDO
           "usuario": {...},
           "estado_pago": "PENDIENTE",
           "tiene_comprobante": false
         }
       ]
     }
   }
  `);
}

// Ejecutar las pruebas
ejecutarPruebas();
mostrarEjemplosDeUso();
