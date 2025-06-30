# 📋 Guía de Implementación: Campo carta_motivacion en Frontend

## ✅ Cambios realizados en el Backend

### 1. **Controladores actualizados:**
- `inscripcionesController.js` - Eventos
- `inscripcionesCursosController.js` - Cursos

### 2. **Funciones modificadas:**

#### **Para Eventos:**
- ✅ `inscribirUsuarioEvento` - Ya guardaba carta_motivacion correctamente
- ✅ `obtenerMisInscripcionesEvento` - Ahora incluye carta_motivacion en respuesta
- ✅ `obtenerTodasInscripcionesEventos` - Ahora incluye carta_motivacion en respuesta

#### **Para Cursos:**
- ✅ `inscribirUsuarioCurso` - Ya guardaba carta_motivacion correctamente  
- ✅ `obtenerMisInscripcionesCurso` - Ahora incluye carta_motivacion en respuesta
- ✅ `obtenerTodasInscripcionesCursos` - Ahora incluye carta_motivacion en respuesta

---

## 🎯 Cambios necesarios en el Frontend

### 1. **Componente de Inscripción**

Asegúrate de que el formulario de inscripción incluya el campo carta_motivacion:

```jsx
// En el componente de inscripción (ej: InscripcionModal.jsx)

const [formData, setFormData] = useState({
  carta_motivacion: '', // <-- Asegúrate de que esté aquí
  metodoPago: '',
  // otros campos...
});

// En el JSX del formulario
<div className="form-group">
  <label htmlFor="carta_motivacion">
    Carta de Motivación {evento?.requiere_carta_motivacion && <span className="text-red-500">*</span>}
  </label>
  <textarea
    id="carta_motivacion"
    name="carta_motivacion"
    value={formData.carta_motivacion}
    onChange={handleInputChange}
    placeholder="Explica por qué te interesa este evento/curso..."
    rows={4}
    maxLength={500}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    required={evento?.requiere_carta_motivacion}
  />
  <small className="text-gray-500">
    {formData.carta_motivacion.length}/500 caracteres
  </small>
</div>
```

### 2. **Función de envío de inscripción**

```jsx
const inscribirUsuario = async () => {
  try {
    const formDataToSend = new FormData();
    
    // Datos básicos
    formDataToSend.append('idUsuario', user.id);
    formDataToSend.append('idEvento', evento.id_eve); // o idCurso para cursos
    
    // ✅ IMPORTANTE: Incluir carta_motivacion
    if (formData.carta_motivacion?.trim()) {
      formDataToSend.append('carta_motivacion', formData.carta_motivacion.trim());
    }
    
    // Solo para eventos/cursos pagados
    if (!evento.es_gratuito) {
      formDataToSend.append('metodoPago', formData.metodoPago);
      if (comprobantePago) {
        formDataToSend.append('comprobantePago', comprobantePago);
      }
    }

    const response = await fetch('/api/inscripciones', { // o /api/inscripciones-cursos
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO incluir Content-Type para FormData
      },
      body: formDataToSend
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Inscripción exitosa:', result);
      console.log('✅ Carta guardada:', result.inscripcion.carta_motivacion);
      // Mostrar mensaje de éxito
    } else {
      console.error('❌ Error en inscripción:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

### 3. **Mostrar carta en detalles de inscripción**

```jsx
// En el componente que muestra detalles (ej: DetalleEventoCurso.jsx)

const MisInscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        const response = await fetch('/api/inscripciones/mis-inscripciones', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log('📋 Inscripciones con carta:', data.data);
        setInscripciones(data.data || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchInscripciones();
  }, []);

  return (
    <div>
      {inscripciones.map(inscripcion => (
        <div key={inscripcion.id_ins} className="border p-4 rounded-lg mb-4">
          <h3>{inscripcion.evento?.nom_eve || inscripcion.curso?.nom_cur}</h3>
          <p>Estado: {inscripcion.estado_pago || inscripcion.estado_pago_cur}</p>
          
          {/* ✅ MOSTRAR CARTA DE MOTIVACIÓN */}
          {inscripcion.carta_motivacion && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-700">Carta de Motivación:</h4>
              <p className="text-gray-600 italic">"{inscripcion.carta_motivacion}"</p>
            </div>
          )}
          
          <small className="text-gray-500">
            Inscrito el: {new Date(inscripcion.fec_ins || inscripcion.fec_ins_cur).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};
```

### 4. **Panel de administración**

```jsx
// Para administradores que ven todas las inscripciones

const PanelInscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    const fetchTodasInscripciones = async () => {
      try {
        const response = await fetch('/api/inscripciones/todas', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        const data = await response.json();
        setInscripciones(data.data || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchTodasInscripciones();
  }, []);

  return (
    <div>
      {inscripciones.map(inscripcion => (
        <div key={inscripcion.id_ins} className="border p-4 rounded-lg mb-4">
          <div className="flex justify-between">
            <div>
              <h3>{inscripcion.usuario?.nom_usu1} {inscripcion.usuario?.ape_usu1}</h3>
              <p>Evento: {inscripcion.evento?.nom_eve}</p>
              <p>Estado: {inscripcion.estado_pago}</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => aprobarInscripcion(inscripcion.id_ins, 'APROBADO')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Aprobar
              </button>
              <button 
                onClick={() => aprobarInscripcion(inscripcion.id_ins, 'RECHAZADO')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Rechazar
              </button>
            </div>
          </div>
          
          {/* ✅ MOSTRAR CARTA PARA EL ADMIN */}
          {inscripcion.carta_motivacion && (
            <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-800">Carta de Motivación:</h4>
              <p className="text-blue-700">"{inscripcion.carta_motivacion}"</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 🧪 Testing y Verificación

### 1. **Pruebas de Backend**

```bash
# Ejecutar script de prueba de base de datos
node scripts/test-carta-motivacion.js

# Ejecutar script de prueba de endpoints  
node scripts/test-carta-endpoints.js
```

### 2. **Pruebas manuales**

1. **Crear inscripción con carta:**
   - Usar Postman o formulario del frontend
   - Verificar que se guarde en BD
   - Verificar que aparezca en la respuesta

2. **Verificar en consultas:**
   - Obtener mis inscripciones
   - Verificar que incluya carta_motivacion
   - Probar con usuario admin

3. **Pruebas de validación:**
   - Campo opcional: debe funcionar sin carta
   - Campo requerido: debe validar si requiere_carta_motivacion=true
   - Límite de caracteres: máximo 500

### 3. **Debugging en Frontend**

```jsx
// Agregar console.logs para debugging
console.log('📝 Datos de inscripción:', formData);
console.log('📋 Respuesta del servidor:', result);
console.log('✅ Carta incluida:', result.inscripcion?.carta_motivacion);

// En las consultas
console.log('📋 Inscripciones obtenidas:', inscripciones);
inscripciones.forEach(ins => {
  console.log(`- ${ins.evento?.nom_eve}: carta = "${ins.carta_motivacion}"`);
});
```

---

## 🚀 Resumen de verificaciones

### ✅ Backend (Completado)
- [x] Campo carta_motivacion se guarda correctamente
- [x] Campo se incluye en respuestas de inscripción
- [x] Campo se incluye en obtenerMisInscripciones
- [x] Campo se incluye en obtenerTodasInscripciones
- [x] Campo se incluye en detalles de evento/curso
- [x] **NUEVO:** Campo se incluye en administracionController.js

### ⚠️ Frontend (Pendiente de verificar)
- [ ] Formulario incluye campo carta_motivacion
- [ ] Campo se envía en la petición de inscripción
- [ ] Campo se muestra en mis inscripciones
- [ ] Campo se muestra en panel de admin
- [ ] Validaciones funcionan correctamente

### 🎯 Próximos pasos
1. Verificar que el frontend esté enviando carta_motivacion
2. Agregar console.logs para debugging
3. Probar flujo completo end-to-end
4. Verificar validaciones de UI

## 🔧 **NUEVA CORRECCIÓN: administracionController.js**

### **Problema identificado:**
El frontend reportaba que `administracionController.js` no incluía el campo `carta_motivacion` en las respuestas.

### **Funciones corregidas:**

#### **1. `obtenerDetallesEventoAdmin`**
```javascript
// ANTES (sin carta_motivacion):
const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
  id_inscripcion: inscripcion.id_ins,
  fecha_inscripcion: inscripcion.fec_ins,
  estado_pago: inscripcion.estado_pago,
  // ... otros campos
}));

// DESPUÉS (con carta_motivacion):
const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
  id_inscripcion: inscripcion.id_ins,
  fecha_inscripcion: inscripcion.fec_ins,
  estado_pago: inscripcion.estado_pago,
  carta_motivacion: inscripcion.carta_motivacion, // ✅ AGREGADO
  // ... otros campos
}));
```

#### **2. `obtenerDetallesCursoAdmin`**
```javascript
// ANTES (sin carta_motivacion):
const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
  id_inscripcion: inscripcion.id_ins_cur,
  fecha_inscripcion: inscripcion.fec_ins_cur,
  estado_pago: inscripcion.estado_pago_cur,
  // ... otros campos
}));

// DESPUÉS (con carta_motivacion):
const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
  id_inscripcion: inscripcion.id_ins_cur,
  fecha_inscripcion: inscripcion.fec_ins_cur,
  estado_pago: inscripcion.estado_pago_cur,
  carta_motivacion: inscripcion.carta_motivacion, // ✅ AGREGADO
  // ... otros campos
}));
```

### **Endpoints afectados:**
- `GET /api/administracion/evento/{idEvento}` - Ahora incluye carta_motivacion
- `GET /api/administracion/curso/{idCurso}` - Ahora incluye carta_motivacion

### **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "evento": { ... },
    "estadisticas": { ... },
    "inscripciones": [
      {
        "id_inscripcion": "uuid",
        "carta_motivacion": "Texto de la carta de motivación...", // ✅ AHORA INCLUIDO
        "fecha_inscripcion": "2025-06-29",
        "estado_pago": "PENDIENTE",
        "usuario": { ... },
        "tiene_comprobante": true
      }
    ]
  }
}
```

---
