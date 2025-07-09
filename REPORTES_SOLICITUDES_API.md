# 📊 API de Reportes de Solicitudes de Cambio

Esta documentación describe los endpoints disponibles para generar reportes y análisis de las solicitudes de cambio del sistema.

## 🔒 Autenticación y Autorización

**IMPORTANTE**: Todos los endpoints de reportes de solicitudes requieren:
- Token JWT válido
- Rol de usuario: **MASTER** (exclusivo)

## 📋 Endpoints Disponibles

### 1. Obtener Lista de Reportes Disponibles

```http
GET /api/reportes/solicitudes
```

**Respuesta:**
```json
{
  "success": true,
  "reportes": [
    {
      "id": "estados",
      "nombre": "Solicitudes por Estado",
      "descripcion": "Distribución de solicitudes según su estado actual",
      "endpoint": "/reportes/solicitudes/estados",
      "icono": "Assignment"
    }
  ],
  "total": 9,
  "ultima_actualizacion": "2025-01-01T12:00:00.000Z"
}
```

### 2. Reporte por Estados

```http
GET /api/reportes/solicitudes/estados
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "estado": "PENDIENTE",
      "cantidad": 15
    },
    {
      "estado": "EN_DESARROLLO",
      "cantidad": 8
    }
  ],
  "total": 23
}
```

### 3. Reporte por Tipos de Cambio

```http
GET /api/reportes/solicitudes/tipos
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "tipo": "NUEVA_FUNCIONALIDAD",
      "cantidad": 12
    },
    {
      "tipo": "CORRECCION_ERROR",
      "cantidad": 8
    }
  ],
  "total": 20
}
```

### 4. Reporte por Prioridades

```http
GET /api/reportes/solicitudes/prioridades
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "prioridad": "ALTA",
      "cantidad": 10
    },
    {
      "prioridad": "MEDIA",
      "cantidad": 8
    }
  ],
  "total": 18
}
```

### 5. Reporte por Riesgos

```http
GET /api/reportes/solicitudes/riesgos
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "riesgo": "MEDIO",
      "cantidad": 12
    },
    {
      "riesgo": "BAJO",
      "cantidad": 6
    }
  ],
  "total": 18
}
```

### 6. Reporte por Urgencias

```http
GET /api/reportes/solicitudes/urgencias
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "urgencia": "NORMAL",
      "cantidad": 15
    },
    {
      "urgencia": "ALTA",
      "cantidad": 5
    }
  ],
  "total": 20
}
```

### 7. Reporte por Desarrolladores

```http
GET /api/reportes/solicitudes/desarrolladores
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "desarrollador_id": "uuid-123",
      "desarrollador_nombre": "Juan Pérez García",
      "cantidad": 8
    },
    {
      "desarrollador_id": "uuid-456",
      "desarrollador_nombre": "María López Ruiz",
      "cantidad": 5
    }
  ],
  "sin_asignar": 3,
  "total": 16
}
```

### 8. Reporte Mensual

```http
GET /api/reportes/solicitudes/mensual
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "mes": "2024-11",
      "cantidad": 15
    },
    {
      "mes": "2024-12",
      "cantidad": 22
    }
  ],
  "total": 37
}
```

### 9. Reporte de Solicitudes Completadas

```http
GET /api/reportes/solicitudes/completadas
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-solicitud",
      "titulo": "Implementar nueva funcionalidad",
      "fecha_creacion": "2024-11-01T10:00:00.000Z",
      "fecha_inicio": "2024-11-05",
      "fecha_fin": "2024-11-15",
      "tiempo_horas": 40,
      "desarrollador": "Juan Pérez García"
    }
  ],
  "total": 12
}
```

### 10. Reporte Resumen Ejecutivo

```http
GET /api/reportes/solicitudes/resumen
```

**Respuesta:**
```json
{
  "success": true,
  "resumen": {
    "total": 150,
    "hoy": 3,
    "este_mes": 25,
    "por_estado": [
      {
        "estado": "PENDIENTE",
        "cantidad": 20
      }
    ],
    "por_prioridad": [
      {
        "prioridad": "ALTA",
        "cantidad": 15
      }
    ],
    "por_tipo": [
      {
        "tipo": "NUEVA_FUNCIONALIDAD",
        "cantidad": 30
      }
    ]
  }
}
```

## 🔍 Filtros Opcionales

Todos los endpoints soportan los siguientes parámetros de consulta opcionales:

```http
GET /api/reportes/solicitudes/estados?fecha_inicio=2024-01-01&fecha_fin=2024-12-31&estado=PENDIENTE
```

**Parámetros disponibles:**
- `fecha_inicio` (YYYY-MM-DD): Filtrar desde esta fecha
- `fecha_fin` (YYYY-MM-DD): Filtrar hasta esta fecha
- `estado`: Filtrar por estado específico
- `prioridad`: Filtrar por prioridad específica
- `tipo_cambio`: Filtrar por tipo de cambio específico
- `desarrollador_id`: Filtrar por desarrollador específico (UUID)

## 📝 Auditoría

Todos los accesos a reportes se registran automáticamente con:
- Usuario que accedió
- Timestamp del acceso
- Tipo de reporte consultado

## ⚠️ Errores Comunes

### 401 - No Autenticado
```json
{
  "success": false,
  "message": "Token no válido"
}
```

### 403 - Sin Permisos
```json
{
  "success": false,
  "message": "Acceso denegado. Los reportes de solicitudes son exclusivos para usuarios MASTER."
}
```

### 400 - Parámetros Inválidos
```json
{
  "success": false,
  "message": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"
}
```

### 500 - Error del Servidor
```json
{
  "success": false,
  "message": "Error al generar reporte de solicitudes por estado"
}
```

## 🚀 Uso Recomendado

1. **Primero** obtén la lista de reportes disponibles
2. **Luego** consulta reportes específicos según necesidades
3. **Utiliza filtros** para análisis más detallados
4. **Monitorea logs** para auditoría de accesos

## 📊 Casos de Uso

- **Dashboard Ejecutivo**: Usar endpoint `/resumen`
- **Análisis de Tendencias**: Usar endpoint `/mensual`
- **Gestión de Carga**: Usar endpoint `/desarrolladores`
- **Control de Calidad**: Usar endpoint `/completadas`
- **Análisis de Prioridades**: Usar endpoints específicos por clasificación 