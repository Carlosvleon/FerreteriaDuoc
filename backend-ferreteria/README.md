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


## Crear un usuario administrador manualmente (INSERT SQL)

### 1. Genera la contraseña encriptada

Debes generar la contraseña encriptada usando bcrypt. Puedes hacerlo fácilmente desde Node.js. Abre una terminal y ejecuta lo siguiente en el directorio del proyecto:

```cmd
node
```

Luego, en la consola interactiva de Node.js, escribe:

```js
const bcrypt = require('bcrypt');
bcrypt.hashSync('TU_CONTRASEÑA_AQUI', 12)
```

Esto te devolverá un string, que es la contraseña encriptada. Cópiala.

### 2. Realiza el INSERT en la base de datos

Ejecuta el siguiente comando SQL en tu base de datos PostgreSQL, reemplazando los valores según corresponda:

```sql
INSERT INTO usuarios (
  id_usuario, nombre, email, password, telefono, direccion, foto_perfil, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa
) VALUES (
  'UUID_GENERADO', 'Admin', 'admin@tudominio.com', 'CONTRASEÑA_ENCRIPTADA', '123456789', 'Dirección admin', 'GPP/ADMIN_RUT/perfil/avatar.jpg', NULL, 1, 'ADMIN_RUT', 1, NULL, NULL
);
```

- `UUID_GENERADO`: Puedes generar un UUID con [uuidgenerator.net](https://www.uuidgenerator.net/) o usando `uuidv4()` en Node.js.
- `CONTRASEÑA_ENCRIPTADA`: Es la cadena que obtuviste con bcrypt.
- `tipo_usuario_id`: Usa el valor correspondiente para administrador (por ejemplo, `1` si así está definido en tu sistema).
- `ADMIN_RUT`: El RUT que desees asignar al admin.

**Nota:** Asegúrate de crear la carpeta y el avatar si es necesario, siguiendo la estructura de `/GPP/<RUT>/perfil/avatar.jpg`.

---

## Notas

- Asegúrate de que la base de datos esté corriendo y accesible.
- Revisa y ajusta las rutas y configuraciones según tus necesidades.