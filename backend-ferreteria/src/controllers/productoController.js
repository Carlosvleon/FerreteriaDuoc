const productoModel = require('../models/ProductoModel');

// LISTAR
exports.getTodosLosProductos = async (req, res) => {
  try {
    const filtros = {
      id_bodega: req.query.id_bodega,
      id_sucursal: req.query.id_sucursal,
      id_marca: req.query.id_marca,
      id_categoria: req.query.id_categoria,
      activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined
    };
    const productos = await productoModel.listar(filtros);
    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos desde la base de datos." });
  }
};

// CREAR PRODUCTO (con precio online)
exports.crearProducto = async (req, res) => {
  try {
    const { codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo, precio_online } = req.body;
    const producto = await productoModel.crear({ codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo });

    // Si se envía precio_online, crear registro en tabla
    if (precio_online !== undefined && producto && producto.id_producto) {
      await productoModel.crearPrecioOnline(producto.id_producto, precio_online);
      producto.precio_online = precio_online; // Para mostrar en la respuesta
    }

    res.status(201).json(producto);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: "Error al crear producto." });
  }
};

// EDITAR PRODUCTO (con precio online)
exports.actualizarProducto = async (req, res) => {
  console.log("Entró a actualizarProducto con id:", req.params.id, "y body:", req.body);
  try {
    const id_producto = req.params.id;
    const { codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo, precio_online } = req.body;
    const producto = await productoModel.actualizar(id_producto, { codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo });

    // Si se envía precio_online, actualiza o inserta en tabla
    if (precio_online !== undefined && producto && producto.id_producto) {
      await productoModel.actualizarPrecioOnline(producto.id_producto, precio_online);
      producto.precio_online = precio_online;
    }

    res.json(producto);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto." });
  }
};

// ELIMINAR PRODUCTO
exports.eliminarProducto = async (req, res) => {
  try {
    const id_producto = req.params.id;
    await productoModel.eliminar(id_producto);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto." });
  }
};
