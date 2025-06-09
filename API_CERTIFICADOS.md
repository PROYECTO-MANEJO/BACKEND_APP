# API de Certificados - Generación Automática y Manual

Esta API proporciona funcionalidades completas para la generación, gestión y descarga de certificados de aprobación para cursos y eventos.

## 🔐 Autenticación Requerida

Todos los endpoints requieren:
- **Token JWT válido** en el header `Authorization: Bearer <token>`
- Para endpoints administrativos: **Rol de ADMINISTRADOR** o **MASTER**

## 📋 Características Principales

### ✅ Generación Automática
- Los certificados se generan **automáticamente** cuando se aprueba una participación
- Para eventos: Se requiere **≥70% de asistencia**
- Para cursos: Se requiere **≥70% nota final Y ≥70% asistencia**

### ✅ Almacenamiento Optimizado
- Los certificados se almacenan como **datos binarios** en la base de datos
- No requiere sistema de archivos externo
- Incluye metadatos: nombre del archivo, tamaño, fecha de generación

### ✅ Diseño Profesional
- Certificados con diseño profesional en formato PDF
- Diferentes estilos para eventos (participación) y cursos (aprobación)
- Información completa: participante, fechas, calificaciones, organizador

## 📋 Endpoints Disponibles

### 1. Obtener Mis Certificados

**GET** `/api/certificados/mis-certificados`

Obtiene todos los certificados generados para el usuario autenticado.

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Certificados obtenidos exitosamente",
  "data": {
    "total": 3,
    "eventos": [
      {
        "id": "uuid-participacion",
        "tipo": "evento",
        "titulo": "Conferencia de IA 2024",
        "categoria": "Tecnología",
        "fecha_inicio": "2024-01-15",
        "fecha_fin": "2024-01-16",
        "fecha_certificado": "2024-01-17",
        "asistencia": 85,
        "aprobado": true,
        "url_descarga": "/api/certificados/descargar/evento/uuid-participacion"
      }
    ],
    "cursos": [
      {
        "id": "uuid-participacion-curso",
        "tipo": "curso",
        "titulo": "Programación Avanzada en Python",
        "categoria": "Desarrollo",
        "fecha_inicio": "2024-02-01",
        "fecha_fin": "2024-02-28",
        "fecha_certificado": "2024-03-01",
        "nota_final": 85.5,
        "asistencia": 92.0,
        "aprobado": true,
        "url_descarga": "/api/certificados/descargar/curso/uuid-participacion-curso"
      }
    ],
    "todos": [
      // Array combinado ordenado por fecha de generación
    ]
  }
}
```

### 2. Generar Certificado de Evento (Manual)

**POST** `/api/certificados/evento/:idEvento/:idInscripcion`

Genera manualmente un certificado para un evento (si no se generó automáticamente).

#### Parámetros:
- `idEvento`: UUID del evento
- `idInscripcion`: UUID de la inscripción

#### Condiciones:
- Usuario debe estar inscrito en el evento
- Pago debe estar aprobado (si no es gratuito)
- Participación debe estar aprobada (≥70% asistencia)
- No debe existir certificado previo

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Certificado generado exitosamente",
  "data": {
    "certificado_filename": "certificado_evento_uuid_timestamp.pdf",
    "certificado_size": 245760,
    "evento": "Conferencia de IA 2024",
    "participante": "Juan Pérez",
    "fecha_generacion": "2024-01-17T10:30:00Z",
    "asistencia": 85
  }
}
```

### 3. Generar Certificado de Curso (Manual)

**POST** `/api/certificados/curso/:idCurso/:idInscripcion`

Genera manualmente un certificado para un curso (si no se generó automáticamente).

#### Parámetros:
- `idCurso`: UUID del curso
- `idInscripcion`: UUID de la inscripción

#### Condiciones:
- Usuario debe estar inscrito en el curso
- Pago debe estar aprobado (si no es gratuito)
- Participación debe estar aprobada (≥70% nota y ≥70% asistencia)
- No debe existir certificado previo

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Certificado generado exitosamente",
  "data": {
    "certificado_filename": "certificado_curso_uuid_timestamp.pdf",
    "certificado_size": 267840,
    "curso": "Programación Avanzada en Python",
    "participante": "María González",
    "fecha_generacion": "2024-03-01T15:45:00Z",
    "nota_final": 85.5,
    "asistencia": 92.0
  }
}
```

### 4. Descargar Certificado

**GET** `/api/certificados/descargar/:tipo/:idParticipacion`

Descarga un certificado existente en formato PDF.

#### Parámetros:
- `tipo`: `'evento'` o `'curso'`
- `idParticipacion`: UUID de la participación

#### Respuesta:
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="certificado_xxx.pdf"`
- Archivo PDF binario

### 5. Regenerar Certificado (Solo Admin)

**PUT** `/api/certificados/regenerar/:tipo/:idParticipacion`

Regenera un certificado existente (útil para corregir errores o cambios de diseño).

#### Parámetros:
- `tipo`: `'evento'` o `'curso'`
- `idParticipacion`: UUID de la participación

#### Requiere:
- Rol de **ADMINISTRADOR** o **MASTER**
- Participación debe estar aprobada

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Certificado de evento regenerado exitosamente",
  "certificado_filename": "certificado_evento_uuid_nuevo_timestamp.pdf",
  "certificado_size": 245760
}
```

## 🚀 Integración con el Sistema Existente

### Generación Automática

Los certificados se generan automáticamente cuando se registra una participación aprobada a través de:

- **POST** `/api/administracion/evento/:idEvento/participacion`
- **POST** `/api/administracion/curso/:idCurso/participacion`

La respuesta incluirá información del certificado generado:

```json
{
  "success": true,
  "message": "Participación registrada exitosamente",
  "data": {
    // ... datos de participación ...
    "certificado": {
      "success": true,
      "message": "Certificado de evento generado automáticamente",
      "certificado_filename": "certificado_evento_uuid_timestamp.pdf",
      "certificado_size": 245760
    }
  }
}
```

## 📊 Estructura de Base de Datos

### Tabla PARTICIPACIONES (Eventos)
```sql
-- Nuevas columnas para certificados
CERTIFICADO_PDF          BYTEA          -- Archivo PDF como datos binarios
CERTIFICADO_FILENAME     VARCHAR(255)   -- Nombre del archivo
CERTIFICADO_SIZE         INTEGER        -- Tamaño en bytes
FEC_CER_PAR             DATE           -- Fecha de generación
```

### Tabla PARTICIPACIONES_CURSO (Cursos)
```sql
-- Nuevas columnas para certificados
CERTIFICADO_PDF          BYTEA          -- Archivo PDF como datos binarios
CERTIFICADO_FILENAME     VARCHAR(255)   -- Nombre del archivo
CERTIFICADO_SIZE         INTEGER        -- Tamaño en bytes
FEC_CER_PAR_CUR         DATE           -- Fecha de generación
```

## 🎨 Diseño de Certificados

### Certificado de Evento (Participación)
- **Color principal**: Azul corporativo (#3498DB)
- **Título**: "CERTIFICADO DE PARTICIPACIÓN"
- **Información**: Evento, fechas, categoría, asistencia
- **Formato**: Paisaje A4

### Certificado de Curso (Aprobación)
- **Color principal**: Verde (#27AE60)
- **Título**: "CERTIFICADO DE APROBACIÓN"
- **Información**: Curso, fechas, duración, nota final, asistencia
- **Formato**: Paisaje A4

## 🔧 Funcionalidades Técnicas

### Validaciones
- ✅ Verificación de permisos de acceso
- ✅ Validación de estado de pago
- ✅ Verificación de aprobación de participación
- ✅ Prevención de duplicados
- ✅ Manejo robusto de errores

### Optimizaciones
- ✅ Almacenamiento eficiente en base de datos
- ✅ Generación bajo demanda
- ✅ Metadatos para gestión
- ✅ Diseño responsive para diferentes dispositivos

## 🚨 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "El participante no ha sido aprobado en el evento. Se requiere al menos 70% de asistencia."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Certificado no encontrado"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Solo los administradores pueden regenerar certificados"
}
```

## 📝 Notas de Implementación

1. **Migración**: Las columnas de certificados reemplazan las antiguas columnas de enlaces (`ENL_CER_PAR`, `ENL_CER_PAR_CUR`)

2. **Rendimiento**: Los PDFs se almacenan comprimidos en la base de datos para optimizar el espacio

3. **Escalabilidad**: El sistema puede manejar miles de certificados sin impacto significativo

4. **Mantenimiento**: Los certificados regenerados reemplazan automáticamente los anteriores

## 🔄 Flujo de Trabajo Típico

1. **Inscripción**: Usuario se inscribe en curso/evento
2. **Aprobación de pago**: Admin aprueba el pago (si aplica)
3. **Participación**: Usuario participa en curso/evento
4. **Registro de asistencia/notas**: Admin registra participación
5. **Generación automática**: Si aprobado → certificado se genera automáticamente
6. **Descarga**: Usuario puede descargar su certificado desde el perfil

Este módulo proporciona una solución completa, automatizada y profesional para la gestión de certificados en el sistema de cursos y eventos. 