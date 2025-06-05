const bodegaModel = require('../models/BodegaModel');

exports.obtenerProductosPorSucursal = async (req, res) => {
  const { id_sucursal, id_bodega } = req.body;

  if (!id_sucursal || !id_bodega) {
    return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega en el body." });
  }

  try {
    const productos = await bodegaModel.obtenerProductos(id_bodega, id_sucursal, req.user.email);
    res.json(productos);
  } catch (err) {
    console.error("Error al consultar productos:", err);
    res.status(500).json({ error: "Error al obtener productos desde la base de datos." });
  }
};
