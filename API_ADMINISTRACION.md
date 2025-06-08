# API de Administración - Gestión de Cursos y Eventos

Esta API proporciona endpoints especializados para que los administradores puedan gestionar cursos y eventos, incluyendo la visualización de inscripciones y la aprobación/rechazo de pagos.

## 🔐 Autenticación Requerida

Todos los endpoints requieren:
- **Token JWT válido** en el header `Authorization: Bearer <token>`
- **Rol de ADMINISTRADOR** o **MASTER**

## 📋 Endpoints Disponibles

### 1. Obtener Cursos y Eventos Administrables

**GET** `/api/administracion/cursos-eventos`

Obtiene todos los cursos y eventos que están activos o se pueden administrar.

#### Criterios de Filtrado:
- **Eventos**: Que no hayan terminado o que iniciaron hace menos de 30 días
- **Cursos**: Que no hayan terminado o que iniciaron hace menos de 60 días

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Cursos y eventos administrables obtenidos exitosamente",
  "data": {
    "total": 15,
    "eventos": 8,
    "cursos": 7,
    "items": [
      {
        "id_eve": "uuid-evento",
        "nom_eve": "Conferencia de IA",
        "des_eve": "Descripción del evento",
        "fec_ini_eve": "2024-02-15",
        "fec_fin_eve": "2024-02-16",
        "capacidad_max_eve": 100,
        "es_gratuito": false,
        "precio": "25.00",
        "tipo": "EVENTO",
        "organizador_nombre": "Juan Pérez",
        "categoria_nombre": "Tecnología",
        "estadisticas": {
          "total": 45,
          "aprobadas": 30,
          "pendientes": 10,
          "rechazadas": 5,
          "disponibles": 55,
          "con_comprobante": 40
        }
      }
    ]
  }
}
```

### 2. Obtener Detalles de Evento

**GET** `/api/administracion/evento/:idEvento`

Obtiene detalles completos de un evento específico con todas las inscripciones.

#### Parámetros:
- `idEvento`: UUID del evento

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Detalles del evento obtenidos exitosamente",
  "data": {
    "evento": {
      "id_eve": "uuid-evento",
      "nom_eve": "Conferencia de IA",
      "des_eve": "Descripción completa",
      "fec_ini_eve": "2024-02-15",
      "fec_fin_eve": "2024-02-16",
      "hor_ini_eve": "09:00:00",
      "hor_fin_eve": "17:00:00",
      "ubi_eve": "Auditorio Principal",
      "capacidad_max_eve": 100,
      "es_gratuito": false,
      "precio": "25.00",
      "organizador_nombre": "Juan Pérez",
      "categoria_nombre": "Tecnología",
      "carreras_dirigidas": ["Ingeniería en Sistemas", "Ingeniería Industrial"]
    },
    "estadisticas": {
      "total": 45,
      "aprobadas": 30,
      "pendientes": 10,
      "rechazadas": 5,
      "disponibles": 55,
      "con_comprobante": 40
    },
    "inscripciones": [
      {
        "id_inscripcion": "uuid-inscripcion",
        "fecha_inscripcion": "2024-02-01",
        "estado_pago": "PENDIENTE",
        "valor": "25.00",
        "metodo_pago": "TRANSFERENCIA",
        "fecha_aprobacion": null,
        "tiene_comprobante": true,
        "comprobante_info": {
          "filename": "comprobante_pago.pdf",
          "size": 245760,
          "fecha_subida": "2024-02-01T10:30:00Z"
        },
        "usuario": {
          "id": "uuid-usuario",
          "cedula": "1234567890",
          "nombre_completo": "María García López",
          "email": "maria.garcia@email.com",
          "telefono": "0987654321",
          "carrera": "Ingeniería en Sistemas",
          "rol": "ESTUDIANTE"
        },
        "admin_aprobador": null
      }
    ]
  }
}
```

### 3. Obtener Detalles de Curso

**GET** `/api/administracion/curso/:idCurso`

Similar al endpoint de eventos, pero para cursos.

#### Parámetros:
- `idCurso`: UUID del curso

### 4. Aprobar Inscripción de Evento

**PUT** `/api/administracion/evento/inscripcion/:idInscripcion/aprobar`

Aprueba una inscripción pendiente de un evento pagado.

#### Parámetros:
- `idInscripcion`: UUID de la inscripción

#### Validaciones:
- La inscripción debe existir
- Debe estar en estado PENDIENTE
- El evento no debe ser gratuito
- Debe haber capacidad disponible

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Inscripción de María García aprobada exitosamente",
  "data": {
    "inscripcion": {
      "id_ins": "uuid-inscripcion",
      "estado_pago": "APROBADO",
      "fec_aprobacion": "2024-02-02T14:30:00Z"
    },
    "evento": "Conferencia de IA",
    "usuario": "María García"
  }
}
```

### 5. Rechazar Inscripción de Evento

**PUT** `/api/administracion/evento/inscripcion/:idInscripcion/rechazar`

Rechaza una inscripción pendiente de un evento pagado.

#### Parámetros:
- `idInscripcion`: UUID de la inscripción

#### Body (opcional):
```json
{
  "motivo": "Comprobante de pago no válido"
}
```

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Inscripción de María García rechazada",
  "data": {
    "inscripcion": {
      "id_ins": "uuid-inscripcion",
      "estado_pago": "RECHAZADO"
    },
    "evento": "Conferencia de IA",
    "usuario": "María García",
    "motivo": "Comprobante de pago no válido"
  }
}
```

### 6. Aprobar Inscripción de Curso

**PUT** `/api/administracion/curso/inscripcion/:idInscripcion/aprobar`

Similar a la aprobación de eventos, pero para cursos.

### 7. Rechazar Inscripción de Curso

**PUT** `/api/administracion/curso/inscripcion/:idInscripcion/rechazar`

Similar al rechazo de eventos, pero para cursos.

### 8. Descargar Comprobante de Pago

**GET** `/api/administracion/comprobante/:tipo/:idInscripcion`

Descarga el comprobante de pago de una inscripción.

#### Parámetros:
- `tipo`: "evento" o "curso"
- `idInscripcion`: UUID de la inscripción

#### Respuesta:
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="comprobante.pdf"`
- Archivo PDF binario

## 🚨 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "ID del evento es obligatorio"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token no válido"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Evento no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## 📝 Notas Importantes

1. **Eventos/Cursos Gratuitos**: Se aprueban automáticamente al momento de la inscripción, no requieren gestión manual.

2. **Capacidad**: El sistema verifica automáticamente la capacidad disponible antes de aprobar inscripciones.

3. **Comprobantes**: Solo las inscripciones de eventos/cursos pagados tienen comprobantes de pago.

4. **Filtros de Administrabilidad**: Los eventos y cursos muy antiguos no aparecen en la lista para mantener la interfaz limpia.

5. **Auditoría**: Todas las aprobaciones/rechazos quedan registradas con el ID del administrador que las realizó.

## 🔧 Ejemplo de Uso con JavaScript

```javascript
// Obtener lista de cursos y eventos
const response = await fetch('/api/administracion/cursos-eventos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Items administrables:', data.data.items);

// Aprobar una inscripción
const aprobar = await fetch(`/api/administracion/evento/inscripcion/${inscripcionId}/aprobar`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Descargar comprobante
const comprobante = await fetch(`/api/administracion/comprobante/evento/${inscripcionId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await comprobante.blob();
// Crear enlace de descarga...
``` 