const pool = require('../db');

// LISTADO CON FILTROS DINÁMICOS
exports.listar = async (filtros) => {
  let where = [];
  let values = [];
  let idx = 1;

  if (filtros.id_bodega) {
    where.push(`bp.id_bodega = $${idx++}`);
    values.push(filtros.id_bodega);
  }
  if (filtros.id_sucursal) {
    where.push(`s.id_sucursal = $${idx++}`);
    values.push(filtros.id_sucursal);
  }
  if (filtros.id_marca) {
    where.push(`ma.id_marca = $${idx++}`);
    values.push(filtros.id_marca);
  }
  if (filtros.id_categoria) {
    where.push(`c.id_categoria = $${idx++}`);
    values.push(filtros.id_categoria);
  }
  if (filtros.activo !== undefined) {
    where.push(`p.activo = $${idx++}`);
    values.push(filtros.activo);
  }

  const sql = `
    SELECT 
      p.id_producto,
      p.codigo_producto,
      p.nombre,
      p.activo,
      ma.id_marca,
      ma.nombre AS nombre_marca,
      mo.id_modelo,
      mo.nombre AS nombre_modelo,
      c.id_categoria,
      c.nombre AS nombre_categoria,
      po.precio_online,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'bodega', b.nombre, 
            'id_bodega', b.id_bodega,
            'sucursal', s.nombre, 
            'id_sucursal', s.id_sucursal,
            'stock', bp.stock,
            'ultimo_precio', bp.ultimo_precio
          )
        ) FILTER (WHERE b.id_bodega IS NOT NULL),
        '[]'
      ) AS stock_por_bodega
    FROM producto p
      LEFT JOIN marca ma ON ma.id_marca = p.id_marca
      LEFT JOIN modelo mo ON mo.id_modelo = p.id_modelo
      LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN precios_online po ON po.id_producto = p.id_producto
      LEFT JOIN bodega_producto bp ON bp.id_producto = p.id_producto
      LEFT JOIN bodega b ON bp.id_bodega = b.id_bodega
      LEFT JOIN sucursal s ON b.id_sucursal = s.id_sucursal
    ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY 
      p.id_producto, ma.id_marca, mo.id_modelo, c.id_categoria, po.precio_online
    ORDER BY p.id_producto ASC
  `;

  const result = await pool.query(sql, values);
  return result.rows;
};

// CREAR PRODUCTO y PRECIO ONLINE
exports.crear = async ({ codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo = true }) => {
  const result = await pool.query(
    `INSERT INTO producto (codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo]
  );
  return result.rows[0];
};

exports.crearPrecioOnline = async (id_producto, precio_online) => {
  await pool.query(
    `INSERT INTO precios_online (id_producto, precio_online) VALUES ($1, $2)`,
    [id_producto, precio_online]
  );
};

// ACTUALIZAR PRODUCTO
exports.actualizar = async (id_producto, { codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo }) => {
  const result = await pool.query(
    `UPDATE producto SET codigo_producto=$1, nombre=$2, id_marca=$3, id_modelo=$4, id_categoria=$5, activo=$6
     WHERE id_producto=$7 RETURNING *`,
    [codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo, id_producto]
  );
  return result.rows[0];
};

exports.actualizarPrecioOnline = async (id_producto, precio_online) => {
  // Si ya existe, actualiza. Si no, inserta.
  const res = await pool.query(
    `UPDATE precios_online SET precio_online = $2 WHERE id_producto = $1`,
    [id_producto, precio_online]
  );
  if (res.rowCount === 0) {
    await pool.query(
      `INSERT INTO precios_online (id_producto, precio_online) VALUES ($1, $2)`,
      [id_producto, precio_online]
    );
  }
};

// ELIMINAR PRODUCTO (eliminación lógica)
exports.eliminar = async (id_producto) => {
  await pool.query(
    `UPDATE producto SET activo = false WHERE id_producto = $1`,
    [id_producto]
  );
};
