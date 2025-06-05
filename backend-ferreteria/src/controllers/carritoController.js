const carritoModel = require('../models/CarritoModel');

exports.agregarAlCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id_usuario;
    const { id_bodega, productos } = req.body;
    if (!id_bodega || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar id_bodega y al menos un producto." });
    }

    const resultado = await carritoModel.agregarProductos(usuarioId, id_bodega, productos);
    res.json(resultado);
  } catch (err) {
    console.error("Error al agregar productos al carrito:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id_usuario;
    const resultado = await carritoModel.obtenerCarrito(usuarioId);
    res.json(resultado);
  } catch (err) {
    console.error("Error al obtener el carrito:", err);
    res.status(500).json({ error: "Error al obtener el carrito de compras." });
  }
};
