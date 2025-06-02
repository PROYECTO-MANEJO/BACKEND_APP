# 📚 Backend - Gestión de Eventos y Cursos FISEI

Este proyecto implementa un backend en Node.js con Express y Prisma ORM sobre PostgreSQL. Permite al **Administrador** realizar el CRUD completo de **Eventos** y **Cursos**, así como registrar **Organizadores**, **Categorías** y más.


## ⚙️ Configuración

1. Crea un archivo `.env` y agrega tu cadena de conexión:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/Cursos_Fisei"
```

2. Aplica migraciones de Prisma:

```bash
npx prisma migrate dev --name init
```

3. Genera cliente Prisma:

```bash
npx prisma generate
```

---

## 🧱 Estructura de Base de Datos

Se incluyen las siguientes entidades:

- `Evento`: contiene datos de eventos académicos o públicos.
- `Curso`: estructura independiente para cursos con duración, fechas y organizador.
- `Organizador`: persona responsable de un evento o curso.
- `CategoriaEvento`: define el tipo y puntos de aprobación de un evento o curso.
- Relaciones correctas entre categorías, organizadores, eventos y cursos.

---

## 📡 Endpoints disponibles

### 🧑‍🏫 Organizador

- `POST /api/organizadores`: registrar nuevo organizador

### 🏷️ Categorías

- `POST /api/categorias`: registrar nueva categoría

### 📅 Eventos

- `POST /api/eventos`: crear evento
- `GET /api/eventos`: listar eventos
- `GET /api/eventos/:id`: obtener evento por ID
- `PUT /api/eventos/:id`: actualizar evento
- `DELETE /api/eventos/:id`: eliminar evento

### 📘 Cursos

- `POST /api/cursos`: crear curso
- `GET /api/cursos`: listar cursos
- `GET /api/cursos/:id`: obtener curso por ID
- `PUT /api/cursos/:id`: actualizar curso
- `DELETE /api/cursos/:id`: eliminar curso

---

## 🧪 Probar con Postman

1. **Registrar categoría**  
   `POST /api/categorias`  
   ```json
   {
     "nom_cat": "Redes",
     "des_cat": "Aprendizaje sobre protocolos",
     "pun_apr_cat": 8.5,
     "asi_cat": 3
   }
   ```

2. **Registrar organizador**  
   `POST /api/organizadores`  
   ```json
   {
     "ced_org": "1102567890",
     "nom_org1": "Luis",
     "nom_org2": "Eduardo",
     "ape_org1": "Castro",
     "ape_org2": "Pérez",
     "tit_aca_org": "Ing. Redes"
   }
   ```

3. **Crear curso**  
   `POST /api/cursos`  
   ```json
   {
     "nom_cur": "Curso de Redes Avanzadas",
     "des_cur": "Profundización en redes y protocolos avanzados",
     "dur_cur": 40,
     "fec_ini_cur": "2025-07-01",
     "fec_fin_cur": "2025-07-15",
     "id_cat_cur": "uuid_de_categoria_existente",
     "ced_org_cur": "1102567890"
   }
   ```


4. **Crear Eventos**  
   `POST /api/eventos`  
   ```json
 {
      "nom_eve": "Congreso de IA",
      "des_eve": "Evento enfocado en inteligencia artificial aplicada",
      "id_cat_eve": "uuid_categoria_existente",
      "fec_ini_eve": "2025-07-15",
      "fec_fin_eve": "2025-07-17",
      "hor_ini_eve": "2025-07-15T09:00:00",
      "hor_fin_eve": "2025-07-15T12:00:00",
      "dur_eve": 3,
      "are_eve": "IA",
      "ubi_eve": "Auditorio 1",
      "ced_org_eve": "1234567890",
      "capacidad_max_eve": 200,
      "tipo_audiencia_eve": "TODAS_CARRERAS"
    }
   ```


---

## 🧑‍💼 Roles y reglas de negocio

- Solo los usuarios con rol `ADMINISTRADOR` pueden crear eventos y cursos.
- Los cursos y eventos se asocian a un organizador ya registrado.
- Un curso puede tener duración, fechas específicas y categoría académica.
- Se realiza validación completa en los controladores.

---

## 🚀 Levantar el servidor

```bash
npm run dev
```

El servidor quedará activo en `http://localhost:3000`.

---

## 🧾 Autor

Desarrollado para el proyecto académico de segundo parcial - Universidad Técnica de Ambato - FISEI.