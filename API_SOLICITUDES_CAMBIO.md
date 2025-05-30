# API de Solicitudes de Cambio

Esta documentación describe todas las rutas disponibles para el sistema de gestión de control de cambios.

## Autenticación

Todas las rutas requieren autenticación mediante JWT. El token debe enviarse en el header `x-token`.

```
x-token: tu_jwt_token_aqui
```

## Rutas para Usuarios

### 1. Crear Solicitud de Cambio

**POST** `/api/solicitudes-cambio/`

Crea una nueva solicitud de cambio.

**Headers:**
```
Content-Type: application/json
x-token: [JWT_TOKEN]
```

**Body:**
```json
{
  "titulo_sol": "Implementar filtro avanzado de búsqueda",
  "descripcion_sol": "Se necesita implementar un sistema de filtros avanzados que permita buscar por múltiples criterios simultáneamente...",
  "justificacion_sol": "Los usuarios han reportado dificultades para encontrar información específica con el sistema actual...",
  "tipo_cambio_sol": "NUEVA_FUNCIONALIDAD",
  "prioridad_sol": "ALTA"
}
```

**Tipos de cambio válidos:**
- `NUEVA_FUNCIONALIDAD`
- `MEJORA_EXISTENTE`
- `CORRECCION_ERROR`
- `CAMBIO_INTERFAZ`
- `OPTIMIZACION`
- `OTRO`

**Prioridades válidas:**
- `BAJA`
- `MEDIA`
- `ALTA`
- `CRITICA`

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Solicitud de cambio creada exitosamente",
  "data": {
    "id_sol": "uuid",
    "titulo_sol": "Implementar filtro avanzado de búsqueda",
    "descripcion_sol": "Se necesita implementar...",
    "justificacion_sol": "Los usuarios han reportado...",
    "tipo_cambio_sol": "NUEVA_FUNCIONALIDAD",
    "prioridad_sol": "ALTA",
    "estado_sol": "PENDIENTE",
    "fec_creacion_sol": "2024-01-15T10:30:00.000Z",
    "fec_respuesta_sol": null,
    "comentarios_admin_sol": null,
    "id_usuario_sol": "uuid",
    "id_admin_resp_sol": null,
    "usuario": {
      "nom_usu1": "Juan",
      "nom_usu2": "Carlos",
      "ape_usu1": "Pérez",
      "ape_usu2": "García",
      "ced_usu": "1234567890"
    }
  }
}
```

### 2. Obtener Mis Solicitudes

**GET** `/api/solicitudes-cambio/mis-solicitudes`

Obtiene todas las solicitudes del usuario autenticado con paginación y filtros opcionales.

**Query Parameters:**
- `estado` (opcional): Filtrar por estado (`PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `EN_DESARROLLO`, `COMPLETADA`)
- `tipo_cambio` (opcional): Filtrar por tipo de cambio
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Ejemplo:**
```
GET /api/solicitudes-cambio/mis-solicitudes?estado=PENDIENTE&page=1&limit=5
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "solicitudes": [
      {
        "id_sol": "uuid",
        "titulo_sol": "Implementar filtro avanzado",
        "descripcion_sol": "Se necesita implementar...",
        "estado_sol": "PENDIENTE",
        "prioridad_sol": "ALTA",
        "fec_creacion_sol": "2024-01-15T10:30:00.000Z",
        "adminResponsable": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### 3. Obtener Solicitud Específica

**GET** `/api/solicitudes-cambio/mis-solicitudes/:id`

Obtiene los detalles completos de una solicitud específica del usuario.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_sol": "uuid",
    "titulo_sol": "Implementar filtro avanzado",
    "descripcion_sol": "Se necesita implementar...",
    "justificacion_sol": "Los usuarios han reportado...",
    "tipo_cambio_sol": "NUEVA_FUNCIONALIDAD",
    "prioridad_sol": "ALTA",
    "estado_sol": "APROBADA",
    "fec_creacion_sol": "2024-01-15T10:30:00.000Z",
    "fec_respuesta_sol": "2024-01-16T14:20:00.000Z",
    "comentarios_admin_sol": "Solicitud aprobada. Se iniciará desarrollo la próxima semana.",
    "usuario": {
      "nom_usu1": "Juan",
      "nom_usu2": "Carlos",
      "ape_usu1": "Pérez",
      "ape_usu2": "García",
      "ced_usu": "1234567890"
    },
    "adminResponsable": {
      "nom_usu1": "María",
      "nom_usu2": "Isabel",
      "ape_usu1": "González",
      "ape_usu2": "López"
    }
  }
}
```

## Rutas para Administradores

### 4. Obtener Todas las Solicitudes

**GET** `/api/solicitudes-cambio/admin/todas`

Obtiene todas las solicitudes del sistema (solo administradores).

**Query Parameters:**
- `estado` (opcional): Filtrar por estado
- `tipo_cambio` (opcional): Filtrar por tipo de cambio
- `prioridad` (opcional): Filtrar por prioridad
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "solicitudes": [
      {
        "id_sol": "uuid",
        "titulo_sol": "Implementar filtro avanzado",
        "descripcion_sol": "Se necesita implementar...",
        "tipo_cambio_sol": "NUEVA_FUNCIONALIDAD",
        "prioridad_sol": "ALTA",
        "estado_sol": "PENDIENTE",
        "fec_creacion_sol": "2024-01-15T10:30:00.000Z",
        "usuario": {
          "nom_usu1": "Juan",
          "nom_usu2": "Carlos",
          "ape_usu1": "Pérez",
          "ape_usu2": "García",
          "ced_usu": "1234567890"
        },
        "adminResponsable": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### 5. Responder a una Solicitud

**PUT** `/api/solicitudes-cambio/admin/:id/responder`

Permite a un administrador aprobar o rechazar una solicitud.

**Body:**
```json
{
  "estado_sol": "APROBADA",
  "comentarios_admin_sol": "Solicitud aprobada. Se iniciará desarrollo la próxima semana."
}
```

**Estados válidos para respuesta:**
- `APROBADA`
- `RECHAZADA`
- `EN_REVISION`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Solicitud aprobada exitosamente",
  "data": {
    "id_sol": "uuid",
    "titulo_sol": "Implementar filtro avanzado",
    "estado_sol": "APROBADA",
    "fec_respuesta_sol": "2024-01-16T14:20:00.000Z",
    "comentarios_admin_sol": "Solicitud aprobada. Se iniciará desarrollo la próxima semana.",
    "adminResponsable": {
      "nom_usu1": "María",
      "nom_usu2": "Isabel",
      "ape_usu1": "González",
      "ape_usu2": "López"
    }
  }
}
```

### 6. Actualizar Estado de Solicitud

**PUT** `/api/solicitudes-cambio/admin/:id/estado`

Actualiza el estado de una solicitud durante el proceso de desarrollo.

**Body:**
```json
{
  "estado_sol": "EN_DESARROLLO"
}
```

**Estados válidos:**
- `PENDIENTE`
- `EN_REVISION`
- `APROBADA`
- `RECHAZADA`
- `EN_DESARROLLO`
- `COMPLETADA`

### 7. Obtener Estadísticas

**GET** `/api/solicitudes-cambio/admin/estadisticas`

Obtiene estadísticas generales de las solicitudes.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "porEstado": [
      { "estado": "PENDIENTE", "cantidad": 8 },
      { "estado": "APROBADA", "cantidad": 10 },
      { "estado": "RECHAZADA", "cantidad": 3 },
      { "estado": "EN_DESARROLLO", "cantidad": 3 },
      { "estado": "COMPLETADA", "cantidad": 1 }
    ],
    "porTipo": [
      { "tipo": "NUEVA_FUNCIONALIDAD", "cantidad": 12 },
      { "tipo": "MEJORA_EXISTENTE", "cantidad": 8 },
      { "tipo": "CORRECCION_ERROR", "cantidad": 5 }
    ],
    "porPrioridad": [
      { "prioridad": "CRITICA", "cantidad": 2 },
      { "prioridad": "ALTA", "cantidad": 8 },
      { "prioridad": "MEDIA", "cantidad": 12 },
      { "prioridad": "BAJA", "cantidad": 3 }
    ]
  }
}
```

### 8. Obtener Solicitud por ID (Admin)

**GET** `/api/solicitudes-cambio/admin/:id`

Obtiene los detalles completos de cualquier solicitud (vista de administrador).

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "msg": "El título es obligatorio",
      "param": "titulo_sol"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No hay token en la petición"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "El usuario no tiene permisos de administrador"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Solicitud no encontrada"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Mensaje específico del error"
}
```

## Flujo Típico de una Solicitud

1. **Usuario crea solicitud**: POST `/api/solicitudes-cambio/` → Estado: `PENDIENTE`
2. **Admin revisa**: PUT `/api/solicitudes-cambio/admin/:id/estado` → Estado: `EN_REVISION`
3. **Admin responde**: PUT `/api/solicitudes-cambio/admin/:id/responder` → Estado: `APROBADA` o `RECHAZADA`
4. **Si aprobada, inicia desarrollo**: PUT `/api/solicitudes-cambio/admin/:id/estado` → Estado: `EN_DESARROLLO`
5. **Desarrollo completado**: PUT `/api/solicitudes-cambio/admin/:id/estado` → Estado: `COMPLETADA`

## Notas Importantes

- Todas las fechas están en formato ISO 8601 (UTC)
- Los UUIDs son generados automáticamente por Prisma
- Las validaciones se aplican automáticamente en todas las rutas
- Los usuarios solo pueden ver sus propias solicitudes
- Los administradores pueden ver y gestionar todas las solicitudes
- La paginación es obligatoria en las rutas de listado para optimizar el rendimiento 