const pool = require('../../db');

exports.crearProducto = async (productoData) => {
  const { codigoProducto, nombre, idMarca, idModelo, idCategoria, precioOnline } = productoData;

  const result = await pool.query(`
    INSERT INTO producto (codigo_producto, nombre, id_marca, id_modelo, id_categoria, activo)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id_producto
  `, [codigoProducto, nombre, idMarca, idModelo, idCategoria]);

  const idProducto = result.rows[0].id_producto;

  await pool.query(`
    INSERT INTO precios_online (id_producto, precio_online)
    VALUES ($1, $2)
  `, [idProducto, precioOnline]);

  // Insertar en todas las bodegas activas
  const bodegasRes = await pool.query(`SELECT id_bodega FROM bodega WHERE activo = true`);
  for (const bodega of bodegasRes.rows) {
    await pool.query(`
      INSERT INTO bodega_producto (id_bodega, id_producto, stock, stock_critico, fecha_modificacion)
      VALUES ($1, $2, 0, 10, NOW())
    `, [bodega.id_bodega, idProducto]);
  }

  return idProducto;
};


exports.obtenerProductosConDetalles = async () => {
  const query = `
    SELECT
      p.id_producto,
      p.nombre AS nombre_producto,
      p.codigo_producto,
      p.id_marca,
      m.nombre AS marca,
      p.id_modelo,
      mo.nombre AS modelo,
      p.id_categoria,
      c.nombre AS categoria,
      po.precio_online,
      s.id_sucursal,
      s.nombre AS nombre_sucursal,
      b.id_bodega,
      b.nombre AS nombre_bodega,
      bp.stock
    FROM producto p
    LEFT JOIN marca m ON p.id_marca = m.id_marca
    LEFT JOIN modelo mo ON p.id_modelo = mo.id_modelo
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN precios_online po ON p.id_producto = po.id_producto
    LEFT JOIN bodega_producto bp ON p.id_producto = bp.id_producto
    LEFT JOIN bodega b ON bp.id_bodega = b.id_bodega
    LEFT JOIN sucursal s ON b.id_sucursal = s.id_sucursal
    WHERE p.activo = true
    ORDER BY p.id_producto, s.id_sucursal, b.id_bodega
  `;

  const result = await pool.query(query);
  return result.rows;
};

exports.listarMarcas = async () => {
  const result = await pool.query('SELECT id_marca AS id, nombre FROM marca WHERE activo IS TRUE');
  return result.rows;
};

exports.listarModelos = async () => {
  const result = await pool.query('SELECT id_modelo AS id, nombre FROM modelo WHERE activo IS TRUE');
  return result.rows;
};

exports.listarCategorias = async () => {
  const result = await pool.query('SELECT id_categoria AS id, nombre FROM categoria WHERE activo IS TRUE');
  return result.rows;
};

exports.crearMarca = async (nombre) => {
  const result = await pool.query(`
    INSERT INTO marca (nombre, activo)
    VALUES ($1, true)
    RETURNING id_marca AS id
  `, [nombre]);

  return result.rows[0].id;
};

exports.crearModelo = async (nombre) => {
  const result = await pool.query(`
    INSERT INTO modelo (nombre, activo)
    VALUES ($1, true)
    RETURNING id_modelo AS id
  `, [nombre]);
  return result.rows[0].id;
};
exports.crearCategoria = async (nombre) => {
  const result = await pool.query(`
    INSERT INTO categoria (nombre, activo)
    VALUES ($1, true)
    RETURNING id_categoria AS id
  `, [nombre]);
  return result.rows[0].id;
};
exports.actualizarProducto = async (idProducto, datos) => {
  const {
    codigoProducto,
    nombre,
    idMarca,
    idModelo,
    idCategoria,
    precioOnline,
    stockPorBodega = []
  } = datos;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Actualizar datos generales del producto
    await client.query(`
      UPDATE producto
      SET codigo_producto = $1,
          nombre = $2,
          id_marca = $3,
          id_modelo = $4,
          id_categoria = $5
      WHERE id_producto = $6
    `, [codigoProducto, nombre, idMarca, idModelo, idCategoria, idProducto]);

    // 2. Actualizar precio online
    await client.query(`
      UPDATE precios_online
      SET precio_online = $1
      WHERE id_producto = $2
    `, [precioOnline, idProducto]);

    // 3. Actualizar stock por bodega
    for (const item of stockPorBodega) {
      
      const { idBodega, stock } = item;
      console.log('[STOCK UPDATE]', item);
      await client.query(`
        UPDATE bodega_producto
        SET stock = $1,
            fecha_modificacion = NOW()
        WHERE id_producto = $2 AND id_bodega = $3
      `, [stock, idProducto, idBodega]);
    }


    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

