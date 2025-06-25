const pool = require('../../db');

exports.listarTransaccionesConFiltros = async ({ status, fechaInicio, fechaFin, busqueda, pagina = 1, limite = 10 }) => {
  const offset = (pagina - 1) * limite;
  const filtros = [];
  const valores = [];

  if (status) {
    filtros.push(`t.status = $${valores.length + 1}`);
    valores.push(status);
  }

  if (fechaInicio) {
    filtros.push(`t.transaction_date >= $${valores.length + 1}`);
    valores.push(fechaInicio);
  }

  if (fechaFin) {
    filtros.push(`t.transaction_date <= $${valores.length + 1}`);
    valores.push(fechaFin);
  }

  if (busqueda) {
    filtros.push(`(t.buy_order ILIKE $${valores.length + 1} OR t.card_last_digits::text ILIKE $${valores.length + 1})`);
    valores.push(`%${busqueda}%`);
  }

  const whereClause = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const query = `
  SELECT t.*, ct.id_compra
  FROM transaccion_webpay t
  LEFT JOIN compra_transaccion_webpay ct ON t.id = ct.id_transaccion
  ${whereClause}
  ORDER BY t.transaction_date DESC
  LIMIT $${valores.length + 1}
  OFFSET $${valores.length + 2}
`;

const totalQuery = `
  SELECT COUNT(*) AS total
  FROM transaccion_webpay t
  LEFT JOIN compra_transaccion_webpay ct ON t.id = ct.id_transaccion
  ${whereClause}
`;


  valores.push(limite, offset);

  const transacciones = await pool.query(query, valores);
  const totalRes = await pool.query(totalQuery, valores.slice(0, -2));
  const totalPaginas = Math.ceil(totalRes.rows[0].total / limite);

  return {
    resultados: transacciones.rows,
    totalPaginas,
  };
};
