const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../../middleware/authMiddleware");

router.post("/carrito_compras", authMiddleware, async (req, res) => {
  const { id_bodega, productos } = req.body;
  const idUsuario = req.user.id_usuario;

  if (!id_bodega || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debe proporcionar id_bodega y al menos un producto." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Paso 1: Buscar carrito existente del usuario
    let idCarrito;
    const { rows: carritoRows } = await client.query(
      `SELECT id_carrito_compras FROM carrito_compras WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (carritoRows.length > 0) {
      idCarrito = carritoRows[0].id_carrito_compras;
    } else {
      // Crear carrito nuevo
      const nuevoCarrito = await client.query(
        `INSERT INTO carrito_compras (id_usuario, total) VALUES ($1, 0) RETURNING id_carrito_compras`,
        [idUsuario]
      );
      idCarrito = nuevoCarrito.rows[0].id_carrito_compras;
    }

    let totalCarrito = 0;

    for (const item of productos) {
      const { codigo_producto, cantidad } = item;

      const { rows: productoRows } = await client.query(
        `SELECT p.id_producto, bp.stock
         FROM producto p
         JOIN bodega_producto bp ON bp.id_producto = p.id_producto
         WHERE p.codigo_producto = $1 AND bp.id_bodega = $2`,
        [codigo_producto, id_bodega]
      );

      if (productoRows.length === 0) {
        throw new Error(`Producto con código ${codigo_producto} no existe o no está en la bodega`);
      }

      const { id_producto, stock } = productoRows[0];

      if (cantidad > stock) {
        throw new Error(`Stock insuficiente para el producto ${codigo_producto}`);
      }


      // Por ejemplo, podrías obtenerlo de la tabla producto:
      const { rows: precioRows } = await client.query(
        `SELECT precio FROM producto WHERE id_producto = $1`,
        [id_producto]
      );
      if (precioRows.length === 0) {
        throw new Error(`No se encontró el precio para el producto ${codigo_producto}`);
      }
      const precio = parseFloat(precioRows[0].precio);

      const total = precio * cantidad;
      totalCarrito += total;

      // Verificar si el producto ya está en el carrito
      const { rows: detalleRows } = await client.query(
        `SELECT id_detalle_carrito, cantidad FROM detalle_carrito_compras
         WHERE id_carrito_compras = $1 AND id_producto = $2`,
        [idCarrito, id_producto]
      );

      if (detalleRows.length > 0) {
        // Ya existe → actualizar cantidad y total
        const nuevaCantidad = detalleRows[0].cantidad + cantidad;
        const nuevoTotal = nuevaCantidad * precio;

        await client.query(
          `UPDATE detalle_carrito_compras
           SET cantidad = $1, total = $2
           WHERE id_detalle_carrito = $3`,
          [nuevaCantidad, nuevoTotal, detalleRows[0].id_detalle_carrito]
        );
      } else {
        // No existe → insertar nuevo detalle
        await client.query(
          `INSERT INTO detalle_carrito_compras (id_carrito_compras, id_producto, cantidad, total)
           VALUES ($1, $2, $3, $4)`,
          [idCarrito, id_producto, cantidad, total]
        );
      }

      // Actualizar stock
      await client.query(
        `UPDATE bodega_producto
         SET stock = stock - $1
         WHERE id_producto = $2 AND id_bodega = $3`,
        [cantidad, id_producto, id_bodega]
      );
    }

    // Actualizar total del carrito
    await client.query(
      `UPDATE carrito_compras SET total = total + $1 WHERE id_carrito_compras = $2`,
      [totalCarrito, idCarrito]
    );

    await client.query("COMMIT");
    res.json({ mensaje: "Carrito actualizado correctamente." });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al agregar productos al carrito:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});



router.get("/carrito_compras", authMiddleware, async (req, res) => {
  const idUsuario = req.user.id_usuario;

  try {
    const client = await pool.connect();

    // Obtener el carrito del usuario
    const { rows: carritoRows } = await client.query(
      `SELECT id_carrito_compras, total
       FROM carrito_compras
       WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (carritoRows.length === 0) {
      return res.status(404).json({ mensaje: "El usuario no tiene un carrito activo." });
    }

    const idCarrito = carritoRows[0].id_carrito_compras;
    const totalGeneral = carritoRows[0].total;

    // Obtener los detalles del carrito
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

    res.json({
      id_carrito_compras: idCarrito,
      productos: detalles,
      total_general: parseFloat(totalGeneral)
    });

    client.release();

  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al obtener el carrito de compras." });
  }
});

module.exports = router;