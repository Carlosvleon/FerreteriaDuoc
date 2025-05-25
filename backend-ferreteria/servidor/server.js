const express = require('express');
const cors = require('cors'); // Importar cors para permitir peticiones desde el frontend
const app = express();
app.use(express.json());
require("dotenv").config();
  
// Configurar CORS
app.use(cors());

// Usa las rutas de test para probar la conexión a la BD
const testRoutes = require('./rutas/testRoutes');  
app.use('/api', testRoutes);

// Usar las rutas para registro de usuario
const registerUserRoutes = require('./rutas/register_user');  
app.use('/api', registerUserRoutes);

// Usar las rutas para Login de usuario
const loginUser = require('./rutas/login_user');  
app.use('/api', loginUser);

// Usar las rutas para encontrar los datos del usuario
const perfilUserRoutes = require("./rutas/perfil_user"); 
app.use("/api", perfilUserRoutes);

// Usar las rutas para encontrar los datos del usuario
const perfilesUsersRoutes = require("./rutas/Perfiles_users"); 
app.use("/api", perfilesUsersRoutes);

// Usar la ruta para ver el perfil seleccionado
const perfilBuscadoRoutes = require('./rutas/perfil_buscado'); 
app.use("/api", perfilBuscadoRoutes);

// Usar la ruta para actualizar la foto de perfil
const actualizarFotoPerfilRoutes = require('./rutas/actualizar_fp'); 
app.use("/api", actualizarFotoPerfilRoutes);

// Usar las rutas para actualizar el estado de un oficio
const actualizarEstadoOficioRoutes = require('./rutas/actualizar_estado_oficio');
app.use('/api', actualizarEstadoOficioRoutes);

// Usar la ruta para actualizar la portada
const actualizarPortadaRoutes = require('./rutas/actualizar_pp'); 
app.use("/api", actualizarPortadaRoutes);

// Usar las rutas para cerrar sesión
const cerrarSesionRoutes = require('./rutas/cerrar_sesion');
app.use('/api', cerrarSesionRoutes);

// Usar las rutas para agregar oficios
const agregarOficiosRoutes = require('./rutas/agregar_oficios');
app.use('/api', agregarOficiosRoutes);

// Usar las rutas para obtener oficios y sus especializaciones
const llamarOficiosRoutes = require('./rutas/llamar_oficios');
app.use('/api', llamarOficiosRoutes);

// Usar las rutas para obtener productos
const productoRoutes = require('./rutas/producto');
app.use('/api', productoRoutes);

// Usar las rutas para obtener productos
const bodegaProductoRoutes = require('./rutas/bodega_producto');
app.use('/api', bodegaProductoRoutes);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
