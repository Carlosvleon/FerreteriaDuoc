const bodegaModel = require('../models/BodegaModel');

exports.obtenerProductosPorBodega = async (req, res) => {

  try {
    const { id_sucursal, id_bodega } = req.body;
    // Validación de campos obligatorios
    if (id_sucursal === undefined || id_bodega === undefined) {
      return res.status(400).json({ error: 'Debe enviar id_sucursal e id_bodega en el body.' });
    }
    try {
      const productos = await bodegaModel.obtenerProductos({ id_sucursal, id_bodega });
      // Si no hay productos, retornar 404
      if (!productos || productos.length === 0) {
        return res.status(404).json({ error: 'No se encontraron productos para esta bodega.' });
      }
      return res.status(200).json(productos);
    } catch (err) {
      // Si el error es por clave foránea (bodega/sucursal no existe)
      if (err.code === '23503') {
        return res.status(404).json({ error: 'La bodega o sucursal no existe.' });
      }
      // Otros errores de negocio
      return res.status(500).json({ error: 'Error al obtener productos de la bodega.' });
    }
  } catch (err) {
    // Errores inesperados
    console.error('Error al obtener productos:', err);
    return res.status(500).json({ error: 'Error interno al obtener productos de bodega.' });
  }
};
