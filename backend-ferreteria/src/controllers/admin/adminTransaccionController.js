const transaccionModel = require('../../models/admin/adminTransaccionModel');

exports.listarTransaccionesConFiltros = async (req, res) => {
  try {
    const data = await transaccionModel.listarTransaccionesConFiltros(req.query);
    res.json(data);
  } catch (error) {
    console.error('Error al listar transacciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
