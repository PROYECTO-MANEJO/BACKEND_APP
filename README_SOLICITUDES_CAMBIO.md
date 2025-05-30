# Sistema de Gestión de Control de Cambios

## Descripción

Este sistema permite a los usuarios enviar solicitudes de cambio para la aplicación, las cuales son revisadas y gestionadas por los administradores. Proporciona un flujo completo desde la creación de la solicitud hasta su implementación y seguimiento.

## Características Principales

- ✅ **Creación de Solicitudes**: Los usuarios pueden crear solicitudes detalladas con título, descripción, justificación, tipo y prioridad
- ✅ **Gestión por Roles**: Usuarios regulares y administradores con diferentes permisos
- ✅ **Estados de Seguimiento**: Sistema completo de estados para seguir el progreso de cada solicitud
- ✅ **Filtros y Paginación**: Búsqueda avanzada con filtros por estado, tipo y prioridad
- ✅ **Estadísticas**: Dashboard con métricas de solicitudes para administradores
- ✅ **Validaciones**: Validación completa de datos de entrada
- ✅ **Autenticación JWT**: Seguridad basada en tokens

## Instalación y Configuración

### 1. Migrar la Base de Datos

```bash
# Opción 1: Usar el script automatizado
npm run migrate

# Opción 2: Manualmente
npx prisma generate
npx prisma db push
```

### 2. Verificar la Migración

Después de ejecutar la migración, deberías ver la nueva tabla `SOLICITUDES_CAMBIO` en tu base de datos PostgreSQL con todos los campos y relaciones necesarias.

### 3. Iniciar el Servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000` (o el puerto configurado en tu variable de entorno PORT).

## Estructura de la Base de Datos

### Tabla: SOLICITUDES_CAMBIO

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID_SOL | UUID | Identificador único (Primary Key) |
| TITULO_SOL | VARCHAR(200) | Título de la solicitud |
| DESCRIPCION_SOL | TEXT | Descripción detallada del cambio |
| JUSTIFICACION_SOL | TEXT | Justificación del cambio |
| TIPO_CAMBIO_SOL | ENUM | Tipo de cambio solicitado |
| PRIORIDAD_SOL | ENUM | Prioridad de la solicitud |
| ESTADO_SOL | ENUM | Estado actual de la solicitud |
| FEC_CREACION_SOL | TIMESTAMP | Fecha de creación (automática) |
| FEC_RESPUESTA_SOL | TIMESTAMP | Fecha de respuesta del admin |
| COMENTARIOS_ADMIN_SOL | TEXT | Comentarios del administrador |
| ID_USUARIO_SOL | UUID | Usuario que creó la solicitud (FK) |
| ID_ADMIN_RESP_SOL | UUID | Admin que respondió (FK) |

### Enums Disponibles

**TipoCambio:**
- `NUEVA_FUNCIONALIDAD`
- `MEJORA_EXISTENTE`
- `CORRECCION_ERROR`
- `CAMBIO_INTERFAZ`
- `OPTIMIZACION`
- `OTRO`

**PrioridadSolicitud:**
- `BAJA`
- `MEDIA`
- `ALTA`
- `CRITICA`

**EstadoSolicitud:**
- `PENDIENTE`
- `EN_REVISION`
- `APROBADA`
- `RECHAZADA`
- `EN_DESARROLLO`
- `COMPLETADA`

## Endpoints de la API

### Para Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/solicitudes-cambio/` | Crear nueva solicitud |
| GET | `/api/solicitudes-cambio/mis-solicitudes` | Obtener mis solicitudes |
| GET | `/api/solicitudes-cambio/mis-solicitudes/:id` | Obtener solicitud específica |

### Para Administradores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/solicitudes-cambio/admin/todas` | Obtener todas las solicitudes |
| PUT | `/api/solicitudes-cambio/admin/:id/responder` | Aprobar/rechazar solicitud |
| PUT | `/api/solicitudes-cambio/admin/:id/estado` | Actualizar estado |
| GET | `/api/solicitudes-cambio/admin/estadisticas` | Obtener estadísticas |
| GET | `/api/solicitudes-cambio/admin/:id` | Ver solicitud específica |

## Flujo de Trabajo

```
1. Usuario crea solicitud
   ↓
2. Estado: PENDIENTE
   ↓
3. Admin revisa → Estado: EN_REVISION
   ↓
4. Admin decide:
   ├── APROBADA → Continúa al paso 5
   └── RECHAZADA → Fin del proceso
   ↓
5. Desarrollo inicia → Estado: EN_DESARROLLO
   ↓
6. Desarrollo termina → Estado: COMPLETADA
```

## Ejemplos de Uso

### Crear una Solicitud

```javascript
const response = await fetch('/api/solicitudes-cambio/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-token': 'tu_jwt_token'
  },
  body: JSON.stringify({
    titulo_sol: 'Implementar modo oscuro',
    descripcion_sol: 'Agregar un modo oscuro para mejorar la experiencia del usuario en condiciones de poca luz.',
    justificacion_sol: 'Muchos usuarios han solicitado esta característica para uso nocturno.',
    tipo_cambio_sol: 'NUEVA_FUNCIONALIDAD',
    prioridad_sol: 'MEDIA'
  })
});
```

### Aprobar una Solicitud (Admin)

```javascript
const response = await fetch('/api/solicitudes-cambio/admin/123e4567-e89b-12d3-a456-426614174000/responder', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-token': 'admin_jwt_token'
  },
  body: JSON.stringify({
    estado_sol: 'APROBADA',
    comentarios_admin_sol: 'Solicitud aprobada. Se iniciará desarrollo en el próximo sprint.'
  })
});
```

## Validaciones

### Creación de Solicitudes

- **Título**: Obligatorio, 5-200 caracteres
- **Descripción**: Obligatorio, mínimo 10 caracteres
- **Justificación**: Obligatorio, mínimo 10 caracteres
- **Tipo de cambio**: Obligatorio, debe ser un valor válido del enum
- **Prioridad**: Opcional, debe ser un valor válido del enum (default: MEDIA)

### Respuestas de Administrador

- **Estado**: Obligatorio, solo puede ser APROBADA, RECHAZADA o EN_REVISION
- **Comentarios**: Opcional, máximo 1000 caracteres

## Seguridad

- 🔐 **Autenticación JWT**: Todas las rutas requieren token válido
- 🛡️ **Autorización por Roles**: Los endpoints de admin solo son accesibles por administradores
- ✅ **Validación de Datos**: Todas las entradas son validadas
- 🔒 **Aislamiento de Datos**: Los usuarios solo pueden ver sus propias solicitudes

## Monitoreo y Estadísticas

Los administradores pueden acceder a estadísticas completas:

- Total de solicitudes por estado
- Distribución por tipo de cambio
- Distribución por prioridad
- Métricas de tiempo de respuesta

## Consideraciones de Rendimiento

- **Paginación**: Todas las listas incluyen paginación automática
- **Índices**: Los campos de filtro tienen índices para consultas rápidas
- **Consultas Optimizadas**: Uso de `include` selectivo para evitar overfetching

## Próximas Mejoras

- [ ] Notificaciones por email
- [ ] Archivos adjuntos en solicitudes
- [ ] Historial de cambios de estado
- [ ] Asignación de solicitudes a desarrolladores específicos
- [ ] Estimación de tiempo de implementación
- [ ] Comentarios adicionales de usuarios

## Soporte

Para cualquier duda o problema:
1. Revisar la documentación de la API en `API_SOLICITUDES_CAMBIO.md`
2. Verificar los logs del servidor
3. Comprobar que la migración se ejecutó correctamente
4. Verificar que el usuario tiene los permisos correctos

¡El sistema está listo para usar! 🚀 