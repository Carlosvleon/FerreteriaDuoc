const productoModel = require('../models/ProductoModel');

exports.getProductosActivos = async (req, res) => {
  try {
    const productos = await productoModel.obtenerActivos();
    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al obtener productos activos:", err);
    res.status(500).json({ error: "Error al obtener productos activos desde la base de datos." });
  }
};

exports.getProductosPorBodega = async (req, res) => {
  try {
    const { id_sucursal, id_bodega } = req.query;
    if (!id_sucursal || !id_bodega) {
      return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega." });
    }
    const productos = await productoModel.obtenerPorBodega(id_sucursal, id_bodega);
    if (!productos || productos.length === 0) {
      return res.status(404).json({ error: "No se encontraron productos en la bodega" });
    }
    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al obtener productos de la bodega:", err);
    res.status(500).json({ error: "Error al obtener productos de la bodega." });
  }
};

exports.getProductosPorBodegaPost = async (req, res) => {
  try {
    const { id_sucursal, id_bodega } = req.body;
    if (!id_sucursal || !id_bodega) {
      return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega." });
    }
    const productos = await productoModel.obtenerPorBodega(id_sucursal, id_bodega);
    if (!productos || productos.length === 0) {
      return res.status(404).json({ error: "No se encontraron productos en la bodega" });
    }
    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al obtener productos de la bodega:", err);
    res.status(500).json({ error: "Error al obtener productos de la bodega." });
  }
};
