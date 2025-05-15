
# BACKEND_APP - FISEI Gestión de Eventos

## Descripción

Backend del sistema de gestión de cursos y eventos académicos de la FISEI (Universidad Técnica de Ambato).  
Desarrollado con **Node.js**, utiliza **Express** para APIs, **Prisma** como ORM, **Multer** para subida de archivos, **PDFKit** para generación de certificados/reporte en PDF y **dotenv** para la gestión de variables de entorno, entre otras herramientas.

---

## Tecnologías y Herramientas Usadas

| Herramienta   | Propósito |
|---------------|-----------|
| **Node.js**   | Entorno de ejecución para JavaScript en el servidor |
| **Express**   | Framework minimalista para crear APIs REST |
| **Prisma**    | ORM para interactuar con bases de datos SQL |
| **dotenv**    | Manejo de variables de entorno |
| **Multer**    | Subida de archivos (comprobantes, documentos, etc.) |
| **PDFKit**    | Generación dinámica de PDFs (certificados, reportes) |
| **Jest**      | Pruebas automáticas |
| **Morgan**    | Logger de peticiones HTTP |
| **Cors**      | Habilita CORS en la API |
| **JWT**       | Autenticación con JSON Web Tokens |
| **Bcrypt**    | Hash de contraseñas |

---

## Estructura del Proyecto

```
/backend_app
│
├── app.js              # Punto de entrada de la app
├── .env                # Variables de entorno (no subir a git)
├── .env.example        # Ejemplo de variables de entorno
├── package.json
├── prisma/
│   └── schema.prisma
├── models/
├── controllers/
├── routes/
├── middlewares/
├── services/
├── config/
├── database/
├── assets/
│   ├── comprobantes/
│   └── certificados/
├── docs/
├── tests/
```

---

## Instalación y Primeros Pasos

### 1. **Requisitos previos**

- Node.js v18.x o superior  
- npm v9.x o superior  
- PostgreSQL, MySQL, o SQLite (según configuración Prisma)

### 2. **Clona el repositorio**

```bash
git clone <url-del-repo>
cd backend_app
```

### 3. **Instala dependencias**

```bash
npm install
```

### 4. **Configura las variables de entorno**

- Copia `.env.example` a `.env` y coloca los valores reales.

```
PORT=4000
DATABASE_URL=tu-url-bd
JWT_SECRET=miclaveultrasecreta
```

### 5. **Configura y ejecuta la base de datos (Prisma)**

- Modifica `prisma/schema.prisma` según tus modelos.
- Ejecuta las migraciones y genera el cliente Prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. **(Opcional) Visualiza la base de datos con Prisma Studio**

```bash
npx prisma studio
```

### 7. **Arranca el servidor**

```bash
npm run dev
```

La API estará disponible en `http://localhost:4000/`.

---

## Uso y Ejemplos de Cada Herramienta

### **Node.js & Express**

**Express** es el framework base de la API.

```js
const express = require('express');
const app = express();

app.use(express.json()); // Permite recibir JSON
app.get('/', (req, res) => res.send('¡Hola FISEI!'));

app.listen(process.env.PORT, () => {
  console.log('Servidor corriendo en puerto', process.env.PORT);
});
```

---

### **Prisma**

**Prisma** es el ORM para interactuar con la base de datos.

```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar usuarios
app.get('/api/usuarios', async (req, res) => {
  const usuarios = await prisma.usuario.findMany();
  res.json(usuarios);
});
```

**Comando para abrir Prisma Studio (gestión visual de la BD):**
```bash
npx prisma studio
```

---

### **dotenv**

**dotenv** permite cargar variables de entorno desde el archivo `.env`.

```js
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const dbURI = process.env.DATABASE_URL;
```

**No subas tu `.env` real.**  
Incluye siempre un `.env.example` para facilitar la configuración.

---

### **Multer**

**Multer** facilita la subida de archivos (como comprobantes de pago).

```js
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './assets/comprobantes'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/pagos/upload', upload.single('comprobante'), (req, res) => {
  res.json({ file: req.file });
});
```

---

### **PDFKit**

**PDFKit** permite generar archivos PDF dinámicos (ejemplo: certificados).

```js
const PDFDocument = require('pdfkit');
const fs = require('fs');

app.get('/api/certificados/generar', (req, res) => {
  const doc = new PDFDocument();
  const filePath = './assets/certificados/certificado-ejemplo.pdf';
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(25).text('Certificado de Participación', 100, 100);
  doc.end();
  doc.on('finish', () => res.download(filePath));
});
```


### **Cors**

**Cors** habilita peticiones desde otros dominios (frontend-backend).

```bash
npm install cors
```
```js
const cors = require('cors');
app.use(cors());
```

---

### **JWT**

**jsonwebtoken** para autenticación de usuarios.

```bash
npm install jsonwebtoken
```
```js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
```
**Para verificar:**
```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

---

### **Bcrypt**

**bcryptjs** para hashear contraseñas.

```bash
npm install bcryptjs
```
```js
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('miclave', 10);
const esCorrecta = await bcrypt.compare('miclave', hash);
```

---

## Pruebas y Desarrollo

- **Inicia el servidor en modo desarrollo:**
  ```bash
  npm run dev
  ```
- **Corre las pruebas automáticas:**
  ```bash
  npm test
  ```

---

## Recomendaciones Finales

- No subas tu `.env` real. Usa `.env.example`.
- Protege rutas sensibles con autenticación (JWT y roles).
- Haz pruebas automáticas siempre que modifiques lógica crítica.
- Documenta tus endpoints y reglas de negocio en `/docs`.

---

## Créditos y Licencia

Desarrollado por el equipo PROYECTO SEGUNDO PARCIAL - FISEI  
Universidad Técnica de Ambato

---
