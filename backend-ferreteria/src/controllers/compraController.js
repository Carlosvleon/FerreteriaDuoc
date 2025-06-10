const compraModel = require('../models/compraModel');
exports.realizarCompra = async (req, res) => {
  try {
    const usuarioId = req.user.id_usuario;
    const resultado = await compraModel.realizarCompra(usuarioId);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerMisCompras = async (req, res) => {
  try {
    const usuarioId = req.user.id_usuario;
    const compras = await compraModel.obtenerComprasPorUsuario(usuarioId);
    res.json(compras);
  } catch (err) {
    console.error("Error al obtener compras del usuario:", err);
    res.status(500).json({ error: "Error al obtener compras del usuario." });
  }
};