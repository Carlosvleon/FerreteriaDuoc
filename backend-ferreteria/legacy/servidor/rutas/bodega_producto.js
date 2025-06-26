const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/bodega_sucursal", authMiddleware, async (req, res) => {
  const { id_sucursal, id_bodega } = req.query;

  if (!id_sucursal || !id_bodega) {
    return res.status(400).json({ error: "Debe enviar id_sucursal e id_bodega en los parámetros de consulta." });
  }

  try {
    const result = await pool.query(
      `SELECT 
       p.codigo_producto AS "Código del producto",
       ma.nombre AS "Marca",
       p.nombre AS "Nombre",
       mo.nombre AS "Modelo",
       bp.stock AS "Stock",
       s.nombre AS "Sucursal",
       b.nombre AS "Bodega",
       bp.fecha_modificacion AS "Fecha"
       FROM bodega_producto bp
       JOIN producto p ON bp.id_producto = p.id_producto
       JOIN bodega b ON bp.id_bodega = b.id_bodega
       JOIN sucursal s ON b.id_sucursal = s.id_sucursal
       LEFT JOIN marca ma ON ma.id_marca = p.id_marca
       LEFT JOIN modelo mo ON mo.id_modelo = p.id_modelo
       WHERE b.id_bodega = $1 AND s.id_sucursal = $2
       ORDER BY p.id_producto ASC`,
      [id_bodega, id_sucursal]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(" Error al consultar bodega_sucursal:", error);
    res.status(500).json({ error: "Error al obtener información de bodega y sucursal." });
  }
});

module.exports = router;