# Phase 2: Verification & Recovery System

## 📋 Descripción

Esta fase implementa el sistema de verificación de email y recuperación de contraseñas siguiendo los principios SOLID y Clean Architecture.

## 🏗️ Arquitectura Implementada

### Domain Layer

- **Entities**: `VerificationToken.ts` - Entidad para tokens de verificación
- **Services**:
  - `VerificationService.ts` - Lógica de verificación de email
  - `PasswordRecoveryService.ts` - Lógica de recuperación de contraseña
- **Repositories**: Interfaces para abstracción de datos

### Application Layer

- **Use Cases**:
  - `SendEmailVerificationUseCase.ts` - Envío de verificación
  - `VerifyEmailUseCase.ts` - Verificación de email
  - `RequestPasswordResetUseCase.ts` - Solicitud de recuperación
  - `ValidateResetTokenUseCase.ts` - Validación de token
  - `ResetPasswordUseCase.ts` - Restablecimiento de contraseña

### Infrastructure Layer

- **Repositories**: `VerificationTokenRepository.ts` - Implementación con Prisma
- **External Services**: `EmailService.ts` - Servicio de envío de emails
- **Config**: Contenedor de dependencias y configuración

### Presentation Layer

- **Controllers**: Controladores HTTP para verificación y recuperación
- **Routes**: Definición de endpoints REST

## 🔌 Endpoints Disponibles

### Verificación de Email

```
POST /api/v2/verification/send
GET  /api/v2/verification/verify?token={token}
```

### Recuperación de Contraseña

```
POST /api/v2/password-recovery/forgot
GET  /api/v2/password-recovery/validate?token={token}
POST /api/v2/password-recovery/reset
```

## 🔄 Integración

Para integrar en la aplicación principal:

1. Importar las rutas:

```typescript
import { apiRoutes } from "./src/presentation/routes";

// En tu app.ts
app.use("/api/v2", apiRoutes);
```

2. Configurar el cleanup:

```typescript
import { DIContainer } from "./src/infrastructure/config/DIContainer";

// Al cerrar la aplicación
process.on("SIGTERM", async () => {
  await DIContainer.getInstance().dispose();
});
```

## 🎯 Principios SOLID Aplicados

- **SRP**: Cada clase tiene una sola responsabilidad
- **OCP**: Sistema extensible sin modificar código existente
- **LSP**: Interfaces respetadas en implementaciones
- **ISP**: Interfaces pequeñas y específicas
- **DIP**: Dependencias invertidas mediante interfaces

## 📝 Funcionalidades

### ✅ Verificación de Email

- Generación segura de tokens
- Envío de emails con enlaces de verificación
- Verificación de tokens con expiración
- Marcado de usuarios como verificados

### 🔐 Recuperación de Contraseña

- Solicitud segura de recuperación
- Validación de tokens con expiración
- Restablecimiento seguro de contraseñas
- Invalidación de tokens usados

## 🔒 Seguridad

- Tokens criptográficamente seguros (32 bytes)
- Expiración de tokens (24h verificación, 1h recuperación)
- Tokens de un solo uso
- Validación de entrada y sanitización
- Manejo seguro de errores (no exposición de información)
