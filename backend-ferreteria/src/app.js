const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin:  process.env.CORS,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rutas (todas movidas a /src/routes/)
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const oficioRoutes = require("./routes/oficioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const bodegaRoutes = require("./routes/bodegaRoutes");
const carritoRoutes = require('./routes/carritoRoutes');
const compraRoutes = require('./routes/compraRoutes');

app.use("/api/test", testRoutes);
app.use("/api/usuarios", userRoutes); // login, register, cerrar sesión
app.use("/api/perfiles", perfilRoutes); // perfil_user, perfiles_users, perfil_buscado, actualizar_fp, actualizar_pp
app.use("/api/oficios", oficioRoutes); // llamar_oficios, agregar_oficios, actualizar_estado_oficio
app.use("/api/productos", productoRoutes); // producto, bodega_producto
app.use("/api/bodegas", bodegaRoutes); // bodega_sucursal
app.use('/api/carrito', carritoRoutes); // carrito_compras
app.use('/api/compra', compraRoutes);

module.exports = app;