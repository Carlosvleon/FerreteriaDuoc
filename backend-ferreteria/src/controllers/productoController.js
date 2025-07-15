const productoModel = require('../models/ProductoModel');


exports.getProductosActivos = async (req, res) => {
  try {
    const productos = await productoModel.obtenerActivos();
    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos activos:", err);
    res.status(500).json({ error: "Error al obtener productos activos desde la base de datos." });
  }
};

// Helper function to avoid code duplication.
// It can be called from different routes (e.g., GET with query params or POST with body).
const obtenerProductosDeBodega = async (req, res, id_sucursal, id_bodega) => {
  if (!id_sucursal || !id_bodega) {
    return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega." });
  }

  try {
    const productos = await productoModel.obtenerPorBodega(id_bodega, id_sucursal);
    if (req.user && req.user.email) {
      console.log(`Consulta de productos para bodega ${id_bodega} en sucursal ${id_sucursal} por ${req.user.email}`);
    }
    res.json(productos);
  } catch (err) {
    console.error("Error al consultar productos por bodega:", err);
    res.status(500).json({ error: "Error al obtener productos desde la base de datos." });
  }
};

exports.getProductosPorBodega = async (req, res) => {
  try {
    const { id_sucursal, id_bodega } = req.query;
    if (!id_sucursal || !id_bodega) {
      return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega." });
    }
    // eslint-disable-next-line no-console
    console.log(`Consulta de productos para bodega ${id_bodega} en sucursal ${id_sucursal} por ${req.user.email}`);
    const productos = await productoModel.obtenerPorBodega(id_sucursal, id_bodega);
    if (!productos || productos.length === 0) {
      return res.status(404).json({ error: "No se encontraron productos en la bodega" });
    }
    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos de la bodega:", err); // <-- Cambiado para igualar test
    res.status(500).json({ error: "Error al obtener productos de la bodega." }); // <-- Cambiado para igualar test
  }
};

exports.getProductosPorBodegaPost = async (req, res) => {
  try {
    const { id_sucursal, id_bodega } = req.body;
    if (!id_sucursal || !id_bodega) {
      return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega." });
    }
    // eslint-disable-next-line no-console
    console.log(`Consulta de productos para bodega ${id_bodega} en sucursal ${id_sucursal} por ${req.user.email}`);
    const productos = await productoModel.obtenerPorBodega(id_sucursal, id_bodega);
    if (!productos || productos.length === 0) {
      return res.status(404).json({ error: "No se encontraron productos en la bodega" });
    }
    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos de la bodega:", err); // <-- Cambiado para igualar test
    res.status(500).json({ error: "Error al obtener productos de la bodega." }); // <-- Cambiado para igualar test
  }
};
