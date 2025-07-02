# Scripts de Población de Datos

Este directorio contiene scripts para poblar la base de datos con datos iniciales de categorías, organizadores y carreras.

## Scripts Disponibles

### 1. `poblar_datos_basicos.js`
**Descripción:** Crea categorías y organizadores (no requiere autenticación)

**Uso:**
```bash
cd BACKEND_APP
node scripts/poblar_datos_basicos.js
```

**Datos que crea:**
- 8 categorías de eventos (TECNOLOGÍA, CIENCIAS, INVESTIGACIÓN, etc.)
- 5 organizadores de ejemplo

### 2. `poblar_carreras.js`
**Descripción:** Crea carreras universitarias (requiere autenticación de administrador)

**Uso:**
```bash
cd BACKEND_APP
node scripts/poblar_carreras.js
```

**Prerrequisitos:**
- Tener un usuario con rol MASTER o ADMINISTRADOR
- Configurar las credenciales correctas en el script

**Datos que crea:**
- 10 carreras universitarias con sus facultades

### 3. `poblar_datos.js`
**Descripción:** Script completo que crea todo (categorías, organizadores y carreras)

**Uso:**
```bash
cd BACKEND_APP
node scripts/poblar_datos.js
```

### 4. `crear_carreras_ingenieria_directo.js`
**Descripción:** Crea carreras específicas de ingeniería (Software, TI, Industrial, etc.) usando acceso directo a la base de datos

**Uso:**
```bash
cd BACKEND_APP
node scripts/crear_carreras_ingenieria_directo.js
```

**Características:**
- ✅ No requiere autenticación
- 🎯 Enfocado en carreras de ingeniería modernas
- 🔧 Acceso directo a la base de datos
- 📊 Reporte detallado del proceso

**Carreras que crea:**
- Ingeniería de Software
- Ingeniería en Sistemas de Información
- Ingeniería en Tecnologías de la Información
- Ingeniería Industrial
- Ingeniería Mecánica
- Ingeniería en Computación
- Ingeniería en Automatización Industrial
- Ingeniería Electrónica
- Ingeniería en Ciencias de Datos
- Ingeniería en Ciberseguridad
- Ingeniería Mecatrónica
- Ingeniería en Redes y Comunicaciones

### 5. `verificar_servidor.js`
**Descripción:** Verifica que el servidor backend esté funcionando correctamente

**Uso:**
```bash
cd BACKEND_APP
node scripts/verificar_servidor.js
```

**Utilidad:**
- Verifica la conexión al servidor
- Comprueba que los endpoints estén disponibles
- Útil para diagnóstico de problemas

## Configuración

### Para usar los scripts que requieren autenticación:

1. **Edita las credenciales de administrador** en los archivos correspondientes:
   ```javascript
   const ADMIN_CREDENTIALS = {
     email: 'tu_email_admin@example.com',
     password: 'tu_contraseña_admin'
   };
   ```

2. **Asegúrate de que el servidor esté ejecutándose:**
   ```bash
   cd BACKEND_APP
   npm run dev
   ```

3. **Verifica que tengas un usuario administrador** en la base de datos con rol MASTER o ADMINISTRADOR.

## Datos Creados

### Categorías
- TECNOLOGÍA
- CIENCIAS
- INVESTIGACIÓN
- DESARROLLO PROFESIONAL
- INNOVACIÓN
- EDUCACIÓN
- SALUD
- INGENIERÍA

### Organizadores
- María Elena González Rodríguez (PhD en Ciencias de la Computación)
- Carlos Andrés Martínez López (Magíster en Ingeniería de Software)
- Ana Sofía Hernández Vargas (PhD en Investigación Educativa)
- Roberto Silva Montenegro (Especialista en Gestión de Proyectos)
- Diana Patricia Morales Jiménez (Magíster en Innovación y Emprendimiento)

### Carreras
- Ingeniería de Sistemas (Facultad de Ingeniería)
- Ingeniería Civil (Facultad de Ingeniería)
- Medicina (Facultad de Medicina)
- Administración de Empresas (Facultad de Ciencias Económicas)
- Psicología (Facultad de Ciencias Sociales)
- Ingeniería Industrial (Facultad de Ingeniería)
- Derecho (Facultad de Derecho)
- Enfermería (Facultad de Medicina)
- Arquitectura (Facultad de Arquitectura)
- Comunicación Social (Facultad de Comunicación)

## Troubleshooting

### Error de conexión
- Verifica que el servidor backend esté ejecutándose en `http://localhost:3000`
- Revisa que no haya conflictos de puertos

### Error de autenticación
- Verifica las credenciales de administrador
- Asegúrate de que el usuario tenga el rol correcto (MASTER o ADMINISTRADOR)

### Datos duplicados
- Los scripts manejan automáticamente los duplicados
- Si un elemento ya existe, se mostrará una advertencia pero continuará con el siguiente

## Personalización

Para agregar más datos, simplemente edita los arrays en los scripts correspondientes:

```javascript
// Ejemplo: agregar una nueva categoría
const categorias = [
  // ...categorías existentes...
  {
    nom_cat: 'NUEVA CATEGORÍA',
    des_cat: 'Descripción de la nueva categoría'
  }
];
```

## Dependencias

Los scripts requieren:
- `axios` para hacer peticiones HTTP
- Servidor backend ejecutándose
- Base de datos configurada y conectada
