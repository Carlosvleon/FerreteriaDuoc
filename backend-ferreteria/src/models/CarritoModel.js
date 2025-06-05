const pool = require('../db');

exports.agregarProductos = async (usuarioId, id_bodega, productos) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let idCarrito;
    const { rows: carritoRows } = await client.query(
      "SELECT id_carrito_compras FROM carrito_compras WHERE id_usuario = $1",
      [usuarioId]
    );

    if (carritoRows.length > 0) {
      idCarrito = carritoRows[0].id_carrito_compras;
    } else {
      const nuevo = await client.query(
        "INSERT INTO carrito_compras (id_usuario, total) VALUES ($1, 0) RETURNING id_carrito_compras",
        [usuarioId]
      );
      idCarrito = nuevo.rows[0].id_carrito_compras;
    }

    let totalCarrito = 0;

    for (const item of productos) {
      const { codigo_producto, cantidad } = item;

      const { rows: productoRows } = await client.query(
        `SELECT p.id_producto, bp.stock, bp.ultimo_precio
         FROM producto p
         JOIN bodega_producto bp ON bp.id_producto = p.id_producto
         WHERE p.codigo_producto = $1 AND bp.id_bodega = $2`,
        [codigo_producto, id_bodega]
      );

      if (productoRows.length === 0) {
        throw new Error(`Producto con código \${codigo_producto} no existe o no está en la bodega`);
      }

      const { id_producto, stock, ultimo_precio } = productoRows[0];

      if (cantidad > stock) {
        throw new Error(`Stock insuficiente para el producto \${codigo_producto}`);
      }

      const total = parseFloat(ultimo_precio) * cantidad;
      totalCarrito += total;

      const { rows: detalleRows } = await client.query(
        `SELECT id_detalle_carrito, cantidad FROM detalle_carrito_compras
         WHERE id_carrito_compras = $1 AND id_producto = $2`,
        [idCarrito, id_producto]
      );

      if (detalleRows.length > 0) {
        const nuevaCantidad = detalleRows[0].cantidad + cantidad;
        const nuevoTotal = nuevaCantidad * parseFloat(ultimo_precio);

        await client.query(
          `UPDATE detalle_carrito_compras
           SET cantidad = $1, total = $2
           WHERE id_detalle_carrito = $3`,
          [nuevaCantidad, nuevoTotal, detalleRows[0].id_detalle_carrito]
        );
      } else {
        await client.query(
          `INSERT INTO detalle_carrito_compras (id_carrito_compras, id_producto, cantidad, total)
           VALUES ($1, $2, $3, $4)`,
          [idCarrito, id_producto, cantidad, total]
        );
      }

      await client.query(
        `UPDATE bodega_producto
         SET stock = stock - $1
         WHERE id_producto = $2 AND id_bodega = $3`,
        [cantidad, id_producto, id_bodega]
      );
    }

    await client.query(
      "UPDATE carrito_compras SET total = total + $1 WHERE id_carrito_compras = $2",
      [totalCarrito, idCarrito]
    );

    await client.query("COMMIT");
    return { mensaje: "Carrito actualizado correctamente." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.obtenerCarrito = async (usuarioId) => {
  const client = await pool.connect();
  try {
    const { rows: carritoRows } = await client.query(
      "SELECT id_carrito_compras, total FROM carrito_compras WHERE id_usuario = $1",
      [usuarioId]
    );

    if (carritoRows.length === 0) {
      return { mensaje: "El usuario no tiene un carrito activo." };
    }

    const idCarrito = carritoRows[0].id_carrito_compras;
    const totalGeneral = carritoRows[0].total;

    const { rows: detalles } = await client.query(
      `SELECT 
        p.nombre, 
        p.codigo_producto, 
        dcc.cantidad, 
        dcc.total
       FROM detalle_carrito_compras dcc
       JOIN producto p ON dcc.id_producto = p.id_producto
       WHERE dcc.id_carrito_compras = $1`,
      [idCarrito]
    );

    return {
      id_carrito_compras: idCarrito,
      productos: detalles,
      total_general: parseFloat(totalGeneral)
    };
  } finally {
    client.release();
  }
};
