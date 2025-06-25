const adminCompraModel = require('../../models/admin/adminCompraModel');

exports.listarComprasConFiltros = async (req, res) => {
  try {
    const filtros = {
      rut: req.query.rut,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
      busqueda: req.query.busqueda,
      pagina: parseInt(req.query.pagina) || 1,
    };

    const compras = await adminCompraModel.listarComprasConFiltros(filtros);
    res.json(compras);
  } catch (err) {
    console.error('Error al obtener compras:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.obtenerDetalleCompra = async (req, res) => {
  try {
    const detalle = await adminCompraModel.obtenerDetalleCompra(req.params.id);
    res.json(detalle);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el detalle de la compra' });
  }
};

exports.listarComprasConFiltros = async (req, res) => {
  try {
    const resultados = await adminCompraModel.obtenerComprasFiltradas(req.query);
    res.json(resultados);
  } catch (error) {
    console.error('Error en listarComprasConFiltros:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};
