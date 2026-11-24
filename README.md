# 🧉 MateA API — Backend de la plataforma de cursos online

API RESTful para **MateA**, una plataforma de cursos online al estilo Udemy. Alumnos exploran el catálogo y se registran; instructores y administradores gestionan los cursos y las categorías. Es el backend del sitio de MateA hecho en React (TP Frontend) y el **Trabajo Práctico Final del curso de Backend Developer (UTN BA)**.

El proyecto aplica **separación de responsabilidades**: las rutas delegan en controladores livianos (manejan HTTP) y toda la lógica de negocio y el acceso a MongoDB vive en una **capa de servicios**.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **Node.js** (≥ 18) | Entorno de ejecución |
| **Express 5** | Framework web / rutas |
| **MongoDB + Mongoose 9** | Base de datos y ODM (modelos, validaciones, `populate`) |
| **bcrypt** | Hash de contraseñas (hook `pre-save` de Mongoose) |
| **jsonwebtoken (JWT)** | Autenticación y protección de rutas |
| **dotenv** | Variables de entorno |
| **cors** | Permite que el front (React) consuma la API |
| **nodemon** | Recarga automática en desarrollo |

---

## 📁 Estructura del proyecto

```
matea-api/
├── app.js                      # Punto de entrada (Express, CORS, rutas, arranque)
├── .env                        # Variables de entorno (valores de ejemplo)
├── .env.example
├── package.json
└── src/
    ├── models/
    │   ├── cursoModel.js       # Entidad principal (equivale a "Producto")
    │   ├── userModel.js        # Usuarios (+ hook bcrypt)
    │   └── categoryModel.js    # Entidad referenciada
    ├── services/               # Lógica de negocio + llamadas a Mongoose
    │   ├── cursoService.js
    │   ├── userService.js
    │   └── categoryService.js
    ├── controllers/            # Solo manejan Request/Response HTTP
    │   ├── cursoController.js
    │   ├── userController.js
    │   └── categoryController.js
    ├── routes/
    │   ├── cursoRoute.js
    │   ├── userRoute.js
    │   └── categoryRoute.js
    ├── config/
    │   └── db.js               # Conexión a MongoDB
    ├── middleware/
    │   └── verifyToken.js      # Middleware JWT (+ autorización por rol)
    ├── utils/                  # AppError, handleError, slugify
    └── seed.js                 # Carga datos de ejemplo
```

> **Nota:** la entidad principal de MateA es el **Curso** (equivale al "Producto" de la consigna), por eso `productModel/Service/Controller/Route` se llaman `curso*`. El campo **Stock** de la consigna se modela como `cupos` (cantidad máxima de alumnos).

---

## 🚀 Cómo correr el proyecto

### Requisitos
- Node.js 18 o superior
- MongoDB local **o** una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL-DEL-REPO>
cd matea-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
#    (el repo ya incluye un .env de ejemplo apuntando a MongoDB local;
#     si usás Atlas, reemplazá MONGODB_URI)

# 4. (Opcional pero recomendado) Cargar datos de ejemplo
npm run seed

# 5. Iniciar el servidor
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

El servidor queda en **http://localhost:3000**. Probá `GET http://localhost:3000/` para verificar que responde.

### Variables de entorno (`.env`)

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/matea
# Ejemplo Atlas: mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/matea?retryWrites=true&w=majority
JWT_SECRET=cambiar_este_secreto_por_uno_largo_y_aleatorio_de_ejemplo
JWT_EXPIRES_IN=1d
```

> ⚠️ Los valores incluidos son **de ejemplo**. Nunca subas credenciales reales: si usás Atlas para la entrega, creá un usuario descartable con permisos mínimos.

### Usuarios de prueba (creados por `npm run seed`)

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@matea.com` | `Admin123!` |
| instructor | `mariana@matea.com` | `Instructor123!` |
| instructor | `diego@matea.com` | `Instructor123!` |
| alumno | `lucia@example.com` | `Alumno123!` |

> ⚠️ `npm run seed` **borra** el contenido de las colecciones `users`, `categories` y `cursos` antes de cargar los datos.

---

## 🗄️ Esquema de la base de datos

Base de datos: `matea`. Colecciones creadas por Mongoose: `users`, `categories` y `cursos`.

```
categories (1) ────< (N) cursos (N) >──── (1) users [rol: instructor]
```

### `categories`
| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | |
| `nombre` | String | Obligatorio, **único** |
| `slug` | String | Se genera automáticamente desde el nombre, **único** |
| `descripcion` | String | Obligatoria |
| `tag` | String | Etiqueta visual (ej. "Tecnología") |
| `imagen` | String | Ruta de la imagen en el front |

### `cursos`
| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | |
| `titulo` | String | Obligatorio |
| `descripcion` | String | Obligatoria |
| `precio` | Number | Obligatorio, ≥ 0 |
| `cupos` | Number | Obligatorio, entero ≥ 0 (equivale al *stock*) |
| `categoria` | ObjectId → `Category` | **Referencia**. Obligatoria. Se resuelve con `populate` |
| `instructor` | ObjectId → `User` | **Referencia**. Se asigna según el usuario autenticado |
| `nivel` | String | `principiante` \| `intermedio` \| `avanzado` (default `principiante`) |
| `imagen` | String | Ruta de la imagen en el front |
| `temario` | [Object] | **Embebido**: `{ orden, titulo, duracionMin }` |
| `fechaPublicacion` | Date | Default: fecha actual |

### `users`
| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | |
| `nombre` | String | Obligatorio |
| `email` | String | Obligatorio, **único**, en minúsculas |
| `password` | String | Obligatoria (mín. 6). **Se guarda hasheada con bcrypt** y nunca se devuelve en las respuestas |
| `rol` | String | `admin` \| `instructor` \| `alumno` (default `alumno`) |
| `telefono`, `categoriaInteres`, `origen` | String | Opcionales (vienen del formulario de registro del front) |
| `fechaRegistro` | Date | Default: fecha actual |

### Índices
| Colección | Índice | Para qué sirve |
|---|---|---|
| `users` | único en `email` | Evitar emails duplicados y acelerar el login |
| `categories` | único en `nombre` y en `slug` | Evitar categorías repetidas y buscar por slug |
| `cursos` | en `categoria` | Acelerar el filtro por categoría |
| `cursos` | en `instructor` | Acelerar la consulta de cursos de un instructor |
| `cursos` | de texto en `titulo` + `descripcion` | Búsqueda de cursos (`?q=`) |

### Decisiones de diseño
- **Categoría referenciada**: se reutiliza en muchos cursos y tiene ciclo de vida propio (renombrarla no obliga a tocar los cursos).
- **Temario embebido**: una lección no existe fuera de su curso, siempre se lee junto con él y su tamaño es acotado.
- Respecto al diseño del TP intermedio se ajustó: `passwordHash` → `password` (hash con hook `pre-save`), se agregó `cupos`, `imagen`, `tag` y los campos del formulario de registro. Las colecciones `inscripciones` y `reseñas` quedan como funcionalidad a futuro.

---

## 🔐 Autenticación y permisos

Las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/usuarios/login` (o al registrarse) y expira según `JWT_EXPIRES_IN`.

| Acción | Quién puede |
|---|---|
| Ver cursos y categorías | Público |
| Registrarse / iniciar sesión | Público (el registro siempre crea usuarios con rol `alumno`) |
| Crear curso | `admin`, `instructor` (el instructor queda asignado al usuario que lo crea) |
| Editar / eliminar curso | `admin`, o el `instructor` dueño del curso |
| Crear / eliminar categoría | `admin` |

---

## 📡 Endpoints

Base URL: `http://localhost:3000`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Estado de la API |
| **Usuarios / Login** | | | |
| POST | `/api/usuarios/register` | — | Registrar alumno (devuelve token) |
| POST | `/api/usuarios/login` | — | Iniciar sesión (devuelve token) |
| GET | `/api/usuarios/me` | JWT | Perfil del usuario autenticado |
| **Categorías** | | | |
| GET | `/api/categorias` | — | Listar categorías |
| GET | `/api/categorias/:id` | — | Obtener una categoría |
| POST | `/api/categorias` | JWT (admin) | Crear categoría |
| DELETE | `/api/categorias/:id` | JWT (admin) | Eliminar categoría (409 si tiene cursos) |
| **Cursos** | | | |
| GET | `/api/cursos` | — | Listar cursos (con `populate` de categoría) |
| GET | `/api/cursos/:id` | — | Obtener un curso |
| POST | `/api/cursos` | JWT (admin/instructor) | Crear curso |
| PUT | `/api/cursos/:id` | JWT (admin/dueño) | Actualizar curso |
| DELETE | `/api/cursos/:id` | JWT (admin/dueño) | Eliminar curso |

### Filtros de `GET /api/cursos` (query params, todos opcionales)

| Param | Ejemplo | Descripción |
|---|---|---|
| `categoria` | `?categoria=idiomas-e-ingles` | ID **o slug** de la categoría |
| `nivel` | `?nivel=principiante` | Nivel del curso |
| `instructor` | `?instructor=<id>` | ID del instructor |
| `q` | `?q=excel` | Búsqueda de texto en título y descripción |

Se pueden combinar: `/api/cursos?categoria=negocios-y-marketing&nivel=principiante`.

---

## 🧪 Ejemplos de datos Mock (JSON)

> Todas las respuestas tienen la forma `{ "success": true|false, "message"?, "data"? }`.

### 👤 `POST /api/usuarios/register`
**Request body**
```json
{
  "nombre": "Lautaro Varela",
  "email": "lautaro16@email.com",
  "password": "MiClave123",
  "telefono": "+54 11 1234-5678",
  "categoriaInteres": "programacion",
  "origen": "redes"
}
```
**Response `201`**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "data": {
    "user": {
      "_id": "665f1a000000000000000010",
      "nombre": "Lautaro Varela",
      "email": "lautaro16@email.com",
      "rol": "alumno",
      "telefono": "+54 11 1234-5678",
      "categoriaInteres": "programacion",
      "origen": "redes",
      "fechaRegistro": "2026-11-24T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 🔑 `POST /api/usuarios/login`
**Request body**
```json
{
  "email": "admin@matea.com",
  "password": "Admin123!"
}
```
**Response `200`**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "_id": "665f1a000000000000000001",
      "nombre": "Admin MateA",
      "email": "admin@matea.com",
      "rol": "admin",
      "fechaRegistro": "2026-11-24T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Response `401`** (credenciales incorrectas)
```json
{ "success": false, "message": "Credenciales inválidas" }
```

### 🙋 `GET /api/usuarios/me`
Header: `Authorization: Bearer <token>` — sin body.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a000000000000000001",
    "nombre": "Admin MateA",
    "email": "admin@matea.com",
    "rol": "admin",
    "fechaRegistro": "2026-11-24T15:00:00.000Z"
  }
}
```

### 🏷️ `GET /api/categorias`
**Response `200`**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "665f1b000000000000000003",
      "nombre": "Idiomas e Inglés",
      "slug": "idiomas-e-ingles",
      "descripcion": "Aprendé inglés con una metodología práctica y conversacional.",
      "tag": "Idiomas",
      "imagen": "/img/categorias-idioma.png"
    }
  ]
}
```

### 🏷️ `GET /api/categorias/:id`
**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "665f1b000000000000000002",
    "nombre": "Negocios y Marketing",
    "slug": "negocios-y-marketing",
    "descripcion": "Estrategias de marketing digital, gestión empresarial y liderazgo.",
    "tag": "Negocios",
    "imagen": "/img/categorias-administracion.png"
  }
}
```

### 🏷️ `POST /api/categorias` *(admin)*
**Request body**
```json
{
  "nombre": "Diseño",
  "descripcion": "Cursos de diseño gráfico, UX/UI y producto.",
  "tag": "Diseño",
  "imagen": "/img/categorias-diseno.png"
}
```
**Response `201`**
```json
{
  "success": true,
  "message": "Categoría creada correctamente",
  "data": {
    "_id": "665f1b000000000000000004",
    "nombre": "Diseño",
    "slug": "diseno",
    "descripcion": "Cursos de diseño gráfico, UX/UI y producto.",
    "tag": "Diseño",
    "imagen": "/img/categorias-diseno.png"
  }
}
```

### 🏷️ `DELETE /api/categorias/:id` *(admin)* — sin body
**Response `200`**
```json
{
  "success": true,
  "message": "Categoría eliminada correctamente",
  "data": { "_id": "665f1b000000000000000004", "nombre": "Diseño", "slug": "diseno" }
}
```
**Response `409`** (la categoría tiene cursos)
```json
{ "success": false, "message": "No se puede eliminar: la categoría tiene 3 curso(s) asociado(s)" }
```

### 📚 `GET /api/cursos`
**Response `200`** (la categoría llega completa gracias a `populate`; del instructor solo el nombre)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f1c000000000000000004",
      "titulo": "Inglés: de Cero a Avanzado",
      "descripcion": "Metodología conversacional con hablantes nativos.",
      "precio": 12000,
      "cupos": 200,
      "categoria": {
        "_id": "665f1b000000000000000003",
        "nombre": "Idiomas e Inglés",
        "slug": "idiomas-e-ingles",
        "descripcion": "Aprendé inglés con una metodología práctica y conversacional.",
        "tag": "Idiomas",
        "imagen": "/img/categorias-idioma.png"
      },
      "instructor": { "_id": "665f1a000000000000000002", "nombre": "Mariana Gómez" },
      "nivel": "principiante",
      "imagen": "/img/Ingles.png",
      "temario": [
        { "orden": 1, "titulo": "Presentaciones y vocabulario básico", "duracionMin": 25 },
        { "orden": 2, "titulo": "Conversación cotidiana", "duracionMin": 30 }
      ],
      "fechaPublicacion": "2026-11-24T15:00:00.000Z"
    }
  ]
}
```

### 📚 `GET /api/cursos/:id`
Misma estructura que un elemento de la lista anterior, dentro de `"data": { ... }`.

**Response `404`**
```json
{ "success": false, "message": "Curso no encontrado" }
```

### 📚 `POST /api/cursos` *(admin / instructor)*
**Request body**
```json
{
  "titulo": "Node.js desde Cero",
  "descripcion": "Backend con JavaScript: Express, MongoDB y JWT.",
  "precio": 20000,
  "cupos": 60,
  "categoria": "665f1b000000000000000001",
  "nivel": "avanzado",
  "imagen": "/img/nodejs.png",
  "temario": [
    { "orden": 1, "titulo": "Módulos y npm", "duracionMin": 28 },
    { "orden": 2, "titulo": "Servidor con Express", "duracionMin": 40 }
  ]
}
```
**Response `201`**
```json
{
  "success": true,
  "message": "Curso creado correctamente",
  "data": {
    "_id": "665f1c000000000000000007",
    "titulo": "Node.js desde Cero",
    "precio": 20000,
    "cupos": 60,
    "categoria": { "_id": "665f1b000000000000000001", "nombre": "Programación e Inteligencia Artificial", "slug": "programacion-e-inteligencia-artificial" },
    "instructor": { "_id": "665f1a000000000000000002", "nombre": "Mariana Gómez" },
    "nivel": "avanzado"
  }
}
```
**Response `400`** (validación)
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": ["El precio no puede ser negativo", "La categoría es obligatoria"]
}
```

### 📚 `PUT /api/cursos/:id` *(admin / dueño)*
Se envían solo los campos a modificar.

**Request body**
```json
{
  "precio": 17500,
  "cupos": 45,
  "nivel": "intermedio"
}
```
**Response `200`**
```json
{
  "success": true,
  "message": "Curso actualizado correctamente",
  "data": { "_id": "665f1c000000000000000007", "titulo": "Node.js desde Cero", "precio": 17500, "cupos": 45, "nivel": "intermedio" }
}
```
**Response `403`** (instructor que no es dueño del curso)
```json
{ "success": false, "message": "No tenés permiso para modificar este curso" }
```

### 📚 `DELETE /api/cursos/:id` *(admin / dueño)* — sin body
**Response `200`**
```json
{
  "success": true,
  "message": "Curso eliminado correctamente",
  "data": { "_id": "665f1c000000000000000007", "titulo": "Node.js desde Cero" }
}
```

### ❌ Errores de autenticación
```json
// 401 — sin token
{ "success": false, "message": "Acceso denegado: falta el token (Authorization: Bearer <token>)" }

// 401 — token inválido o vencido
{ "success": false, "message": "Token inválido" }

// 403 — rol sin permisos
{ "success": false, "message": "No tenés permisos para realizar esta acción" }
```

### Códigos HTTP utilizados
`200` OK · `201` Creado · `400` Datos inválidos / ID inválido · `401` No autenticado · `403` Sin permisos · `404` No encontrado · `409` Conflicto (duplicado / categoría con cursos) · `500` Error interno

---

## ✅ Funcionalidades implementadas

- CRUD completo de **cursos** con `populate` de categoría e instructor
- **Categorías**: listar, obtener, crear y eliminar (no se puede eliminar una con cursos asociados)
- **Registro y login** de usuarios con contraseñas hasheadas con **bcrypt** (hook `pre-save`)
- **JWT** + middleware `verifyToken` que protege crear / actualizar / eliminar
- Autorización por **roles** (admin / instructor / alumno) y por **propiedad** del curso
- Filtros y búsqueda de texto en el listado de cursos
- Validaciones de esquema, manejo centralizado de errores y códigos HTTP apropiados
- **CORS** habilitado, variables de entorno con **dotenv**
- Script de **seed** con los cursos y categorías del front de MateA

## 🔮 Funcionalidades a futuro

- Colección `inscripciones` (alumno ↔ curso, progreso y completado) con índice único `(usuario, curso)`
- Colección `reseñas` (calificación y comentario) y promedio de calificación por curso
- Descuento de `cupos` al inscribirse
- Paginación en el listado de cursos
- Subida de imágenes (hoy se guarda solo la ruta)
- Recuperación de contraseña y refresh tokens
- Tests automatizados y documentación Swagger

---

## 🔗 Conexión con el front de MateA (React)

1. La API ya tiene **CORS** habilitado, así que el front puede llamarla desde `http://localhost:5173`.
2. Las imágenes se guardan como rutas (`/img/Ingles.png`). Copiá las imágenes de `src/assets` del front a `public/img` (con los mismos nombres de archivo) y se verán con esas rutas.
3. En el front, `Cursos.jsx` y `Categorias.jsx` pasan de arrays fijos a `fetch` a `/api/cursos` y `/api/categorias`; el formulario de registro envía a `/api/usuarios/register`.

---

**Autor:** _Lautaro Varela_ — Curso de Backend Developer, Centro de e-Learning UTN BA
