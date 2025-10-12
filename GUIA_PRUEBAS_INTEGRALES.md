# 🧪 GUÍA DE PRUEBAS INTEGRALES - SISTEMA COMPLETO

## 📋 **CHECKLIST DE VERIFICACIÓN**

### 🔐 **FASE 1: AUTENTICACIÓN Y ACCESOS**

#### ✅ **Prueba 1.1: Registro y Login**
```bash
# 1. Registrar nuevo usuario
POST /api/auth/register
{
  "ced_usu": "1234567890",
  "nom_usu1": "Juan",
  "ape_usu1": "Pérez",
  "cor_cue": "juan.perez@test.com",
  "pas_cue": "Password123!"
}

# 2. Login del usuario
POST /api/auth/login
{
  "cor_cue": "juan.perez@test.com",
  "pas_cue": "Password123!"
}
# Debe retornar: token JWT
```

#### ✅ **Prueba 1.2: Acceso con Admin**
```bash
# Login como administrador
POST /api/auth/login
{
  "cor_cue": "oriofrio0126@gmail.com",
  "pas_cue": "Re2478ri@"
}
# Debe retornar: token JWT con permisos admin
```

---

### 👤 **FASE 2: FUNCIONALIDADES DE USUARIO NORMAL**

#### ✅ **Prueba 2.1: Dashboard/Homepage**
```bash
# Obtener contenido de la página principal
GET /api/homepage/content
# Debe retornar: contenido de la homepage

# Obtener eventos/cursos disponibles
GET /api/pagina-principal/eventos-cursos-disponibles
# Debe retornar: lista de eventos y cursos disponibles
```

#### ✅ **Prueba 2.2: Solicitudes de Cambio**
```bash
# Crear nueva solicitud (requiere JWT)
POST /api/change-requests
Authorization: Bearer {token}
{
  "titulo_sol": "Mejora en el sistema de login",
  "descripcion_sol": "Agregar autenticación de dos factores",
  "tipo_cambio_sol": "NUEVA_FUNCIONALIDAD",
  "prioridad_sol": "MEDIA"
}

# Obtener mis solicitudes
GET /api/change-requests/my-requests
Authorization: Bearer {token}
# Debe retornar: lista de solicitudes del usuario
```

#### ✅ **Prueba 2.3: Inscripciones**
```bash
# Inscribirse a un evento (requiere JWT)
POST /api/inscriptions/events
Authorization: Bearer {token}
{
  "id_eve": "{eventId}",
  "val_ins": 25.00
}

# Obtener mis inscripciones
GET /api/inscriptions/my-events
Authorization: Bearer {token}
# Debe retornar: lista de eventos inscritos
```

#### ✅ **Prueba 2.4: Certificados**
```bash
# Obtener mis certificados
GET /api/certificates/my-certificates
Authorization: Bearer {token}
# Debe retornar: lista de certificados disponibles

# Generar certificado de evento
POST /api/certificates/generar-evento/{participationId}
Authorization: Bearer {token}
# Debe retornar: confirmación de generación
```

---

### 👑 **FASE 3: FUNCIONALIDADES ADMINISTRATIVAS**

#### ✅ **Prueba 3.1: Dashboard Admin**
```bash
# Obtener estadísticas del dashboard (requiere JWT admin)
GET /api/admin/dashboard
Authorization: Bearer {adminToken}
# Debe retornar: estadísticas generales del sistema

# Obtener actividad reciente
GET /api/admin/recent-activity
Authorization: Bearer {adminToken}
# Debe retornar: últimas actividades del sistema
```

#### ✅ **Prueba 3.2: Gestión de Cursos**
```bash
# Crear nuevo curso (requiere JWT admin)
POST /api/cursos
Authorization: Bearer {adminToken}
{
  "nom_cur": "Curso de Prueba",
  "des_cur": "Descripción del curso",
  "fec_ini_cur": "2025-02-01",
  "fec_fin_cur": "2025-02-28",
  "precio": 50.00,
  "cupos": 30,
  "id_cat": "{categoryId}",
  "ced_org": "{organizerId}"
}

# Listar cursos administrativos
GET /api/cursos
Authorization: Bearer {adminToken}
# Debe retornar: lista completa de cursos con detalles admin
```

#### ✅ **Prueba 3.3: Gestión de Eventos**
```bash
# Crear nuevo evento (requiere JWT admin)
POST /api/eventos
Authorization: Bearer {adminToken}
{
  "nom_eve": "Evento de Prueba",
  "des_eve": "Descripción del evento",
  "fec_ini_eve": "2025-02-15",
  "fec_fin_eve": "2025-02-15",
  "precio": 25.00,
  "cupos": 100,
  "id_cat": "{categoryId}",
  "ced_org": "{organizerId}"
}

# Listar eventos administrativos
GET /api/eventos
Authorization: Bearer {adminToken}
# Debe retornar: lista completa de eventos con detalles admin
```

#### ✅ **Prueba 3.4: Aprobación de Inscripciones**
```bash
# Obtener inscripciones pendientes
GET /api/admin/inscriptions/events/pending
Authorization: Bearer {adminToken}
# Debe retornar: inscripciones de eventos pendientes de aprobación

# Aprobar inscripción
PUT /api/admin/inscriptions/events/{inscriptionId}/approve
Authorization: Bearer {adminToken}
# Debe retornar: confirmación de aprobación
```

#### ✅ **Prueba 3.5: Gestión de Participaciones**
```bash
# Obtener inscripciones para registrar participación
GET /api/admin/participations/events/{eventId}/inscriptions
Authorization: Bearer {adminToken}
# Debe retornar: inscripciones aprobadas del evento

# Registrar participación
POST /api/admin/participations/events/{eventId}/register
Authorization: Bearer {adminToken}
{
  "participaciones": [
    {
      "id_ins": "{inscriptionId}",
      "asistencia": 85,
      "nota": 92
    }
  ]
}
```

#### ✅ **Prueba 3.6: Generación de Certificados**
```bash
# Obtener participantes aprobados
GET /api/admin/certificates/events/{eventId}/participants
Authorization: Bearer {adminToken}
# Debe retornar: participantes elegibles para certificado

# Generar certificados masivos
POST /api/admin/certificates/events/generate-massive
Authorization: Bearer {adminToken}
{
  "eventId": "{eventId}",
  "participantIds": ["{participationId1}", "{participationId2}"]
}
```

#### ✅ **Prueba 3.7: Sistema de Reportes**
```bash
# Generar reporte financiero
POST /api/admin/reports/financial/generate
Authorization: Bearer {adminToken}
# Debe retornar: confirmación de generación del reporte

# Generar reporte de usuarios
POST /api/admin/reports/users/generate
Authorization: Bearer {adminToken}
# Debe retornar: confirmación de generación del reporte

# Listar reportes generados
GET /api/admin/reports?tipo=FINANZAS
Authorization: Bearer {adminToken}
# Debe retornar: lista de reportes financieros

# Descargar reporte
GET /api/admin/reports/{reportId}/download
Authorization: Bearer {adminToken}
# Debe retornar: archivo PDF del reporte
```

---

### 🔧 **FASE 4: FUNCIONALIDADES MASTER**

#### ✅ **Prueba 4.1: Gestión de Usuarios**
```bash
# Listar todos los usuarios (requiere MASTER)
GET /api/admin/users
Authorization: Bearer {masterToken}
# Debe retornar: lista completa de usuarios

# Crear nuevo usuario
POST /api/admin/users
Authorization: Bearer {masterToken}
{
  "ced_usu": "9876543210",
  "nom_usu1": "María",
  "ape_usu1": "González",
  "cor_cue": "maria.gonzalez@test.com",
  "rol_cue": "ADMINISTRADOR"
}
```

#### ✅ **Prueba 4.2: Reportes Avanzados (MASTER only)**
```bash
# Reporte de solicitudes por estado
POST /api/admin/reports/change-requests/status/generate
Authorization: Bearer {masterToken}
# Debe retornar: confirmación (solo MASTER puede acceder)

# Reporte por desarrollador
POST /api/admin/reports/change-requests/developers/generate
Authorization: Bearer {masterToken}
# Debe retornar: confirmación (solo MASTER puede acceder)

# Reporte ejecutivo
POST /api/admin/reports/change-requests/summary/generate
Authorization: Bearer {masterToken}
# Debe retornar: confirmación (solo MASTER puede acceder)
```

---

### 🔄 **FASE 5: FLUJO COMPLETO INTEGRADO**

#### ✅ **Prueba 5.1: Flujo Usuario → Admin → Usuario**
```bash
# 1. Usuario se registra y hace login
POST /api/auth/register → POST /api/auth/login

# 2. Usuario crea solicitud de cambio
POST /api/change-requests

# 3. Usuario se inscribe a evento
POST /api/inscriptions/events

# 4. Admin aprueba la inscripción
PUT /api/admin/inscriptions/events/{id}/approve

# 5. Admin registra participación
POST /api/admin/participations/events/{eventId}/register

# 6. Admin genera certificado
POST /api/admin/certificates/events/generate-massive

# 7. Usuario descarga su certificado
GET /api/certificates/my-certificates
GET /api/certificates/download/{tipo}/{id}

# 8. Admin genera reporte del evento
POST /api/admin/reports/events/generate
```

---

### 🛡️ **FASE 6: VERIFICACIÓN DE SEGURIDAD**

#### ✅ **Prueba 6.1: Autorización por Roles**
```bash
# Intentar acceso admin sin permisos (debe fallar)
GET /api/admin/dashboard
# Sin Authorization header → 401 Unauthorized

# Intentar acceso MASTER con token de usuario normal (debe fallar)
GET /api/admin/users
Authorization: Bearer {normalUserToken}
# → 403 Forbidden

# Intentar acceso correcto
GET /api/admin/dashboard
Authorization: Bearer {adminToken}
# → 200 OK con datos
```

#### ✅ **Prueba 6.2: Validación de Datos**
```bash
# Crear curso con datos inválidos (debe fallar)
POST /api/cursos
Authorization: Bearer {adminToken}
{
  "nom_cur": "",  # Campo vacío
  "precio": -10   # Precio negativo
}
# → 400 Bad Request con mensaje de error específico
```

---

### 📊 **FASE 7: VERIFICACIÓN DE COMPATIBILIDAD**

#### ✅ **Prueba 7.1: Rutas Legacy**
```bash
# Probar rutas legacy del frontend
GET /api/pagina-principal/contenido
# Debe funcionar igual que GET /api/homepage/content

POST /api/solicitudes-cambio/solicitud-nueva
# Debe funcionar igual que POST /api/change-requests

GET /api/inscripciones/evento/mis-inscripciones
# Debe funcionar igual que GET /api/inscriptions/my-events
```

---

## 🎯 **CRITERIOS DE ÉXITO**

### ✅ **Funcionalidad**
- [ ] Todos los endpoints responden correctamente
- [ ] Los datos se almacenan y recuperan correctamente
- [ ] Los archivos (PDFs, imágenes) se manejan correctamente
- [ ] Las validaciones funcionan como se espera

### ✅ **Seguridad**
- [ ] La autenticación JWT funciona correctamente
- [ ] Los roles y permisos se respetan
- [ ] Los accesos no autorizados son rechazados
- [ ] Las validaciones de entrada previenen inyecciones

### ✅ **Integración**
- [ ] El frontend puede conectarse sin modificaciones
- [ ] Las rutas legacy funcionan correctamente
- [ ] Los flujos completos usuario-admin funcionan
- [ ] Los reportes se generan y descargan correctamente

### ✅ **Performance**
- [ ] Los endpoints responden en tiempo razonable
- [ ] Las consultas a la base de datos son eficientes
- [ ] La generación de PDFs no bloquea el servidor
- [ ] El sistema maneja múltiples usuarios concurrentes

---

## 🚀 **COMANDOS DE PRUEBA RÁPIDA**

### Para probar rápidamente el sistema:

```bash
# 1. Verificar que el servidor esté funcionando
curl http://localhost:3000/health

# 2. Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cor_cue":"oriofrio0126@gmail.com","pas_cue":"Re2478ri@"}'

# 3. Probar endpoint público
curl http://localhost:3000/api/courses

# 4. Probar endpoint con autenticación (usando token del login)
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:3000/api/admin/dashboard
```

---

## 🎊 **¡SISTEMA LISTO PARA PRODUCCIÓN!**

**Si todas las pruebas pasan exitosamente, el sistema está:**
- ✅ **Completamente funcional**
- ✅ **Seguro y robusto**
- ✅ **Compatible con el frontend**
- ✅ **Siguiendo Clean Architecture**
- ✅ **Implementando SOLID principles**
- ✅ **Listo para uso en producción**

**¡La refactorización ha sido un éxito total!** 🚀
