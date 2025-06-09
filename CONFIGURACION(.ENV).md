# Configuración del archivo .env

Este proyecto utiliza variables de entorno para configurar la conexión a la base de datos, la seguridad, el envío de correos y la URL del frontend. Cada uno de estos parámetros es esencial para que el proyecto se ejecute correctamente, tanto en desarrollo como en producción.

## Archivo .env

Crea un archivo llamado **.env** en la raíz del directorio del proyecto (en este caso, en BACKEND_APP). Asegúrate de que este archivo **no sea versionado** (agrega .env a tu .gitignore).

### Variables de entorno necesarias

#### Base de Datos

- **DATABASE_URL**: Cadena de conexión completa a tu base de datos PostgreSQL.  
  Ejemplo:
  ```
  DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_basedatos?schema=public"
  ```

- **PGDATABASE**, **PGUSER**, **PGHOST**, **PGPORT**: Variables opcionales que también puedes usar para la conexión local.
  ```
  PGDATABASE=nombre_basedatos
  PGUSER=usuario
  PGHOST=localhost
  PGPORT=5432
  ```

#### Seguridad

- **SECRET_KEY**: Clave secreta para firmar y verificar tokens (por ejemplo, JWT).  
  Ejemplo:
  ```
  SECRET_KEY="TuClaveSecretaAquí"
  ```

#### Configuración SMTP (envío de correos)

Estas variables se utilizan para enviar correos electrónicos (por ejemplo, correos de recuperación de contraseña).  
Ejemplo usando Gmail:
```
SMTP_HOST=smtp.gmail.com
SMTP_USER=tuemail@gmail.com
SMTP_PASS=tucontraseña_o_app_password
SMTP_PORT=587
SMTP_SECURE=false
```
> **Nota:** Si usas Gmail, es posible que necesites configurar [contraseñas de aplicaciones](https://support.google.com/accounts/answer/185833) y habilitar el acceso para aplicaciones menos seguras.

#### URL del Frontend

- **FRONTEND_URL**: La URL base de la parte frontend de la aplicación, necesaria para generar enlaces en los correos de recuperación, entre otros.  
  Ejemplo en entorno de desarrollo:
  ```
  FRONTEND_URL=http://localhost:5173
  ```

## Ejemplo completo

A continuación se muestra un ejemplo completo de cómo debería quedar el archivo .env:

```
DATABASE_URL="postgresql://adrian:root@localhost:5432/Cursos_Fisei?schema=public"

PGDATABASE=Cursos_Fisei
PGUSER=adrian
PGHOST=localhost
PGPORT=5432

SECRET_KEY="FiseiSecretKey"

SMTP_HOST=smtp.gmail.com
SMTP_USER=tuemail@gmail.com
SMTP_PASS=tucontraseña_o_app_password
SMTP_PORT=587
SMTP_SECURE=false

FRONTEND_URL=http://localhost:5173
```

## Consideraciones

- **Seguridad:** Nunca compartas tu archivo .env públicamente ni incluyas información sensible en el repositorio.  
- **Migraciones:** Si realizas cambios al esquema de la base de datos, asegúrate de ejecutar las migraciones correspondientes (por ejemplo, usando `npx prisma migrate dev`).

Con estas configuraciones, el proyecto podrá conectarse correctamente a la base de datos, firmar tokens, enviar correos para recuperación de contraseñas y generar enlaces apuntando al frontend.