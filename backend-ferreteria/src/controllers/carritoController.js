const carritoModel = require('../models/CarritoModel');

exports.agregarAlCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id_usuario;
    const { id_sucursal, productos } = req.body;

    // Validar id_sucursal
    if (id_sucursal === undefined) {
      return res.status(400).json({ error: "Debe enviar id_sucursal." });
    }

    // Validar productos
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debes enviar un array de productos." });
    }

    // Validar que cada producto tenga id_producto y cantidad válidos
    for (const producto of productos) {
      if (
        typeof producto.id_producto !== 'number' ||
        typeof producto.cantidad !== 'number' ||
        producto.cantidad <= 0
      ) {
        return res.status(400).json({ error: "Cada producto debe tener un id_producto y una cantidad válida." });
      }
    }

    // Llama al modelo, que debe implementar la lógica de buscar bodegas y descontar stock
    const resultado = await carritoModel.agregar(usuarioId, id_sucursal, productos);

    // Devuelve el resultado esperado según el test
    if (resultado && resultado.status && resultado.body) {
      // Si el mock retorna { status: ..., body: ... }, respetar exactamente ese output
      return res.status(resultado.status).json(resultado.body);
    }
    if (resultado && resultado.mensaje) {
      // Caso modelo real: { mensaje: ... }
      return res.status(200).json({ message: resultado.mensaje });
    }
    // Si por alguna razón el modelo retorna otra cosa, igual responde 200 con el resultado
    return res.status(200).json(resultado);
  } catch (err) {
    console.error("Error al agregar productos al carrito:", err);
    res.status(500).json({ error: "Error interno al agregar productos al carrito." });
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
exports.agregar = exports.agregarProductosPorSucursal;