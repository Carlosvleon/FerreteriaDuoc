# Backend Ferretería

Este proyecto es el backend de una ferretería, desarrollado en Node.js con Express y PostgreSQL.

## Requisitos Previos

- Node.js (v18 o superior recomendado)
- npm (v9 o superior)
- PostgreSQL (base de datos configurada)

## Instalación

1. **Clona el repositorio:**

   ```
   git clone <URL_DEL_REPOSITORIO>
   cd backend-ferreteria
   ```

2. **Instala las dependencias:**

   ```
   npm install
   ```

## Dependencias

### Dependencias normales

- bcrypt
- bcryptjs
- cors
- dotenv
- express
- fs-extra
- jsonwebtoken
- multer
- pg
- transbank-sdk
- uuid

### Dependencias de desarrollo

- jest
- supertest

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (ajusta los valores según tu entorno):

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_de_datos
JWT_SECRET=tu_clave_secreta
```

## Comandos útiles

- **Iniciar el servidor en modo desarrollo:**
  ```
  npm run dev
  ```
- **Iniciar el servidor en modo producción:**
  ```
  npm start
  ```
- **Ejecutar pruebas:**
  ```
  npm test
  ```

## Notas

- Asegúrate de que la base de datos esté corriendo y accesible.
- Revisa y ajusta las rutas y configuraciones según tus necesidades.